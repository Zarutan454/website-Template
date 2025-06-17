
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { FeedLayout } from '@/components/Feed/FeedLayout';
import { ChevronLeft, Upload, X, Lock, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/components/ThemeProvider';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const CreateGroupPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { profile } = useProfile();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // Create group mutation
  const createGroupMutation = useMutation({
    mutationFn: async () => {
      if (!profile) throw new Error('Nicht angemeldet');
      if (!name.trim()) throw new Error('Gruppenname darf nicht leer sein');
      
      // Upload avatar if selected
      let avatarUrl = null;
      if (avatarFile) {
        const avatarFileName = `group-avatars/${Date.now()}-${avatarFile.name}`;
        const { data: avatarData, error: avatarError } = await supabase.storage
          .from('media')
          .upload(avatarFileName, avatarFile);
        
        if (avatarError) throw avatarError;
        
        const { data: avatarUrlData } = supabase.storage
          .from('media')
          .getPublicUrl(avatarFileName);
        
        avatarUrl = avatarUrlData.publicUrl;
      }
      
      // Upload banner if selected
      let bannerUrl = null;
      if (bannerFile) {
        const bannerFileName = `group-banners/${Date.now()}-${bannerFile.name}`;
        const { data: bannerData, error: bannerError } = await supabase.storage
          .from('media')
          .upload(bannerFileName, bannerFile);
        
        if (bannerError) throw bannerError;
        
        const { data: bannerUrlData } = supabase.storage
          .from('media')
          .getPublicUrl(bannerFileName);
        
        bannerUrl = bannerUrlData.publicUrl;
      }
      
      // Create the group
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          created_by: profile.id,
          is_private: isPrivate,
          avatar_url: avatarUrl,
          banner_url: bannerUrl
        })
        .select()
        .single();
      
      if (groupError) throw groupError;
      
      // Add the creator as admin
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupData.id,
          user_id: profile.id,
          role: 'admin'
        });
      
      if (memberError) throw memberError;
      
      return groupData;
    },
    onSuccess: (data) => {
      toast.success('Gruppe erfolgreich erstellt');
      navigate(`/community/group/${data.id}`);
    },
    onError: (error) => {
      toast.error('Fehler beim Erstellen der Gruppe. Bitte versuche es später erneut.');
    }
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(null);
  };

  const handleRemoveBanner = () => {
    setBannerFile(null);
    if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    setBannerPreview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createGroupMutation.mutate();
  };

  if (!profile) {
    navigate('/login', { replace: true });
    return null;
  }

  return (
    <FeedLayout>
      <div className="max-w-2xl mx-auto">
        <Button 
          variant="ghost" 
          size="sm" 
          className={`mb-6 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
          onClick={() => navigate('/community/groups')}
        >
          <ChevronLeft size={16} className="mr-1" /> Zurück
        </Button>
        
        <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-dark-100 border-gray-800' : 'bg-white border-gray-200'}`}>
          <h1 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Neue Gruppe erstellen
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Banner Upload */}
            <div>
              <Label className="block mb-2">Banner</Label>
              <div 
                className={`h-32 w-full rounded-lg relative flex items-center justify-center overflow-hidden border-2 border-dashed ${
                  theme === 'dark' 
                    ? 'bg-dark-200 border-gray-700 hover:border-gray-600' 
                    : 'bg-gray-100 border-gray-300 hover:border-gray-400'
                } transition-colors cursor-pointer`}
                onClick={() => document.getElementById('banner-upload')?.click()}
              >
                {bannerPreview ? (
                  <>
                    <img 
                      src={bannerPreview} 
                      alt="Banner preview" 
                      className="w-full h-full object-cover absolute inset-0"
                    />
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveBanner();
                      }}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload size={24} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                    <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Bannerbild hochladen (optional)
                    </p>
                  </div>
                )}
                <input 
                  type="file" 
                  id="banner-upload" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleBannerChange}
                />
              </div>
            </div>
            
            {/* Avatar Upload */}
            <div className="flex items-start gap-4">
              <div>
                <Label className="block mb-2">Gruppenbild</Label>
                <div 
                  className={`h-24 w-24 rounded-full relative flex items-center justify-center overflow-hidden border-2 border-dashed ${
                    theme === 'dark' 
                      ? 'bg-dark-200 border-gray-700 hover:border-gray-600' 
                      : 'bg-gray-100 border-gray-300 hover:border-gray-400'
                  } transition-colors cursor-pointer`}
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                >
                  {avatarPreview ? (
                    <>
                      <img 
                        src={avatarPreview} 
                        alt="Avatar preview" 
                        className="w-full h-full object-cover absolute inset-0"
                      />
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveAvatar();
                        }}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload size={18} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                      <p className={`text-xs mt-1 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Bild
                      </p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    id="avatar-upload" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleAvatarChange}
                  />
                </div>
              </div>
              
              <div className="flex-1">
                <Label htmlFor="name" className="block mb-2">Name der Gruppe *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Gib deiner Gruppe einen Namen"
                  className={theme === 'dark' ? 'bg-dark-200 border-gray-700' : 'bg-white border-gray-300'}
                  required
                />
              </div>
            </div>
            
            {/* Description */}
            <div>
              <Label htmlFor="description" className="block mb-2">Beschreibung</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Beschreibe, worum es in deiner Gruppe geht (optional)"
                className={theme === 'dark' ? 'bg-dark-200 border-gray-700' : 'bg-white border-gray-300'}
                rows={4}
              />
            </div>
            
            {/* Privacy Settings */}
            <div>
              <Label className="block mb-4">Datenschutzeinstellungen</Label>
              <div className="space-y-4">
                <div className={`p-4 rounded-lg border ${
                  !isPrivate 
                    ? `border-2 ${theme === 'dark' ? 'border-primary-600 bg-primary-950/20' : 'border-primary-500 bg-primary-50'}` 
                    : theme === 'dark' ? 'border-gray-800 bg-dark-200' : 'border-gray-200 bg-gray-50'
                } flex gap-3 cursor-pointer`}
                  onClick={() => setIsPrivate(false)}
                >
                  <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                    !isPrivate 
                      ? `${theme === 'dark' ? 'bg-primary-600 text-primary-50' : 'bg-primary-500 text-white'}` 
                      : `${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-500'}`
                  }`}>
                    <Globe size={12} />
                  </div>
                  <div>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Öffentlich
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Jeder kann die Gruppe, ihre Mitglieder und Beiträge sehen.
                    </p>
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg border ${
                  isPrivate 
                    ? `border-2 ${theme === 'dark' ? 'border-primary-600 bg-primary-950/20' : 'border-primary-500 bg-primary-50'}` 
                    : theme === 'dark' ? 'border-gray-800 bg-dark-200' : 'border-gray-200 bg-gray-50'
                } flex gap-3 cursor-pointer`}
                  onClick={() => setIsPrivate(true)}
                >
                  <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                    isPrivate 
                      ? `${theme === 'dark' ? 'bg-primary-600 text-primary-50' : 'bg-primary-500 text-white'}` 
                      : `${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-500'}`
                  }`}>
                    <Lock size={12} />
                  </div>
                  <div>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Privat
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Nur Mitglieder können Gruppenbeiträge sehen. Die Gruppe ist für alle sichtbar, aber Beiträge sind privat.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate('/community/groups')}
              >
                Abbrechen
              </Button>
              <Button 
                type="submit" 
                disabled={!name.trim() || createGroupMutation.isPending}
              >
                {createGroupMutation.isPending ? 'Wird erstellt...' : 'Gruppe erstellen'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </FeedLayout>
  );
};

export default CreateGroupPage;
