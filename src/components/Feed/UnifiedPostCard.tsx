import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Heart, MessageCircle, Share2, MoreHorizontal, Flag, Bookmark, BookmarkCheck, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { timeAgo, formatRelativeTime } from '@/utils/dateUtils';
import djangoApi from '../../lib/django-api-new';
import type { Post, Comment, UserProfile } from '../../lib/django-api-new';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { socialAPI } from '@/lib/django-api-new';
import { deleteComment } from '@/utils/commentUtils';

import PostContent from './Post/PostContent';
import SimpleShareModal from './SimpleShareModal';

// BASE_URL für Media-URLs - direkt die Backend-URL verwenden
const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL || 'http://localhost:8000';

// Die Logik in dieser Komponente ist korrekt und bleibt unverändert.
// Sie kann sowohl mit absoluten als auch mit relativen URLs umgehen.
const PostMedia: React.FC<{ mediaUrl: string; mediaType?: string }> = ({ mediaUrl, mediaType }) => {
  const getSafeMediaUrl = (url: string | undefined): string => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const fullUrl = `${MEDIA_BASE_URL}${url}`;
    console.log('[PostMedia] Original URL:', url);
    console.log('[PostMedia] MEDIA_BASE_URL:', MEDIA_BASE_URL);
    console.log('[PostMedia] Full URL:', fullUrl);
    return fullUrl;
  };
  
  const safeMediaUrl = getSafeMediaUrl(mediaUrl);

  if (!mediaType) {
    if (/\.(jpg|jpeg|png|gif|webp)$/i.test(safeMediaUrl)) {
      mediaType = 'image';
    } else if (/\.(mp4|webm|ogg)$/i.test(safeMediaUrl)) {
      mediaType = 'video';
    }
  }

  switch (mediaType) {
    case 'image':
      return (
        <img 
          src={safeMediaUrl} 
          alt="Post media" 
          className="w-full h-auto object-cover"
        />
      );
    case 'video':
      return (
        <video 
          src={safeMediaUrl} 
          controls 
          className="w-full h-auto"
        >
          Your browser does not support the video tag.
        </video>
      );
    default:
      return (
        <a href={safeMediaUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          Anhang ansehen
        </a>
      );
  }
};

export interface UnifiedPostCardProps {
  post: Post;
  onLike: (postId: number) => Promise<boolean>;
  onDelete?: (postId: number) => Promise<boolean>;
  onComment: (postId: number, content: string) => Promise<Comment | null>;
  onGetComments: (postId: number) => Promise<Comment[]>;
  onShare: (postId: number) => Promise<boolean>;
  onReport?: (postId: number, reason: string) => Promise<boolean>;
  onDeleteComment?: (commentId: number) => Promise<boolean>;
  currentUserId?: number;
  currentUser?: UserProfile | null;
  darkMode?: boolean;
}

