from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    # Authentication
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    path('login/', views.UserLoginView.as_view(), name='login'),
    path('logout/', views.UserLogoutView.as_view(), name='logout'),
    
    # Profile management
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('profile/detail/', views.UserProfileDetailView.as_view(), name='profile-detail'),
    
    # Password management
    path('password/change/', views.PasswordChangeView.as_view(), name='password-change'),
    path('password/reset/', views.PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password/reset/confirm/', views.PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    
    # Email verification
    path('email/verify/', views.EmailVerificationView.as_view(), name='email-verify'),
    
    # Sessions
    path('sessions/', views.UserSessionsView.as_view(), name='sessions'),
    path('sessions/<uuid:session_id>/', views.UserSessionDeleteView.as_view(), name='session-delete'),
    
    # Statistics
    path('stats/', views.user_stats, name='user-stats'),
] 