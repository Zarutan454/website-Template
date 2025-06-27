import React, { useState } from 'react';
import { FeedLayout } from '@/components/Feed/FeedLayout';
import { useGroups } from '@/hooks/useGroups';
import GroupPageHeader from './GroupPageHeader';
import GroupSearchBar from './GroupSearchBar';
import GroupTabsNav from './GroupTabsNav';
import GroupsGrid from './GroupsGrid';
import GroupsLoadingSkeleton from './GroupsLoadingSkeleton';
import GroupsErrorState from './GroupsErrorState';
import { EmptyState } from '@/components/ui/empty-state';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GroupsOverviewPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'my-groups' | 'suggested'>('all');

  const { data: groups, isLoading, error } = useGroups(activeTab);

  const filteredGroups = groups?.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (group.description && group.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleBrowseGroups = () => {
    setActiveTab('all');
  };

  return (
    <FeedLayout hideRightSidebar={true}>
      <div className="space-y-6">
        <GroupPageHeader 
          title="Gemeinschaften" 
          description="Finde und tritt Gruppen bei, die deine Interessen teilen"
        />

        <GroupSearchBar 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
        />

        <GroupTabsNav 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />

        {isLoading ? (
          <GroupsLoadingSkeleton />
        ) : error ? (
          <GroupsErrorState />
        ) : filteredGroups && filteredGroups.length > 0 ? (
          <GroupsGrid groups={filteredGroups} />
        ) : (
          <EmptyState 
            title="Keine Gruppen gefunden"
            description={
              activeTab === 'my-groups' 
                ? 'Du bist noch keiner Gruppe beigetreten.' 
                : 'Keine Gruppen gefunden, die deiner Suche entsprechen.'
            }
            icon={<Users className="h-16 w-16 text-muted-foreground opacity-20" />}
            action={
              activeTab === 'my-groups' && (
                <Button onClick={handleBrowseGroups}>
                  Gruppen durchsuchen
                </Button>
              )
            }
          />
        )}
      </div>
    </FeedLayout>
  );
};

export default GroupsOverviewPage;
