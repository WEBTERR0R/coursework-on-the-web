from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('substances.urls')),           
    path('api/', include('substances.urls_api')),   
]