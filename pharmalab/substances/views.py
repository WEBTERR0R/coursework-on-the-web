from django.shortcuts import render, get_object_or_404, redirect
from django.db.models import Q, Sum, F
from django.utils import timezone
from django.db import connection
from django.http import Http404
from django.conf import settings
from .models import Substance, Request, RequestItem, User


DEMO_USER_ID = getattr(settings, 'DEMO_USER_ID', 1)


def index(request):
   
    search_query = request.GET.get('search', '')
    
    # Получаем активные субстанции с фильтрацией
    substances = Substance.objects.filter(is_active=True)
    if search_query:
        substances = substances.filter(
            Q(name__icontains=search_query) |
            Q(cas__icontains=search_query)
        )
    
    # Получаем текущую заявку пользователя (черновик)
    current_request = Request.objects.filter(
        user_id=DEMO_USER_ID,
        status='draft'
    ).first()
    
    # Подготовка данных для шаблона
    request_id = current_request.id if current_request else None
    request_items_count = 0
    request_total = "0 ₽"
    
    if current_request:
        items = RequestItem.objects.filter(
            request=current_request,
            is_active=True
        ).select_related('substance')
        request_items_count = items.count()
        total = items.aggregate(
            total=Sum(F('substance__price') * F('quantity'))
        )['total'] or 0
        request_total = f"{total} ₽"
    
    # URL видео из MinIO
    promo_video_url = "http://localhost:9000/pharmalab-media/promo.mp4"
    
    context = {
        'services': substances,  # Коллекция услуг
        'search_query': search_query,  # Сохранение поиска
        'request_id': request_id,  # ID заявки для Network tab
        'request_items_count': request_items_count,  # Количество в корзине
        'request_total': request_total,
        'promo_video_url': promo_video_url,
    }
    
    return render(request, 'index.html', context)


def detail(request, substance_id):
    """
    GET запрос #2: Детальная страница субстанции
    - Портретный режим как Vibes
    - Автоматическое воспроизведение видео
    - Изображение и видео из MinIO
    """
    substance = get_object_or_404(Substance, id=substance_id, is_active=True)
    search_query = request.GET.get('search', '')
    
    context = {
        'service': substance,
        'search_query': search_query,
    }
    
    return render(request, 'detail.html', context)


def add_to_request(request, substance_id):
    """
    POST запрос #1: Добавление субстанции в заявку (через ORM)
    - Создание заявки если не существует
    - Добавление услуги в заявку
    - Обновление карточки корзины
    """
    if request.method != 'POST':
        return redirect('index')
    
    substance = get_object_or_404(Substance, id=substance_id, is_active=True)
    
    # Получаем или создаем заявку-черновик (не более одной на пользователя)
    current_request, created = Request.objects.get_or_create(
        user_id=DEMO_USER_ID,
        status='draft',
        defaults={
            'created_at': timezone.now()
        }
    )
    
    # Добавляем или обновляем позицию в заявке
    item, item_created = RequestItem.objects.get_or_create(
        request=current_request,
        substance=substance,
        is_active=True,
        defaults={
            'quantity': 1,
            'unit': substance.unit,
            'mm_value': f"MM-{substance.molecular_weight}",
            'order_number': current_request.items.filter(is_active=True).count() + 1,
        }
    )
    
    if not item_created:
        item.quantity += 1
        item.save()
    
    # Пересчитываем общую сумму заявки
    current_request.calculate_total()
    
    # Сохраняем параметр поиска при редиректе
    search_query = request.GET.get('search', '')
    redirect_url = f"/?search={search_query}" if search_query else '/'
    return redirect(redirect_url)


def request_detail(request, request_id):
    """
    GET запрос #3: Страница просмотра заявки
    - Поля заявки
    - Каждая услуга отдельной карточкой
    - Поле м-м справа для каждой услуги
    - Поле результата вычислений
    """
    search_query = request.GET.get('search', '')
    
    try:
        request_obj = Request.objects.select_related('user').prefetch_related(
            'items__substance'
        ).get(id=request_id)
    except Request.DoesNotExist:
        raise Http404(f"Заявка №{request_id} не найдена")
    
    # Удаленные заявки просматривать нельзя
    if request_obj.status == 'deleted':
        return render(request, 'request_deleted.html', {
            'request_id': request_id,
            'search_query': search_query
        })
    
    items = request_obj.items.filter(is_active=True).select_related('substance')
    created_at = request_obj.created_at.strftime('%d.%m.%Y %H:%M')
    total_calculation = f"{request_obj.total_amount} ₽"
    
    context = {
        'request_obj': request_obj,
        'items': items,
        'search_query': search_query,
        'created_at': created_at,
        'total_calculation': total_calculation,
    }
    
    return render(request, 'request.html', context)


def delete_request(request, request_id):
    
    if request.method != 'POST':
        return redirect('index')
    
    search_query = request.GET.get('search', '')
    
    # SQL UPDATE без ORM (требование лабораторной 2)
    with connection.cursor() as cursor:
        cursor.execute(
            """
            UPDATE requests
            SET status = 'deleted'
            WHERE id = %s AND status = 'draft'
            """,
            [request_id]
        )
    
    redirect_url = f"/?search={search_query}" if search_query else '/'
    return redirect(redirect_url)