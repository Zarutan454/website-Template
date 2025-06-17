from django.urls import path
from . import views

urlpatterns = [
    path('', views.NFTListView.as_view(), name='api-nft-list'),
    path('create/', views.NFTCreateView.as_view(), name='api-nft-create'),
    path('<int:pk>/', views.NFTDetailView.as_view(), name='api-nft-detail'),
    path('<int:pk>/transfer/', views.NFTTransferView.as_view(), name='api-nft-transfer'),
    path('<int:pk>/marketplace/', views.NFTMarketplaceView.as_view(), name='api-nft-marketplace'),
    path('<int:pk>/purchase/', views.NFTPurchaseView.as_view(), name='api-nft-purchase'),
] 