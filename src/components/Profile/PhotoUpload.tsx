import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.utils';
import { uploadProfilePhoto } from '../../hooks/useProfile';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Upload, X, Image, AlertCircle } from 'lucide-react';
import { toast } from '../../hooks/use-toast';

interface PhotoUploadProps {
  onPhotoUploaded: (photoUrl: string) => void;
  onClose: () => void;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({ onPhotoUploaded, onClose }) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    // Validiere Dateityp
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Fehler",
        description: "Nur Bilder sind erlaubt",
        variant: "destructive"
      });
      return;
    }

    // Validiere Dateigröße (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Fehler",
        description: "Datei zu groß (max 5MB)",
        variant: "destructive"
      });
      return;
    }

    // Erstelle Vorschau
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!preview || !fileInputRef.current?.files?.[0] || !user?.id) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', fileInputRef.current.files[0]);

      const response = await uploadProfilePhoto(user.id, formData);
      
      if (response.success) {
        toast({
          title: "Erfolg",
          description: "Foto erfolgreich hochgeladen"
        });
        onPhotoUploaded(response.photo_url);
        onClose();
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Upload fehlgeschlagen",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="w-5 h-5" />
          Foto hochladen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drag & Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Vorschau"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => {
                  setPreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-8 h-8 mx-auto text-gray-400" />
              <p className="text-sm text-gray-600">
                Ziehe ein Foto hierher oder klicke zum Auswählen
              </p>
              <p className="text-xs text-gray-500">
                JPG, PNG, GIF bis 5MB
              </p>
            </div>
          )}
        </div>

        {/* File Input */}
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
          className="hidden"
        />

        {/* Upload Button */}
        {preview && (
          <div className="flex gap-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="flex-1"
            >
              Anderes Foto wählen
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="flex-1"
            >
              {isUploading ? 'Wird hochgeladen...' : 'Hochladen'}
            </Button>
          </div>
        )}

        {/* Info */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Tipps für bessere Fotos:</p>
            <ul className="mt-1 space-y-1 text-xs">
              <li>• Verwende hochauflösende Bilder</li>
              <li>• Stelle sicher, dass das Gesicht gut sichtbar ist</li>
              <li>• Verwende natürliches Licht</li>
              <li>• Vermeide starke Filter</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 