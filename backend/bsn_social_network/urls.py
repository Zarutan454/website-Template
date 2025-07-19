from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views
from .views import HashtagViewSet, PhotoAlbumViewSet, PhotoViewSet, GroupEventRSVPViewSet, vote_in_post_poll, get_post_poll, group_online_status

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
router.register(r'albums', PhotoAlbumViewSet, basename='albums')
router.register(r'photos', PhotoViewSet, basename='photos')
router.register(r'group-events', views.GroupEventViewSet, basename='group-events')
router.register(r'group-event-rsvps', GroupEventRSVPViewSet, basename='group-event-rsvp')

urlpatterns = [
    # Authentication Endpoints
    path('auth/register/', views.UserRegistrationView.as_view(), name='user-register'),
    path('auth/login/', views.UserLoginView.as_view(), name='user-login'),
    path('auth/logout/', views.user_logout, name='user-logout'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('auth/user/', views.UserProfileView.as_view(), name='user-profile'),
    path('auth/alpha-access/', views.request_alpha_access, name='alpha-access-request'),
    
    # Wallet & Token Endpoints
    path('wallet/', views.WalletView.as_view(), name='wallet'),
    path('wallet/transfer/', views.transfer_tokens, name='transfer-tokens'),
    path('wallet/balance/', views.get_token_balance, name='get-token-balance'),
    path('wallet/stake/', views.stake_tokens, name='stake-tokens'),
    path('wallet/unstake/', views.unstake_tokens, name='unstake-tokens'),
    path('wallet/staking-info/', views.get_staking_info, name='get-staking-info'),
    path('wallet/stream/create/', views.create_token_stream, name='create-token-stream'),
    path('wallet/streams/', views.get_token_streams, name='get-token-streams'),
    
    # Smart Contract Endpoints
    path('contracts/deploy/', views.deploy_smart_contract, name='deploy-smart-contract'),
    path('contracts/', views.get_smart_contracts, name='get-smart-contracts'),
    
    # NFT Management Endpoints
    path('nfts/mint/', views.mint_nft, name='mint-nft'),
    path('nfts/<str:nft_id>/stake/', views.stake_nft, name='stake-nft'),
    path('nfts/<str:nft_id>/unstake/', views.unstake_nft, name='unstake-nft'),
    
    # Mining Endpoints
    path('mining/stats/', views.get_mining_stats, name='mining-stats'),
    path('mining/start/', views.start_mining, name='start-mining-session'),
    path('mining/stop/', views.stop_mining_session, name='stop-mining-session'),
    path('mining/claim/', views.claim_tokens, name='claim_tokens'),
    path('mining/heartbeat/', views.mining_heartbeat, name='mining_heartbeat'),
    path('mining/boost/', views.create_mining_boost, name='create-mining-boost'),
    path('mining/leaderboard/', views.mining_leaderboard, name='mining-leaderboard'),
    path('mining/activities/', views.mining_activities, name='mining-activities'),
    path('mining/achievements/', views.mining_achievements, name='mining-achievements'),
    
    # Achievement Endpoints (KONSOLIDIERT - Keine Duplikate mehr)
    path('achievements/', views.get_achievements, name='get-achievements'),
    path('achievements/user/<int:user_id>/', views.get_user_achievements, name='user-achievements'),
    
    # Story Endpoints
    path('stories/my/', views.get_my_stories, name='my-stories'),
    path('stories/following/', views.get_following_stories, name='following-stories'),
    path('stories/<int:story_id>/view/', views.mark_story_viewed, name='mark-story-viewed'),
    path('stories/<int:story_id>/report/', views.report_story, name='report-story'),
    
    # Reels Endpoints
    path('reels/', views.get_reels, name='get_reels'),
    path('reels/create/', views.create_reel, name='create_reel'),
    path('reels/<int:reel_id>/', views.get_reel, name='get_reel'),
    path('reels/<int:reel_id>/like/', views.like_reel, name='like_reel'),
    path('reels/<int:reel_id>/comment/', views.comment_reel, name='comment_reel'),
    
    # NFT Endpoints
    path('nfts/', views.get_nfts, name='get_nfts'),
    path('nfts/create/', views.create_nft, name='create_nft'),
    path('nfts/search/', views.search_nfts, name='search_nfts'),
    path('nfts/<int:nft_id>/', views.get_nft, name='get_nft'),
    path('nfts/<int:nft_id>/view/', views.increment_nft_view, name='increment_nft_view'),
    path('nfts/<int:nft_id>/buy/', views.buy_nft, name='buy_nft'),
    path('nfts/<int:nft_id>/list/', views.list_nft, name='list_nft'),
    path('nfts/<int:nft_id>/unlist/', views.unlist_nft, name='unlist_nft'),
    path('nfts/<int:nft_id>/favorite/', views.favorite_nft, name='favorite_nft'),
    path('nfts/<int:nft_id>/unfavorite/', views.unfavorite_nft, name='unfavorite_nft'),
    
    # Media Upload Endpoints
    path('upload/media/', views.upload_media, name='upload-media'),
    
    # DAO Endpoints (additional)
    path('proposals/active/', views.active_proposals, name='active-proposals'),
    path('proposals/<int:proposal_id>/vote/', views.vote_on_proposal, name='vote-on-proposal'),
    
    # ICO Endpoints
    path('ico/reserve/', views.create_ico_reservation, name='create-ico-reservation'),
    
    # Settings Endpoints
    path('settings/', views.UserSettingsView.as_view(), name='user-settings'),
    path('settings/notifications/', views.NotificationSettingsView.as_view(), name='notification-settings'),
    
    # User Relationship Endpoints
    path('followers/<int:user_id>/', views.get_followers, name='get_followers'),
    path('following/<int:user_id>/', views.get_following, name='get_following'),
    path('follow/<int:user_id>/', views.follow_user, name='follow_user'),
    path('unfollow/<int:user_id>/', views.unfollow_user, name='unfollow_user'),
    
    # Profil-Endpunkte (MUSS VOR dem include stehen!)
    path('users/profile/<int:user_id>/', views.get_user_profile_by_id, name='user-profile-by-id'),
    path('users/<int:user_id>/photos/', views.get_user_photos, name='user-photos'),
    path('users/<int:user_id>/activity/', views.get_user_activity, name='user-activity'),
    path('users/<int:user_id>/analytics/', views.get_user_analytics, name='user-analytics'),
    path('users/<int:user_id>/privacy/', views.get_user_privacy, name='user-privacy'),
    path('users/<int:user_id>/social-links/', views.get_user_social_links, name='user-social-links'),
    # Neue erweiterte Profil-Endpunkte
    path('users/<int:user_id>/upload-photo/', views.upload_profile_photo, name='upload-profile-photo'),
    path('users/<int:user_id>/update-privacy/', views.update_privacy_settings, name='update-privacy-settings'),
    path('users/<int:user_id>/update-social-links/', views.update_social_links, name='update-social-links'),
    path('users/<int:user_id>/delete-photo/<int:photo_id>/', views.delete_profile_photo, name='delete-profile-photo'),
    path('users/<int:user_id>/stats/', views.get_user_stats, name='user-stats'),
    path('users/<int:user_id>/report/', views.report_user, name='report-user'),
    path('users/<int:user_id>/recommendations/', views.get_user_recommendations, name='user-recommendations'),

    # Danach erst das include!
    path('users/', include(('users.urls', 'users_app'), namespace='users_app')),
    
    # Group Analytics and Reports (MUSS VOR dem Router stehen!)
    path('groups/<int:group_id>/analytics/', views.group_analytics, name='group-analytics'),
    path('groups/<int:group_id>/reports/', views.group_reports, name='group-reports'),
    
    # Router URLs (MUSS NACH den spezifischen URLs stehen!)
    path('', include(router.urls)),
    
    # Group Chat File Sharing & Admin Management
    path('groups/<int:group_id>/file-upload/', views.group_message_file_upload, name='group-message-file-upload'),
    path('groups/messages/<int:message_id>/file-download/', views.group_message_file_download, name='group-message-file-download'),
    path('groups/messages/<int:message_id>/file-delete/', views.group_message_file_delete, name='group-message-file-delete'),
    path('groups/<int:group_id>/promote/<int:user_id>/', views.group_promote_member, name='group-promote-member'),
    path('groups/<int:group_id>/demote/<int:user_id>/', views.group_demote_member, name='group-demote-member'),
    path('groups/<int:group_id>/kick/<int:user_id>/', views.group_kick_member, name='group-kick-member'),
    path('groups/<int:group_id>/search/', views.group_message_search, name='group-message-search'),
    path('groups/<int:group_id>/media/', views.get_group_media, name='get-group-media'),
    path('groups/<int:group_id>/files/', views.get_group_files, name='get-group-files'),
    path('groups/<int:group_id>/ai-summary/', views.add_group_ai_summary, name='group-ai-summary'),

    # Advanced Search Endpoints
    path('search/advanced/', views.advanced_user_search, name='advanced-user-search'),
    path('search/recommendations/', views.get_user_recommendations, name='user-recommendations'),
    path('search/trending/', views.get_trending_users, name='trending-users'),
    path('search/similar/<int:user_id>/', views.get_similar_users, name='similar-users'),
    path('search/suggestions/', views.get_search_suggestions, name='search-suggestions'),
    path('search/popular/', views.get_popular_searches, name='popular-searches'),
    path('search/discovery/', views.get_discovery_feed, name='discovery-feed'),
    path('search/analytics/', views.get_search_analytics, name='search-analytics'),

    # Story Interactions (Facebook-Style)
    path('stories/<int:story_id>/react/', views.react_to_story, name='react-to-story'),
    path('stories/<int:story_id>/reactions/', views.get_reactions, name='get-reactions'),
    path('stories/<int:story_id>/reply/', views.reply_to_story, name='reply-to-story'),
    path('stories/<int:story_id>/replies/', views.get_replies, name='get-replies'),
    path('stories/<int:story_id>/poll/vote/', views.vote_in_poll, name='vote-in-poll'),
    path('stories/<int:story_id>/poll/', views.get_poll, name='get-poll'),
    path('stories/<int:story_id>/music/', views.add_music_to_story, name='add-music-to-story'),
    path('stories/<int:story_id>/music/', views.get_music, name='get-music'),
    path('stories/<int:story_id>/sticker/', views.add_sticker_to_story, name='add-sticker-to-story'),
    path('stories/<int:story_id>/stickers/', views.get_stickers, name='get-stickers'),
    path('stories/highlights/', views.create_highlight, name='create-highlight'),
    path('stories/highlights/', views.get_highlights, name='get-highlights'),
    path('stories/<int:story_id>/viewers/', views.get_viewers, name='get-viewers'),
    path('spotify/search/', views.spotify_search, name='spotify-search'),
]
urlpatterns += [
    path('posts/<int:post_id>/poll/vote/', vote_in_post_poll, name='vote-in-post-poll'),
    path('posts/<int:post_id>/poll/', get_post_poll, name='get-post-poll'),
    path('groups/<int:group_id>/online/', group_online_status, name='group-online-status'),
] 