from django.urls import path
from . import views

urlpatterns = [
    path('reservations/', views.ICOTokenReservationViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='ico-reservations'),
    path('reservations/<int:pk>/', views.ICOTokenReservationViewSet.as_view({
        'get': 'retrieve',
        'delete': 'destroy'
    }), name='ico-reservation-detail'),
    path('stats/', views.ICOStatsView.as_view(), name='ico-stats'),
    path('config/', views.ICOConfigView.as_view(), name='ico-config'),
] 