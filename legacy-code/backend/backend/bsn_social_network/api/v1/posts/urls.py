from django.urls import path
from . import views

urlpatterns = [
    path('', views.PostListCreateView.as_view(), name='api-post-list-create'),
    path('<int:pk>/', views.PostDetailView.as_view(), name='api-post-detail'),
    path('<int:pk>/comments/', views.CommentListCreateView.as_view(), name='api-comment-list-create'),
    path('comments/<int:pk>/', views.CommentDetailView.as_view(), name='api-comment-detail'),
    path('<int:pk>/likes/', views.PostLikeView.as_view(), name='api-post-like'),
    path('comments/<int:pk>/likes/', views.CommentLikeView.as_view(), name='api-comment-like'),
    path('feed/', views.FeedView.as_view(), name='api-feed'),
] 