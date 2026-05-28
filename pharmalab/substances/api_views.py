from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import login, logout as django_logout
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.utils import timezone
from minio import Minio
from django.conf import settings
import uuid

from .models import User, Substance, Request, RequestItem
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer,
    SubstanceSerializer, SubstanceCreateSerializer,
    RequestSerializer, RequestCreateSerializer, RequestUpdateSerializer,
    RequestItemSerializer, RequestItemCreateSerializer, RequestItemUpdateSerializer
)
from .permissions import IsModerator, IsOwnerOrModerator


minio_client = Minio(
    settings.MINIO_ENDPOINT,
    access_key=settings.MINIO_ACCESS_KEY,
    secret_key=settings.MINIO_SECRET_KEY,
    secure=settings.MINIO_USE_SSL
)


# ========== АУТЕНТИФИКАЦИЯ ==========

@method_decorator(csrf_exempt, name='dispatch')
class AuthViewSet(viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    
    def get_serializer_class(self):
        if self.action == 'register':
            return RegisterSerializer
        if self.action == 'login':
            return LoginSerializer
        if self.action == 'me':
            return UserSerializer
        return None
    
    def get_serializer(self, *args, **kwargs):
        serializer_class = self.get_serializer_class()
        if serializer_class is None:
            return None
        return serializer_class(*args, **kwargs)
    
    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        login(request, user)
        return Response({
            'message': 'Успешный вход',
            'user': UserSerializer(user).data
        })
    
    @action(detail=False, methods=['post'])
    def logout(self, request):
        django_logout(request)
        return Response({'message': 'Успешный выход'})
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        if request.user.is_authenticated:
            return Response(UserSerializer(request.user).data)
        return Response({'error': 'Не авторизован'}, status=status.HTTP_401_UNAUTHORIZED)


# ========== УСЛУГИ ==========

@method_decorator(csrf_exempt, name='dispatch')
class SubstanceViewSet(viewsets.ModelViewSet):
    queryset = Substance.objects.filter(is_active=True)
    serializer_class = SubstanceSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'cas']
    parser_classes = [MultiPartParser, FormParser]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return SubstanceCreateSerializer
        return SubstanceSerializer
    
    def get_queryset(self):
        """Добавляем фильтрацию по цене"""
        queryset = Substance.objects.filter(is_active=True)
        
        price_from = self.request.query_params.get('price_from')
        price_to = self.request.query_params.get('price_to')
        
        if price_from:
            queryset = queryset.filter(price__gte=price_from)
        if price_to:
            queryset = queryset.filter(price__lte=price_to)
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        name_latin = serializer.validated_data['name'].replace(' ', '_').lower()
        name_latin = ''.join(c for c in name_latin if c.isalnum() or c == '_')
        
        image_file = request.FILES.get('image')
        if image_file:
            ext = image_file.name.split('.')[-1].lower()
            image_key = f"{name_latin}_{uuid.uuid4().hex[:8]}.{ext}"
            try:
                if not minio_client.bucket_exists(settings.MINIO_BUCKET):
                    minio_client.make_bucket(settings.MINIO_BUCKET)
                minio_client.put_object(
                    bucket_name=settings.MINIO_BUCKET,
                    object_name=image_key,
                    data=image_file,
                    length=image_file.size,
                    content_type=image_file.content_type
                )
                serializer.validated_data['image_key'] = image_key
            except Exception as e:
                return Response({'error': f'Ошибка загрузки изображения: {str(e)}'}, 
                              status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        video_file = request.FILES.get('video')
        if video_file:
            ext = video_file.name.split('.')[-1].lower()
            video_key = f"{name_latin}_video_{uuid.uuid4().hex[:8]}.{ext}"
            try:
                minio_client.put_object(
                    bucket_name=settings.MINIO_BUCKET,
                    object_name=video_key,
                    data=video_file,
                    length=video_file.size,
                    content_type=video_file.content_type
                )
                serializer.validated_data['video_key'] = video_key
            except Exception as e:
                return Response({'error': f'Ошибка загрузки видео: {str(e)}'}, 
                              status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        substance = Substance.objects.create(**serializer.validated_data)
        return Response(SubstanceSerializer(substance).data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def image_url(self, request, pk=None):
        substance = self.get_object()
        return Response({'image_url': substance.image_url})
    
    @action(detail=True, methods=['get'])
    def video_url(self, request, pk=None):
        substance = self.get_object()
        return Response({'video_url': substance.video_url})


# ========== ЗАЯВКИ ==========

@method_decorator(csrf_exempt, name='dispatch')
class RequestViewSet(viewsets.ModelViewSet):
    serializer_class = RequestSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status']
    
    def get_permissions(self):
        if self.action in ['complete', 'reject']:
            return [IsModerator()]
        if self.action == 'submit':
            return [IsAuthenticated()]
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsOwnerOrModerator()]
        return [IsAuthenticatedOrReadOnly()]
    
    def get_queryset(self):
        user = self.request.user
        if getattr(self, 'swagger_fake_view', False):
            return Request.objects.none()
        if not user.is_authenticated:
            return Request.objects.none()
        if user.is_moderator:
            queryset = Request.objects.exclude(status='deleted')
        else:
            queryset = Request.objects.exclude(status='deleted').filter(user=user)
        
        formed_from = self.request.query_params.get('formed_from')
        formed_to = self.request.query_params.get('formed_to')
        if formed_from:
            queryset = queryset.filter(formed_at__gte=formed_from)
        if formed_to:
            queryset = queryset.filter(formed_at__lte=formed_to)
        
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'create':
            return RequestCreateSerializer
        if self.action in ['update', 'partial_update']:
            return RequestUpdateSerializer
        return RequestSerializer
    
    def create(self, request, *args, **kwargs):
        user = request.user
        if not user.is_authenticated:
            return Response({'error': 'Необходима авторизация'}, status=status.HTTP_401_UNAUTHORIZED)
        
        existing_draft = Request.objects.filter(user=user, status='draft').first()
        if existing_draft:
            return Response({'error': 'У вас уже есть черновик заявки'}, status=status.HTTP_400_BAD_REQUEST)
        
        request_obj = Request.objects.create(
            user=user,
            status='draft',
            delivery_address=request.data.get('delivery_address', ''),
            comments=request.data.get('comments', '')
        )
        return Response(RequestSerializer(request_obj).data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['put'])
    def submit(self, request, pk=None):
        request_obj = self.get_object()
        user = request.user
        if request_obj.user != user:
            return Response({'error': 'Только создатель может сформировать заявку'}, status=status.HTTP_403_FORBIDDEN)
        if request_obj.status != 'draft':
            return Response({'error': f'Нельзя сформировать заявку в статусе {request_obj.status}'}, status=status.HTTP_400_BAD_REQUEST)
        if not request_obj.delivery_address:
            return Response({'error': 'Не указан адрес доставки'}, status=status.HTTP_400_BAD_REQUEST)
        
        request_obj.calculate_total()
        request_obj.formed_at = timezone.now()
        request_obj.status = 'formed'
        request_obj.save()
        return Response(RequestSerializer(request_obj).data)
    
    @action(detail=True, methods=['put'])
    def complete(self, request, pk=None):
        request_obj = self.get_object()
        if not request.user.is_moderator:
            return Response({'error': 'Только модератор может завершить заявку'}, status=status.HTTP_403_FORBIDDEN)
        if request_obj.status != 'formed':
            return Response({'error': f'Нельзя завершить заявку в статусе {request_obj.status}'}, status=status.HTTP_400_BAD_REQUEST)
        
        request_obj.moderator = request.user
        request_obj.completed_at = timezone.now()
        request_obj.status = 'completed'
        request_obj.save()
        return Response(RequestSerializer(request_obj).data)
    
    @action(detail=True, methods=['put'])
    def reject(self, request, pk=None):
        request_obj = self.get_object()
        if not request.user.is_moderator:
            return Response({'error': 'Только модератор может отклонить заявку'}, status=status.HTTP_403_FORBIDDEN)
        if request_obj.status != 'formed':
            return Response({'error': f'Нельзя отклонить заявку в статусе {request_obj.status}'}, status=status.HTTP_400_BAD_REQUEST)
        
        request_obj.moderator = request.user
        request_obj.completed_at = timezone.now()
        request_obj.status = 'rejected'
        request_obj.save()
        return Response(RequestSerializer(request_obj).data)
    
    @action(detail=False, methods=['get'])
    def cart(self, request):
        if not request.user.is_authenticated:
            return Response({'request_id': None, 'items_count': 0})
        draft = Request.objects.filter(user=request.user, status='draft').first()
        if draft:
            items_count = draft.items.filter(is_active=True).count()
            return Response({'request_id': draft.id, 'items_count': items_count})
        return Response({'request_id': None, 'items_count': 0})


# ========== ПОЗИЦИИ ЗАЯВКИ ==========

@method_decorator(csrf_exempt, name='dispatch')
class RequestItemViewSet(viewsets.ModelViewSet):
    serializer_class = RequestItemSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return RequestItem.objects.none()
        if not self.request.user.is_authenticated:
            return RequestItem.objects.none()
        return RequestItem.objects.filter(is_active=True, request__user=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return RequestItemCreateSerializer
        if self.action in ['update', 'partial_update']:
            return RequestItemUpdateSerializer
        return RequestItemSerializer
    
    def create(self, request, *args, **kwargs):
        user = request.user
        draft, created = Request.objects.get_or_create(
            user=user,
            status='draft',
            defaults={'created_at': timezone.now()}
        )
        
        substance_id = request.data.get('substance')
        try:
            substance = Substance.objects.get(id=substance_id, is_active=True)
        except Substance.DoesNotExist:
            return Response({'error': 'Субстанция не найдена'}, status=status.HTTP_404_NOT_FOUND)
        
        item, created = RequestItem.objects.get_or_create(
            request=draft,
            substance=substance,
            is_active=True,
            defaults={
                'quantity': request.data.get('quantity', 1),
                'unit': request.data.get('unit', substance.unit),
                'mm_value': request.data.get('mm_value', f"MM-{substance.molecular_weight}"),
                'order_number': draft.items.filter(is_active=True).count() + 1
            }
        )
        
        if not created:
            item.quantity += request.data.get('quantity', 1)
            item.save()
        
        draft.calculate_total()
        
        # Возвращаем обновлённую информацию о заявке
        return Response({
            'item': RequestItemSerializer(item).data,
            'request_id': draft.id,
            'items_count': draft.items.filter(is_active=True).count(),
            'total_amount': float(draft.total_amount)
        }, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        """PUT /api/request-items/{id}/ - полное обновление"""
        item = self.get_object()
        if item.request.status != 'draft':
            return Response({'error': 'Нельзя изменять позиции в не черновой заявке'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        if item.request.user != request.user:
            return Response({'error': 'Нельзя изменять чужие заявки'}, 
                          status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        """PATCH /api/request-items/{id}/ - частичное обновление (количество)"""
        item = self.get_object()
        if item.request.status != 'draft':
            return Response({'error': 'Нельзя изменять позиции в не черновой заявке'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        if item.request.user != request.user:
            return Response({'error': 'Нельзя изменять чужие заявки'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        quantity = request.data.get('quantity')
        if quantity is not None:
            item.quantity = quantity
            item.save()
            item.request.calculate_total()
        
        # Возвращаем обновлённую информацию о заявке
        return Response({
            'item': RequestItemSerializer(item).data,
            'request_id': item.request.id,
            'items_count': item.request.items.filter(is_active=True).count(),
            'total_amount': float(item.request.total_amount)
        }, status=status.HTTP_200_OK)
    
    def destroy(self, request, *args, **kwargs):
        """DELETE /api/request-items/{id}/ - удаление позиции из заявки"""
        item = self.get_object()
        if item.request.status != 'draft':
            return Response({'error': 'Нельзя удалять позиции из не черновой заявке'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        if item.request.user != request.user:
            return Response({'error': 'Нельзя изменять чужие заявки'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        request_id = item.request.id
        item.delete()
        
        # Получаем обновлённую заявку
        try:
            req = Request.objects.get(id=request_id)
            req.calculate_total()
            items_count = req.items.filter(is_active=True).count()
            total_amount = float(req.total_amount)
        except Request.DoesNotExist:
            items_count = 0
            total_amount = 0
        
        return Response({
            'message': 'Позиция удалена из заявки',
            'request_id': request_id,
            'items_count': items_count,
            'total_amount': total_amount
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['delete'], url_path='delete')
    def delete_by_keys(self, request):
        request_id = request.query_params.get('request_id')
        substance_id = request.query_params.get('substance_id')
        
        if not request_id or not substance_id:
            return Response({'error': 'Необходимо указать request_id и substance_id'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        try:
            item = RequestItem.objects.get(
                request_id=request_id,
                substance_id=substance_id,
                is_active=True
            )
            
            if item.request.status != 'draft':
                return Response({'error': 'Нельзя удалять позиции из не черновой заявки'},
                              status=status.HTTP_400_BAD_REQUEST)
            
            if item.request.user != request.user:
                return Response({'error': 'Нельзя изменять чужие заявки'},
                              status=status.HTTP_403_FORBIDDEN)
            
            item.is_active = False
            item.save()
            item.request.calculate_total()
            
            return Response({'message': 'Позиция удалена из заявки'}, 
                          status=status.HTTP_200_OK)
        except RequestItem.DoesNotExist:
            return Response({'error': 'Позиция не найдена'}, 
                          status=status.HTTP_404_NOT_FOUND)