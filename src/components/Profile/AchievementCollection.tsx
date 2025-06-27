
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserAchievement } from '@/hooks/mining/achievements/types';
import AchievementBadge from './AchievementBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Trophy, CheckCircle, Lock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface AchievementCollectionProps {
  achievements: UserAchievement[];
  isLoading?: boolean;
  title?: string;
  showCompleted?: boolean;
  columns?: number;
  onAchievementClick?: (achievement: UserAchievement) => void;
}

const AchievementCollection: React.FC<AchievementCollectionProps> = ({
  achievements,
  isLoading = false,
  title = "Errungenschaften",
  showCompleted = true,
  columns = 5,
  onAchievementClick,
}) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 20 }
    },
    hover: { scale: 1.05, transition: { duration: 0.2 } }
  };

  // Process achievements
  const processedAchievements = React.useMemo(() => {
    const filtered = showCompleted 
      ? achievements 
      : achievements.filter(a => a.completed);
      
    return [...filtered].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? -1 : 1;
      return (a.achievement?.category || '').localeCompare(b.achievement?.category || '');
    });
  }, [achievements, showCompleted]);

  // Responsive column count - adjust based on the columns prop
  const responsiveColumns = `grid-cols-2 sm:grid-cols-3 md:grid-cols-${Math.min(columns, 5)} lg:grid-cols-${Math.min(columns, 7)}`;

  if (isLoading) {
    return (
      <Card className="bg-background/50 backdrop-blur-sm border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Award className="h-5 w-5 text-primary" />
            {title}
            <Badge variant="secondary" className="ml-auto">
              Lädt...
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid ${responsiveColumns} gap-4`}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (processedAchievements.length === 0) {
    return (
      <Card className="bg-background/50 backdrop-blur-sm border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Award className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 gap-3">
          <Trophy className="h-12 w-12 text-muted-foreground" strokeWidth={1.5} />
          <p className="text-muted-foreground text-center">
            {showCompleted 
              ? "Keine Errungenschaften verfügbar" 
              : "Keine abgeschlossenen Errungenschaften"}
          </p>
          <p className="text-sm text-muted-foreground/70 text-center max-w-md">
            {showCompleted
              ? "Erfülle Bedingungen um neue Errungenschaften freizuschalten"
              : "Arbeite an deinen Zielen um diese Sektion zu füllen"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="bg-background/50 backdrop-blur-sm border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Award className="h-5 w-5 text-primary" />
            {title}
            <Badge variant="outline" className="ml-auto">
              {processedAchievements.filter(a => a.completed).length}/{processedAchievements.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div
            className={`grid ${responsiveColumns} gap-4`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {processedAchievements.map(achievement => (
                <Tooltip key={achievement.id}>
                  <TooltipTrigger asChild>
                    <motion.div
                      variants={itemVariants}
                      whileHover="hover"
                      className="flex flex-col items-center gap-2 cursor-pointer"
                      onClick={() => onAchievementClick?.(achievement)}
                    >
                      <AchievementBadge 
                        achievement={achievement}
                        showProgress={true}
                        size="lg"
                      />
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-medium text-center line-clamp-1">
                          {achievement.title || achievement.achievement?.title}
                        </p>
                        {achievement.completed ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      {achievement.progress > 0 && !achievement.completed && (
                        <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ 
                              width: `${Math.min(achievement.progress, 100)}%` 
                            }}
                            transition={{ duration: 0.8, type: 'spring' }}
                          />
                        </div>
                      )}
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="center" className="max-w-[200px]">
                    <div className="space-y-1">
                      <h4 className="font-semibold flex items-center gap-1">
                        {achievement.title || achievement.achievement?.title}
                        {achievement.completed && (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        )}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {achievement.achievement?.description}
                      </p>
                      {!achievement.completed && achievement.progress > 0 && (
                        <p className="text-xs text-primary mt-1">
                          Fortschritt: {Math.floor(achievement.progress)}%
                        </p>
                      )}
                      {achievement.completed && achievement.tokenReward && (
                        <p className="text-xs text-green-500 mt-1">
                          +{achievement.tokenReward} Token erhalten
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </AnimatePresence>
          </motion.div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default React.memo(AchievementCollection);
