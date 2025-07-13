// Only the part that needs fixing, around line 250:
// Finding the exact error location by searching for a date string being passed to formatDate

// Replace the entire file to avoid partial file updates:
import React from 'react';
import { Profile } from '@/types/profile';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarDays, Edit, Globe, MapPin, UserPlus, UserMinus, UserCheck, Camera } from 'lucide-react';
import { formatDate, parseDate } from '@/utils/dateUtils';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import FriendRequestButton from '@/components/UserRelationship/FriendRequestButton';
import { useFriendship } from '@/context/FriendshipContext';
import { userAPI } from '@/lib/django-api-new';
import { toast } from 'sonner';
import { useProfileImageUpload } from './useProfileImageUpload';

interface FollowStats {
  followers_count: number;
  following_count: number;
}

export interface ProfileHeaderProps {
  profile: Profile;
  isOwnProfile: boolean;
  isFollowing: boolean;
  followStats: FollowStats;
  onFollowToggle: () => Promise<void> | void;
  onEditProfile: () => void;
  onProfileUpdate?: () => void; // Callback für Profil-Updates
  isLoading?: boolean;
}

const ROLE_BADGES = {
  admin: { label: 'Admin', variant: 'destructive' as const },
  moderator: { label: 'Moderator', variant: 'secondary' as const },
  verified: { label: 'Verifiziert', variant: 'default' as const },
  user: { label: 'Benutzer', variant: 'outline' as const }
};

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  isOwnProfile,
  isFollowing,
  followStats,
  onFollowToggle,
  onEditProfile,
  onProfileUpdate,
  isLoading = false
}) => {
  const [isFollowingLoading, setIsFollowingLoading] = React.useState(false);
  const { getFriendshipStatus } = useFriendship();
  const {
    avatarUploading,
    coverUploading,
    avatarError,
    coverError,
    avatarProgress,
    coverProgress,
    uploadAvatar,
    uploadCover,
  } = useProfileImageUpload();
  const avatarInputRef = React.useRef<HTMLInputElement>(null);
  const coverInputRef = React.useRef<HTMLInputElement>(null);
  
  // Fallback values
  const displayName = profile.display_name || profile.username;
  const userRole = profile.role_name || 'user';
  const roleConfig = ROLE_BADGES[userRole as keyof typeof ROLE_BADGES] || ROLE_BADGES.user;
  
  const friendshipStatus = getFriendshipStatus(profile.id);

  const handleFollowClick = async () => {
    if (isFollowingLoading) return;
    
    try {
      setIsFollowingLoading(true);
      await onFollowToggle();
    } finally {
      setIsFollowingLoading(false);
    }
  };

  const getWebsiteUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `https://${url}`;
  };

  const getDisplayWebsite = (url: string) => {
    if (!url) return '';
    return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadAvatar(file);
    if (url) {
      toast.success('Profilbild erfolgreich aktualisiert!');
      if (onProfileUpdate) onProfileUpdate();
    } else if (avatarError) {
      toast.error(avatarError);
    }
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadCover(file);
    if (url) {
      toast.success('Banner erfolgreich aktualisiert!');
      if (onProfileUpdate) onProfileUpdate();
    } else if (coverError) {
      toast.error(coverError);
    }
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  // Hilfsfunktion für absolute URLs und Cache-Buster
  const getImageUrl = (url?: string) => {
    if (!url) return '';
    let fullUrl = url;
    if (url.startsWith('/media/')) {
      fullUrl = `http://localhost:8000${url}`;
    }
    // Cache-Buster nur nach Upload erzwingen
    let cacheBuster = '';
    if (avatarUploading || coverUploading) {
      cacheBuster = `?t=${Date.now()}`;
    }
    const finalUrl = `${fullUrl}${cacheBuster}`;
    console.log(`[getImageUrl] Original: ${url} -> Final: ${finalUrl}`);
    return finalUrl;
  };

  // Nach Profil-Reload
  React.useEffect(() => {
    if (profile) {
      console.log('[ProfileHeader] Aktuelles Profil:', profile);
      if (!profile.avatar_url) {
        console.warn('[ProfileHeader] avatar_url ist leer oder undefined!');
      }
      if (!profile.cover_url) {
        console.warn('[ProfileHeader] cover_url ist leer oder undefined!');
      }
    }
  }, [profile]);

  console.log('[Render] avatar_url:', profile.avatar_url, 'cover_url:', profile.cover_url);

  return (
    <div className="relative">
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-purple-500/20">
        {profile.cover_url ? (
          <img 
            src={getImageUrl(profile.cover_url)} 
            alt="Cover" 
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Error loading cover image:', profile.cover_url);
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <Camera className="h-12 w-12 text-gray-600" />
          </div>
        )}
        
        {/* Cover Upload Button (Own Profile) */}
        {isOwnProfile && (
          <div className="absolute top-4 right-4">
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="hidden"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => coverInputRef.current?.click()}
              disabled={coverUploading}
              className="bg-black/50 hover:bg-black/70 backdrop-blur-sm"
            >
              {coverUploading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Profile Info */}
      <div className="relative px-3 sm:px-6 pb-4 sm:pb-6">
        {/* Avatar */}
        <div className="relative -mt-10 sm:-mt-16 mb-2 sm:mb-4">
          <div className="relative w-20 h-20 sm:w-32 sm:h-32 rounded-full border-4 border-dark-200 bg-gradient-to-br from-primary/20 to-purple-500/20 overflow-hidden group">
            {profile.avatar_url ? (
              <img 
                src={getImageUrl(profile.avatar_url)} 
                alt={displayName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Error loading avatar image:', profile.avatar_url);
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                <span className="text-2xl sm:text-3xl font-bold text-white">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            {/* Avatar Upload Button (Own Profile, nur bei Hover sichtbar, mittig) */}
            {isOwnProfile && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/60 hover:bg-black/80 shadow-lg flex items-center justify-center"
                >
                  {avatarUploading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                  ) : (
                    <Camera className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Details */}
        <div className="space-y-2 sm:space-y-4">
          {/* Name and Role */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                  {displayName}
                </h1>
                <Badge variant={roleConfig.variant} className="text-xs">
                  {roleConfig.label}
                </Badge>
                {friendshipStatus && (
                  <Badge variant="outline" className="text-xs">
                    {friendshipStatus}
                  </Badge>
                )}
              </div>
              <p className="text-gray-400 text-sm sm:text-base">@{profile.username}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {isOwnProfile ? (
                <Button onClick={onEditProfile} className="bg-primary hover:bg-primary/90">
                  <Edit className="h-4 w-4 mr-2" />
                  Profil bearbeiten
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant={isFollowing ? "secondary" : "default"}
                    onClick={handleFollowClick}
                    disabled={isFollowingLoading}
                    className="min-w-[120px]"
                  >
                    {isFollowingLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : isFollowing ? (
                      <>
                        <UserMinus className="h-4 w-4 mr-2" />
                        Entfolgen
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Folgen
                      </>
                    )}
                  </Button>
                  <FriendRequestButton userId={profile.id} />
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-gray-300 leading-relaxed max-w-2xl">
              {profile.bio}
            </p>
          )}

          {/* Stats */}
          <div className="flex flex-wrap gap-6 text-sm">
            <button 
              onClick={() => setShowFollowersModal(true)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <span className="font-semibold text-white">{followStats.followers_count}</span>
              <span>Follower</span>
            </button>
            <button 
              onClick={() => setShowFollowingModal(true)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <span className="font-semibold text-white">{followStats.following_count}</span>
              <span>Folgt</span>
            </button>
            {profile.location && (
              <div className="flex items-center gap-2 text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>{profile.location}</span>
              </div>
            )}
            {profile.website && (
              <a 
                href={getWebsiteUrl(profile.website)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors"
              >
                <Globe className="h-4 w-4" />
                <span>{getDisplayWebsite(profile.website)}</span>
              </a>
            )}
            <div className="flex items-center gap-2 text-gray-400">
              <CalendarDays className="h-4 w-4" />
              <span>Beigetreten {formatDate(profile.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
