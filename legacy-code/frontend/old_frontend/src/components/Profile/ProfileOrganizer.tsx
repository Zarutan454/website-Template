
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
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  
  useEffect(() => {
    setEditedProfile(profile);
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(null);
    
    try {
      const success = await onSave({
        ...editedProfile,
        // Konvertiere die Felder in das korrekte Format (snake_case)
        display_name: editedProfile.display_name,
        bio: editedProfile.bio,
        username: editedProfile.username,
        wallet_address: editedProfile.wallet_address,
        social_links: editedProfile.social_links,
        avatar_url: editedProfile.avatar_url,
        cover_url: editedProfile.cover_url
      });
      
      setSaveSuccess(success);
    } catch (error) {
      setSaveSuccess(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof ProfileData, value: any) => {
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
  
  const handleTwitterChange = (value: string) => {
    handleSocialLinkChange('twitter', value);
  };
  
  const handleInstagramChange = (value: string) => {
    handleSocialLinkChange('instagram', value);
  };
  
  const handleGithubChange = (value: string) => {
    handleSocialLinkChange('github', value);
  };
  
  const handleLinkedinChange = (value: string) => {
    handleSocialLinkChange('linkedin', value);
  };
  
  const handleWebsiteChange = (value: string) => {
    handleSocialLinkChange('website', value);
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        handleChange('avatar_url', result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCoverPreview(result);
        handleChange('cover_url', result);
      };
      reader.readAsDataURL(file);
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
                    <AvatarImage src={avatarPreview || editedProfile.avatar_url || ''} />
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
                      <Upload className="w-4 h-4 mr-2" />
                      Bild hochladen
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Titelbild</Label>
                <div className="relative rounded-lg overflow-hidden bg-dark-300/50 h-32 flex items-center justify-center">
                  {(coverPreview || editedProfile.cover_url) ? (
                    <img 
                      src={coverPreview || editedProfile.cover_url || ''} 
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
                      <Upload className="w-3 h-3 mr-1" />
                      Hochladen
                      <input
                        id="cover-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCoverChange}
                      />
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="socials" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="twitter" className="flex items-center">
                  <Twitter className="w-4 h-4 mr-2 text-blue-400" />
                  Twitter
                </Label>
                <Input
                  id="twitter"
                  placeholder="Dein Twitter Username"
                  value={editedProfile.social_links?.twitter || ''}
                  onChange={(e) => handleTwitterChange(e.target.value)}
                  className="bg-dark-300/50 border-gray-700"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="instagram" className="flex items-center">
                  <Instagram className="w-4 h-4 mr-2 text-pink-500" />
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  placeholder="Dein Instagram Username"
                  value={editedProfile.social_links?.instagram || ''}
                  onChange={(e) => handleInstagramChange(e.target.value)}
                  className="bg-dark-300/50 border-gray-700"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="github" className="flex items-center">
                  <Github className="w-4 h-4 mr-2 text-gray-300" />
                  GitHub
                </Label>
                <Input
                  id="github"
                  placeholder="Dein GitHub Username"
                  value={editedProfile.social_links?.github || ''}
                  onChange={(e) => handleGithubChange(e.target.value)}
                  className="bg-dark-300/50 border-gray-700"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="linkedin" className="flex items-center">
                  <Linkedin className="w-4 h-4 mr-2 text-blue-600" />
                  LinkedIn
                </Label>
                <Input
                  id="linkedin"
                  placeholder="Dein LinkedIn Profil"
                  value={editedProfile.social_links?.linkedin || ''}
                  onChange={(e) => handleLinkedinChange(e.target.value)}
                  className="bg-dark-300/50 border-gray-700"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website" className="flex items-center">
                  <Globe className="w-4 h-4 mr-2 text-green-400" />
                  Website
                </Label>
                <Input
                  id="website"
                  placeholder="Deine Website URL"
                  value={editedProfile.social_links?.website || ''}
                  onChange={(e) => handleWebsiteChange(e.target.value)}
                  className="bg-dark-300/50 border-gray-700"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="wallet" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wallet_address" className="flex items-center">
                  Wallet-Adresse
                </Label>
                <Textarea
                  id="wallet_address"
                  placeholder="Deine Ethereum Wallet-Adresse"
                  value={editedProfile.wallet_address || ''}
                  onChange={(e) => handleChange('wallet_address', e.target.value)}
                  className="bg-dark-300/50 border-gray-700 font-mono text-sm h-24"
                />
              </div>
              
              <Alert className="bg-dark-300/50 border-yellow-600/50">
                <AlertDescription className="text-sm text-gray-300">
                  Stelle sicher, dass du eine gültige Ethereum-Adresse eingibst. Diese Adresse wird für Transaktionen und Token-Aktivitäten verwendet.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>
        
        {saveSuccess !== null && (
          <div className={`mt-4 p-3 rounded-md ${saveSuccess ? 'bg-green-900/20 border border-green-700/50' : 'bg-red-900/20 border border-red-700/50'}`}>
            <div className="flex items-center">
              {saveSuccess ? (
                <Check className="w-5 h-5 text-green-500 mr-2" />
              ) : (
                <X className="w-5 h-5 text-red-500 mr-2" />
              )}
              <span className={saveSuccess ? 'text-green-400' : 'text-red-400'}>
                {saveSuccess ? 'Profil erfolgreich gespeichert' : 'Fehler beim Speichern des Profils'}
              </span>
            </div>
          </div>
        )}
        
        <div className="mt-6 flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={isSaving || isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isSaving ? (
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
