from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from . import api_views

schema_view = get_schema_view(
    openapi.Info(
        title="PharmaLab API",
        default_version='v1',
        description="API для каталога фармацевтических субстанций",
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

router = DefaultRouter()
router.register(r'substances', api_views.SubstanceViewSet, basename='substance')
router.register(r'requests', api_views.RequestViewSet, basename='request')
router.register(r'request-items', api_views.RequestItemViewSet, basename='requestitem')
router.register(r'auth', api_views.AuthViewSet, basename='auth')

urlpatterns = [
    path('', include(router.urls)),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]