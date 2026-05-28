from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('substances.urls')),           # HTML страницы
    path('api/', include('substances.urls_api')),   # API (префикс api/)
]