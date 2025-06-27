import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProfileData } from '@/types/profile';
import { Check, X, Upload, Loader2, Instagram, Twitter, Github, Linkedin, Globe } from 'lucide-react';
import { useProfileImageUpload } from './useProfileImageUpload';
import { toast } from 'sonner';

interface ProfileOrganizerProps {
  profile: Partial<ProfileData>;
  onSave: (profile: Partial<ProfileData>) => Promise<boolean>;
  isLoading?: boolean;
}

const ProfileOrganizer: React.FC<ProfileOrganizerProps> = ({
  profile,
  onSave,
  isLoading = false
}) => {
  const [editedProfile, setEditedProfile] = useState<Partial<ProfileData>>(profile);
  const [activeTab, setActiveTab] = useState('personal');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null);

  const {
    avatarUploading,
    coverUploading,
    uploadAvatar,
    uploadCover,
  } = useProfileImageUpload();

  useEffect(() => {
    setEditedProfile(profile);
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(null);
    try {
      const success = await onSave(editedProfile);
      setSaveSuccess(success);
      if (success) {
        toast.success('Profil erfolgreich gespeichert!');
      } else {
        toast.error('Fehler beim Speichern des Profils.');
      }
    } catch (error) {
      setSaveSuccess(false);
      toast.error('Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof ProfileData, value: string | Record<string, string>) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSocialLinkChange = (platform: string, value: string) => {
    setEditedProfile(prev => ({
      ...prev,
      social_links: {
        ...(prev.social_links || {}),
        [platform]: value
      }
    }));
  };
  
  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>, imageType: 'avatar' | 'cover') => {
    const file = event.target.files?.[0];
    if (!file) return;

    const uploader = imageType === 'avatar' ? uploadAvatar : uploadCover;
    const url = await uploader(file);

    if (url) {
      const fieldName = imageType === 'avatar' ? 'avatar_url' : 'cover_url';
      handleChange(fieldName, url);
      toast.success(`${imageType === 'avatar' ? 'Profilbild' : 'Banner'} erfolgreich hochgeladen und zur Speicherung vorgemerkt.`);
    } else {
      toast.error(`Fehler beim Hochladen des ${imageType === 'avatar' ? 'Profilbilds' : 'Banners'}.`);
    }
  };
  
  return (
    <Card className="w-full border-gray-800/60 bg-dark-200/30 backdrop-blur-md">
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="personal">Persönliches</TabsTrigger>
            <TabsTrigger value="socials">Social Media</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Benutzername</Label>
                <Input
                  id="username"
                  placeholder="Dein Benutzername"
                  value={editedProfile.username || ''}
                  onChange={(e) => handleChange('username', e.target.value)}
                  className="bg-dark-300/50 border-gray-700"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="display_name">Anzeigename</Label>
                <Input
                  id="display_name"
                  placeholder="Dein Anzeigename"
                  value={editedProfile.display_name || ''}
                  onChange={(e) => handleChange('display_name', e.target.value)}
                  className="bg-dark-300/50 border-gray-700"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="wallet_address">Wallet-Adresse</Label>
                <Input
                  id="wallet_address"
                  placeholder="Deine Ethereum Wallet-Adresse"
                  value={editedProfile.wallet_address || ''}
                  onChange={(e) => handleChange('wallet_address', e.target.value)}
                  className="bg-dark-300/50 border-gray-700 font-mono text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Erzähle etwas über dich"
                  value={editedProfile.bio || ''}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  className="bg-dark-300/50 border-gray-700 h-24"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Profilbild</Label>
                <div className="flex items-center space-x-4">
                  <Avatar className="w-20 h-20 border-2 border-primary">
                    <AvatarImage src={editedProfile.avatar_url || ''} />
                    <AvatarFallback className="bg-dark-300">
                      {editedProfile.display_name?.charAt(0).toUpperCase() || 
                       editedProfile.username?.charAt(0).toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <Label
                      htmlFor="avatar-upload"
                      className="cursor-pointer inline-flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-sm font-medium text-white"
                    >
                      {avatarUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                      {avatarUploading ? 'Lade...' : 'Bild hochladen'}
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageChange(e, 'avatar')}
                        disabled={avatarUploading}
                      />
                    </Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Titelbild</Label>
                <div className="relative rounded-lg overflow-hidden bg-dark-300/50 h-32 flex items-center justify-center">
                  {editedProfile.cover_url ? (
                    <img 
                      src={editedProfile.cover_url || ''} 
                      alt="Cover" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-500">Kein Titelbild</div>
                  )}
                  
                  <div className="absolute bottom-2 right-2">
                    <Label
                      htmlFor="cover-upload"
                      className="cursor-pointer inline-flex items-center px-3 py-1 bg-black/70 hover:bg-black/90 rounded-md text-xs font-medium text-white"
                    >
                      {coverUploading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Upload className="w-3 h-3 mr-1" />}
                      {coverUploading ? 'Lade...' : 'Hochladen'}
                      <input
                        id="cover-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageChange(e, 'cover')}
                        disabled={coverUploading}
                      />
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="socials" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="twitter" className="flex items-center text-gray-300"><Twitter className="w-5 h-5 mr-3 text-gray-400" />Twitter</Label>
              <Input id="twitter" placeholder="URL zu deinem Twitter-Profil" value={editedProfile.social_links?.twitter || ''} onChange={(e) => handleSocialLinkChange('twitter', e.target.value)} className="bg-dark-300/50 border-gray-700" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram" className="flex items-center text-gray-300"><Instagram className="w-5 h-5 mr-3 text-gray-400" />Instagram</Label>
              <Input id="instagram" placeholder="URL zu deinem Instagram-Profil" value={editedProfile.social_links?.instagram || ''} onChange={(e) => handleSocialLinkChange('instagram', e.target.value)} className="bg-dark-300/50 border-gray-700" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github" className="flex items-center text-gray-300"><Github className="w-5 h-5 mr-3 text-gray-400" />GitHub</Label>
              <Input id="github" placeholder="URL zu deinem GitHub-Profil" value={editedProfile.social_links?.github || ''} onChange={(e) => handleSocialLinkChange('github', e.target.value)} className="bg-dark-300/50 border-gray-700" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin" className="flex items-center text-gray-300"><Linkedin className="w-5 h-5 mr-3 text-gray-400" />LinkedIn</Label>
              <Input id="linkedin" placeholder="URL zu deinem LinkedIn-Profil" value={editedProfile.social_links?.linkedin || ''} onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)} className="bg-dark-300/50 border-gray-700" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website" className="flex items-center text-gray-300"><Globe className="w-5 h-5 mr-3 text-gray-400" />Website</Label>
              <Input id="website" placeholder="URL zu deiner Website" value={editedProfile.social_links?.website || ''} onChange={(e) => handleSocialLinkChange('website', e.target.value)} className="bg-dark-300/50 border-gray-700" />
            </div>
          </TabsContent>

          <TabsContent value="wallet">
            {/* Hier könnte man Wallet-spezifische Einstellungen hinzufügen, falls erforderlich */}
            <p className="text-gray-400">Verwalte hier deine Wallet-Informationen.</p>
             <div className="space-y-2 mt-4">
                <Label htmlFor="wallet_address_tab">Wallet-Adresse</Label>
                <Input
                  id="wallet_address_tab"
                  placeholder="Deine Ethereum Wallet-Adresse"
                  value={editedProfile.wallet_address || ''}
                  onChange={(e) => handleChange('wallet_address', e.target.value)}
                  className="bg-dark-300/50 border-gray-700 font-mono text-sm"
                  readOnly // oder disabled, je nach Anforderung
                />
              </div>
          </TabsContent>
        </Tabs>
        
        {saveSuccess !== null && (
          <Alert variant={saveSuccess ? "default" : "destructive"} className="mt-6 bg-dark-300/50 border-gray-700">
            <AlertDescription className="flex items-center">
              {saveSuccess ? 
                <><Check className="w-4 h-4 mr-2 text-green-500" /> Erfolgreich gespeichert!</> :
                <><X className="w-4 h-4 mr-2 text-red-500" /> Fehler beim Speichern.</>
              }
            </AlertDescription>
          </Alert>
        )}
        
        <div className="mt-6 flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={isSaving || isLoading || avatarUploading || coverUploading}
            className="bg-primary hover:bg-primary/90"
          >
            {(isSaving || avatarUploading || coverUploading) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Speichern...
              </>
            ) : (
              'Profil speichern'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileOrganizer;
