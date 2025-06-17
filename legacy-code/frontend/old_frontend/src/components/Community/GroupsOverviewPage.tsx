
import React, { useState } from 'react';
import { FeedLayout } from '@/components/Feed/FeedLayout';
import { useGroups } from '@/hooks/useGroups';

// Komponenten
import GroupPageHeader from './GroupPageHeader';
import GroupSearchBar from './GroupSearchBar';
import GroupTabsNav from './GroupTabsNav';
import GroupsGrid from './GroupsGrid';
import GroupsLoadingSkeleton from './GroupsLoadingSkeleton';
import GroupEmptyState from './GroupEmptyState';
import GroupsErrorState from './GroupsErrorState';

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
          <GroupEmptyState 
            activeTab={activeTab} 
            onBrowseGroups={handleBrowseGroups} 
          />
        )}
      </div>
    </FeedLayout>
  );
};

export default GroupsOverviewPage;
