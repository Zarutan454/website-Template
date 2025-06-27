
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CreateAlbumDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { title: string; description: string }) => Promise<boolean>;
}

export const CreateAlbumDialog: React.FC<CreateAlbumDialogProps> = ({ 
  isOpen, 
  onClose, 
  onCreate 
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [titleError, setTitleError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validierung
    if (!title.trim()) {
      setTitleError('Bitte gib einen Titel ein');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const success = await onCreate({ title, description });
      if (success) {
        // Zurücksetzen des Formulars
        setTitle('');
        setDescription('');
        setTitleError('');
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setTitleError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-dark-100 border-gray-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Neues Album erstellen</DialogTitle>
          <DialogDescription className="text-gray-400">
            Erstelle ein neues Album für deine Fotos
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-300">
              Titel <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setTitleError('');
              }}
              placeholder="Mein Fotoalbum"
              className={`bg-dark-200 border-gray-700 text-white ${titleError ? 'border-red-500' : ''}`}
            />
            {titleError && <p className="text-sm text-red-500">{titleError}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-300">
              Beschreibung
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beschreibe dein Album..."
              className="bg-dark-200 border-gray-700 text-white resize-none min-h-[100px]"
            />
          </div>
          
          <DialogFooter className="pt-2">
            <Button 
              type="button" 
              variant="outline"
              onClick={handleClose}
              className="border-gray-700 hover:bg-dark-300 hover:border-primary-500/30"
              disabled={isSubmitting}
            >
              Abbrechen
            </Button>
            <Button 
              type="submit"
              className="bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Wird erstellt...' : 'Album erstellen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
