import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreVertical, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../../components/ui/dropdown-menu';
import { Reel, useReels } from '../../hooks/useReels';
import { useProfile } from '../../hooks/useProfile';
import ReelComments from './ReelComments';

interface ReelCardProps {
  reel: Reel;
  isActive: boolean;
  onNext: () => void;
  onPrev: () => void;
}

const ReelCard: React.FC<ReelCardProps> = ({ 
  reel, 
  isActive,
  onNext,
  onPrev
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  
  const { likeReel, formatTimeSince } = useReels();
  const { profile } = useProfile();
  
  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        if (isPlaying) {
          videoRef.current.play().catch(error => {
            console.error('Error playing video:', error);
            setIsPlaying(false);
          });
        } else {
          videoRef.current.pause();
        }
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isActive, isPlaying]);
  
  useEffect(() => {
    if (isActive && videoRef.current) {
      const timer = setTimeout(() => {
        setIsPlaying(true);
        videoRef.current?.play().catch(error => {
          console.error('Error auto-playing video:', error);
          setIsPlaying(false);
        });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isActive]);
  
  useEffect(() => {
    if (!isActive || !isPlaying) {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
      return;
    }
    
    if (videoRef.current) {
      progressInterval.current = setInterval(() => {
        if (videoRef.current) {
          const currentTime = videoRef.current.currentTime;
          const duration = videoRef.current.duration;
          if (duration) {
            setProgress((currentTime / duration) * 100);
          }
        }
      }, 100);
    }
    
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isActive, isPlaying]);
  
  const handleVideoClick = () => {
    setIsPlaying(!isPlaying);
  };
  
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };
  
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (profile) {
      likeReel.mutate(reel.id);
    }
  };
  
  const handleComments = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowComments(true);
  };
  
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(window.location.origin + `/reels/${reel.id}`);
    alert('Link zum Reel kopiert!');
  };
  
  const formattedTags = reel.tags?.map(tag => `#${tag}`).join(' ') || '';
  
  return (
    <div className="relative h-full w-full bg-black flex items-center justify-center">
      {/* Video */}
      <video
        ref={videoRef}
        src={reel.video_url}
        poster={reel.thumbnail_url || undefined}
        className="h-full w-full object-contain"
        loop
        playsInline
        muted={isMuted}
        onClick={handleVideoClick}
      />
      
      {/* Play/Pause overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30" onClick={handleVideoClick}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-black/50 rounded-full p-4"
          >
            <Play className="h-12 w-12 text-white" />
          </motion.div>
        </div>
      )}
      
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/20">
        <div 
          className="h-full bg-primary"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* User info and caption */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center gap-3 mb-2">
          <Avatar className="h-10 w-10 border-2 border-primary">
            <AvatarImage src={reel.user?.avatar_url || ''} alt={reel.user?.display_name || reel.user?.username || ''} />
            <AvatarFallback>{reel.user?.display_name?.[0] || reel.user?.username?.[0] || '?'}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <p className="font-semibold text-white">
              {reel.user?.display_name || reel.user?.username || 'Unbekannter Nutzer'}
            </p>
            <p className="text-xs text-white/70">
              {formatTimeSince(reel.created_at)}
            </p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {profile?.id === reel.user_id ? (
                <DropdownMenuItem>Löschen</DropdownMenuItem>
              ) : (
                <DropdownMenuItem>Melden</DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleShare}>Teilen</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {reel.caption && (
          <p className="text-white mb-2">{reel.caption}</p>
        )}
        
        {formattedTags && (
          <p className="text-primary text-sm mb-2">{formattedTags}</p>
        )}
      </div>
      
      {/* Action buttons */}
      <div className="absolute right-4 bottom-20 flex flex-col gap-4">
        <Button
          variant="ghost"
          size="icon"
          className={`rounded-full bg-black/30 text-white hover:bg-black/50 ${reel.liked_by_me ? 'text-red-500' : ''}`}
          onClick={handleLike}
        >
          <Heart className="h-6 w-6" fill={reel.liked_by_me ? 'currentColor' : 'none'} />
          <span className="text-xs mt-1">{reel.likes}</span>
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-black/30 text-white hover:bg-black/50"
          onClick={handleComments}
        >
          <MessageCircle className="h-6 w-6" />
          <span className="text-xs mt-1">{reel.comments_count}</span>
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-black/30 text-white hover:bg-black/50"
          onClick={handleShare}
        >
          <Share2 className="h-6 w-6" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-black/30 text-white hover:bg-black/50"
          onClick={toggleMute}
        >
          {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
        </Button>
      </div>
      
      {/* Comments panel */}
      <ReelComments
        reelId={reel.id}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />
    </div>
  );
};

export default ReelCard;
