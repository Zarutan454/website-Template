import * as React from 'react';

interface MediaItem {
  url: string;
  type?: 'image' | 'video';
  caption?: string;
}

interface MediaLightboxProps {
  open: boolean;
  mediaUrl?: string; // für Rückwärtskompatibilität
  mediaType?: 'image' | 'video';
  caption?: string;
  onClose: () => void;
  mediaList?: MediaItem[]; // NEU: mehrere Medien
  initialIndex?: number;
}

const MediaLightbox: React.FC<MediaLightboxProps> = ({
  open,
  mediaUrl,
  mediaType = 'image',
  caption,
  onClose,
  mediaList,
  initialIndex = 0
}) => {
  // State für Karussell
  const [current, setCurrent] = React.useState(initialIndex);
  const hasCarousel = Array.isArray(mediaList) && mediaList.length > 1;
  const items = hasCarousel ? mediaList : mediaList && mediaList.length === 1 ? mediaList : mediaUrl ? [{ url: mediaUrl, type: mediaType, caption }] : [];

  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (hasCarousel && e.key === 'ArrowLeft') setCurrent((c) => (c - 1 + items.length) % items.length);
      if (hasCarousel && e.key === 'ArrowRight') setCurrent((c) => (c + 1) % items.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, hasCarousel, items.length]);

  React.useEffect(() => {
    if (open && initialIndex !== current) setCurrent(initialIndex);
    // eslint-disable-next-line
  }, [open, initialIndex]);

  if (!open || items.length === 0) return null;
  const item = items[current];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80" role="dialog" aria-modal="true">
      <button
        className="absolute top-4 right-4 text-white text-2xl bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-white"
        onClick={onClose}
        aria-label="Schließen"
        autoFocus
      >
        ×
      </button>
      {hasCarousel && (
        <>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-3xl bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-white"
            onClick={() => setCurrent((c) => (c - 1 + items.length) % items.length)}
            aria-label="Vorheriges Bild"
          >
            ‹
          </button>
          <button
            className="absolute right-16 top-1/2 -translate-y-1/2 text-white text-3xl bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-white"
            onClick={() => setCurrent((c) => (c + 1) % items.length)}
            aria-label="Nächstes Bild"
          >
            ›
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {items.map((_, i) => (
              <span key={i} className={`w-2 h-2 rounded-full ${i === current ? 'bg-white' : 'bg-white/40'}`}></span>
            ))}
          </div>
        </>
      )}
      <div className="max-w-full max-h-full flex flex-col items-center">
        {item.type === 'image' ? (
          <img src={item.url} alt={item.caption || 'Media'} className="max-w-[90vw] max-h-[80vh] rounded shadow-lg" />
        ) : (
          <video src={item.url} controls className="max-w-[90vw] max-h-[80vh] rounded shadow-lg" />
        )}
        {item.caption && <div className="mt-2 text-white text-sm text-center bg-black bg-opacity-40 px-4 py-1 rounded">{item.caption}</div>}
      </div>
    </div>
  );
};

export default MediaLightbox; 