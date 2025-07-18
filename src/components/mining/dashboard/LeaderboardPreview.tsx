import React, { useState, useEffect } from 'react';
import { Trophy, ArrowRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Link } from 'react-router-dom';

interface LeaderboardUser {
  id: string;
  name: string;
  score: number;
  avatar: string;
}

const LeaderboardPreview: React.FC = () => {
  const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        
        // TODO: Django-API-Migration: LeaderboardPreview auf Django-API umstellen
        // Die gesamte Logik für das Laden der Leaderboard-Daten muss auf die Django-API migriert werden.
        // Aktuell ist keine Funktionalität vorhanden, da Supabase entfernt wurde.
        
        // const { data, error } = await supabase
        //   .from('mining_stats')
        //   .select('user_id, total_points, users:user_id(display_name, avatar_url)')
        //   .order('total_points', { ascending: false })
        //   .limit(3);
        
        // if (error) throw error;
        
        // const formattedLeaders = data.map(item => ({
        //   id: item.user_id,
        //   name: item.users ? (item.users as any).display_name : 'Anonymous User',
        //   score: item.total_points || 0,
        //   avatar: item.users ? (item.users as any).avatar_url : ''
        // }));
        
        // setLeaders(formattedLeaders);
      } catch (err) {
        setLeaders([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, []);

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Spinner size="lg" text="Rangliste wird geladen..." />
        </div>
      ) : leaders.length === 0 ? (
        <EmptyState
          title="Keine Ranglisten-Daten"
          description="Sobald Benutzer mit dem Mining beginnen, werden sie hier angezeigt."
          icon={<Users className="h-10 w-10" />}
          className="bg-transparent border-gray-800"
        />
      ) : (
        <>
          {leaders.map((leader, index) => (
            <div 
              key={leader.id}
              className="flex items-center p-3 bg-dark-200 rounded-lg hover:bg-dark-300 transition-colors"
            >
              <div className="w-10 h-10 flex items-center justify-center font-bold">
                {index === 0 ? (
                  <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                  </div>
                ) : index === 1 ? (
                  <div className="w-8 h-8 rounded-full bg-gray-400/20 flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-gray-400" />
                  </div>
                ) : index === 2 ? (
                  <div className="w-8 h-8 rounded-full bg-amber-700/20 flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-amber-700" />
                  </div>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              
              <Avatar className="h-10 w-10 ml-2 border-2 border-primary/20">
                <AvatarImage src={leader.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {leader.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="ml-3 flex-grow">
                <div className="font-medium">{leader.name}</div>
                <div className="text-xs text-muted-foreground">Miner</div>
              </div>
              
              <div className="text-right">
                <div className="font-medium text-primary">{leader.score}</div>
                <div className="text-xs text-muted-foreground">Punkte</div>
              </div>
            </div>
          ))}
        </>
      )}
      
      <Button 
        variant="outline" 
        className="w-full mt-4 flex items-center justify-center"
        asChild
      >
        <Link to="/leaderboard">
          Vollständige Rangliste
          <ArrowRight className="h-4 w-4 ml-2" />
        </Link>
      </Button>
    </div>
  );
};

export default LeaderboardPreview;
