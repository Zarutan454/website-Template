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
    <TooltipProvider>
      <Card className="overflow-hidden">
        {/* Cover Image */}
        <div className="h-32 md:h-48 bg-gradient-to-r from-gray-900 to-gray-800 relative">
          {isLoading ? (
            <Skeleton className="w-full h-full" />
          ) : coverUploading ? (
            <div className="w-full h-full flex items-center justify-center bg-black/20">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <span className="text-sm">Lade Banner...</span>
              </div>
            </div>
          ) : profile.cover_url ? (
            <motion.img 
              src={getImageUrl(profile.cover_url) || '/placeholder.svg'} 
              alt={`${displayName}'s cover`} 
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          ) : null}
          {isOwnProfile && (
            <>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverChange}
                title="Banner auswählen"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="absolute bottom-2 right-2 bg-black/70 hover:bg-black/90 text-white rounded-full p-2 shadow-lg focus:outline-none transition-colors"
                    onClick={() => coverInputRef.current?.click()}
                    disabled={coverUploading}
                    tabIndex={0}
                    aria-label="Banner ändern"
                  >
                    <Camera size={18} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Banner ändern</TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
        
        <CardContent className="px-4 md:px-6 -mt-16 pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-background relative">
                  {isLoading ? (
                    <Skeleton className="w-full h-full rounded-full" />
                  ) : avatarUploading ? (
                    <div className="w-full h-full flex items-center justify-center bg-muted rounded-full">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-1"></div>
                        <span className="text-xs">Lade...</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <AvatarImage 
                        src={getImageUrl(profile.avatar_url) || '/placeholder.svg'} 
                        alt={displayName} 
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-muted text-3xl font-medium">
                        {(profile.display_name?.[0] || profile.username?.[0] || '?').toUpperCase()}
                      </AvatarFallback>
                    </>
                  )}
                </Avatar>
                {isOwnProfile && (
                  <>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                      title="Profilbild auswählen"
                    />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="absolute bottom-2 right-2 bg-black/70 hover:bg-black/90 text-white rounded-full p-2 shadow-lg focus:outline-none transition-colors"
                          onClick={() => avatarInputRef.current?.click()}
                          disabled={avatarUploading}
                          tabIndex={0}
                          aria-label="Profilbild ändern"
                        >
                          <Camera size={18} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Profilbild ändern</TooltipContent>
                    </Tooltip>
                  </>
                )}
              </div>
            </motion.div>
            
            {/* Profile Info */}
            <div className="flex-1 space-y-4 w-full text-center sm:text-left">
              {/* Name and Action Buttons */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <h1 className="text-2xl font-bold tracking-tight">
                        {isLoading ? <Skeleton className="h-8 w-48" /> : displayName}
                      </h1>
                      <Badge variant={roleConfig.variant}>
                        {roleConfig.label}
                      </Badge>
                      {friendshipStatus === 'friends' && (
                        <Badge variant="secondary" className="ml-1">
                          <UserCheck className="h-3 w-3 mr-1" />
                          Freund
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">
                      {isLoading ? <Skeleton className="h-4 w-32 mt-1" /> : `@${profile.username}`}
                    </p>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex justify-center sm:justify-end gap-2">
                    {isLoading ? (
                      <Skeleton className="h-9 w-32 rounded-md" />
                    ) : isOwnProfile ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={onEditProfile}
                        className="min-w-[150px]"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Profil bearbeiten
                      </Button>
                    ) : (
                      <>
                        <motion.div whileTap={{ scale: 0.95 }}>
                          <Button 
                            variant={isFollowing ? "secondary" : "default"} 
                            size="sm" 
                            onClick={handleFollowClick}
                            disabled={isFollowingLoading}
                            className="min-w-[120px]"
                          >
                            {isFollowingLoading ? (
                              <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {isFollowing ? 'Entfolgen' : 'Folgen'}
                              </span>
                            ) : (
                              <>
                                {isFollowing ? (
                                  <>
                                    <UserMinus className="mr-2 h-4 w-4" />
                                    Entfolgen
                                  </>
                                ) : (
                                  <>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Folgen
                                  </>
                                )}
                              </>
                            )}
                          </Button>
                        </motion.div>
                        
                        <FriendRequestButton 
                          targetUserId={profile.id} 
                          initialStatus={friendshipStatus}
                          size="sm"
                          showLabels={false}
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Bio */}
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : profile.bio ? (
                <p className="text-sm text-muted-foreground">{profile.bio}</p>
              ) : null}
              
              {/* Meta Info */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-muted-foreground">
                {isLoading ? (
                  <>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-40" />
                  </>
                ) : (
                  <>
                    {profile.location && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center">
                            <MapPin className="mr-1 h-4 w-4 flex-shrink-0" />
                            <span className="truncate max-w-[150px]">{profile.location}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Wohnort</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    
                    {profile.website && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a 
                            href={getWebsiteUrl(profile.website)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center hover:underline"
                          >
                            <Globe className="mr-1 h-4 w-4 flex-shrink-0" />
                            <span className="truncate max-w-[150px]">{getDisplayWebsite(profile.website)}</span>
                          </a>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Website</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    
                    {profile.created_at && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center">
                            <CalendarDays className="mr-1 h-4 w-4 flex-shrink-0" />
                            <span>
                              {formatDate(parseDate(profile.created_at) || new Date())}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Mitglied seit</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </>
                )}
              </div>
              
              {/* Stats */}
              <div className="flex items-center justify-center sm:justify-start gap-6 text-sm font-medium">
                <div>
                  <span className="block font-bold">
                    {isLoading ? <Skeleton className="h-5 w-10 inline-block" /> : (followStats?.following_count ?? 0)}
                  </span>
                  <span className="text-muted-foreground">Folge ich</span>
                </div>
                <div>
                  <span className="block font-bold">
                    {isLoading ? <Skeleton className="h-5 w-10 inline-block" /> : (followStats?.followers_count ?? 0)}
                  </span>
                  <span className="text-muted-foreground">Follower</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default ProfileHeader;
