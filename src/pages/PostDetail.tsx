import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FeedLayout } from '@/components/Feed/FeedLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react';
import { socialAPI } from '@/lib/django-api-new';
import { interactionRepository } from '@/repositories/InteractionRepository';
import djangoApi from '@/lib/django-api-new';
import { toast } from 'sonner';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatRelativeTime } from '@/utils/dateUtils';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import type { Post, Comment, UserProfile } from '@/lib/django-api-new';

const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL || 'http://localhost:8000';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (id) {
      loadPost();
      loadComments();
    }
  }, [id]);

  const loadPost = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const postData = await socialAPI.getPost(id);
      setPost(postData);
      setIsLiked(postData.is_liked_by_user || false);
      setLikeCount(postData.likes_count || 0);
      setIsBookmarked(postData.is_bookmarked_by_user || false);
    } catch (err) {
      setError('Post konnte nicht geladen werden');
      toast.error('Fehler beim Laden des Posts');
    } finally {
      setIsLoading(false);
    }
  };

  const loadComments = async () => {
    if (!id) return;
    
    try {
      const commentsData = await socialAPI.getComments(id);
      setComments(Array.isArray(commentsData) ? commentsData : commentsData.results || []);
    } catch (err) {
      console.error('Error loading comments:', err);
    }
  };

  const handleLike = async () => {
    if (!post) return;
    
    try {
      await socialAPI.togglePostLike(post.id);
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (err) {
      toast.error('Fehler beim Liken');
    }
  };

  const handleBookmark = async () => {
    if (!post) return;
    
    try {
      if (isBookmarked) {
        await djangoApi.unbookmarkPost(post.id);
        setIsBookmarked(false);
        toast.success('Bookmark entfernt');
      } else {
        await djangoApi.bookmarkPost(post.id);
        setIsBookmarked(true);
        toast.success('Bookmark hinzugefügt');
      }
    } catch (err) {
      toast.error('Fehler bei Bookmark-Aktion');
    }
  };

  const handleShare = async () => {
    if (!post) return;
    
    try {
      await socialAPI.sharePost(post.id);
      toast.success('Post geteilt!');
    } catch (err) {
      toast.error('Fehler beim Teilen');
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !post) return;
    
    setIsSubmittingComment(true);
    try {
      const comment = await socialAPI.createComment(post.id, { content: newComment });
      if (comment) {
        setComments(prev => [...prev, comment]);
        setNewComment('');
        toast.success('Kommentar hinzugefügt');
      }
    } catch (err) {
      toast.error('Fehler beim Erstellen des Kommentars');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const getSafeMediaUrl = (url: string | undefined): string => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${MEDIA_BASE_URL}${url}`;
  };

  const getAvatarUrl = (avatarUrl?: string): string => {
    if (!avatarUrl) return '';
    if (avatarUrl.startsWith('http')) return avatarUrl;
    return `${MEDIA_BASE_URL}${avatarUrl}`;
  };

  if (isLoading) {
    return (
      <FeedLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </FeedLayout>
    );
  }

  if (error || !post) {
    return (
      <FeedLayout>
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6 text-center">
            <p className="text-red-500 mb-4">{error || 'Post nicht gefunden'}</p>
            <Button onClick={() => navigate('/feed')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück zum Feed
            </Button>
          </CardContent>
        </Card>
      </FeedLayout>
    );
  }

  return (
    <FeedLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück
        </Button>

        {/* Post Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={getAvatarUrl(post.author.avatar_url)} />
                <AvatarFallback>
                  {post.author.display_name?.charAt(0) || post.author.username.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">
                  {post.author.display_name || post.author.username}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {formatRelativeTime(post.created_at)}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Post Content */}
            <p className="text-sm">{post.content}</p>

            {/* Post Media */}
            {post.media_url && (
              <div className="rounded-lg overflow-hidden">
                {post.media_type === 'video' ? (
                  <video 
                    src={getSafeMediaUrl(post.media_url)} 
                    controls 
                    className="w-full h-auto"
                  />
                ) : (
                  <img 
                    src={getSafeMediaUrl(post.media_url)} 
                    alt="Post media" 
                    className="w-full h-auto object-cover"
                  />
                )}
              </div>
            )}

            {/* Post Actions */}
            <div className="flex items-center space-x-4 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`flex items-center space-x-2 ${isLiked ? 'text-red-500' : ''}`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                <span>{likeCount}</span>
              </Button>

              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span>{comments.length}</span>
              </Button>

              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
                className={isBookmarked ? 'text-blue-500' : ''}
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Kommentare ({comments.length})</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Comment */}
            <div className="space-y-2">
              <Textarea
                placeholder="Schreibe einen Kommentar..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
              />
              <Button 
                onClick={handleCommentSubmit}
                disabled={!newComment.trim() || isSubmittingComment}
                size="sm"
              >
                {isSubmittingComment ? 'Wird gesendet...' : 'Kommentieren'}
              </Button>
            </div>

            <Separator />

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={getAvatarUrl(comment.author.avatar_url)} />
                    <AvatarFallback>
                      {comment.author.display_name?.charAt(0) || comment.author.username.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">
                        {comment.author.display_name || comment.author.username}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))}
              
              {comments.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Noch keine Kommentare. Sei der Erste!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </FeedLayout>
  );
};

export default PostDetail; 