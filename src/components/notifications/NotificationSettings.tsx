import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { X } from 'lucide-react';

interface NotificationSettingsProps {
  userId: string;
  onClose: () => void;
}

interface NotificationSettingsData {
  email_enabled: boolean;
  push_enabled: boolean;
  follows_enabled: boolean;
  likes_enabled: boolean;
  comments_enabled: boolean;
  mentions_enabled: boolean;
  new_posts_enabled: boolean;
  group_activity_enabled: boolean;
  mining_rewards_enabled: boolean;
  system_updates_enabled: boolean;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ userId, onClose }) => {
  const [settings, setSettings] = useState<NotificationSettingsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Lädt die Benachrichtigungseinstellungen
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        // TODO: Diese Komponente muss auf Django-API migriert werden. Supabase-Logik wurde entfernt.
        // const { data, error } = await supabase
        //   .from('user_notification_settings')
        //   .select('*')
        //   .eq('user_id', userId)
        //   .single();
        
        // if (error) throw error;
        
        // setSettings(data);
      } catch (err: unknown) {
        const error = err as { message?: string };
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, [userId]);
  
  // Aktualisiert eine einzelne Einstellung
  const updateSetting = async (setting: keyof NotificationSettingsData, value: boolean) => {
    if (!settings) return;
    
    try {
      setIsSaving(true);
      
      // Optimistisches UI-Update
      setSettings({
        ...settings,
        [setting]: value
      });
      
      // Speichern in der Datenbank
      // const { error } = await supabase
      //   .from('user_notification_settings')
      //   .update({ [setting]: value })
      //   .eq('user_id', userId);
      
      // if (error) throw error;
      
      toast.success('Einstellung aktualisiert');
    } catch (err: unknown) {
      // Zurücksetzen auf vorherigen Zustand
      setSettings({
        ...settings,
        [setting]: !value
      });
      const error = err as { message?: string };
      toast.error(`Einstellung konnte nicht gespeichert werden${error.message ? ': ' + error.message : ''}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Setzt alle Einstellungen auf Standardwerte zurück
  const resetToDefaults = async () => {
    try {
      setIsSaving(true);
      
      const defaultSettings = {
        email_enabled: false,
        push_enabled: true,
        follows_enabled: true,
        likes_enabled: false,
        comments_enabled: true,
        mentions_enabled: true,
        new_posts_enabled: true,
        group_activity_enabled: true,
        mining_rewards_enabled: true,
        system_updates_enabled: true
      };
      
      // Optimistisches UI-Update
      setSettings(defaultSettings);
      
      // Speichern in der Datenbank
      // const { error } = await supabase
      //   .from('user_notification_settings')
      //   .update(defaultSettings)
      //   .eq('user_id', userId);
        
      toast.success('Einstellungen zurückgesetzt');
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(`Einstellungen konnten nicht zurückgesetzt werden${error.message ? ': ' + error.message : ''}`);
      
      // Aktuellen Zustand neu laden
      // const { data } = await supabase
      //   .from('user_notification_settings')
      //   .select('*')
      //   .eq('user_id', userId)
      //   .single();
        
      // if (data) {
      //   setSettings(data);
      // }
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Benachrichtigungseinstellungen</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex justify-center py-10">
          <Spinner size="lg" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Benachrichtigungseinstellungen</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-destructive">
            Fehler beim Laden der Einstellungen. Bitte versuche es später erneut.
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!settings) return null;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Benachrichtigungseinstellungen</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Benachrichtigungsmethoden</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push_enabled">Push-Benachrichtigungen</Label>
                <p className="text-xs text-muted-foreground">Erhalte Benachrichtigungen auf deinem Gerät</p>
              </div>
              <Switch
                id="push_enabled"
                checked={settings.push_enabled}
                onCheckedChange={(checked) => updateSetting('push_enabled', checked)}
                disabled={isSaving}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email_enabled">E-Mail-Benachrichtigungen</Label>
                <p className="text-xs text-muted-foreground">Erhalte Benachrichtigungen per E-Mail</p>
              </div>
              <Switch
                id="email_enabled"
                checked={settings.email_enabled}
                onCheckedChange={(checked) => updateSetting('email_enabled', checked)}
                disabled={isSaving}
              />
            </div>
          </div>
          
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-medium">Benachrichtigungstypen</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="follows_enabled">Neue Follower</Label>
                <p className="text-xs text-muted-foreground">Wenn dir jemand folgt</p>
              </div>
              <Switch
                id="follows_enabled"
                checked={settings.follows_enabled}
                onCheckedChange={(checked) => updateSetting('follows_enabled', checked)}
                disabled={isSaving}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="likes_enabled">Likes</Label>
                <p className="text-xs text-muted-foreground">Wenn jemand deine Beiträge liked</p>
              </div>
              <Switch
                id="likes_enabled"
                checked={settings.likes_enabled}
                onCheckedChange={(checked) => updateSetting('likes_enabled', checked)}
                disabled={isSaving}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="comments_enabled">Kommentare</Label>
                <p className="text-xs text-muted-foreground">Wenn jemand auf deine Beiträge antwortet</p>
              </div>
              <Switch
                id="comments_enabled"
                checked={settings.comments_enabled}
                onCheckedChange={(checked) => updateSetting('comments_enabled', checked)}
                disabled={isSaving}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="mentions_enabled">Erwähnungen</Label>
                <p className="text-xs text-muted-foreground">Wenn dich jemand in einem Beitrag oder Kommentar erwähnt</p>
              </div>
              <Switch
                id="mentions_enabled"
                checked={settings.mentions_enabled}
                onCheckedChange={(checked) => updateSetting('mentions_enabled', checked)}
                disabled={isSaving}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="new_posts_enabled">Neue Beiträge</Label>
                <p className="text-xs text-muted-foreground">Wenn Personen, denen du folgst, etwas posten</p>
              </div>
              <Switch
                id="new_posts_enabled"
                checked={settings.new_posts_enabled}
                onCheckedChange={(checked) => updateSetting('new_posts_enabled', checked)}
                disabled={isSaving}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="group_activity_enabled">Gruppenaktivitäten</Label>
                <p className="text-xs text-muted-foreground">Aktivitäten in Gruppen, denen du beigetreten bist</p>
              </div>
              <Switch
                id="group_activity_enabled"
                checked={settings.group_activity_enabled}
                onCheckedChange={(checked) => updateSetting('group_activity_enabled', checked)}
                disabled={isSaving}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="mining_rewards_enabled">Mining-Belohnungen</Label>
                <p className="text-xs text-muted-foreground">Wenn du Token durch Mining-Aktivitäten verdienst</p>
              </div>
              <Switch
                id="mining_rewards_enabled"
                checked={settings.mining_rewards_enabled}
                onCheckedChange={(checked) => updateSetting('mining_rewards_enabled', checked)}
                disabled={isSaving}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="system_updates_enabled">System-Updates</Label>
                <p className="text-xs text-muted-foreground">Wichtige Updates und Ankündigungen zur Plattform</p>
              </div>
              <Switch
                id="system_updates_enabled"
                checked={settings.system_updates_enabled}
                onCheckedChange={(checked) => updateSetting('system_updates_enabled', checked)}
                disabled={isSaving}
              />
            </div>
          </div>
          
          <div className="pt-4 flex justify-end">
            <Button
              variant="outline"
              onClick={resetToDefaults}
              disabled={isSaving}
            >
              {isSaving ? <Spinner size="sm" className="mr-2" /> : null}
              Auf Standard zurücksetzen
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
