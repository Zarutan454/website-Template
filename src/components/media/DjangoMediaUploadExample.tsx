import React, { useRef, useState } from 'react';
import { useDjangoMediaUpload } from '@/hooks/media/useDjangoMediaUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Image, 
  Video, 
  File, 
  X, 
  Eye, 
  EyeOff, 
  Download,
  Trash2,
  Settings,
  HardDrive
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * Beispiel-Komponente für die Verwendung des Django Media Upload Systems
 * 
 * ALT (Supabase):
 * const { data, error } = await supabase.storage.from('media').upload(path, file);
 * 
 * NEU (Django):
 * const { uploadFile, isUploading, progress } = useDjangoMediaUpload();
 */
const DjangoMediaUploadExample: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [storageUsage, setStorageUsage] = useState<{
    used_bytes: number;
    total_bytes: number;
    used_percentage: number;
  } | null>(null);

  const {
    isUploading,
    progress,
    uploadedFiles,
    error,
    uploadFile,
    uploadMultipleFiles,
    deleteFile,
    updateFile,
    generateThumbnail,
    getStorageUsage,
    getSupportedTypes,
    clearUploadedFiles,
    reset,
    validateFile
  } = useDjangoMediaUpload({
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['image/*', 'video/*', 'application/pdf'],
    multiple: true
  });

  // Load storage usage on mount
  React.useEffect(() => {
    const loadStorageUsage = async () => {
      const usage = await getStorageUsage();
      if (usage) {
        setStorageUsage(usage);
      }
    };
    loadStorageUsage();
  }, [getStorageUsage]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    if (files.length === 1) {
      await uploadFile(files[0]);
    } else {
      await uploadMultipleFiles(files);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    if (files.length === 0) return;

    if (files.length === 1) {
      await uploadFile(files[0]);
    } else {
      await uploadMultipleFiles(files);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDeleteFile = async (fileId: string) => {
    const confirmed = window.confirm('Möchtest du diese Datei wirklich löschen?');
    if (confirmed) {
      await deleteFile(fileId);
    }
  };

  const handleTogglePublic = async (fileId: string, isPublic: boolean) => {
    await updateFile(fileId, { is_public: !isPublic });
  };

  const handleGenerateThumbnail = async (fileId: string) => {
    const thumbnailUrl = await generateThumbnail(fileId, { width: 300, height: 300 });
    if (thumbnailUrl) {
      toast.success('Thumbnail generiert!');
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <Image className="w-6 h-6 text-blue-500" />;
    } else if (mimeType.startsWith('video/')) {
      return <Video className="w-6 h-6 text-red-500" />;
    } else {
      return <File className="w-6 h-6 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Upload className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Media Upload</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="outline"
            size="sm"
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Button
            onClick={clearUploadedFiles}
            variant="outline"
            size="sm"
          >
            Liste leeren
          </Button>
          <Button
            onClick={reset}
            variant="outline"
            size="sm"
          >
            Zurücksetzen
          </Button>
        </div>
      </div>

      {/* Storage Usage */}
      {storageUsage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HardDrive className="w-5 h-5" />
              <span>Speicherplatz</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Verwendet: {formatFileSize(storageUsage.used_bytes)}</span>
                <span>Gesamt: {formatFileSize(storageUsage.total_bytes)}</span>
              </div>
              <Progress value={storageUsage.used_percentage} className="w-full" />
              <p className="text-xs text-gray-500">
                {storageUsage.used_percentage.toFixed(1)}% verwendet
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle>Upload-Einstellungen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Unterstützte Dateitypen:</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Bilder (JPG, PNG, GIF, WebP)</Badge>
                  <Badge variant="secondary">Videos (MP4, WebM, MOV)</Badge>
                  <Badge variant="secondary">Dokumente (PDF)</Badge>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Maximale Dateigröße:</h4>
                <p className="text-sm text-gray-600">50 MB pro Datei</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isUploading 
                ? 'border-blue-300 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {isUploading ? 'Upload läuft...' : 'Dateien hier ablegen oder klicken'}
            </h3>
            <p className="text-gray-600 mb-4">
              Unterstützte Formate: Bilder, Videos, PDFs (max. 50MB)
            </p>
            
            {/* Progress Bar */}
            {isUploading && progress && (
              <div className="mb-4">
                <Progress value={progress.percentage} className="w-full mb-2" />
                <p className="text-sm text-gray-600">
                  {progress.percentage}% - {formatFileSize(progress.loaded)} / {formatFileSize(progress.total)}
                </p>
              </div>
            )}

            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? 'Upload läuft...' : 'Dateien auswählen'}
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">Fehler: {error}</p>
          </CardContent>
        </Card>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Hochgeladene Dateien ({uploadedFiles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="border rounded-lg p-4 space-y-3">
                  {/* File Preview */}
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    {file.mime_type.startsWith('image/') ? (
                      <img
                        src={file.file_url}
                        alt={file.file_name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : file.mime_type.startsWith('video/') ? (
                      <video
                        src={file.file_url}
                        className="w-full h-full object-cover rounded-lg"
                        controls
                      />
                    ) : (
                      <div className="text-center">
                        {getFileIcon(file.mime_type)}
                        <p className="text-sm text-gray-600 mt-2">PDF Dokument</p>
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm truncate" title={file.file_name}>
                      {file.file_name}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatFileSize(file.file_size)}</span>
                      <span>{formatDate(file.upload_date)}</span>
                    </div>
                    
                    {/* File Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Button
                          onClick={() => handleTogglePublic(file.id, file.is_public)}
                          variant="ghost"
                          size="sm"
                          title={file.is_public ? 'Privat machen' : 'Öffentlich machen'}
                        >
                          {file.is_public ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </Button>
                        
                        {file.mime_type.startsWith('image/') && (
                          <Button
                            onClick={() => handleGenerateThumbnail(file.id)}
                            variant="ghost"
                            size="sm"
                            title="Thumbnail generieren"
                          >
                            <Image className="w-4 h-4" />
                          </Button>
                        )}
                        
                        <Button
                          onClick={() => window.open(file.file_url, '_blank')}
                          variant="ghost"
                          size="sm"
                          title="Herunterladen"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <Button
                        onClick={() => handleDeleteFile(file.id)}
                        variant="ghost"
                        size="sm"
                        title="Löschen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Status Badge */}
                    <div className="flex justify-between items-center">
                      <Badge variant={file.is_public ? "default" : "secondary"}>
                        {file.is_public ? 'Öffentlich' : 'Privat'}
                      </Badge>
                      {file.metadata?.thumbnail_url && (
                        <Badge variant="outline">Thumbnail</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DjangoMediaUploadExample; 
