import * as React from 'react';

interface MediaUploadButtonProps {
  accept?: string;
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  previewUrl?: string | null;
}

const MediaUploadButton: React.FC<MediaUploadButtonProps> = ({ accept = 'image/*,video/*,audio/*', onFileSelect, disabled, previewUrl }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="flex items-center gap-1 text-gray-500 hover:text-blue-500 px-2 py-1 rounded"
        onClick={handleButtonClick}
        disabled={disabled}
        aria-label="Bild, Video oder Audio hochladen"
      >
        <span role="img" aria-label="Medien">🖼️</span>
        <span className="hidden sm:inline">Bild/Video</span>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
        tabIndex={-1}
        title="Datei auswählen"
        placeholder="Datei auswählen"
      />
      {previewUrl && (
        <div className="ml-2">
          {/* Zeige Bild- oder Video-Preview, je nach Typ */}
          {previewUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
            <img src={previewUrl} alt="Preview" className="w-10 h-10 object-cover rounded" />
          ) : previewUrl.match(/\.(mp4|webm|ogg)$/i) ? (
            <video src={previewUrl} className="w-10 h-10 object-cover rounded" controls />
          ) : previewUrl.match(/\.(mp3|wav|ogg)$/i) ? (
            <audio src={previewUrl} controls className="w-10" />
          ) : null}
        </div>
      )}
    </div>
  );
};

export default MediaUploadButton; 