// Wiederhergestellte und umbenannte Hilfsfunktion, nur für Avatare
function getAbsoluteAvatarUrl(url?: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${MEDIA_BASE_URL}${url}`;
}

const UnifiedPostCard: React.FC<UnifiedPostCardProps> = ({
  post,
  onLike,
  onDelete,
  onComment,
  onGetComments,
  onShare,
  onReport,
  onDeleteComment,
  currentUserId,
  currentUser,
  darkMode = true,
}) => {
  const navigate = useNavigate();
  // State für Interaktionen
  const [isLiked, setIsLiked] = useState(post.is_liked_by_user || false);
  const [likeCount, setLikeCount] = useState(post.likes_count || 0);
  const [shareCount, setShareCount] = useState(post.shares_count || 0);
  const [isBookmarked, setIsBookmarked] = useState(post.is_bookmarked_by_user || false);

  const [isLiking, setIsLiking] = useState(false);
  const [shareAnimating, setShareAnimating] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // State für Kommentare
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  // Synchronisiere State mit Props, falls sich der Post von außen ändert
  useEffect(() => {
    setIsLiked(post.is_liked_by_user || false);
    setLikeCount(post.likes_count || 0);
    setShareCount(post.shares_count || 0);
    setIsBookmarked(post.is_bookmarked_by_user || false);
  }, [post.is_liked_by_user, post.likes_count, post.shares_count, post.is_bookmarked_by_user]);

  // Debug-Log für media_url
  useEffect(() => {
    console.log('[UnifiedPostCard] post.media_url:', post.media_url);
  }, [post.media_url]);

  // Debug-Log für currentUser
  useEffect(() => {
    console.log('[UnifiedPostCard] currentUser:', currentUser);
    console.log('[UnifiedPostCard] currentUser?.avatar_url:', currentUser?.avatar_url);
    console.log('[UnifiedPostCard] currentUser?.username:', currentUser?.username);
  }, [currentUser]);

  const formattedTimeAgo = formatRelativeTime(post.created_at);
  const isCurrentUserAuthor = currentUserId && post.author?.id === currentUserId;

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      const success = await djangoApi.togglePostLike(post.id);
      if (success) {
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
      }
    } catch (error) {
      console.error('[Like] Fehler beim Liken:', error);
      toast.error('Fehler beim Liken');
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    try {
      const success = await djangoApi.sharePost(post.id);
      if (success) {
        setShareCount(prev => prev + 1);
        setShareAnimating(true);
        setTimeout(() => setShareAnimating(false), 1000);
        toast.success('Beitrag geteilt!');
        setShareModalOpen(true);
      }
    } catch (error) {
      console.error('[Share] Fehler beim Teilen:', error);
      toast.error('Fehler beim Teilen');
    }
  };

  const handleBookmark = async () => {
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
    } catch (error) {
      console.error('[Bookmark] Fehler:', error);
      toast.error('Fehler bei Bookmark-Aktion');
    }
  };

  // Direkte API-Aufrufe für Kommentare
  const loadComments = async () => {
    console.log('[UnifiedPostCard] Loading comments for post:', post.id);
    setIsLoadingComments(true);
    try {
      const response = await djangoApi.getComments(String(post.id), { page: '1' });
      console.log('[UnifiedPostCard] Comments response:', response);
      
      // Django API gibt direkt ein Array zurück oder { results: [...] }
      let commentsData = [];
      if (Array.isArray(response)) {
        commentsData = response;
      } else if (response && response.results && Array.isArray(response.results)) {
        commentsData = response.results;
      } else if (response && response.data && response.data.results && Array.isArray(response.data.results)) {
        commentsData = response.data.results;
      }
      
      console.log('[UnifiedPostCard] Comments loaded:', commentsData.length);
      setComments(commentsData);
    } catch (error) {
      console.error('[UnifiedPostCard] Error loading comments:', error);
      toast.error("Fehler beim Laden der Kommentare.");
      setComments([]);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const createCommentDirect = async (content: string) => {
    console.log('[UnifiedPostCard] Creating comment for post:', post.id);
    console.log('[UnifiedPostCard] Post ID type:', typeof post.id);
    console.log('[UnifiedPostCard] Content:', content);
    try {
      const response = await djangoApi.createComment(String(post.id), { content });
      console.log('[UnifiedPostCard] Create comment response:', response);
      
      if (response) {
        console.log('[UnifiedPostCard] Comment created:', response);
        setComments(prev => [response, ...prev]);
        return response;
      } else {
        console.warn('[UnifiedPostCard] No comment data in response');
        return null;
      }
    } catch (error) {
      console.error('[UnifiedPostCard] Error creating comment:', error);
      toast.error("Fehler beim Senden des Kommentars.");
      return null;
    }
  };

  const toggleComments = async () => {
    console.log('[UnifiedPostCard] Toggle comments called for post:', post.id);
    console.log('[UnifiedPostCard] Current showComments:', showComments);
    console.log('[UnifiedPostCard] Current comments length:', comments.length);
    
    setShowComments(prev => !prev);
    if (!showComments && comments.length === 0) {
      await loadComments();
    }
  };
  
  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    try {
      const newCommentData = await createCommentDirect(newComment);
      if (newCommentData) {
        setNewComment('');
      }
    } catch (error) {
      toast.error("Fehler beim Senden des Kommentars.");
    }
  };
  
  const handleDelete = async () => {
    if(onDelete) {
      const success = await onDelete(post.id);
      if (success) {
        toast.success("Beitrag erfolgreich gelöscht.");
      } else {
        toast.error("Fehler beim Löschen des Beitrags.");
      }
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      const success = await deleteComment(commentId);
      if (success) {
        toast.success("Kommentar erfolgreich gelöscht.");
        // Kommentar aus der lokalen Liste entfernen
        setComments(prev => prev.filter(comment => comment.id !== commentId));
        return true;
      } else {
        toast.error("Fehler beim Löschen des Kommentars.");
        return false;
      }
    } catch (error) {
      console.error('[UnifiedPostCard] Error deleting comment:', error);
      toast.error("Fehler beim Löschen des Kommentars.");
      return false;
    }
  };

  return (
    <Card className={`border-0 shadow-sm ${darkMode ? 'bg-dark-100' : 'bg-white/80'} my-4`}>
      <CardHeader className="pt-4 pb-2">
        <div className="flex items-start">
          <Link to={`/profile/${post.author?.username}`} className="flex items-start group">
            <Avatar className="mr-3 h-10 w-10 group-hover:ring-2 group-hover:ring-primary">
              <AvatarImage 
                src={getAbsoluteAvatarUrl(post.author?.avatar_url)}
                alt={post.author?.display_name || post.author?.username}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <AvatarFallback>
                {post.author?.display_name?.charAt(0) || post.author?.username?.charAt(0) || 'A'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-medium leading-none group-hover:text-primary">
                {post.author?.display_name || post.author?.username}
              </div>
              <div className="text-sm text-gray-400">
                <span>@{post.author?.username}</span>
                <span className="mx-1">•</span>
                <span>{formattedTimeAgo}</span>
              </div>
            </div>
          </Link>
          <div className="flex-1" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {isCurrentUserAuthor && onDelete && (
                <>
                  <DropdownMenuItem onClick={handleDelete} className="text-red-500 focus:text-red-500">Beitrag löschen</DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {onReport && !isCurrentUserAuthor && (
                 <DropdownMenuItem onClick={() => onReport(post.id, 'spam')}><Flag className="h-4 w-4 mr-2" /> Beitrag melden</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="px-5 py-2">
        <PostContent content={post.content} />
        {(post.media_url || (post.media_urls && post.media_urls.length > 0)) && (
          <div className="mt-4 rounded-xl overflow-hidden border">
            {post.media_url ? (
              <PostMedia mediaUrl={post.media_url} mediaType={post.media_type} />
            ) : (
              post.media_urls && post.media_urls.map((url, index) => (
                <PostMedia key={index} mediaUrl={url} mediaType={post.media_type} />
              ))
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col items-start px-5 pb-4 pt-2">
        <div className="flex w-full items-center justify-between text-xs text-gray-500 mb-2">
          <div className="flex items-center gap-1 text-gray-400 text-sm">
            {/* Like Button */}
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleLike} disabled={isLiking}>
              <Heart className={`h-5 w-5 ${isLiked ? 'text-red-500 fill-current' : ''}`} />
            </Button>
            <span>{likeCount}</span>
            
            {/* Comment Button */}
            <Button variant="ghost" size="icon" className="h-9 w-9 ml-4" onClick={toggleComments}>
              <MessageCircle className={`h-5 w-5 ${showComments ? 'text-primary' : ''}`} />
            </Button>
            <span>{post.comments_count || 0}</span>
            
            {/* Share Button */}
            <Button variant="ghost" size="icon" className="h-9 w-9 ml-4" onClick={handleShare}>
              <Share2 className={`h-5 w-5 ${shareAnimating ? 'text-green-500' : ''}`} />
            </Button>
            <span className={shareAnimating ? 'text-green-500 font-bold' : ''}>{String(shareCount)}</span>
            
            {/* Bookmark Button */}
            <Button variant="ghost" size="icon" className="h-9 w-9 ml-4" onClick={handleBookmark}>
              {isBookmarked ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <Bookmark className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        
        {showComments && (
          <div className="w-full mt-4">
            <Separator className="my-3" />
            <div className="flex space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={getAbsoluteAvatarUrl(currentUser?.avatar_url)} 
                  alt={currentUser?.username || 'User'}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <AvatarFallback>
                  {currentUser?.username?.charAt(0) || currentUser?.display_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex">
                <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Schreibe einen Kommentar..." className="flex-1 bg-transparent border-b border-gray-700 focus:outline-none focus:border-primary" />
                <Button variant="ghost" size="sm" onClick={handleCommentSubmit} disabled={!newComment.trim()}>Senden</Button>
              </div>
            </div>
            <div className="space-y-4 mt-4">
              {isLoadingComments && <div className="text-center">Lade Kommentare...</div>}
              {!isLoadingComments && comments.length === 0 && <div className="text-center text-gray-500">Keine Kommentare.</div>}
              {comments
                .filter(comment => comment && comment.id && comment.author)
                .map((comment) => (
                <div key={comment.id} className="flex space-x-2 text-sm">
                  <Link to={`/profile/${comment.author?.username}`} className="flex items-center group">
                    <Avatar className="h-8 w-8 group-hover:ring-2 group-hover:ring-primary">
                      <AvatarImage src={getAbsoluteAvatarUrl(comment.author?.avatar_url)} />
                      <AvatarFallback>{comment.author?.username?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link to={`/profile/${comment.author?.username}`} className="font-medium group-hover:text-primary">
                          {comment.author?.display_name || comment.author?.username}
                        </Link>
                        <span className="ml-2 text-xs text-gray-400">{formatRelativeTime(comment.created_at)}</span>
                      </div>
                      {(currentUserId === comment.author?.id || currentUserId === comment.author_id) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-gray-400 hover:text-red-500"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                    <p>{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardFooter>

      <SimpleShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        shareUrl={`${window.location.origin}/post/${String(post.id)}`}
        postTitle={String(post.content)}
      />
    </Card>
  );
};

export default UnifiedPostCard; 