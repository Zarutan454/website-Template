import { useState } from 'react';
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
import { useNavigate } from 'react-router-dom';
import LeftSidebar from '@/components/Feed/LeftSidebar';
import { Menu } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import GroupCard from './GroupCard';

// Responsive Layout für Gruppenübersicht mit linker Sidebar
const GroupsLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-dark-100" aria-label="Gruppenübersicht" role="main">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-16">
        <Button
          variant="ghost"
          size="sm"
          aria-label={sidebarOpen ? 'Sidebar schließen' : 'Sidebar öffnen'}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-dark-200 backdrop-blur-sm border border-white/10 text-white hover:bg-dark-300"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <div className={`
        w-64 fixed top-14 left-0 z-30 bg-dark-200 backdrop-blur-sm border-r border-white/5 overflow-auto hide-scrollbar
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0
        transition-transform duration-300 ease-in-out
      `}>
        <div className="p-4">
          <LeftSidebar />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-14">
        <div className="container mx-auto max-w-4xl px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  );
};

const GroupsOverviewPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'my-groups' | 'suggested'>('all');
  const navigate = useNavigate();
  // Dummy-Handler für Gruppenerstellung (kann später angepasst werden)
  const onCreateGroup = () => navigate('/create-group');

  const { data: groups, isLoading, error } = useGroups(activeTab);

  const filteredGroups = groups?.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (group.description && group.description.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  const handleBrowseGroups = () => {
    setActiveTab('all');
  };

  return (
    <GroupsLayout>
      <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto px-2 md:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Gruppen</h1>
          <Button variant="default" size="lg" onClick={onCreateGroup} className="font-semibold shadow-md hover:scale-105 transition-transform">
            <Plus className="h-5 w-5 mr-2" /> Neue Gruppe
          </Button>
        </div>
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center md:items-end">
          <Tabs value={activeTab} onValueChange={v => setActiveTab(v as 'all' | 'my-groups' | 'suggested')} className="w-full md:w-auto">
            <TabsList className="flex gap-2 md:gap-4">
              <TabsTrigger value="all" className="px-5 py-2 rounded-lg font-semibold text-white/90 hover:text-white hover:bg-primary/30 data-[state=active]:bg-primary/90 data-[state=active]:text-white shadow-sm transition-colors">Alle Gruppen</TabsTrigger>
              <TabsTrigger value="my-groups" className="px-5 py-2 rounded-lg font-semibold text-white/90 hover:text-white hover:bg-primary/30 data-[state=active]:bg-primary/90 data-[state=active]:text-white shadow-sm transition-colors">Meine Gruppen</TabsTrigger>
              <TabsTrigger value="suggested" className="px-5 py-2 rounded-lg font-semibold text-white/90 hover:text-white hover:bg-primary/30 data-[state=active]:bg-primary/90 data-[state=active]:text-white shadow-sm transition-colors">Vorgeschlagen</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="w-full md:w-80">
            <Input
              type="text"
              placeholder="Suche nach Gruppen..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-dark-200 border border-white/10 text-white placeholder:text-white/40 focus:ring-primary focus:border-primary rounded-lg px-4 py-2 shadow-sm"
              aria-label="Gruppen suchen"
            />
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredGroups.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center text-white/80 animate-fade-in">
              <div className="text-6xl mb-4">🤝</div>
              <div className="text-xl font-bold mb-2">Keine Gruppen gefunden</div>
              <div className="text-base mb-6">Probiere einen anderen Suchbegriff oder erstelle eine neue Gruppe!</div>
              <Button variant="outline" size="lg" onClick={onCreateGroup} className="font-semibold shadow hover:scale-105 transition-transform">
                <Plus className="h-5 w-5 mr-2" /> Neue Gruppe erstellen
              </Button>
            </div>
          ) : (
            filteredGroups.map(group => (
              <GroupCard key={group.id} group={group} />
            ))
          )}
        </div>
      </div>
    </GroupsLayout>
  );
};

export default GroupsOverviewPage; 