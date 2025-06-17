import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, UserPlus, UserCheck, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useUserSearch } from '@/hooks/useUserSearch';
import { useProfile } from '@/hooks/useProfile';
import { useFollowSystem } from '@/hooks/useFollowSystem';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import UserRelationshipButton from '@/components/UserRelationship/UserRelationshipButton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 12 }
  }
};

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState('all');
  
  const { users, isLoading, searchUsers, findRelatedUsers } = useUserSearch();
  const { profile } = useProfile();
  const { isFollowing } = useFollowSystem();
  
  const [isFollowingMap, setIsFollowingMap] = useState<Record<string, boolean>>({});
  const [suggestedUsers, setSuggestedUsers] = useState<{id: string; username: string; display_name?: string; avatar_url?: string; followers_count?: number; bio?: string}[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  
  useEffect(() => {
    if (initialQuery) {
      searchUsers(initialQuery);
    }
  }, [initialQuery, searchUsers]);
  
  useEffect(() => {
    const loadSuggestions = async () => {
      if (!profile?.id || initialQuery) return;
      
      setIsLoadingSuggestions(true);
      try {
        const related = await findRelatedUsers(profile.id, 10);
        setSuggestedUsers(related);
      } catch (error) {
      } finally {
        setIsLoadingSuggestions(false);
      }
    };
    
    loadSuggestions();
  }, [profile, initialQuery, findRelatedUsers]);
  
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!profile) return;
      
      const displayedUsers = initialQuery ? users : suggestedUsers;
      const followingMap: Record<string, boolean> = {};
      
      for (const user of displayedUsers) {
        if (user.id === profile.id) continue;
        followingMap[user.id] = await isFollowing(user.id);
      }
      
      setIsFollowingMap(followingMap);
    };
    
    checkFollowStatus();
  }, [users, suggestedUsers, profile, isFollowing, initialQuery]);
  
  const handleSearch = () => {
    if (!query.trim()) return;
    
    setSearchParams({ q: query });
    searchUsers(query);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const renderUserCard = (user: {id: string; username: string; display_name?: string; avatar_url?: string; followers_count?: number; bio?: string}) => {
    if (!profile) return null;
    if (user.id === profile.id) return null;
    
    return (
      <motion.div 
        key={user.id}
        variants={itemVariants}
        className="w-full"
      >
        <Card className="bg-dark-100 border-gray-800 hover:border-primary-500/30 transition-all">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-gray-800">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-primary-500/80 to-secondary-600/80 text-lg">
                    {user.display_name?.charAt(0) || user.username?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex flex-col">
                  <div className="font-semibold">{user.display_name || user.username}</div>
                  <div className="text-sm text-gray-400">@{user.username}</div>
                  {user.followers_count > 0 && (
                    <div className="text-xs text-gray-500 flex items-center mt-1">
                      <Users size={12} className="mr-1" />
                      {user.followers_count} {user.followers_count === 1 ? 'Follower' : 'Follower'}
                    </div>
                  )}
                </div>
              </div>
              
              <UserRelationshipButton 
                targetUserId={user.id} 
                initialIsFollowing={false}
                showLabels={false}
              />
            </div>
            
            {user.bio && (
              <div className="mt-2 text-sm text-gray-300">
                {user.bio}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-dark-200 text-white pt-16 lg:pt-0 lg:pl-64">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Benutzer suchen</h1>
        
        <div className="flex items-center mb-6 gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-500" />
            </div>
            <Input
              className="pl-10 bg-dark-100 border-gray-700 text-white"
              placeholder="Nach Benutzern suchen..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <Button 
            onClick={handleSearch} 
            className="bg-primary-500 hover:bg-primary-600"
          >
            Suchen
          </Button>
        </div>
        
        {initialQuery ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Suchergebnisse für "{initialQuery}"</h2>
              <span className="text-gray-400 text-sm">{users.length} Ergebnisse</span>
            </div>
            
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="bg-dark-100 border-gray-800 animate-pulse">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-dark-300"></div>
                          <div className="flex flex-col gap-2">
                            <div className="h-4 w-32 bg-dark-300 rounded"></div>
                            <div className="h-3 w-24 bg-dark-300 rounded"></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : users.length > 0 ? (
              <motion.div 
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {users.map(renderUserCard)}
              </motion.div>
            ) : (
              <Card className="bg-dark-100 border-gray-800">
                <CardContent className="p-8 text-center">
                  <div className="text-gray-400 mb-2">Keine Ergebnisse gefunden</div>
                  <p className="text-gray-500 text-sm">
                    Versuche es mit einem anderen Suchbegriff oder schaue dir unsere Vorschläge an.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-dark-100 mb-6">
              <TabsTrigger value="all" className="data-[state=active]:bg-dark-300">
                Alle Vorschläge
              </TabsTrigger>
              <TabsTrigger value="followers" className="data-[state=active]:bg-dark-300">
                Follower
              </TabsTrigger>
              <TabsTrigger value="similar" className="data-[state=active]:bg-dark-300">
                Ähnliche Profile
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <Card className="bg-dark-100 border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle>Benutzer, die du kennen könntest</CardTitle>
                  <CardDescription>Basierend auf deinen Verbindungen und Interessen</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingSuggestions ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 animate-pulse">
                          <div className="h-12 w-12 rounded-full bg-dark-300"></div>
                          <div className="flex flex-col gap-2">
                            <div className="h-4 w-32 bg-dark-300 rounded"></div>
                            <div className="h-3 w-24 bg-dark-300 rounded"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : suggestedUsers.length > 0 ? (
                    <motion.div 
                      className="space-y-4"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {suggestedUsers.map(renderUserCard)}
                    </motion.div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-400">Noch keine Vorschläge verfügbar</p>
                      <p className="text-gray-500 text-sm mt-1">
                        Folge anderen Benutzern, um Vorschläge zu erhalten
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="followers">
              <Card className="bg-dark-100 border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle>Deine Follower</CardTitle>
                  <CardDescription>Benutzer, die dir folgen</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6">
                    <p className="text-gray-400">Folger-Vorschläge werden hier angezeigt</p>
                    <p className="text-gray-500 text-sm mt-1">
                      Diese Funktion ist in Entwicklung
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="similar">
              <Card className="bg-dark-100 border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle>Ähnliche Profile</CardTitle>
                  <CardDescription>Benutzer mit ähnlichen Interessen</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6">
                    <p className="text-gray-400">Ähnliche Profile werden hier angezeigt</p>
                    <p className="text-gray-500 text-sm mt-1">
                      Diese Funktion ist in Entwicklung
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
