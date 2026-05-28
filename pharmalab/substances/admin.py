from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Substance, Request, RequestItem


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'is_moderator', 'created_at']
    list_filter = ['is_moderator', 'is_active']
    fieldsets = UserAdmin.fieldsets + (
        ('Дополнительно', {'fields': ('is_moderator', 'created_at')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Дополнительно', {'fields': ('email', 'is_moderator')}),
    )


@admin.register(Substance)
class SubstanceAdmin(admin.ModelAdmin):
    list_display = ['name', 'cas', 'price', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'cas']


@admin.register(Request)
class RequestAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'status', 'created_at', 'total_amount']
    list_filter = ['status', 'created_at']
    search_fields = ['user__username', 'delivery_address']


@admin.register(RequestItem)
class RequestItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'request', 'substance', 'quantity', 'is_active']
    list_filter = ['is_active']