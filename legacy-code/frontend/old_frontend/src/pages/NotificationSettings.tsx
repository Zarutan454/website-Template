
import React from 'react';
import { useNotificationSettings } from '@/hooks/use-notification-settings';
import { Link } from 'react-router-dom';
import { ChevronLeft, Info } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const NotificationSettings = () => {
  const { settings, isLoading, error, updateSettings, resetToDefaults } = useNotificationSettings();
  const [isSaving, setIsSaving] = React.useState(false);

  const handleToggle = async (setting: string, value: boolean) => {
    try {
      setIsSaving(true);
      await updateSettings({ [setting]: value });
      toast.success('Einstellungen aktualisiert');
    } catch (error) {
      toast.error('Fehler beim Aktualisieren der Einstellungen');
    } finally {
      setIsSaving(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-dark-200 text-white">
        <header className="bg-dark-100 border-b border-gray-800 fixed top-0 left-0 right-0 z-40">
          <div className="flex items-center justify-between px-4 py-3">
            <Link to="/notifications" className="text-gray-400 hover:text-white">
              <ChevronLeft size={24} />
            </Link>
            <div className="text-xl font-bold">Benachrichtigungseinstellungen</div>
            <div className="w-8"></div> {/* Spacer for balance */}
          </div>
        </header>
        <main className="pt-14 container mx-auto p-6">
          <div className="bg-dark-100 rounded-lg p-6 flex flex-col items-center justify-center text-center space-y-4">
            <Info className="text-red-500" size={48} />
            <h3 className="text-xl font-semibold">Fehler beim Laden der Einstellungen</h3>
            <p className="text-gray-400">Bitte versuche es später noch einmal.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-200 text-white">
      <header className="bg-dark-100 border-b border-gray-800 fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/notifications" className="text-gray-400 hover:text-white">
            <ChevronLeft size={24} />
          </Link>
          <div className="text-xl font-bold">Benachrichtigungseinstellungen</div>
          <div className="w-8"></div> {/* Spacer for balance */}
        </div>
      </header>

      <main className="pt-14 container mx-auto p-6">
        <div className="bg-dark-100 rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-bold mb-6">Benachrichtigungseinstellungen</h2>
          
          <div className="space-y-6">
            {isLoading ? (
              // Loading skeletons
              Array(8).fill(0).map((_, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-800">
                  <div>
                    <Skeleton className="h-5 w-40 bg-gray-700" />
                    <Skeleton className="h-4 w-64 mt-2 bg-gray-700" />
                  </div>
                  <Skeleton className="h-6 w-12 bg-gray-700" />
                </div>
              ))
            ) : (
              <>
                <SettingItem
                  title="Push-Benachrichtigungen"
                  description="Erhalte Push-Benachrichtigungen auf deinem Gerät"
                  enabled={settings?.push_enabled || false}
                  disabled={isSaving}
                  onChange={(value) => handleToggle('push_enabled', value)}
                />
                
                <SettingItem
                  title="E-Mail-Benachrichtigungen"
                  description="Erhalte Benachrichtigungen per E-Mail"
                  enabled={settings?.email_enabled || false}
                  disabled={isSaving}
                  onChange={(value) => handleToggle('email_enabled', value)}
                />

                <h3 className="text-lg font-semibold mt-8 mb-4 text-gray-300">Benachrichtigungstypen</h3>
                
                <SettingItem
                  title="Erwähnungen"
                  description="Wenn dich jemand in einem Beitrag oder Kommentar erwähnt"
                  enabled={settings?.mentions_enabled || false}
                  disabled={isSaving}
                  onChange={(value) => handleToggle('mentions_enabled', value)}
                />
                
                <SettingItem
                  title="Neue Follower"
                  description="Wenn dir jemand folgt"
                  enabled={settings?.follows_enabled || false}
                  disabled={isSaving}
                  onChange={(value) => handleToggle('follows_enabled', value)}
                />
                
                <SettingItem
                  title="Kommentare"
                  description="Wenn jemand auf deine Beiträge antwortet"
                  enabled={settings?.comments_enabled || false}
                  disabled={isSaving}
                  onChange={(value) => handleToggle('comments_enabled', value)}
                />
                
                <SettingItem
                  title="Likes"
                  description="Wenn jemand deine Beiträge liked"
                  enabled={settings?.likes_enabled || false}
                  disabled={isSaving}
                  onChange={(value) => handleToggle('likes_enabled', value)}
                />
                
                <SettingItem
                  title="Neue Beiträge von gefolgten Personen"
                  description="Wenn Personen, denen du folgst, etwas posten"
                  enabled={settings?.new_posts_enabled || false}
                  disabled={isSaving}
                  onChange={(value) => handleToggle('new_posts_enabled', value)}
                />
                
                <SettingItem
                  title="Gruppenaktivitäten"
                  description="Aktivitäten in Gruppen, denen du beigetreten bist"
                  enabled={settings?.group_activity_enabled || false}
                  disabled={isSaving}
                  onChange={(value) => handleToggle('group_activity_enabled', value)}
                />
                
                <SettingItem
                  title="Mining-Belohnungen"
                  description="Wenn du Token durch Mining-Aktivitäten verdienst"
                  enabled={settings?.mining_rewards_enabled || false}
                  disabled={isSaving}
                  onChange={(value) => handleToggle('mining_rewards_enabled', value)}
                />
                
                <SettingItem
                  title="System-Updates"
                  description="Wichtige Updates und Ankündigungen zur Plattform"
                  enabled={settings?.system_updates_enabled || false}
                  disabled={isSaving}
                  onChange={(value) => handleToggle('system_updates_enabled', value)}
                />
              </>
            )}
          </div>
        </div>
        
        <div className="mt-6 text-sm text-gray-400">
          <p>Diese Einstellungen bestimmen, welche Benachrichtigungen du erhältst. Du kannst sie jederzeit ändern.</p>
        </div>
      </main>
    </div>
  );
};

interface SettingItemProps {
  title: string;
  description: string;
  enabled: boolean;
  disabled?: boolean;
  onChange: (enabled: boolean) => void;
}

const SettingItem: React.FC<SettingItemProps> = ({ 
  title, 
  description, 
  enabled, 
  disabled = false,
  onChange 
}) => {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-800">
      <div>
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </div>
  );
};

export default NotificationSettings;
