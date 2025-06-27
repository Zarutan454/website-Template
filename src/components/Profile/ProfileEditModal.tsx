
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { Profile } from '@/types/profile';

export interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile | null;
  onProfileUpdate: (updatedProfile: Profile) => void;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  profile,
  onProfileUpdate
}) => {
  const { updateProfile } = useProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || '',
    bio: profile?.bio || '',
    wallet_address: profile?.wallet_address || '',
    website: profile?.social_links?.website || '',
  });

  // Update form when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        wallet_address: profile.wallet_address || '',
        website: profile.social_links?.website || '',
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;
    
    setIsSubmitting(true);
    
    try {
      // Prepare the social links object
      const socialLinks = {
        ...(profile.social_links || {}),
        website: formData.website,
      };
      
      // Create update payload with correct types
      const updatePayload = {
        display_name: formData.display_name,
        bio: formData.bio,
        wallet_address: formData.wallet_address,
        social_links: socialLinks,
      };
      
      const result = await updateProfile(updatePayload);
      
      if (result.success) {
        // Call the callback with updated profile data
        onProfileUpdate(result.data);
        onClose();
      } else {
        toast.error('Fehler beim Aktualisieren des Profils');
      }
    } catch (error) {
      toast.error('Fehler beim Aktualisieren des Profils');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle>Profil bearbeiten</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X size={18} />
          </Button>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display_name">Name</Label>
            <Input
              id="display_name"
              name="display_name"
              value={formData.display_name}
              onChange={handleChange}
              placeholder="Dein Name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Erzähle etwas über dich"
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="wallet_address">Wallet Adresse</Label>
            <Input
              id="wallet_address"
              name="wallet_address"
              value={formData.wallet_address}
              onChange={handleChange}
              placeholder="Deine Wallet-Adresse"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://deinewebsite.de"
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              type="button" 
              onClick={onClose}
            >
              Abbrechen
            </Button>
            
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Speichern...
                </>
              ) : 'Speichern'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditModal;
