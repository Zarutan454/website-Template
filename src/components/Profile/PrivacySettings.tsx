import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.utils';
import { updatePrivacySettings, PrivacySettings } from '../../hooks/useProfile';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Shield, Eye, EyeOff, Lock, Unlock, Users, MessageSquare, Activity, Image, BarChart3 } from 'lucide-react';
import { toast } from '../../hooks/use-toast';

interface PrivacySettingsProps {
  settings: PrivacySettings | null;
  onSettingsUpdated: () => void;
}

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({ settings, onSettingsUpdated }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [localSettings, setLocalSettings] = useState<PrivacySettings | null>(settings);

  const handleSave = async () => {
    if (!user?.id || !localSettings) return;

    setIsSaving(true);
    try {
      await updatePrivacySettings(user.id, localSettings);
      toast({
        title: "Erfolg",
        description: "Privacy-Einstellungen aktualisiert"
      });
      setIsEditing(false);
      onSettingsUpdated();
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Einstellungen konnten nicht gespeichert werden",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setLocalSettings(settings);
    setIsEditing(false);
  };

  if (!localSettings) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Shield className="w-8 h-8 mx-auto mb-2" />
            <p>Privacy-Einstellungen werden geladen...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Privacy-Einstellungen
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="ml-auto"
            >
              Bearbeiten
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profil-Sichtbarkeit */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {localSettings.profile_visibility === 'public' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            <span className="font-medium">Profil-Sichtbarkeit</span>
          </div>
          {isEditing ? (
            <Select
              value={localSettings.profile_visibility}
              onValueChange={(value) => setLocalSettings(prev => prev ? { ...prev, profile_visibility: value as 'public' | 'private' | 'friends' } : null)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Öffentlich</SelectItem>
                <SelectItem value="friends">Nur Freunde</SelectItem>
                <SelectItem value="private">Privat</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm text-gray-600">
              {localSettings.profile_visibility === 'public' ? 'Öffentlich' : 
               localSettings.profile_visibility === 'friends' ? 'Nur Freunde' : 'Privat'}
            </p>
          )}
        </div>

        {/* Kontakt-Informationen */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span className="font-medium">Kontakt-Informationen</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">E-Mail anzeigen</span>
              {isEditing ? (
                <Switch
                  checked={localSettings.show_email}
                  onCheckedChange={(checked) => setLocalSettings(prev => prev ? { ...prev, show_email: checked } : null)}
                />
              ) : (
                <span className="text-sm text-gray-600">
                  {localSettings.show_email ? 'Ja' : 'Nein'}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Telefonnummer anzeigen</span>
              {isEditing ? (
                <Switch
                  checked={localSettings.show_phone}
                  onCheckedChange={(checked) => setLocalSettings(prev => prev ? { ...prev, show_phone: checked } : null)}
                />
              ) : (
                <span className="text-sm text-gray-600">
                  {localSettings.show_phone ? 'Ja' : 'Nein'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Interaktionen */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="font-medium">Interaktionen</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Freundschaftsanfragen erlauben</span>
              {isEditing ? (
                <Switch
                  checked={localSettings.allow_friend_requests}
                  onCheckedChange={(checked) => setLocalSettings(prev => prev ? { ...prev, allow_friend_requests: checked } : null)}
                />
              ) : (
                <span className="text-sm text-gray-600">
                  {localSettings.allow_friend_requests ? 'Ja' : 'Nein'}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Nachrichten erlauben</span>
              {isEditing ? (
                <Switch
                  checked={localSettings.allow_messages}
                  onCheckedChange={(checked) => setLocalSettings(prev => prev ? { ...prev, allow_messages: checked } : null)}
                />
              ) : (
                <span className="text-sm text-gray-600">
                  {localSettings.allow_messages ? 'Ja' : 'Nein'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Status & Aktivität */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span className="font-medium">Status & Aktivität</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Online-Status anzeigen</span>
              {isEditing ? (
                <Switch
                  checked={localSettings.show_online_status}
                  onCheckedChange={(checked) => setLocalSettings(prev => prev ? { ...prev, show_online_status: checked } : null)}
                />
              ) : (
                <span className="text-sm text-gray-600">
                  {localSettings.show_online_status ? 'Ja' : 'Nein'}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Aktivitäten anzeigen</span>
              {isEditing ? (
                <Switch
                  checked={localSettings.show_activity}
                  onCheckedChange={(checked) => setLocalSettings(prev => prev ? { ...prev, show_activity: checked } : null)}
                />
              ) : (
                <span className="text-sm text-gray-600">
                  {localSettings.show_activity ? 'Ja' : 'Nein'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Inhalte */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            <span className="font-medium">Inhalte</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Fotos anzeigen</span>
              {isEditing ? (
                <Switch
                  checked={localSettings.show_photos}
                  onCheckedChange={(checked) => setLocalSettings(prev => prev ? { ...prev, show_photos: checked } : null)}
                />
              ) : (
                <span className="text-sm text-gray-600">
                  {localSettings.show_photos ? 'Ja' : 'Nein'}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Freunde anzeigen</span>
              {isEditing ? (
                <Switch
                  checked={localSettings.show_friends}
                  onCheckedChange={(checked) => setLocalSettings(prev => prev ? { ...prev, show_friends: checked } : null)}
                />
              ) : (
                <span className="text-sm text-gray-600">
                  {localSettings.show_friends ? 'Ja' : 'Nein'}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Analytics anzeigen</span>
              {isEditing ? (
                <Switch
                  checked={localSettings.show_analytics}
                  onCheckedChange={(checked) => setLocalSettings(prev => prev ? { ...prev, show_analytics: checked } : null)}
                />
              ) : (
                <span className="text-sm text-gray-600">
                  {localSettings.show_analytics ? 'Ja' : 'Nein'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Aktions-Buttons */}
        {isEditing && (
          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? 'Wird gespeichert...' : 'Speichern'}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              Abbrechen
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 