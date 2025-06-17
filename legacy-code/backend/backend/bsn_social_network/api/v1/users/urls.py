from django.urls import path
from . import views

urlpatterns = [
    path('', views.UserListView.as_view(), name='api-user-list'),
    path('<int:pk>/', views.UserDetailView.as_view(), name='api-user-detail'),
    path('<int:pk>/friends/', views.UserFriendsView.as_view(), name='api-user-friends'),
    path('<int:pk>/friend-requests/', views.FriendRequestView.as_view(), name='api-friend-requests'),
    path('settings/', views.UserSettingsView.as_view(), name='api-user-settings'),
    path('notification-settings/', views.NotificationSettingsView.as_view(), name='api-notification-settings'),
] 