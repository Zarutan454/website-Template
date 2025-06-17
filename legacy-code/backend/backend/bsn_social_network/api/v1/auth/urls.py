from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('login/', views.LoginView.as_view(), name='api-login'),
    path('register/', views.RegisterView.as_view(), name='api-register'),
    path('logout/', views.LogoutView.as_view(), name='api-logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('password-reset/', views.PasswordResetView.as_view(), name='api-password-reset'),
    path('me/', views.UserProfileView.as_view(), name='api-user-profile'),
] 