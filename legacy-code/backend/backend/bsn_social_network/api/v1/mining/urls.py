from django.urls import path
from . import views

urlpatterns = [
    path('progress/', views.MiningProgressView.as_view(), name='api-mining-progress'),
    path('claim/', views.ClaimRewardView.as_view(), name='api-claim-reward'),
    path('stats/', views.MiningStatsView.as_view(), name='api-mining-stats'),
    path('update-power/', views.UpdateMiningPowerView.as_view(), name='api-update-mining-power'),
] 