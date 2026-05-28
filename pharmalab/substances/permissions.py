from rest_framework import permissions


class IsModerator(permissions.BasePermission):
    """
    Разрешение только для модераторов.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_moderator
    
    def has_object_permission(self, request, view, obj):
        return request.user.is_authenticated and request.user.is_moderator


class IsOwnerOrModerator(permissions.BasePermission):
    """
    Разрешение для владельца объекта или модератора.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.is_moderator:
            return True
        
        # Для заявок (Request)
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        # Для позиций заявок (RequestItem)
        if hasattr(obj, 'request') and hasattr(obj.request, 'user'):
            return obj.request.user == request.user
        
        return False


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Разрешение: чтение для всех, изменение только для владельца.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        return False


class IsModeratorOrReadOnly(permissions.BasePermission):
    """
    Разрешение: чтение для всех, изменение только для модераторов.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.is_moderator