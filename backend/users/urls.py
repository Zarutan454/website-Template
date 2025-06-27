from django.urls import path
from . import views

app_name = 'users_app'

urlpatterns = [
    # Authentication
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    path('login/', views.UserLoginView.as_view(), name='login'),
    path('logout/', views.UserLogoutView.as_view(), name='logout'),
    
    # Wallet authentication
    path('metamask/', views.MetaMaskLoginView.as_view(), name='metamask-login'),
    path('register-wallet/', views.WalletRegistrationView.as_view(), name='register-wallet'),
    
    # Profile image upload
    path('upload/avatar/', views.AvatarUploadView.as_view(), name='upload-avatar'),
    path('upload/cover/', views.CoverUploadView.as_view(), name='upload-cover'),
    
    # Profile management
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('profile/detail/', views.UserProfileDetailView.as_view(), name='profile-detail'),
    path('profile/<str:username>/', views.UserProfileByUsernameView.as_view(), name='profile-by-username'),
    path('<int:user_id>/profile/', views.UserProfileByIdView.as_view(), name='profile-by-id'),
    
    # User Relationships - Follow/Unfollow
    path('<int:user_id>/follow/', views.FollowUserView.as_view(), name='follow-user'),
    path('<int:user_id>/unfollow/', views.UnfollowUserView.as_view(), name='unfollow-user'),
    path('<int:user_id>/is-following/', views.IsFollowingView.as_view(), name='is-following'),
    path('<int:user_id>/follow-stats/', views.FollowStatsView.as_view(), name='follow-stats'),
    path('<int:user_id>/followers/', views.FollowersListView.as_view(), name='followers-list'),
    path('<int:user_id>/following/', views.FollowingListView.as_view(), name='following-list'),
    
    # User Relationships - Block/Unblock
    path('<int:user_id>/block/', views.BlockUserView.as_view(), name='block-user'),
    path('<int:user_id>/unblock/', views.UnblockUserView.as_view(), name='unblock-user'),
    path('<int:user_id>/is-blocked/', views.IsBlockedView.as_view(), name='is-blocked'),
    path('blocked/', views.BlockedUsersListView.as_view(), name='blocked-users'),
    
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
    
    # Search
    path('search/', views.UserSearchView.as_view(), name='search'),
    
    # Settings
    path('settings/', views.UserSettingsView.as_view(), name='settings'),
] 