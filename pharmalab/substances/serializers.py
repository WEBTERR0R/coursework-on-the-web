from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from .models import User, Substance, Request, RequestItem


# пользователь

class UserSerializer(serializers.ModelSerializer):
    """Сериализатор пользователя"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_moderator', 'created_at']
        read_only_fields = ['id', 'created_at', 'is_moderator']


class UserUpdateSerializer(serializers.ModelSerializer):
    """Сериализатор редактирования профиля"""
    class Meta:
        model = User
        fields = ['username', 'email']

    def validate_username(self, value):
        user = self.context['request'].user
        if User.objects.exclude(id=user.id).filter(username=value).exists():
            raise serializers.ValidationError("Пользователь с таким именем уже существует")
        return value

    def validate_email(self, value):
        user = self.context['request'].user
        if User.objects.exclude(id=user.id).filter(email=value).exists():
            raise serializers.ValidationError("Пользователь с таким email уже существует")
        return value


class ChangePasswordSerializer(serializers.Serializer):
    """Сериализатор смены пароля"""
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=6)
    new_password_confirm = serializers.CharField(write_only=True, min_length=6)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Текущий пароль указан неверно")
        return value

    def validate(self, data):
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError("Новые пароли не совпадают")
        return data


class RegisterSerializer(serializers.ModelSerializer):
    """Сериализатор регистрации"""
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True, min_length=6)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm']
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Пароли не совпадают")
        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError("Пользователь с таким именем уже существует")
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError("Пользователь с таким email уже существует")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        validated_data['password'] = make_password(validated_data['password'])
        return User.objects.create(**validated_data)


class LoginSerializer(serializers.Serializer):
    """Сериализатор входа"""
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        user = authenticate(**data)
        if not user:
            raise serializers.ValidationError("Неверное имя пользователя или пароль")
        if not user.is_active:
            raise serializers.ValidationError("Пользователь заблокирован")
        return user


# субстанции

class SubstanceSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    video_url = serializers.SerializerMethodField()
    price_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Substance
        fields = [
            'id', 'name', 'cas', 'description', 'full_description',
            'price', 'price_display', 'unit', 'image_key', 'video_key',
            'image_url', 'video_url', 'is_active', 'molecular_weight',
            'storage_conditions', 'shelf_life', 'manufacturer',
            'country_of_origin', 'purity', 'pharmacopoeia', 'storage_temperature'
        ]
    
    def get_image_url(self, obj):
        return obj.image_url
    
    def get_video_url(self, obj):
        return obj.video_url
    
    def get_price_display(self, obj):
        return obj.price_display


class SubstanceCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Substance
        fields = [
            'name', 'cas', 'description', 'full_description', 'price',
            'unit', 'molecular_weight', 'storage_conditions', 'shelf_life',
            'manufacturer', 'country_of_origin', 'purity', 'pharmacopoeia',
            'storage_temperature'
        ]


# заявки

class RequestItemSerializer(serializers.ModelSerializer):
    substance_name = serializers.CharField(source='substance.name', read_only=True)
    substance_cas = serializers.CharField(source='substance.cas', read_only=True)
    substance_price = serializers.DecimalField(source='substance.price', read_only=True, max_digits=10, decimal_places=2)
    substance_price_display = serializers.SerializerMethodField()
    substance_image_url = serializers.SerializerMethodField()
    item_total = serializers.DecimalField(read_only=True, max_digits=12, decimal_places=2)
    item_total_display = serializers.SerializerMethodField()
    
    class Meta:
        model = RequestItem
        fields = [
            'id', 'request', 'substance', 'substance_name', 'substance_cas',
            'substance_price', 'substance_price_display', 'substance_image_url',
            'quantity', 'unit', 'mm_value', 'order_number', 'is_main',
            'item_comment', 'calculated_value', 'item_total', 'item_total_display'
        ]
        read_only_fields = ['calculated_value']
    
    def get_substance_price_display(self, obj):
        return obj.substance.price_display

    def get_substance_image_url(self, obj):
        return obj.substance.image_url

    def get_item_total_display(self, obj):
        return f"{obj.item_total:.2f} ₽"


class RequestSerializer(serializers.ModelSerializer):
    items = RequestItemSerializer(many=True, read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    moderator_username = serializers.CharField(source='moderator.username', read_only=True)
    items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Request
        fields = [
            'id', 'user', 'user_username', 'status', 'created_at',
            'formed_at', 'completed_at', 'moderator', 'moderator_username',
            'total_amount', 'delivery_address', 'comments', 'items', 'items_count'
        ]
        read_only_fields = ['user', 'created_at', 'formed_at', 'completed_at', 'moderator', 'total_amount']
    
    def get_items_count(self, obj):
        return obj.items.filter(is_active=True).count()


class RequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Request
        fields = ['delivery_address', 'comments']


class RequestUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Request
        fields = ['delivery_address', 'comments']


class RequestItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequestItem
        fields = ['substance', 'quantity', 'unit', 'mm_value', 'order_number', 'is_main', 'item_comment']


class RequestItemUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequestItem
        fields = ['quantity', 'mm_value', 'order_number', 'is_main', 'item_comment']
