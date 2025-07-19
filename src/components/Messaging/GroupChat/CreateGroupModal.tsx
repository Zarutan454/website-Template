import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Users, Upload, Loader2 } from 'lucide-react';
import { uploadFile } from '../../../utils/storageUtils';
import { toast } from 'sonner';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (name: string, description: string, avatarUrl?: string) => Promise<void>;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onCreateGroup
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Das Bild darf maximal 5MB groß sein');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Bitte wähle ein Bild aus');
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadFile(file, 'group-avatars');
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setAvatarUrl(result.url);
    } catch (error) {
      toast.error('Fehler beim Hochladen des Bildes');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Bitte gib einen Gruppennamen ein');
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreateGroup(name.trim(), description.trim(), avatarUrl || undefined);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Fehler beim Erstellen der Gruppe');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setAvatarUrl('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users size={18} />
            Neue Gruppe erstellen
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="flex flex-col items-center mb-4">
            <div className="relative group">
              <Avatar className="h-20 w-20 cursor-pointer">
                <AvatarImage src={avatarUrl} alt="Gruppenbild" />
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {name ? name.charAt(0).toUpperCase() : <Users />}
                </AvatarFallback>
              </Avatar>
              
              <div 
                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <Upload className="h-6 w-6 text-white" />
                )}
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={isUploading}
                aria-label="Gruppenbild auswählen"
                title="Gruppenbild auswählen"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Klicke, um ein Gruppenbild hochzuladen
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="group-name">Gruppenname</Label>
            <Input
              id="group-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Projektteam"
              maxLength={50}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="group-description">Beschreibung (optional)</Label>
            <Textarea
              id="group-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Worum geht es in dieser Gruppe?"
              maxLength={200}
              className="resize-none"
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Abbrechen
            </Button>
            <Button 
              type="submit" 
              disabled={!name.trim() || isSubmitting || isUploading}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Erstelle...
                </>
              ) : (
                'Gruppe erstellen'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupModal;
