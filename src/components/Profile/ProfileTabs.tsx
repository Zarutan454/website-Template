
import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  MessageSquare, 
  Image, 
  Calendar, 
  Bookmark, 
  Heart, 
  User, 
  Trophy 
} from 'lucide-react';
import { useUserAchievements } from '@/hooks/useUserAchievements';
import { Profile } from '@/types/profile';
import AchievementCollection from './AchievementCollection';
import ProfileLoader from './ProfileLoader';
import MediaGallery from './MediaGallery';
import ProfileCalendar from './ProfileCalendar';
import ActivityFeed from './ActivityFeed';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

type ProfileTab = 
  | 'posts' 
  | 'media' 
  | 'calendar' 
  | 'likes' 
  | 'saved' 
  | 'following' 
  | 'achievements';

interface ProfileTabsProps {
  profile: Profile;
  isOwnProfile: boolean;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ profile, isOwnProfile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const { 
    achievements, 
    isLoading: isLoadingAchievements 
  } = useUserAchievements(profile?.id);
  
  // Define available tabs based on profile ownership
  const availableTabs: ProfileTab[] = [
    'posts',
    'media',
    'calendar',
    'achievements',
    ...(isOwnProfile ? ['likes', 'saved', 'following'] as ProfileTab[] : [])
  ];

  // Parse the URL for tab query parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab') as ProfileTab;
    
    if (tabParam && availableTabs.includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search, availableTabs]);

  // Update URL when tab changes
  const handleTabChange = useCallback((value: string) => {
    if (availableTabs.includes(value as ProfileTab)) {
      setActiveTab(value as ProfileTab);
      navigate(`?tab=${value}`, { replace: true });
    }
  }, [navigate, availableTabs]);

  // Handle achievement click
  const handleAchievementClick = useCallback((achievement: any) => {
    if (achievement.completed) {
      toast.success(`Erfolg: ${achievement.title || achievement.achievement?.title}`, {
        description: achievement.achievement?.description,
      });
    } else {
      toast.info(`Fortschritt: ${Math.floor(achievement.progress)}%`, {
        description: achievement.achievement?.description,
      });
    }
  }, []);

  // Tab content animation variants
  const tabContentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  // Render placeholder content for empty tabs
  const renderPlaceholderContent = (title: string, description: string) => (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={tabContentVariants}
    >
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <Tabs 
      value={activeTab} 
      onValueChange={handleTabChange}
      className="mt-6"
    >
      <TabsList className="grid grid-cols-7 w-full overflow-x-auto">
        {[
          { value: 'posts', icon: MessageSquare, label: 'Beiträge' },
          { value: 'media', icon: Image, label: 'Medien' },
          { value: 'calendar', icon: Calendar, label: 'Kalender' },
          { value: 'achievements', icon: Trophy, label: 'Erfolge' },
          ...(isOwnProfile ? [
            { value: 'likes', icon: Heart, label: 'Likes' },
            { value: 'saved', icon: Bookmark, label: 'Gespeichert' },
            { value: 'following', icon: User, label: 'Folgt' }
          ] : [])
        ].map((tab) => (
          <TabsTrigger 
            key={tab.value} 
            value={tab.value}
            className="flex items-center gap-2 py-2 px-3"
          >
            <tab.icon className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">
              {tab.label}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>

      {/* Posts Tab */}
      <TabsContent value="posts" className="mt-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={tabContentVariants}
          key="posts"
        >
          <ActivityFeed userId={profile?.id} limit={10} />
        </motion.div>
      </TabsContent>

      {/* Media Tab */}
      <TabsContent value="media" className="mt-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={tabContentVariants}
          key="media"
        >
          <MediaGallery userId={profile?.id} isOwnProfile={isOwnProfile} />
        </motion.div>
      </TabsContent>

      {/* Calendar Tab */}
      <TabsContent value="calendar" className="mt-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={tabContentVariants}
          key="calendar"
        >
          <ProfileCalendar userId={profile?.id} isOwnProfile={isOwnProfile} />
        </motion.div>
      </TabsContent>

      {/* Achievements Tab */}
      <TabsContent value="achievements" className="mt-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={tabContentVariants}
          key="achievements"
        >
          <AchievementCollection 
            achievements={achievements || []}
            title="Errungenschaften" 
            showCompleted={true}
            columns={3}
            isLoading={isLoadingAchievements}
            onAchievementClick={handleAchievementClick}
          />
        </motion.div>
      </TabsContent>

      {/* Private Tabs (only visible for own profile) */}
      {isOwnProfile && (
        <>
          <TabsContent value="likes" className="mt-6">
            {renderPlaceholderContent(
              'Likes', 
              'Hier werden die Likes angezeigt.'
            )}
          </TabsContent>

          <TabsContent value="saved" className="mt-6">
            {renderPlaceholderContent(
              'Gespeicherte Beiträge', 
              'Hier werden die gespeicherten Beiträge angezeigt.'
            )}
          </TabsContent>

          <TabsContent value="following" className="mt-6">
            {renderPlaceholderContent(
              'Folgt', 
              'Hier werden die Benutzer angezeigt, denen du folgst.'
            )}
          </TabsContent>
        </>
      )}
    </Tabs>
  );
};

export default React.memo(ProfileTabs);
