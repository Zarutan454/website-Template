from django.urls import path
from . import views

urlpatterns = [
    path('', views.GroupListCreateView.as_view(), name='api-group-list-create'),
    path('<int:pk>/', views.GroupDetailView.as_view(), name='api-group-detail'),
    path('<int:pk>/members/', views.GroupMemberListView.as_view(), name='api-group-members'),
    path('<int:pk>/join/', views.GroupJoinView.as_view(), name='api-group-join'),
    path('<int:group_pk>/members/<int:user_pk>/', views.GroupMemberDetailView.as_view(), name='api-group-member-detail'),
    path('<int:pk>/posts/', views.GroupPostListView.as_view(), name='api-group-posts'),
] 