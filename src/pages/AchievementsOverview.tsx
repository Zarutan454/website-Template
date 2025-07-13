import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Medal, 
  Target, 
  Star, 
  CheckCircle2, 
  Clock, 
  Lock,
  Search,
  Filter,
  Grid3X3,
  List,
  TrendingUp,
  Users,
  Coins,
  Zap,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  LucideIcon
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAchievements, Achievement } from '@/hooks/achievements/useAchievements';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  color: string;
}

const ITEMS_PER_PAGE = 12;

const AchievementsOverview = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);

  // Use the updated hook with pagination
  const { 
    achievements, 
    pagination, 
    stats, 
    loading, 
    error 
  } = useAchievements(currentPage, ITEMS_PER_PAGE, searchTerm, selectedCategory, selectedStatus);

  const categories = [
    { value: 'all', label: 'All Categories', icon: Grid3X3, color: 'text-gray-400' },
    { value: 'mining', label: 'Mining', icon: Zap, color: 'text-yellow-400' },
    { value: 'social', label: 'Social', icon: Users, color: 'text-blue-400' },
    { value: 'token', label: 'Token', icon: Coins, color: 'text-green-400' },
    { value: 'system', label: 'System', icon: Target, color: 'text-purple-400' },
    { value: 'general', label: 'General', icon: Trophy, color: 'text-orange-400' }
  ];

  const statusFilters = [
    { value: 'all', label: 'All Achievements' },
    { value: 'completed', label: 'Completed' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'locked', label: 'Locked' }
  ];

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, selectedCategory, selectedStatus]);

  const getAchievementIcon = (category: string, isCompleted: boolean) => {
    const categoryData = categories.find(c => c.value === category) || categories[0];
    const IconComponent = categoryData.icon;
    const iconClass = `w-6 h-6 ${isCompleted ? 'text-yellow-400' : 'text-gray-500'}`;
    
    return <IconComponent className={iconClass} />;
  };

  const getStatusBadge = (achievement: Achievement) => {
    if (achievement.is_completed) {
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    } else if (achievement.progress > 0) {
      return (
        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30">
          <Clock className="w-3 h-3 mr-1" />
          In Progress
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="text-gray-500 border-gray-600">
          <Lock className="w-3 h-3 mr-1" />
          Locked
        </Badge>
      );
    }
  };

  const AchievementCard = ({ achievement }: { achievement: Achievement }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`h-full transition-all duration-200 hover:shadow-xl border ${
        achievement.is_completed 
          ? 'border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 shadow-yellow-500/10' 
          : 'border-gray-700 bg-dark-200/50 hover:border-gray-600'
      } backdrop-blur-sm`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              {getAchievementIcon(achievement.category, achievement.is_completed)}
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base text-white truncate">{achievement.name}</CardTitle>
                <CardDescription className="text-sm text-gray-400 line-clamp-2">
                  {achievement.description}
                </CardDescription>
              </div>
            </div>
            <div className="flex-shrink-0 ml-2">
              {getStatusBadge(achievement)}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3 pt-0">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Progress</span>
              <span className="text-white">{achievement.progress}%</span>
            </div>
            <Progress 
              value={achievement.progress} 
              className="h-1.5 bg-gray-700" 
            />
          </div>

          {/* Rewards */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-3 text-xs">
              {achievement.points > 0 && (
                <div className="flex items-center space-x-1 text-blue-400">
                  <Star className="w-3 h-3" />
                  <span>{achievement.points}</span>
                </div>
              )}
              {achievement.token_reward > 0 && (
                <div className="flex items-center space-x-1 text-green-400">
                  <Coins className="w-3 h-3" />
                  <span>{achievement.token_reward}</span>
                </div>
              )}
            </div>
            
            {achievement.unlocked_at && (
              <span className="text-xs text-gray-500">
                {new Date(achievement.unlocked_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const StatsCard = ({ title, value, subtitle, icon: Icon, color }: StatsCardProps) => (
    <Card className="bg-dark-200/50 border-gray-700 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">{title}</p>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );

  const PaginationControls = () => {
    if (!pagination) return null;

    return (
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">
          Showing {((pagination.page - 1) * pagination.page_size) + 1}-{Math.min(pagination.page * pagination.page_size, pagination.total_count)} of {pagination.total_count} achievements
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(1)}
            disabled={!pagination.has_previous}
            className="bg-dark-300/50 border-gray-600 hover:bg-dark-200"
          >
            <ChevronsLeft className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={!pagination.has_previous}
            className="bg-dark-300/50 border-gray-600 hover:bg-dark-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <span className="text-sm text-gray-400 px-3">
            Page {pagination.page} of {pagination.total_pages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.total_pages))}
            disabled={!pagination.has_next}
            className="bg-dark-300/50 border-gray-600 hover:bg-dark-200"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(pagination.total_pages)}
            disabled={!pagination.has_next}
            className="bg-dark-300/50 border-gray-600 hover:bg-dark-200"
          >
            <ChevronsRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Trophy className="w-16 h-16 text-red-400 mx-auto" />
          <h3 className="text-lg font-semibold text-red-400">Error loading achievements</h3>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-100">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.h1 
            className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            🏆 Achievements
          </motion.h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Track your progress and unlock achievements in the BSN ecosystem
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Progress"
              value={`${stats.completed}/${stats.total}`}
              subtitle={`${Math.round((stats.completed / stats.total) * 100)}% completed`}
              icon={Trophy}
              color="text-yellow-400"
            />
            <StatsCard
              title="Points"
              value={stats.earned_points.toLocaleString()}
              subtitle={`${stats.total_points.toLocaleString()} total`}
              icon={Star}
              color="text-blue-400"
            />
            <StatsCard
              title="Tokens"
              value={stats.earned_tokens.toLocaleString()}
              subtitle={`${stats.total_tokens.toLocaleString()} total`}
              icon={Coins}
              color="text-green-400"
            />
            <StatsCard
              title="In Progress"
              value={stats.in_progress}
              subtitle="Active achievements"
              icon={TrendingUp}
              color="text-purple-400"
            />
          </div>
        )}

        {/* Filters */}
        <Card className="bg-dark-200/50 border-gray-700 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 items-center w-full lg:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search achievements..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-dark-300/50 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-48 bg-dark-300/50 border-gray-600 text-white">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-200 border-gray-600">
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value} className="text-white hover:bg-dark-300">
                        <div className="flex items-center space-x-2">
                          <category.icon className={`w-4 h-4 ${category.color}`} />
                          <span>{category.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full sm:w-48 bg-dark-300/50 border-gray-600 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-200 border-gray-600">
                    {statusFilters.map((filter) => (
                      <SelectItem key={filter.value} value={filter.value} className="text-white hover:bg-dark-300">
                        {filter.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="bg-dark-300/50 border-gray-600 hover:bg-dark-200"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="bg-dark-300/50 border-gray-600 hover:bg-dark-200"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pagination Info */}
        <PaginationControls />

        {/* Achievements Grid */}
        <div className={`grid gap-4 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {achievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>

        {/* Bottom Pagination */}
        {pagination && pagination.total_pages > 1 && <PaginationControls />}

        {/* Empty State */}
        {achievements.length === 0 && !loading && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">No achievements found</h3>
            <p className="text-gray-500">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementsOverview; 