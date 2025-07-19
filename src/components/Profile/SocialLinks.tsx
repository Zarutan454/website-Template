import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.utils';
import { updateSocialLinks, SocialLinks } from '../../hooks/useProfile';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Share2, Edit, Save, X, ExternalLink, Facebook, Twitter, Instagram, Linkedin, Youtube, Github } from 'lucide-react';
import { toast } from '../../hooks/use-toast';

interface SocialLinksProps {
  links: SocialLinks;
  onLinksUpdated: () => void;
}

const SOCIAL_PLATFORMS = [
  { key: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600' },
  { key: 'twitter', name: 'Twitter', icon: Twitter, color: 'text-blue-400' },
  { key: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-500' },
  { key: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' },
  { key: 'youtube', name: 'YouTube', icon: Youtube, color: 'text-red-600' },
  { key: 'tiktok', name: 'TikTok', icon: Share2, color: 'text-black' },
  { key: 'github', name: 'GitHub', icon: Github, color: 'text-gray-800' },
] as const;

export const SocialLinks: React.FC<SocialLinksProps> = ({ links, onLinksUpdated }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [localLinks, setLocalLinks] = useState<SocialLinks>(links);

  const handleSave = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      await updateSocialLinks(user.id, localLinks);
      toast({
        title: "Erfolg",
        description: "Social Links aktualisiert"
      });
      setIsEditing(false);
      onLinksUpdated();
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Links konnten nicht gespeichert werden",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setLocalLinks(links);
    setIsEditing(false);
  };

  const handleLinkChange = (platform: keyof SocialLinks, value: string) => {
    setLocalLinks(prev => ({
      ...prev,
      [platform]: value.trim() || undefined
    }));
  };

  const hasAnyLinks = Object.values(links).some(link => link && link.trim() !== '');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          Social Media Links
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="ml-auto"
            >
              <Edit className="w-4 h-4 mr-1" />
              Bearbeiten
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasAnyLinks && !isEditing ? (
          <div className="text-center py-8 text-gray-500">
            <Share2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Keine Social Media Links hinzugefügt</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="mt-2"
            >
              Links hinzufügen
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {SOCIAL_PLATFORMS.map(({ key, name, icon: Icon, color }) => {
              const currentValue = localLinks[key as keyof SocialLinks] || '';
              const displayValue = links[key as keyof SocialLinks] || '';

              return (
                <div key={key} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700">{name}</label>
                    {isEditing ? (
                      <Input
                        type="url"
                        placeholder={`https://${key}.com/username`}
                        value={currentValue}
                        onChange={(e) => handleLinkChange(key as keyof SocialLinks, e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <div className="mt-1">
                        {displayValue ? (
                          <a
                            href={displayValue}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            {displayValue}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400">Nicht hinzugefügt</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Aktions-Buttons */}
        {isEditing && (
          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1"
            >
              <Save className="w-4 h-4 mr-1" />
              {isSaving ? 'Wird gespeichert...' : 'Speichern'}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-1" />
              Abbrechen
            </Button>
          </div>
        )}

        {/* Tipps */}
        {isEditing && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 font-medium mb-2">💡 Tipps:</p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Verwende vollständige URLs (https://...)</li>
              <li>• Stelle sicher, dass die Links öffentlich zugänglich sind</li>
              <li>• Du kannst Links jederzeit hinzufügen oder entfernen</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 