import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Camera, 
  Settings, 
  Share2, 
  Trophy, 
  BarChart3, 
  Flag, 
  MoreHorizontal,
  Edit,
  Plus,
  Users,
  Heart,
  MessageSquare,
  Calendar,
  Image,
  Activity,
  Shield
} from 'lucide-react';
import { MediaGallery } from './MediaGallery';
import { FollowersModal } from './FollowersModal';
import { FriendsList } from './FriendsList';
import { ActivityTimeline } from './ActivityTimeline';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { PhotoUpload } from './PhotoUpload';
import { PrivacySettings } from './PrivacySettings';
import { SocialLinks } from './SocialLinks';
import { Achievements } from './Achievements';
import { UserStats } from './UserStats';
import { ReportUser } from './ReportUser';
import { toast } from '../../hooks/use-toast';

export const UserProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);

  // Lade Profildaten basierend auf username oder currentUser
  const targetUsername = username || currentUser?.username;
  const { 
    profileData, 
    photos, 
    activity, 
    analytics, 
    privacySettings, 
    socialLinks, 
    achievements,
    loading, 
    error,
    loadProfileData,
    loadPhotos,
    loadActivity,
    loadAnalytics,
    loadPrivacySettings,
    loadSocialLinks,
    loadAchievements
  } = useProfile();

  const isOwnProfile = currentUser?.username === targetUsername;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Profil wird geladen...</p>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600">Fehler beim Laden des Profils</p>
          <Button onClick={() => loadProfileData()} className="mt-4">
            Erneut versuchen
          </Button>
        </div>
      </div>
    );
  }

  const handlePhotoUploaded = (photoUrl: string) => {
    toast({
      title: "Erfolg",
      description: "Foto erfolgreich hochgeladen"
    });
    loadPhotos(); // Lade Fotos neu
  };

  const handleSettingsUpdated = () => {
    loadPrivacySettings();
    loadSocialLinks();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profil-Header */}
      <Card className="mb-6">
        <div className="relative">
          {/* Cover-Photo */}
          <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg relative">
            {profileData.cover_url && (
              <img
                src={profileData.cover_url}
                alt="Cover"
                className="w-full h-full object-cover rounded-t-lg"
              />
            )}
            {isOwnProfile && (
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-4 right-4"
                onClick={() => setShowPhotoUpload(true)}
              >
                <Camera className="w-4 h-4 mr-1" />
                Cover ändern
              </Button>
            )}
          </div>

          {/* Avatar und Profil-Info */}
          <div className="relative px-6 pb-6">
            <div className="flex items-end gap-4 -mt-16">
              <div className="relative">
                <img
                  src={profileData.avatar_url || '/placeholder.svg'}
                  alt={profileData.display_name}
                  className="w-32 h-32 rounded-full border-4 border-white object-cover"
                />
                {isOwnProfile && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                    onClick={() => setShowPhotoUpload(true)}
                  >
                    <Camera className="w-3 h-3" />
                  </Button>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold">{profileData.display_name}</h1>
                  {profileData.is_verified && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Verifiziert
                    </Badge>
                  )}
                  {isOwnProfile && (
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Profil bearbeiten
                    </Button>
                  )}
                </div>
                <p className="text-gray-600 mb-2">@{profileData.username}</p>
                
                {/* Follower/Following Stats */}
                <div className="flex items-center gap-6 mb-4">
                  <button
                    onClick={() => setShowFollowersModal(true)}
                    className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    <span className="font-medium">{profileData.follower_count}</span>
                    <span className="text-gray-600">Follower</span>
                  </button>
                  
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{profileData.following_count}</span>
                    <span className="text-gray-600">Folgt</span>
                  </div>
                </div>

                {/* Aktions-Buttons */}
                <div className="flex items-center gap-2">
                  {!isOwnProfile && (
                    <>
                      <Button>
                        <Heart className="w-4 h-4 mr-1" />
                        Folgen
                      </Button>
                      <Button variant="outline">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Nachricht
                      </Button>
                    </>
                  )}
                  
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                  
                  {!isOwnProfile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowReportModal(true)}
                    >
                      <Flag className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="posts" className="flex items-center gap-1">
            <Activity className="w-4 h-4" />
            Posts
          </TabsTrigger>
          <TabsTrigger value="photos" className="flex items-center gap-1">
            <Image className="w-4 h-4" />
            Fotos
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Aktivität
          </TabsTrigger>
          <TabsTrigger value="friends" className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            Freunde
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-1">
            <Share2 className="w-4 h-4" />
            Social
          </TabsTrigger>
        </TabsList>

        {/* Posts Tab */}
        <TabsContent value="posts" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Posts werden hier angezeigt</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Photos Tab */}
        <TabsContent value="photos" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Fotos</h3>
            {isOwnProfile && (
              <Button onClick={() => setShowPhotoUpload(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Foto hinzufügen
              </Button>
            )}
          </div>
          <MediaGallery photos={photos} onPhotoDeleted={() => loadPhotos()} />
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <ActivityTimeline activities={activity} />
        </TabsContent>

        {/* Friends Tab */}
        <TabsContent value="friends" className="space-y-4">
          <FriendsList userId={profileData.id} />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UserStats analytics={analytics} />
            <Achievements 
              achievements={achievements} 
              totalAchievements={achievements.length}
              totalPossible={10}
            />
          </div>
        </TabsContent>

        {/* Social Tab */}
        <TabsContent value="social" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PrivacySettings 
              settings={privacySettings} 
              onSettingsUpdated={handleSettingsUpdated}
            />
            <SocialLinks 
              links={socialLinks} 
              onLinksUpdated={handleSettingsUpdated}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showPhotoUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <PhotoUpload
              onPhotoUploaded={handlePhotoUploaded}
              onClose={() => setShowPhotoUpload(false)}
            />
          </div>
        </div>
      )}

      {showFollowersModal && (
        <FollowersModal
          userId={profileData.id}
          onClose={() => setShowFollowersModal(false)}
        />
      )}

      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <ReportUser
            userId={profileData.id}
            username={profileData.username}
            onClose={() => setShowReportModal(false)}
          />
        </div>
      )}
    </div>
  );
}; 