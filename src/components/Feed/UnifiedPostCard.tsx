import * as React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Heart, MessageCircle, Share2, MoreHorizontal, Flag, Bookmark, BookmarkCheck, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { timeAgo, formatRelativeTime } from '@/utils/dateUtils';
import djangoApi from '../../lib/django-api-new';
import type { Post, UserProfile } from '../../lib/django-api-new';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { socialAPI } from '@/lib/django-api-new';
import { deleteComment } from '@/utils/commentUtils';
import { getAvatarUrl } from '../../utils/api';
import axios from 'axios';

import PostContent from './Post/PostContent';
import SimpleShareModal from './SimpleShareModal';
import MediaLightbox from './components/MediaLightbox';
import type { MediaItem } from './components/MediaLightbox';
import PrivacyIcon, { PrivacyValue } from './components/PrivacyIcon';
import ReactionButton from './components/ReactionButton';
import ErrorBoundary from './ErrorBoundary';
import LazyMedia from './components/LazyMedia';
import type { Comment } from '../../lib/django-api-new';

// BASE_URL für Media-URLs - direkt die Backend-URL verwenden
const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL || 'http://localhost:8080';

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
        <LazyMedia
          src={safeMediaUrl}
          alt="Post media"
          type="image"
          className="w-full h-auto object-cover"
        />
      );
    case 'video':
      return (
        <LazyMedia
          src={safeMediaUrl}
          alt="Post video"
          type="video"
          className="w-full h-auto"
          showControls={true}
        />
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

// Erweiterung für Poll- und Media-Felder
interface Poll {
  question: string;
  options: string[];
  votes: Record<string, string[]>;
  expires_at?: string;
  // Add any other fields as needed from backend
}

interface PostWithPoll extends Post {
  poll?: Poll;
  media_urls?: string[];
  media_url?: string;
  media_type?: string; // match base Post type
  privacy?: PrivacyValue;
}

// Memoized PostCard component for better performance
const UnifiedPostCard: React.FC<UnifiedPostCardProps> = React.memo((props) => {
  const { post: _post, onLike, onDelete, onComment, onGetComments, onShare, onReport, onDeleteComment, currentUserId, currentUser, darkMode = true } = props;
  const post: PostWithPoll = _post;
  const navigate = useNavigate();
  
  // State für Interaktionen
  const [isLiked, setIsLiked] = React.useState(post.is_liked_by_user || false);
  const [likeCount, setLikeCount] = React.useState(post.likes_count || 0);
  const [shareCount, setShareCount] = React.useState(post.shares_count || 0);
  const [isBookmarked, setIsBookmarked] = React.useState(post.is_bookmarked_by_user || false);

  const [isLiking, setIsLiking] = React.useState(false);
  const [shareAnimating, setShareAnimating] = React.useState(false);
  const [shareModalOpen, setShareModalOpen] = React.useState(false);

  // State für Kommentare
  const [showComments, setShowComments] = React.useState(false);
  // Typisiere Kommentare explizit als Comment[]
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = React.useState(false);
  const [newComment, setNewComment] = React.useState('');

  // State für Medien-Preview
  const [showLightbox, setShowLightbox] = React.useState(false);
  const [lightboxUrl, setLightboxUrl] = React.useState<string | null>(null);
  const [lightboxType, setLightboxType] = React.useState<'image' | 'video'>('image');
  const [lightboxIndex, setLightboxIndex] = React.useState(0);

  // Im State:
  const [userReaction, setUserReaction] = React.useState<string | null>(null);

  // --- Poll State ---
  const [poll, setPoll] = React.useState(post.poll);
  const [pollLoading, setPollLoading] = React.useState(false);
  const [userVotedOption, setUserVotedOption] = React.useState<string | null>(null);

  React.useEffect(() => {
    setPoll(post.poll);
  }, [post.poll]);

  // Prüfe, ob der User schon abgestimmt hat
  React.useEffect(() => {
    if (poll && currentUserId) {
      const voted = Object.entries(poll.votes || {}).find(([option, voters]) => (voters as string[]).includes(String(currentUserId)));
      setUserVotedOption(voted ? voted[0] : null);
    }
  }, [poll, currentUserId]);

  // Voting-Handler
  const handleVote = async (option: string) => {
    if (!poll || pollLoading || userVotedOption) return;
    setPollLoading(true);
    try {
      const res = await axios.post(`/api/posts/${post.id}/poll/vote/`, { option });
      setPoll(res.data);
      setUserVotedOption(option);
      toast.success('Deine Stimme wurde gezählt!');
    } catch (e) {
      toast.error('Fehler beim Abstimmen');
    } finally {
      setPollLoading(false);
    }
  };

  // Synchronisiere State mit Props, falls sich der Post von außen ändert
  React.useEffect(() => {
    setIsLiked(post.is_liked_by_user || false);
    setLikeCount(post.likes_count || 0);
    setShareCount(post.shares_count || 0);
    setIsBookmarked(post.is_bookmarked_by_user || false);
  }, [post.is_liked_by_user, post.likes_count, post.shares_count, post.is_bookmarked_by_user]);

  // Memoized values
  const formattedTimeAgo = React.useMemo(() => {
    return formatRelativeTime(new Date(post.created_at));
  }, [post.created_at]);

  const avatarUrl = React.useMemo(() => {
    return getAvatarUrl(post.author?.avatar_url);
  }, [post.author?.avatar_url]);

  const displayName = React.useMemo(() => {
    return post.author?.display_name || post.author?.username || 'Unbekannter Nutzer';
  }, [post.author?.display_name, post.author?.username]);

  // Optimized handlers
  const handleLike = React.useCallback(async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      const success = await onLike(post.id);
      if (success) {
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
      }
    } catch (error) {
      console.error('Like error:', error);
      toast.error('Fehler beim Liken des Posts');
    } finally {
      setIsLiking(false);
    }
  }, [isLiking, isLiked, onLike, post.id]);

  const handleComment = React.useCallback(async (content: string) => {
    try {
      const newComment = await onComment(post.id, content);
      if (newComment) {
        setComments(prev => [...prev, newComment]);
        setNewComment('');
        toast.success('Kommentar hinzugefügt');
      }
    } catch (error) {
      console.error('Comment error:', error);
      toast.error('Fehler beim Hinzufügen des Kommentars');
    }
  }, [onComment, post.id]);

  const handleShare = React.useCallback(async () => {
    setShareAnimating(true);
    try {
      const success = await onShare(post.id);
      if (success) {
        setShareCount(prev => prev + 1);
        toast.success('Post geteilt');
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Fehler beim Teilen des Posts');
    } finally {
      setTimeout(() => setShareAnimating(false), 1000);
    }
  }, [onShare, post.id]);

  const handleDelete = React.useCallback(async () => {
    if (!onDelete) return;
    
    if (!confirm('Möchtest du diesen Post wirklich löschen?')) return;
    
    try {
      const success = await onDelete(post.id);
      if (success) {
        toast.success('Post gelöscht');
        // Post aus der Liste entfernen (wird vom Parent gehandhabt)
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Fehler beim Löschen des Posts');
    }
  }, [onDelete, post.id]);

  const handleGetComments = React.useCallback(async () => {
    if (showComments) return;
    
    setIsLoadingComments(true);
    try {
      const commentsData = await onGetComments(post.id);
      setComments(commentsData);
      setShowComments(true);
    } catch (error) {
      console.error('Get comments error:', error);
      toast.error('Fehler beim Laden der Kommentare');
    } finally {
      setIsLoadingComments(false);
    }
  }, [showComments, onGetComments, post.id]);

  const handleMediaClick = React.useCallback((url: string, type: 'image' | 'video', index: number = 0) => {
    setLightboxUrl(url);
    setLightboxType(type);
    setLightboxIndex(index);
    setShowLightbox(true);
  }, []);

  const getMediaList = React.useCallback((): MediaItem[] => {
    if (post.media_urls && post.media_urls.length > 0) {
      return post.media_urls.map((url: string) => ({
        url: url.startsWith('http') ? url : `${MEDIA_BASE_URL}${url}`,
        type: /\.(mp4|webm|ogg)$/i.test(url) ? 'video' : 'image' as 'image' | 'video',
      }));
    } else if (post.media_url) {
      return [{
        url: post.media_url.startsWith('http') ? post.media_url : `${MEDIA_BASE_URL}${post.media_url}`,
        type: (post.media_type as 'image' | 'video') || 'image',
      }];
    }
    return [];
  }, [post.media_urls, post.media_url, post.media_type]);

  const renderDropdownMenu = React.useCallback(() => {
    const isAuthor = currentUserId === post.author?.id;
    
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isAuthor && (
            <>
              <DropdownMenuItem onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Löschen
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={() => setShareModalOpen(true)}>
            <Share2 className="mr-2 h-4 w-4" />
            Teilen
          </DropdownMenuItem>
          {onReport && (
            <DropdownMenuItem onClick={() => onReport(post.id, 'spam')}>
              <Flag className="mr-2 h-4 w-4" />
              Melden
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }, [currentUserId, post.author?.id, post.id, handleDelete, onReport]);

  return (
    <ErrorBoundary>
      <Card className={`border-0 shadow-2xl rounded-3xl transition-shadow duration-200 focus-within:ring-2 focus-within:ring-primary my-8 px-0 max-w-2xl mx-auto group
  ${darkMode ? 'bg-[#18191a] text-gray-100 border-gray-900' : 'bg-white text-gray-900 border-gray-100'}`}
  tabIndex={0} aria-label="Beitrag">
        {/* MediaLightbox Overlay bleibt */}
        <MediaLightbox
          open={showLightbox}
          mediaList={getMediaList()}
          initialIndex={lightboxIndex}
          onClose={() => setShowLightbox(false)}
        />
        {/* Header: dynamisch */}
        <CardHeader className={`pt-7 pb-4 px-8 border-b flex flex-row items-center gap-5
    ${darkMode ? 'bg-[#18191a] border-gray-900' : 'bg-white/90 border-gray-100'}`}>
          <Link to={`/profile/${post.author?.username}`} className="flex items-center group">
            <Avatar className={`mr-6 h-16 w-16 group-hover:ring-2 group-hover:ring-primary transition-all duration-150 shadow-md ${darkMode ? 'border-2 border-gray-800' : 'border border-gray-200'}`} tabIndex={0} aria-label="Profilbild">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-xl font-bold leading-none group-hover:text-primary flex items-center gap-2">
                {displayName}
                {post.privacy && <PrivacyIcon value={post.privacy as PrivacyValue} />}
              </div>
              <div className={`text-sm flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}> 
                <span>@{post.author?.username}</span>
                <span className="mx-1">•</span>
                <span>{formattedTimeAgo}</span>
              </div>
            </div>
          </Link>
          <div className="flex-1" />
          {/* Dropdown bleibt */}
          {renderDropdownMenu()}
        </CardHeader>
        {/* Content: dynamisch */}
        <CardContent className={`px-8 py-6 ${darkMode ? 'bg-[#242526]' : 'bg-white/95'}`}>
          <PostContent content={post.content} />
          {(post.media_url || (post.media_urls && post.media_urls.length > 0)) && (
            <div className={`mt-6 rounded-2xl overflow-hidden border flex gap-2 ${darkMode ? 'bg-[#18191a] border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              {post.media_urls && post.media_urls.length > 0
                ? post.media_urls.map((url, idx) => (
                    <div
                      key={idx}
                      className="w-1/2 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => handleMediaClick(url, /\.(mp4|webm|ogg)$/i.test(url) ? 'video' : 'image', idx)}
                    >
                      <PostMedia mediaUrl={url} mediaType={/\.(mp4|webm|ogg)$/i.test(url) ? 'video' : 'image'} />
                    </div>
                  ))
                : post.media_url && (
                    <div className="cursor-pointer hover:opacity-90 transition-opacity" onClick={() => handleMediaClick(post.media_url, post.media_type)}>
                      <PostMedia mediaUrl={post.media_url} mediaType={post.media_type} />
                    </div>
                  )}
            </div>
          )}
          {/* Poll-Anzeige */}
          {poll && (
            <div className={`my-4 p-4 rounded-lg ${darkMode ? 'bg-dark-100 border border-primary/30' : 'bg-gray-100 border border-primary/30'}`}>
              <div className="font-semibold text-white mb-2">{poll.question}</div>
              <div className="space-y-3">
                {poll.options.map((opt: string, idx: number) => {
                  const votes: string[] = (poll.votes?.[opt] || []) as string[];
                  const votesObj: Record<string, string[]> = poll.votes as Record<string, string[]> || {};
                  const totalVotes = Object.values(votesObj).reduce((acc, arr) => acc + arr.length, 0);
                  const percent = totalVotes > 0 ? Math.round((votes.length / totalVotes) * 100) : 0;
                  const isSelected = userVotedOption === opt;
                  return (
                    <div key={idx} className="flex flex-col gap-1">
                      <button
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors font-medium
                        ${isSelected ? 'bg-primary text-white border-primary' : darkMode ? 'bg-dark-200 text-gray-200 border-gray-700 hover:bg-primary/10' : 'bg-white text-gray-800 border-gray-300 hover:bg-primary/10'}
                        ${userVotedOption && !isSelected ? 'opacity-70' : ''}`}
                        disabled={!!userVotedOption || pollLoading}
                        onClick={() => handleVote(opt)}
                      >
                        <span className="flex-1 text-left">{opt}</span>
                        {userVotedOption && (
                          <span className="text-xs font-semibold min-w-[40px] text-right">{percent}%</span>
                        )}
                      </button>
                      {/* Fortschrittsbalken */}
                      {userVotedOption && (
                        <div className="w-full h-2 rounded bg-gray-700/40 mt-1">
                          <div
                            className={`h-2 rounded ${isSelected ? 'bg-primary' : 'bg-primary/40'}`}
                            style={{ width: `${percent}%`, transition: 'width 0.5s' }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {userVotedOption && (
                <div className="mt-3 text-xs text-gray-400">{Object.values(poll.votes as Record<string, string[]>).reduce((acc, arr) => acc + arr.length, 0)} Stimmen insgesamt</div>
              )}
            </div>
          )}
        </CardContent>
        {/* Footer: dynamisch */}
        <CardFooter className={`px-8 py-4 ${darkMode ? 'bg-[#18191a] border-t border-gray-900' : 'bg-white/90 border-t border-gray-100'}`}>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <ReactionButton
                isActive={isLiked}
                count={likeCount}
                onLike={handleLike}
                onReactionSelect={(reaction) => setUserReaction(reaction as string)}
                disabled={isLiking}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGetComments}
                className="flex items-center gap-2"
                disabled={isLoadingComments}
              >
                <MessageCircle className="h-5 w-5" />
                <span>{post.comments_count || 0}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className={`flex items-center gap-2 ${shareAnimating ? 'animate-bounce' : ''}`}
              >
                <Share2 className="h-5 w-5" />
                <span>{shareCount}</span>
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsBookmarked(!isBookmarked)}
              className="flex items-center gap-2"
            >
              {isBookmarked ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
            </Button>
          </div>
        </CardFooter>
        
        {/* Comments Section */}
        {showComments && (
          <div className={`px-8 py-4 border-t ${darkMode ? 'bg-[#18191a] border-gray-900' : 'bg-white/90 border-gray-100'}`}>
            <div className="space-y-3">
              {comments.map(comment => (
                <div key={comment.id} className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={getAvatarUrl(comment.author?.avatar_url)} 
                      alt={comment.author?.username} 
                    />
                    <AvatarFallback>{comment.author?.username?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{comment.author?.display_name || comment.author?.username}</span>
                      <span className="text-xs text-gray-500">{formatRelativeTime(new Date(comment.created_at))}</span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                  {onDeleteComment && (currentUserId === comment.author?.id || currentUserId === post.author?.id) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteComment(comment.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            {/* Add Comment */}
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Kommentar hinzufügen..."
                className="flex-1 px-3 py-2 border rounded-lg bg-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newComment.trim()) {
                    handleComment(newComment.trim());
                  }
                }}
              />
              <Button
                size="sm"
                onClick={() => handleComment(newComment.trim())}
                disabled={!newComment.trim()}
              >
                Senden
              </Button>
            </div>
          </div>
        )}
      </Card>
      
      {/* Share Modal */}
      <SimpleShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        post={post}
        onShare={handleShare}
      />
    </ErrorBoundary>
  );
});

UnifiedPostCard.displayName = 'UnifiedPostCard';

export default UnifiedPostCard; 