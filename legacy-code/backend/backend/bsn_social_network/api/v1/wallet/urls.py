from django.urls import path
from . import views

urlpatterns = [
    path('', views.WalletView.as_view(), name='api-wallet'),
    path('transactions/', views.TransactionListView.as_view(), name='api-transactions'),
    path('send/', views.SendTokensView.as_view(), name='api-send-tokens'),
    path('stats/', views.WalletStatsView.as_view(), name='api-wallet-stats'),
] 