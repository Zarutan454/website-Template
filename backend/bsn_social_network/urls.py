from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

# Create router for ViewSets
router = DefaultRouter()
router.register(r'posts', views.PostViewSet, basename='posts')
router.register(r'comments', views.CommentViewSet, basename='comments')
router.register(r'groups', views.GroupViewSet, basename='groups')
router.register(r'friendships', views.FriendshipViewSet, basename='friendships')
router.register(r'transactions', views.TokenTransactionViewSet, basename='transactions')
router.register(r'daos', views.DAOViewSet, basename='daos')
router.register(r'proposals', views.ProposalViewSet, basename='proposals')
router.register(r'ico-reservations', views.ICOTokenReservationViewSet, basename='ico-reservations')
router.register(r'nfts', views.NFTViewSet, basename='nfts')
router.register(r'notifications', views.NotificationViewSet, basename='notifications')
router.register(r'demo-tokens', views.DemoTokenViewSet, basename='demo-tokens')
router.register(r'demo-transactions', views.DemoTransactionViewSet, basename='demo-transactions')
router.register(r'stories', views.StoryViewSet, basename='stories')

urlpatterns = [
    # Authentication Endpoints
    path('auth/register/', views.UserRegistrationView.as_view(), name='user-register'),
    path('auth/login/', views.UserLoginView.as_view(), name='user-login'),
    path('auth/logout/', views.user_logout, name='user-logout'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('auth/user/', views.UserProfileView.as_view(), name='user-profile'),
    path('auth/alpha-access/', views.request_alpha_access, name='alpha-access-request'),
    
    # User Profile Endpoints
    path('users/profile/about/', views.UserProfileAboutView.as_view(), name='user-profile-about'),
    path('users/profile/social-links/', views.UserSocialLinksView.as_view(), name='user-social-links'),
    
    # Wallet & Token Endpoints
    path('wallet/', views.WalletView.as_view(), name='wallet'),
    path('wallet/transfer/', views.transfer_tokens, name='transfer-tokens'),
    
    # Mining Endpoints
    path('mining/stats/', views.get_mining_stats, name='mining-stats'),
    path('mining/start/', views.start_mining, name='start-mining-session'),
    path('mining/stop/', views.stop_mining_session, name='stop-mining-session'),
    path('mining/claim/', views.claim_tokens, name='claim_tokens'),
    path('mining/heartbeat/', views.mining_heartbeat, name='mining_heartbeat'),
    path('mining/achievements/', views.get_achievements, name='get_achievements'),
    path('mining/boost/', views.create_mining_boost, name='create-mining-boost'),
    path('mining/leaderboard/', views.mining_leaderboard, name='mining-leaderboard'),
    path('mining/activities/', views.mining_activities, name='mining-activities'),
    
    # Achievement Endpoints
    path('achievements/', views.get_achievements, name='get-achievements'),
    path('achievements/user/<int:user_id>/', views.get_user_achievements, name='user-achievements'),
    
    # Story Endpoints
    path('stories/my/', views.get_my_stories, name='my-stories'),
    path('stories/following/', views.get_following_stories, name='following-stories'),
    path('stories/<int:story_id>/view/', views.mark_story_viewed, name='mark-story-viewed'),
    
    # Media Upload Endpoints
    path('upload/media/', views.upload_media, name='upload-media'),
    
    # Story Management Endpoints
    path('stories/cleanup/', views.cleanup_expired_stories_manual, name='cleanup-expired-stories'),
    path('stories/statistics/', views.get_story_statistics, name='story-statistics'),
    
    # Story Interactions Endpoints
    path('stories/<int:story_id>/like/', views.story_like_toggle, name='story-like-toggle'),
    path('stories/<int:story_id>/comments/', views.story_comments, name='story-comments'),
    path('stories/<int:story_id>/comments/<int:comment_id>/', views.story_comment_delete, name='story-comment-delete'),
    path('stories/<int:story_id>/share/', views.story_share, name='story-share'),
    path('stories/<int:story_id>/bookmark/', views.story_bookmark_toggle, name='story-bookmark-toggle'),
    path('stories/bookmarks/', views.story_bookmarks, name='story-bookmarks'),
    
    # Follow/Unfollow API Endpoints
    path('follow/', views.FollowUserView.as_view(), name='follow-user'),
    path('follow/<int:user_id>/', views.UnfollowUserView.as_view(), name='unfollow-user'),
    path('followers/<int:user_id>/', views.FollowersListView.as_view(), name='followers-list'),
    path('following/<int:user_id>/', views.FollowingListView.as_view(), name='following-list'),
    path('follow/status/<int:user_id>/', views.FollowStatusView.as_view(), name='follow-status'),
    
    # DAO Endpoints (additional)
    path('proposals/active/', views.active_proposals, name='active-proposals'),
    path('proposals/<int:proposal_id>/vote/', views.vote_on_proposal, name='vote-on-proposal'),
    
    # ICO Endpoints
    path('ico/reserve/', views.create_ico_reservation, name='create-ico-reservation'),
    
    # Settings Endpoints
    path('settings/', views.UserSettingsView.as_view(), name='user-settings'),
    path('settings/notifications/', views.NotificationSettingsView.as_view(), name='notification-settings'),
    
    # Include router URLs
    path('', include(router.urls)),
    path('nfts/<int:nft_id>/like/', views.NFTLikeView.as_view(), name='nft-like'),
    path('nfts/<int:nft_id>/view/', views.NFTViewView.as_view(), name='nft-view'),
] 