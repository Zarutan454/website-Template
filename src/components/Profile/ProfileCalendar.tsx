import React, { useState, useEffect } from 'react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Activity, MessageSquare, Heart, RefreshCw } from 'lucide-react';
import { de } from 'date-fns/locale';
import { format, isSameDay } from 'date-fns';
import { DayProps } from 'react-day-picker';

interface ProfileCalendarProps {
  userId: string;
  isOwnProfile: boolean;
}

interface ActivityData {
  date: Date;
  count: number;
  type: 'post' | 'comment' | 'like' | 'mining';
}

const ProfileCalendar: React.FC<ProfileCalendarProps> = ({ userId, isOwnProfile }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [activeDays, setActiveDays] = useState<Date[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'posts' | 'comments' | 'likes' | 'mining'>('all');
  const [selectedDayActivities, setSelectedDayActivities] = useState<{ type: string; count: number }[]>([]);
  
  useEffect(() => {
    const fetchActivityData = async () => {
      setIsLoading(true);
      try {
        const startOfYear = new Date(new Date().getFullYear(), 0, 1);
        const endOfYear = new Date(new Date().getFullYear(), 11, 31);
        
        // TODO: Replace with Django API calls
        // const postsData = await userAPI.getUserPosts(userId, { startDate, endDate });
        // const commentsData = await userAPI.getUserComments(userId, { startDate, endDate });
        // const likesData = await userAPI.getUserLikes(userId, { startDate, endDate });
        // const miningData = await userAPI.getMiningActivity(userId, { startDate, endDate });
        
        // Temporary placeholder data
        const postsData: any[] = [];
        const commentsData: any[] = [];
        const likesData: any[] = [];
        const miningData: any[] = [];
        
        const postsActivity = (postsData || []).map(post => ({
          date: new Date(post.created_at),
          count: 1,
          type: 'post' as const
        }));
        
        const commentsActivity = (commentsData || []).map(comment => ({
          date: new Date(comment.created_at),
          count: 1,
          type: 'comment' as const
        }));
        
        const likesActivity = (likesData || []).map(like => ({
          date: new Date(like.created_at),
          count: 1,
          type: 'like' as const
        }));
        
        const miningActivity = (miningData || []).map(mining => ({
          date: new Date(mining.created_at),
          count: 1,
          type: 'mining' as const
        }));
        
        const allActivity = [...postsActivity, ...commentsActivity, ...likesActivity, ...miningActivity];
        setActivityData(allActivity);
        
        const uniqueDays = new Set<string>();
        allActivity.forEach(item => {
          uniqueDays.add(format(item.date, 'yyyy-MM-dd'));
        });
        
        const activeDaysList = Array.from(uniqueDays).map(dateStr => new Date(dateStr));
        setActiveDays(activeDaysList);
        
        updateSelectedDayActivities(selectedDate, allActivity);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };
    
    if (userId) {
      fetchActivityData();
    }
  }, [userId, selectedDate]);
  
  useEffect(() => {
    updateSelectedDayActivities(selectedDate, activityData);
  }, [selectedDate, activityData, activeFilter]);
  
  const updateSelectedDayActivities = (date: Date | undefined, data: ActivityData[]) => {
    if (!date) return;
    
    const dayActivities = data.filter(item => 
      isSameDay(item.date, date) && 
      (activeFilter === 'all' || 
       (activeFilter === 'posts' && item.type === 'post') ||
       (activeFilter === 'comments' && item.type === 'comment') ||
       (activeFilter === 'likes' && item.type === 'like') ||
       (activeFilter === 'mining' && item.type === 'mining'))
    );
    
    const activityCounts: Record<string, number> = {};
    dayActivities.forEach(item => {
      activityCounts[item.type] = (activityCounts[item.type] || 0) + 1;
    });
    
    const countsArray = Object.entries(activityCounts).map(([type, count]) => ({ type, count }));
    setSelectedDayActivities(countsArray);
  };
  
  const getDayClassName = (date: Date) => {
    const hasActivity = activeDays.some(activeDate => isSameDay(activeDate, date));
    return hasActivity ? 'bg-primary/20 rounded-full' : '';
  };
  
  const getActivityTypeName = (type: string) => {
    switch (type) {
      case 'post': return 'Beiträge';
      case 'comment': return 'Kommentare';
      case 'like': return 'Likes';
      case 'mining': return 'Mining-Aktivitäten';
      default: return type;
    }
  };
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'post': return <Activity className="h-4 w-4 mr-2" />;
      case 'comment': return <MessageSquare className="h-4 w-4 mr-2" />;
      case 'like': return <Heart className="h-4 w-4 mr-2" />;
      case 'mining': return <RefreshCw className="h-4 w-4 mr-2" />;
      default: return <Activity className="h-4 w-4 mr-2" />;
    }
  };
  
  return (
    <Card className="border-gray-800/60 bg-gray-900/30 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xl">
          <CalendarIcon className="h-5 w-5" />
          Aktivitätskalender
        </CardTitle>
        
        <Tabs
          value={activeFilter}
          onValueChange={(v) => setActiveFilter(v as any)}
          className="mt-4"
        >
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="all">Alle</TabsTrigger>
            <TabsTrigger value="posts">Beiträge</TabsTrigger>
            <TabsTrigger value="comments">Kommentare</TabsTrigger>
            <TabsTrigger value="likes">Likes</TabsTrigger>
            <TabsTrigger value="mining">Mining</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[344px] w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="border border-gray-800 rounded-md"
              locale={de}
              modifiersClassNames={{
                selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
              }}
              modifiers={{
                activity: activeDays,
              }}
              components={{
                Day: ({ date, displayMonth, ...props }: React.ComponentProps<'button'> & { date: Date; displayMonth?: Date }) => {
                  // Filter out non-DOM props
                  const { className, ...domProps } = props;
                  return (
                    <button 
                      {...domProps}
                      className={`${className || ''} ${getDayClassName(date)}`} 
                    />
                  );
                },
              }}
            />
            
            <div className="border-t border-gray-800 pt-4 mt-4">
              <h3 className="font-medium mb-2">
                {selectedDate 
                  ? `Aktivitäten am ${format(selectedDate, 'dd. MMMM yyyy', { locale: de })}`
                  : 'Wähle ein Datum'
                }
              </h3>
              
              {selectedDayActivities.length === 0 ? (
                <p className="text-sm text-gray-400">Keine Aktivitäten an diesem Tag</p>
              ) : (
                <div className="space-y-2">
                  {selectedDayActivities.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-1">
                      <div className="flex items-center">
                        {getActivityIcon(activity.type)}
                        <span>{getActivityTypeName(activity.type)}</span>
                      </div>
                      <Badge variant="outline">{activity.count}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileCalendar;
