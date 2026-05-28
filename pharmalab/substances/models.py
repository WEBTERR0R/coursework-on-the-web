from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.conf import settings


class User(AbstractUser):
    """Расширенная модель пользователя"""
    email = models.EmailField(unique=True)
    is_moderator = models.BooleanField(default=False, verbose_name="Модератор")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    
    class Meta:
        db_table = 'users'
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'
    
    def __str__(self):
        return self.username


class Substance(models.Model):
    """Фармацевтические субстанции (услуги)"""
    name = models.CharField(max_length=200, verbose_name="Наименование")
    cas = models.CharField(max_length=50, unique=True, verbose_name="CAS номер")
    description = models.TextField(verbose_name="Краткое описание", default="")
    full_description = models.TextField(verbose_name="Полное описание", default="")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Цена", default=0)
    unit = models.CharField(max_length=20, default="кг", verbose_name="Единица измерения")
    
    # MinIO поля
    image_key = models.CharField(max_length=200, null=True, blank=True, verbose_name="Ключ изображения в MinIO")
    video_key = models.CharField(max_length=200, null=True, blank=True, verbose_name="Ключ видео в MinIO")
    
    is_active = models.BooleanField(default=True, verbose_name="Активен")
    molecular_weight = models.DecimalField(max_digits=10, decimal_places=2, default=100.00, verbose_name="Молекулярная масса")
    storage_conditions = models.CharField(max_length=500, default="", verbose_name="Условия хранения")
    shelf_life = models.IntegerField(default=24, verbose_name="Срок годности (месяцев)")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")
    
    # Дополнительные поля
    manufacturer = models.CharField(max_length=200, blank=True, default="", verbose_name="Производитель")
    country_of_origin = models.CharField(max_length=100, blank=True, default="", verbose_name="Страна производства")
    purity = models.DecimalField(max_digits=5, decimal_places=2, default=99.0, verbose_name="Чистота (%)")
    pharmacopoeia = models.CharField(max_length=50, default="USP, EP", verbose_name="Фармакопея")
    storage_temperature = models.CharField(max_length=50, default="15-25°C", verbose_name="Температура хранения")
    
    class Meta:
        db_table = 'substances'
        verbose_name = 'Субстанция'
        verbose_name_plural = 'Субстанции'
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['cas']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} (CAS: {self.cas})"
    
    @property
    def image_url(self):
        if self.image_key:
            return f"http://{settings.MINIO_ENDPOINT}/{settings.MINIO_BUCKET}/{self.image_key}"
        return "https://via.placeholder.com/800x450?text=No+Image"
    
    @property
    def video_url(self):
        if self.video_key:
            return f"http://{settings.MINIO_ENDPOINT}/{settings.MINIO_BUCKET}/{self.video_key}"
        return ""
    
    @property
    def price_display(self):
        return f"{self.price} ₽/{self.unit}"


class Request(models.Model):
    """Заявки на субстанции"""
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Черновик'
        DELETED = 'deleted', 'Удалён'
        FORMED = 'formed', 'Сформирован'
        COMPLETED = 'completed', 'Завершён'
        REJECTED = 'rejected', 'Отклонён'
    
    user = models.ForeignKey(
        User, 
        on_delete=models.RESTRICT, 
        related_name='requests',
        verbose_name="Создатель"
    )
    status = models.CharField(
        max_length=20, 
        choices=Status.choices, 
        default=Status.DRAFT,
        verbose_name="Статус"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    formed_at = models.DateTimeField(null=True, blank=True, verbose_name="Дата формирования")
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name="Дата завершения")
    moderator = models.ForeignKey(
        User, 
        on_delete=models.RESTRICT, 
        null=True, 
        blank=True, 
        related_name='moderated_requests',
        verbose_name="Модератор"
    )
    total_amount = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0,
        verbose_name="Общая сумма"
    )
    delivery_address = models.CharField(max_length=500, blank=True, default="", verbose_name="Адрес доставки")
    comments = models.TextField(blank=True, default="", verbose_name="Комментарии")
    
    class Meta:
        db_table = 'requests'
        verbose_name = 'Заявка'
        verbose_name_plural = 'Заявки'
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['status']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'status'],
                condition=models.Q(status='draft'),
                name='unique_user_draft'
            )
        ]
    
    def __str__(self):
        return f"Заявка №{self.id} ({self.get_status_display()})"
    
    def calculate_total(self):
        total = sum(
            float(item.substance.price) * float(item.quantity)
            for item in self.items.filter(is_active=True)
        )
        self.total_amount = total
        self.save(update_fields=['total_amount'])
        return total
    
    def get_items_count(self):
        return self.items.filter(is_active=True).count()


class RequestItem(models.Model):
    """Позиции в заявке (м-м связь)"""
    request = models.ForeignKey(
        Request, 
        on_delete=models.RESTRICT, 
        related_name='items',
        verbose_name="Заявка"
    )
    substance = models.ForeignKey(
        Substance, 
        on_delete=models.RESTRICT, 
        related_name='request_items',
        verbose_name="Субстанция"
    )
    quantity = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=1,
        verbose_name="Количество"
    )
    unit = models.CharField(max_length=20, default="кг", verbose_name="Единица измерения")
    mm_value = models.CharField(
        max_length=200, 
        blank=True, 
        default="",
        verbose_name="Поле м-м"
    )
    order_number = models.IntegerField(default=1, verbose_name="Порядковый номер")
    is_main = models.BooleanField(default=False, verbose_name="Главная позиция")
    item_comment = models.CharField(max_length=500, blank=True, default="", verbose_name="Комментарий к позиции")
    is_active = models.BooleanField(default=True, verbose_name="Активен")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    calculated_value = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0,
        verbose_name="Результат вычислений"
    )
    
    class Meta:
        db_table = 'request_items'
        verbose_name = 'Позиция заявки'
        verbose_name_plural = 'Позиции заявок'
        unique_together = [['request', 'substance', 'is_active']]
        indexes = [
            models.Index(fields=['request', 'is_active']),
            models.Index(fields=['substance', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.substance.name} x {self.quantity}"
    
    @property
    def service_name(self):
        return self.substance.name
    
    @property
    def service_cas(self):
        return self.substance.cas
    
    @property
    def service_price(self):
        return self.substance.price_display
    
    @property
    def item_total(self):
        return float(self.substance.price) * float(self.quantity)
    
    def calculate_value(self):
        self.calculated_value = float(self.substance.price) * float(self.quantity)
        return self.calculated_value