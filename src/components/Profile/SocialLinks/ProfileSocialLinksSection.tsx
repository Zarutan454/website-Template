import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Edit, Plus, X, Globe, Instagram, Twitter, Github, Linkedin, Youtube, Facebook } from 'lucide-react';
import { useAuth } from '@/context/AuthContext.utils';

const SOCIAL_PLATFORMS = [
  { key: 'website', label: 'Website', icon: Globe },
  { key: 'instagram', label: 'Instagram', icon: Instagram },
  { key: 'twitter', label: 'Twitter', icon: Twitter },
  { key: 'github', label: 'GitHub', icon: Github },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { key: 'youtube', label: 'YouTube', icon: Youtube },
  { key: 'facebook', label: 'Facebook', icon: Facebook },
];

interface ProfileSocialLinksSectionProps {
  profileId: string;
  isOwnProfile: boolean;
}

export const ProfileSocialLinksSection = ({ profileId, isOwnProfile }: ProfileSocialLinksSectionProps) => {
  const { user, refreshUser } = useAuth();
  const [links, setLinks] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editLinks, setEditLinks] = useState<{ [key: string]: string }>({});
  const [saving, setSaving] = useState(false);

  // Load social links from API
  useEffect(() => {
    const fetchLinks = async () => {
      setLoading(true);
      try {
        let data;
        if (isOwnProfile && user) {
          data = user.social_media_links || {};
        } else {
          // Fremdes Profil: Hole User-Daten per API
          const res = await fetch(`/api/users/${profileId}/`);
          if (res.ok) {
            const json = await res.json();
            data = json.social_media_links || {};
          } else {
            data = {};
          }
        }
        setLinks(data);
      } catch (e) {
        setLinks({});
      } finally {
        setLoading(false);
      }
    };
    fetchLinks();
  }, [profileId, isOwnProfile, user]);

  // Editieren starten
  const handleEdit = () => {
    setEditLinks({ ...links });
    setEditMode(true);
  };

  // Link ändern
  const handleChange = (key: string, value: string) => {
    setEditLinks(prev => ({ ...prev, [key]: value }));
  };

  // Link entfernen
  const handleRemove = (key: string) => {
    setEditLinks(prev => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  // Speichern (nur eigenes Profil)
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/auth/user/', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ social_media_links: editLinks })
      });
      if (res.ok) {
        setLinks({ ...editLinks });
        setEditMode(false);
        toast.success('Social Links gespeichert');
        refreshUser && refreshUser();
      } else {
        toast.error('Fehler beim Speichern');
      }
    } catch (e) {
      toast.error('Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  // UI
  if (loading) {
    return (
      <Card className="overflow-hidden bg-dark-100/80 backdrop-blur-sm border-gray-800/40 relative animate-pulse min-h-[120px]">
        <CardHeader className="relative flex flex-row items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Social Media</h3>
        </CardHeader>
        <CardContent className="relative">
          <div className="h-8 bg-dark-200/50 rounded mb-2 w-1/2" />
          <div className="h-4 bg-dark-200/50 rounded w-1/3" />
        </CardContent>
      </Card>
    );
  }

  if (!editMode) {
    const hasLinks = Object.keys(links).length > 0 && Object.values(links).some(Boolean);
    return (
      <Card className="overflow-hidden bg-dark-100/80 backdrop-blur-sm border-gray-800/40 relative">
        <CardHeader className="relative flex flex-row items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Social Media</h3>
          {isOwnProfile && (
            <Button size="sm" variant="ghost" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-1" /> Bearbeiten
            </Button>
          )}
        </CardHeader>
        <CardContent className="relative space-y-2">
          {hasLinks ? (
            <div className="flex flex-col gap-2">
              {SOCIAL_PLATFORMS.filter(p => links[p.key]).map(platform => (
                <a
                  key={platform.key}
                  href={links[platform.key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white hover:underline"
                >
                  <platform.icon className="h-5 w-5" />
                  <span>{platform.label}</span>
                  <span className="truncate text-gray-300">{links[platform.key]}</span>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-sm">Keine Social Links hinterlegt.</div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Edit Mode
  return (
    <Card className="overflow-hidden bg-dark-100/80 backdrop-blur-sm border-gray-800/40 relative">
      <CardHeader className="relative flex flex-row items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Social Media</h3>
        <Button size="sm" variant="ghost" onClick={() => setEditMode(false)}>
          <X className="h-4 w-4 mr-1" /> Abbrechen
        </Button>
      </CardHeader>
      <CardContent className="relative space-y-3">
        {SOCIAL_PLATFORMS.map(platform => (
          <div key={platform.key} className="flex items-center gap-2 mb-2">
            <platform.icon className="h-5 w-5" />
            <span className="w-24">{platform.label}</span>
            <Input
              type="url"
              placeholder={`Link zu ${platform.label}`}
              value={editLinks[platform.key] || ''}
              onChange={e => handleChange(platform.key, e.target.value)}
              className="flex-1"
              autoFocus={platform.key === 'website'}
            />
            {editLinks[platform.key] && (
              <Button size="icon" variant="ghost" onClick={() => handleRemove(platform.key)}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <div className="flex gap-2 mt-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Speichern...' : 'Speichern'}
          </Button>
          <Button variant="outline" onClick={() => setEditMode(false)} disabled={saving}>
            Abbrechen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

