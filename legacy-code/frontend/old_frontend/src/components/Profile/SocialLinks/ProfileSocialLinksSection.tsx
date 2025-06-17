import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Twitter, Github, Globe, Facebook, Instagram, Linkedin, 
  Youtube, Twitch, Dribbble, Mail, MessageCircle, Plus, 
  Edit, Save, X, Loader2, type LucideIcon
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { SocialLinkButton } from './SocialLinkButton';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type SocialPlatform = {
  key: string;
  label: string;
  icon: LucideIcon;
  placeholder: string;
  colorClass?: string;
};

const SOCIAL_PLATFORMS: SocialPlatform[] = [
  { key: 'twitter', label: 'Twitter', icon: Twitter, placeholder: 'https://twitter.com/username', colorClass: 'hover:text-[#1DA1F2]' },
  { key: 'github', label: 'GitHub', icon: Github, placeholder: 'https://github.com/username', colorClass: 'hover:text-[#333]' },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/username', colorClass: 'hover:text-[#0A66C2]' },
  { key: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/username', colorClass: 'hover:text-[#1877F2]' },
  { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/username', colorClass: 'hover:text-[#E4405F]' },
  { key: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/c/username', colorClass: 'hover:text-[#FF0000]' },
  { key: 'twitch', label: 'Twitch', icon: Twitch, placeholder: 'https://twitch.tv/username', colorClass: 'hover:text-[#9146FF]' },
  { key: 'dribbble', label: 'Dribbble', icon: Dribbble, placeholder: 'https://dribbble.com/username', colorClass: 'hover:text-[#EA4C89]' },
  { key: 'website', label: 'Website', icon: Globe, placeholder: 'https://example.com', colorClass: 'hover:text-[#0ea5e9]' },
  { key: 'email', label: 'Email', icon: Mail, placeholder: 'mailto:your@email.com', colorClass: 'hover:text-[#EA4335]' },
  { key: 'telegram', label: 'Telegram', icon: MessageCircle, placeholder: 'https://t.me/username', colorClass: 'hover:text-[#0088cc]' }
];

interface ProfileSocialLinksSectionProps {
  profileId: string;
  isOwnProfile: boolean;
}

export const ProfileSocialLinksSection = ({ profileId, isOwnProfile }: ProfileSocialLinksSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const [showNewLinkForm, setShowNewLinkForm] = useState(false);
  const [newLinkType, setNewLinkType] = useState<string>('twitter');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  // Fetch user's social links
  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        // First check if we need to add the social_links column to the users table
        const { error: columnCheckError } = await supabase.rpc('check_column_exists', { 
          table_name: 'users', 
          column_name: 'social_links' 
        });
        
        if (columnCheckError) {
          // The column doesn't exist, so we'll use an empty object
          setSocialLinks({});
          return;
        }
        
        // Fetch the user's social links
        const { data, error } = await supabase
          .from('users')
          .select('social_links')
          .eq('id', profileId)
          .single();
          
        if (error) {
          console.error('Error fetching social links:', error.message);
          setSocialLinks({});
          return;
        }
        
        if (data?.social_links) {
          setSocialLinks(data.social_links);
        } else {
          setSocialLinks({});
        }
      } catch (error: any) {
        console.error('Error fetching social links:', error.message);
        setSocialLinks({});
      }
    };
    
    fetchSocialLinks();
  }, [profileId]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // First try to add the social_links column if it doesn't exist
      try {
        await supabase.rpc('add_column_if_not_exists', {
          table_name: 'users',
          column_name: 'social_links',
          column_type: 'jsonb'
        });
      } catch (error) {
        console.log('Column may already exist or unable to add:', error);
      }
      
      // Now update the user's social links
      const { error } = await supabase
        .from('users')
        .update({ 
          social_links: socialLinks,
          updated_at: new Date().toISOString()
        })
        .eq('id', profileId);

      if (error) throw error;

      toast.success("Soziale Links wurden aktualisiert");
      setIsEditing(false);
      setShowNewLinkForm(false);
    } catch (error: any) {
      toast.error(`Fehler beim Speichern: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNewLink = () => {
    if (!newLinkUrl) {
      toast.error("Bitte geben Sie eine URL ein");
      return;
    }

    // Very basic URL validation
    try {
      new URL(newLinkUrl);
      
      setSocialLinks(prev => ({
        ...prev,
        [newLinkType]: newLinkUrl
      }));
      setNewLinkUrl('');
      setShowNewLinkForm(false);
    } catch (error) {
      toast.error("Bitte geben Sie eine gültige URL ein");
    }
  };

  const handleDeleteLink = (key: string) => {
    setSocialLinks(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  // Filter available platforms for new link form
  const availablePlatforms = SOCIAL_PLATFORMS.filter(
    platform => !socialLinks[platform.key]
  );

  // Get platform details by key
  const getPlatformByKey = (key: string): SocialPlatform => {
    return SOCIAL_PLATFORMS.find(platform => platform.key === key) || 
      { key, label: key.charAt(0).toUpperCase() + key.slice(1), icon: Globe, placeholder: 'https://' };
  };

  return (
    <Card className="overflow-hidden bg-dark-100/80 backdrop-blur-sm border-gray-800/40 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-secondary-600/5 to-accent/5 opacity-80"></div>
      
      <CardHeader className="relative flex flex-row items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Social Media</h3>
        {!isEditing && isOwnProfile && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsEditing(true)}
            className="border-gray-700 hover:bg-dark-300 hover:border-primary-500/30"
          >
            <Edit className="h-4 w-4 mr-2" />
            Bearbeiten
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="relative">
        {isEditing ? (
          <div className="space-y-4">
            {/* Add new link form button */}
            {!showNewLinkForm && availablePlatforms.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full border-dashed border-gray-700 hover:bg-dark-300 hover:border-primary-500/30 text-gray-400"
                onClick={() => setShowNewLinkForm(true)}
                disabled={isSaving}
              >
                <Plus className="w-4 h-4 mr-2" />
                Social Media Link hinzufügen
              </Button>
            )}

            {/* New link form */}
            {showNewLinkForm && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-lg bg-dark-200/50 border border-gray-700"
              >
                <div className="space-y-3">
                  <Select 
                    defaultValue={newLinkType} 
                    onValueChange={setNewLinkType}
                    disabled={isSaving}
                  >
                    <SelectTrigger className="bg-dark-300/80 border-gray-700">
                      <SelectValue placeholder="Plattform wählen" />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-200 border-gray-700">
                      {availablePlatforms.map(platform => (
                        <SelectItem key={platform.key} value={platform.key}>
                          <div className="flex items-center">
                            <platform.icon className="w-4 h-4 mr-2" />
                            {platform.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="flex space-x-2">
                    <Input
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                      placeholder={getPlatformByKey(newLinkType).placeholder}
                      className="flex-1 bg-dark-300/80 border-gray-700 text-white"
                      disabled={isSaving}
                    />
                    <Button size="sm" onClick={handleAddNewLink} disabled={isSaving}>
                      <Plus className="w-4 h-4 mr-2" />
                      Hinzufügen
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Existing links edit form */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              {Object.entries(socialLinks).map(([key, value]) => (
                <motion.div key={key} variants={itemVariants} className="flex items-center space-x-2">
                  <div className="flex-1 p-3 bg-dark-200/50 rounded-lg border border-gray-700 flex items-center">
                    {React.createElement(getPlatformByKey(key).icon, { className: "w-4 h-4 mr-2 text-gray-400" })}
                    <Input
                      value={value}
                      onChange={(e) => setSocialLinks(prev => ({ ...prev, [key]: e.target.value }))}
                      className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-white"
                      disabled={isSaving}
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-10 w-10 p-0 border-gray-700 hover:bg-red-900/30 hover:border-red-500/50 hover:text-red-400"
                    onClick={() => handleDeleteLink(key)}
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </motion.div>

            {/* Save and cancel buttons */}
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setShowNewLinkForm(false);
                }}
                disabled={isSaving}
                className="border-gray-700 hover:bg-dark-300 hover:border-primary-500/30"
              >
                Abbrechen
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Speichern
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {Object.keys(socialLinks).length > 0 ? (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                {Object.entries(socialLinks).map(([key, value]) => {
                  const platform = getPlatformByKey(key);
                  return (
                    <motion.div key={key} variants={itemVariants} whileHover={{ scale: 1.02 }}>
                      <SocialLinkButton
                        icon={platform.icon}
                        link={value}
                        label={platform.label}
                        variant="glass"
                        className={platform.colorClass}
                      />
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <div className="text-center p-6 bg-dark-200/30 rounded-lg border border-gray-700/50">
                <Globe className="w-10 h-10 mx-auto mb-3 text-gray-500" />
                <p className="text-gray-400 mb-2">Keine sozialen Links vorhanden</p>
                {isOwnProfile && (
                  <Button
                    variant="outline"
                    className="mt-2 border-gray-700 hover:bg-dark-300 hover:border-primary-500/30"
                    onClick={() => setIsEditing(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Links hinzufügen
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
