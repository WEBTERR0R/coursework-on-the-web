from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('substance/<int:substance_id>/', views.detail, name='detail'),
    path('request/<int:request_id>/', views.request_detail, name='request'),
    path('add-to-request/<int:substance_id>/', views.add_to_request, name='add_to_request'),
    path('delete-request/<int:request_id>/', views.delete_request, name='delete_request'),
]