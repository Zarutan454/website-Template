import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { ThumbsUp, MessageCircle, Share2, MoreHorizontal, Trash2, Flag, Youtube } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { extractYoutubeVideoId } from '@/utils/youtubeUtils';
import { useMining } from '@/hooks/useMining';
import YouTubeEmbed from './YouTubeEmbed';
import { interactionRepository } from '@/repositories/InteractionRepository';

export interface FeedListItemProps {
  post: any;
  index: number;
  profile: any;
  onLike: (postId: string) => Promise<boolean>;
  onDelete: (postId: string) => Promise<boolean>;
  onComment: (postId: string, content: string) => Promise<any>;
  onDeleteComment?: (commentId: string) => Promise<boolean>;
  onGetComments: (postId: string) => Promise<any[]>;
  onShare: (postId: string) => Promise<boolean>;
  onReport?: (postId: string, reason: string) => Promise<boolean>;
  isDarkMode?: boolean;
  showMiningRewards?: boolean;
  commentsData?: any[];
  showComments?: boolean;
  onToggleComments?: () => void;
  isCommentsLoading?: boolean;
}

const FeedListItem: React.FC<FeedListItemProps> = ({
  post,
  index,
  profile,
  onLike,
  onDelete,
  onComment,
  onDeleteComment,
  onGetComments,
  onShare,
  onReport,
  isDarkMode = false,
  showMiningRewards = true,
  commentsData = [],
  showComments = false,
  onToggleComments = () => {},
  isCommentsLoading = false
}) => {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [showCommentsLocal, setShowCommentsLocal] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  const { recordActivity, isMining } = useMining();

  useEffect(() => {
    if (post?.content) {
      const videoId = extractYoutubeVideoId(post.content);
      if (videoId) {
        setYoutubeVideoId(videoId);
      }
    }
  }, [post?.content, post?.id]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd. MMM yyyy, HH:mm', { locale: de });
    } catch (e) {
      return dateString;
    }
  };

  const handleLikeClick = async () => {
    try {
      const newLikedState = await onLike(post.id);
      setIsLiked(newLikedState);
      setLikesCount(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1));
      
      if (showMiningRewards && isMining && newLikedState) {
        await recordActivity('like', 5, 0.5);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleCommentClick = () => {
    setIsCommenting(true);
    if (!showCommentsLocal) {
      loadComments();
    }
  };

  const loadComments = async () => {
    if (commentsLoading) return;
    
    try {
      setCommentsLoading(true);
      const fetchedComments = await onGetComments(post.id);
      setComments(fetchedComments || []);
      setShowCommentsLocal(true);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Fehler beim Laden der Kommentare');
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleShareClick = async () => {
    try {
      const shared = await onShare(post.id);
      
      if (shared) {
        if (showMiningRewards && isMining) {
          await recordActivity('share', 15, 1.5);
        }
      }
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    
    try {
      const comment = await onComment(post.id, commentText);
      
      if (comment) {
        setCommentText('');
        setComments(prev => [comment, ...prev]);
        
        if (showMiningRewards && isMining) {
          await recordActivity('comment', 10, 1);
        }
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('Fehler beim Erstellen des Kommentars');
    }
  };

  const handleDeletePost = async () => {
    try {
      setIsDeleting(true);
      const success = await onDelete(post.id);
      
      if (success) {
        toast.success('Beitrag erfolgreich gelöscht');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Fehler beim Löschen des Beitrags');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!onDeleteComment) return;
    
    try {
      const success = await onDeleteComment(commentId);
      
      if (success) {
        setComments(prev => prev.filter(c => c.id !== commentId));
        toast.success('Kommentar erfolgreich gelöscht');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Fehler beim Löschen des Kommentars');
    }
  };

  const handleReportSubmit = async () => {
    if (!reportReason.trim()) {
      toast.error('Bitte gib einen Grund für die Meldung an');
      return;
    }
    
    try {
      const success = await onReport(post.id, reportReason);
      
      if (success) {
        setIsReporting(false);
        setReportReason('');
      }
    } catch (error) {
      console.error('Error reporting post:', error);
      toast.error('Fehler beim Melden des Beitrags');
    }
  };

  const renderContentWithHashtags = (content: string) => {
    const hashtagRegex = /#(\w+)/g;
    const parts = content.split(hashtagRegex);
    
    return (
      <span>
        {parts.map((part, i) => {
          if (i % 2 === 0) {
            return part;
          } else {
            return (
              <Badge key={i} variant="secondary" className="mr-1 bg-primary-600/20 text-primary-600">
                #{part}
              </Badge>
            );
          }
        })}
      </span>
    );
  };

  const isAuthor = profile?.id === post.user?.id;

  return (
    <div 
      className={`rounded-lg border ${isDarkMode ? 'bg-dark-200 border-gray-800' : 'bg-white border-gray-200'} p-4 shadow-sm transition-all duration-200 hover:shadow-md`}
    >
      <div className="flex justify-between mb-3">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            {post.user?.avatar_url ? (
              <AvatarImage src={post.user.avatar_url} alt={post.user.display_name || 'User'} />
            ) : null}
            <AvatarFallback className="bg-primary-100 text-primary-800">
              {post.user?.display_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{post.user?.display_name || 'Anonym'}</div>
            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {formatDate(post.createdAt)}
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {isAuthor ? (
              <DropdownMenuItem 
                onClick={handleDeletePost}
                disabled={isDeleting}
                className="text-red-500"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Beitrag löschen
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => setIsReporting(true)}>
                <Flag className="mr-2 h-4 w-4" />
                Beitrag melden
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mb-4">
        <div className={`${isDarkMode ? 'text-gray-200' : 'text-gray-700'} whitespace-pre-line mb-3`}>
          {renderContentWithHashtags(post.content)}
        </div>
        
        {youtubeVideoId && (
          <div className="mt-2 mb-4">
            <YouTubeEmbed 
              videoId={youtubeVideoId}
              title={`YouTube Video von ${post.user?.display_name || 'Benutzer'}`}
              className="w-full rounded-lg overflow-hidden"
              height={315}
              allowFullScreen={true}
            />
          </div>
        )}
        
        {post.media_url && !youtubeVideoId && (
          <div className="mt-2">
            {post.media_type === 'image' ? (
              <img 
                src={post.media_url} 
                alt="Post media" 
                className="rounded-lg max-h-96 w-auto object-contain"
              />
            ) : post.media_type === 'video' ? (
              <video 
                src={post.media_url} 
                controls 
                className="rounded-lg max-h-96 w-full"
              />
            ) : null}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLikeClick}
            className={`flex items-center gap-1 ${isLiked ? 'text-primary-600' : ''}`}
          >
            <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-primary-600' : ''}`} />
            <span>{likesCount}</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCommentClick}
            className="flex items-center gap-1"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{post.commentsCount || 0}</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleShareClick}
            className="flex items-center gap-1"
          >
            <Share2 className="h-4 w-4" />
            <span>{post.sharesCount || 0}</span>
          </Button>
        </div>
      </div>

      {isCommenting && (
        <div className="mt-3 flex gap-2">
          <Input
            placeholder="Schreibe einen Kommentar..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleCommentSubmit}>
            Senden
          </Button>
        </div>
      )}

      {showComments && (
        <div className="mt-3 space-y-3">
          {isCommentsLoading ? (
            <div className="text-center py-2">Kommentare werden geladen...</div>
          ) : commentsData.length === 0 ? (
            <div className="text-center py-2 text-gray-500">Keine Kommentare vorhanden</div>
          ) : (
            commentsData.map((comment) => (
              <div key={comment.id} className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-dark-300 rounded-lg">
                <Avatar className="h-8 w-8">
                  {comment.author?.avatar_url ? (
                    <AvatarImage src={comment.author.avatar_url} alt={comment.author.display_name || 'User'} />
                  ) : null}
                  <AvatarFallback className="text-xs">
                    {comment.author?.display_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div className="font-medium text-sm">{comment.author?.display_name || 'Anonym'}</div>
                    <div className="text-xs text-gray-500">
                      {formatDate(comment.created_at)}
                    </div>
                  </div>
                  <div className="text-sm mt-1">{comment.content}</div>
                </div>
                {(profile?.id === comment.author_id || profile?.id === post.user?.id) && onDeleteComment && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDeleteComment(comment.id)}
                    className="h-6 w-6"
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      <Dialog open={isReporting} onOpenChange={setIsReporting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Beitrag melden</DialogTitle>
            <DialogDescription>
              Bitte gib den Grund für deine Meldung an. Unser Team wird den Beitrag überprüfen.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Grund für die Meldung..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsReporting(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleReportSubmit}>
                Melden
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeedListItem;
