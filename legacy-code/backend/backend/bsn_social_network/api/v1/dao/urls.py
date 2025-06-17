from django.urls import path
from . import views

urlpatterns = [
    path('', views.DAOListView.as_view(), name='api-dao-list'),
    path('<int:pk>/', views.DAODetailView.as_view(), name='api-dao-detail'),
    path('<int:pk>/members/', views.DAOMembershipView.as_view(), name='api-dao-members'),
    path('<int:dao_pk>/members/<int:user_pk>/role/', views.MemberRoleView.as_view(), name='api-member-role'),
    path('<int:dao_pk>/members/<int:user_pk>/voting-power/', views.VotingPowerView.as_view(), name='api-voting-power'),
    path('<int:pk>/proposals/', views.ProposalListView.as_view(), name='api-proposal-list'),
    path('proposals/<int:pk>/', views.ProposalDetailView.as_view(), name='api-proposal-detail'),
    path('proposals/<int:pk>/status/', views.ProposalStatusView.as_view(), name='api-proposal-status'),
    path('proposals/<int:pk>/votes/', views.VoteView.as_view(), name='api-votes'),
    path('<int:pk>/treasury/', views.DAOTreasuryView.as_view(), name='api-dao-treasury'),
] 