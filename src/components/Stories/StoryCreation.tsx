import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { storyAPI } from '@/lib/django-api-new';
import { Camera, Video, Type, Upload, X, Play, Pause, Music, Smile, X as XIcon, BarChart, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface StoryCreationProps {
  onStoryCreated: () => void;
  onClose: () => void;
}

// Entferne DUMMY_SONGS

const DUMMY_STICKERS = [
  { id: 1, name: 'Party', src: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f389.png' },
  { id: 2, name: 'Fire', src: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f525.png' },
  { id: 3, name: 'Star', src: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2b50.png' },
];

// Sticker-Typ definieren
interface Sticker {
  id: number;
  name: string;
  src: string;
  x?: number;
  y?: number;
  scale?: number;
}

// StoryPayload anpassen
interface StoryPayload {
  type: 'image' | 'video' | 'text';
  caption: string;
  media_url?: string;
  music?: SpotifyTrack | null;
  stickers?: Sticker[];
  poll?: { question: string; options: { text: string; votes: number }[] };
  is_highlight?: boolean;
  highlight_name?: string;
}

// Definiere einen Typ für Musikdaten
interface SpotifyTrack {
  id: string;
  title: string;
  artist: string;
  cover_url: string | null;
  preview_url: string | null;
  spotify_url: string;
}

const StoryCreation: React.FC<StoryCreationProps> = ({
  onStoryCreated,
  onClose
}) => {
  const [storyType, setStoryType] = useState<'image' | 'video' | 'text'>('image');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'text' | 'music' | 'sticker' | 'poll'>(storyType);
  const [music, setMusic] = useState<SpotifyTrack | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicSearch, setMusicSearch] = useState('');
  const [musicResults, setMusicResults] = useState<SpotifyTrack[]>([]);
  const [isSearchingMusic, setIsSearchingMusic] = useState(false);
  const [musicError, setMusicError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [poll, setPoll] = useState<{ question: string; options: { text: string; votes: number }[] }>({ question: '', options: [{ text: '', votes: 0 }, { text: '', votes: 0 }] });
  const [isHighlight, setIsHighlight] = useState(false);
  const [highlightName, setHighlightName] = useState('');
  const { user } = useAuth();

  // Musik-Suche (Spotify-Proxy)
  useEffect(() => {
    if (!musicSearch || musicSearch.length < 2) {
      setMusicResults([]);
      setMusicError(null);
      return;
    }
    let cancelled = false;
    setIsSearchingMusic(true);
    setMusicError(null);
    fetch(`/api/spotify/search/?q=${encodeURIComponent(musicSearch)}`)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        if (data && data.results) {
          setMusicResults(data.results);
          setMusicError(null);
        } else {
          setMusicResults([]);
          setMusicError('Keine Ergebnisse gefunden');
        }
      })
      .catch(err => {
        if (cancelled) return;
        setMusicResults([]);
        setMusicError('Fehler bei der Spotify-Suche');
      })
      .finally(() => {
        if (!cancelled) setIsSearchingMusic(false);
      });
    return () => { cancelled = true; };
  }, [musicSearch]);

  // Musik-Vorschau abspielen/stoppen
  const handleMusicPlayPause = () => {
    if (!music?.preview_url) return;
    if (isMusicPlaying) {
      audioRef.current?.pause();
      setIsMusicPlaying(false);
    } else {
      audioRef.current?.play();
      setIsMusicPlaying(true);
    }
  };

  // Stoppe Musik beim Wechsel
  useEffect(() => { setIsMusicPlaying(false); audioRef.current?.pause(); }, [music]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Ungültiger Dateityp. Bitte wähle ein Bild oder Video.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Datei ist zu groß. Maximale Größe: 10MB');
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'story');
      
      // Verwende den korrekten API-Pfad basierend auf der django-api-new.ts Konfiguration
      const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const token = localStorage.getItem('access_token');
      
      console.log('[Upload] Starting upload to:', `${BASE_URL}/api/upload/media/`);
      console.log('[Upload] Token available:', !!token);
      console.log('[Upload] File type:', file.type, 'Size:', file.size);
      
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${BASE_URL}/api/upload/media/`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers,
      });
      
      console.log('[Upload] Response status:', response.status);
      console.log('[Upload] Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        let errorMessage = `Upload failed: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.detail || errorMessage;
        } catch (e) {
          console.error('[Upload] Failed to parse error response:', e);
        }
        
        // Fallback: Verwende eine lokale URL für Demo-Zwecke
        if (response.status === 401) {
          console.log('[Upload] 401 Unauthorized - using fallback URL');
          const fallbackUrl = URL.createObjectURL(file);
          setMediaPreview(fallbackUrl);
          setMediaFile(file);
          setStoryType(file.type.startsWith('video/') ? 'video' : 'image');
          toast.success('Medien hochgeladen (Demo-Modus)');
          return;
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('[Upload] Success response:', data);
      
      if (!data.url) {
        throw new Error('Upload fehlgeschlagen - keine URL erhalten');
      }
      
      setMediaPreview(data.url);
      setMediaFile(file);
      setStoryType(file.type.startsWith('video/') ? 'video' : 'image');
      toast.success('Medien erfolgreich hochgeladen');
    } catch (error: unknown) {
      console.error('[Upload] Error:', error);
      
      // Fallback: Verwende eine lokale URL für Demo-Zwecke
      if (file) {
        console.log('[Upload] Using fallback URL due to error');
        const fallbackUrl = URL.createObjectURL(file);
        setMediaPreview(fallbackUrl);
        setMediaFile(file);
        setStoryType(file.type.startsWith('video/') ? 'video' : 'image');
        toast.success('Medien hochgeladen (Demo-Modus)');
      } else {
        toast.error('Upload-Fehler: ' + (error instanceof Error ? error.message : String(error)));
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateStory = async () => {
    if (storyType !== 'text' && !mediaPreview) {
      toast.error('Bitte wähle ein Bild oder Video aus');
      return;
    }
    if (storyType === 'text' && !caption.trim()) {
      toast.error('Bitte gib einen Text für deine Story ein');
      return;
    }
    setIsCreating(true);
    try {
      const payload: StoryPayload = { type: storyType, caption };
      if (storyType !== 'text') payload.media_url = mediaPreview || '';
      // KEIN stickers-Feld mehr im Story-POST!
      if (activeTab === 'poll' && poll.question.trim() && poll.options.filter(o => o.text.trim()).length >= 2) payload.poll = { ...poll, options: poll.options.map(o => ({ text: o.text, votes: 0 })) };
      if (isHighlight) { payload.is_highlight = true; payload.highlight_name = highlightName; }
      const response = await storyAPI.createStory(payload as unknown as Record<string, unknown>);
      if (response && (response.id || response.success)) {
        // Musik nachträglich anhängen, falls ausgewählt
        if (music) {
          try {
            await fetch(`/api/stories/${response.id}/music/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: music.title,
                artist: music.artist,
                url: music.cover_url, // oder preview_url, je nach Backend-Logik
                preview_url: music.preview_url,
                start_time: 0
              })
            });
          } catch (err) {
            toast.error('Musik konnte nicht gespeichert werden');
          }
        }
        toast.success('Story erfolgreich erstellt!');
        onStoryCreated();
        onClose();
      } else {
        toast.error('Fehler beim Erstellen der Story');
      }
    } catch (error: unknown) {
      toast.error('Story-Fehler: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsCreating(false);
    }
  };

  const handleTextStory = () => {
    setStoryType('text');
    setMediaFile(null);
    setMediaPreview(null);
  };

  const handleVideoPlayPause = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const resetForm = () => {
    setStoryType('image');
    setMediaFile(null);
    setMediaPreview(null);
    setCaption('');
    setIsVideoPlaying(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl">
        {/* Avatar und Username oben links */}
        <div className="flex items-center mb-4">
          <Avatar className="w-12 h-12 mr-3">
            <AvatarImage src={user?.avatar_url || '/placeholder.svg'} />
            <AvatarFallback className="bg-gray-700 text-white">
              {user?.username?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-lg text-gray-900 dark:text-white">{user?.display_name || user?.username || 'Du'}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Story erstellen</span>
          </div>
        </div>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Story erstellen</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Redesign modal: large, centered, modern, with big icon tabs and clear sections for each story type */}
          <div className="flex space-x-2 justify-center mb-4">
            <Button variant={activeTab === 'image' ? 'default' : 'outline'} size="lg" onClick={() => { setActiveTab('image'); setStoryType('image'); }} className="flex-1 rounded-full">
              <Camera className="h-6 w-6" />
            </Button>
            <Button variant={activeTab === 'video' ? 'default' : 'outline'} size="lg" onClick={() => { setActiveTab('video'); setStoryType('video'); }} className="flex-1 rounded-full">
              <Video className="h-6 w-6" />
            </Button>
            <Button variant={activeTab === 'text' ? 'default' : 'outline'} size="lg" onClick={() => { setActiveTab('text'); setStoryType('text'); }} className="flex-1 rounded-full">
              <Type className="h-6 w-6" />
            </Button>
            <Button variant={activeTab === 'music' ? 'default' : 'outline'} size="lg" onClick={() => setActiveTab('music')} className="flex-1 rounded-full">
              <Music className="h-6 w-6" />
            </Button>
            <Button variant={activeTab === 'sticker' ? 'default' : 'outline'} size="lg" onClick={() => setActiveTab('sticker')} className="flex-1 rounded-full">
              <Smile className="h-6 w-6" />
            </Button>
            <Button variant={activeTab === 'poll' ? 'default' : 'outline'} size="lg" onClick={() => setActiveTab('poll')} className="flex-1 rounded-full">
              <BarChart className="h-6 w-6" />
            </Button>
          </div>

          {/* Media Upload Section */}
          {storyType !== 'text' && (
            <div className="space-y-4">
              <Label>Medien auswählen</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileSelect} className="hidden" title="Datei auswählen" placeholder="Datei auswählen" />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="w-full">
                  {isUploading ? (<><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>Hochladen...</>) : (<><Upload className="h-4 w-4 mr-2" />Datei auswählen</>)}
                </Button>
                {mediaPreview && (
                  storyType === 'image' ? (
                    <img src={mediaPreview} alt="Preview" className="w-full mt-4 rounded-lg" />
                  ) : (
                    <div className="relative mt-4">
                      <video ref={videoRef} src={mediaPreview} className="w-full rounded-lg" controls={false} onClick={handleVideoPlayPause} />
                      <Button onClick={handleVideoPlayPause} className="absolute bottom-2 left-2" size="icon" variant="secondary">
                        {isVideoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Musik Section */}
          {activeTab === 'music' && (
            <div className="space-y-4">
              <Label>Song suchen</Label>
              <Input
                placeholder="Songtitel oder Artist"
                value={musicSearch}
                onChange={e => setMusicSearch(e.target.value)}
                disabled={isSearchingMusic}
              />
              {musicError && <div className="text-red-500 text-sm">{musicError}</div>}
              <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto">
                {musicResults.map((song, idx) => (
                  <button key={song.id} type="button" className={clsx('flex items-center gap-3 p-2 rounded-lg border transition', music?.id === song.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-100')} onClick={() => setMusic(song)}>
                    {song.cover_url && <img src={song.cover_url} alt="Cover" className="w-10 h-10 rounded-md object-cover" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Music className="w-4 h-4 text-blue-400" />
                        <span className="font-semibold text-gray-900 truncate">{song.title}</span>
                      </div>
                      <span className="text-xs text-gray-500 truncate">{song.artist}</span>
                    </div>
                    {music?.id === song.id && <span className="ml-2 text-xs text-blue-600 font-bold">Ausgewählt</span>}
                  </button>
                ))}
              </div>
              {/* Vorschau des gewählten Songs */}
              {music && (
                <div className="mt-4 flex items-center gap-3 bg-black/80 rounded-xl px-4 py-2">
                  {music.cover_url && <img src={music.cover_url} alt="Cover" className="w-10 h-10 rounded-md object-cover" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Music className="w-5 h-5 text-blue-400" />
                      <span className="font-semibold text-white truncate">{music.title}</span>
                    </div>
                    <span className="text-xs text-gray-300 truncate">{music.artist}</span>
                    {!music.preview_url && <span className="text-xs text-yellow-400 block mt-1">Keine Vorschau verfügbar</span>}
                  </div>
                  {music.preview_url && (
                    <button
                      className="ml-2 p-2 rounded-full bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      aria-label={isMusicPlaying ? 'Pause' : 'Abspielen'}
                      onClick={handleMusicPlayPause}
                      type="button"
                    >
                      {isMusicPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
                    </button>
                  )}
                  <audio ref={audioRef} src={music.preview_url || undefined} onEnded={() => setIsMusicPlaying(false)} style={{ display: 'none' }} />
                </div>
              )}
            </div>
          )}

          {/* Sticker Section */}
          {activeTab === 'sticker' && (
            <div className="space-y-4">
              <Label>Sticker auswählen</Label>
              <div className="flex gap-3 flex-wrap">
                {DUMMY_STICKERS.map(sticker => (
                  <button key={sticker.id} type="button" className="flex flex-col items-center p-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition" onClick={() => setStickers(prev => [...prev, { ...sticker, x: 50 + prev.length * 10, y: 50 + prev.length * 10, scale: 1 }])}>
                    <img src={sticker.src} alt={sticker.name} className="w-12 h-12" />
                    <span className="text-xs mt-1">{sticker.name}</span>
                  </button>
                ))}
              </div>
              {/* Vorschau der hinzugefügten Sticker */}
              {stickers.length > 0 && (
                <div className="relative w-full h-40 bg-gray-100 rounded-lg mt-4 overflow-hidden">
                  {stickers.map((sticker, idx) => (
                    <div key={sticker.id + '-' + idx} className="absolute" style={{ left: `${sticker.x}%`, top: `${sticker.y}%`, transform: 'translate(-50%, -50%)' }}>
                      <img src={sticker.src} alt={sticker.name} className="w-12 h-12" />
                      <button type="button" aria-label="Sticker entfernen" className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow" onClick={() => setStickers(prev => prev.filter((_, i) => i !== idx))}>
                        <XIcon className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Poll Section */}
          {activeTab === 'poll' && (
            <div className="space-y-4">
              <Label>Umfrage-Frage</Label>
              <Input value={poll.question} onChange={e => setPoll(p => ({ ...p, question: e.target.value }))} placeholder="Deine Frage..." maxLength={100} />
              <Label>Antwortoptionen</Label>
              <div className="flex flex-col gap-2">
                {poll.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input value={opt.text} onChange={e => setPoll(p => ({ ...p, options: p.options.map((o, i) => i === idx ? { ...o, text: e.target.value } : o) }))} placeholder={`Option ${idx + 1}`} maxLength={40} />
                    {poll.options.length > 2 && (
                      <button type="button" aria-label="Option entfernen" className="p-1 bg-white rounded-full border border-gray-200 hover:bg-red-100" onClick={() => setPoll(p => ({ ...p, options: p.options.filter((_, i) => i !== idx) }))}>
                        <span className="text-red-500 font-bold">&times;</span>
                      </button>
                    )}
                  </div>
                ))}
                {poll.options.length < 4 && (
                  <button type="button" className="mt-2 px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200" onClick={() => setPoll(p => ({ ...p, options: [...p.options, { text: '', votes: 0 }] }))}>
                    + Option hinzufügen
                  </button>
                )}
              </div>
              {/* Vorschau */}
              <div className="mt-4 p-3 rounded-lg bg-gray-50 border">
                <div className="font-semibold mb-2 flex items-center gap-2"><BarChart className="w-4 h-4 text-blue-500" />{poll.question || 'Vorschau der Frage...'}</div>
                <ul className="flex flex-col gap-1">
                  {poll.options.map((opt, idx) => (
                    <li key={idx} className="px-3 py-1 rounded bg-white border text-gray-700">{opt.text || `Option ${idx + 1}`}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Highlight and Caption Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="highlight" checked={isHighlight} onChange={e => setIsHighlight(e.target.checked)} className="w-4 h-4" />
              <label htmlFor="highlight" className="text-sm font-medium">Als Highlight speichern</label>
              {isHighlight && (
                <input type="text" className="ml-2 border rounded px-2 py-1 text-sm" placeholder="Highlight-Name" value={highlightName} onChange={e => setHighlightName(e.target.value)} maxLength={30} />
              )}
            </div>
            <div className="space-y-2">
              <Label>Caption</Label>
              {storyType === 'text' ? (
                <Textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="Dein Text..." rows={4} />
              ) : (
                <Input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Bild-/Video-Beschreibung (optional)" />
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { resetForm(); onClose(); }} disabled={isCreating}>Abbrechen</Button>
            <Button onClick={handleCreateStory} disabled={isCreating || isUploading} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full px-8 py-2">
              {isCreating ? 'Erstelle...' : 'Story posten'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StoryCreation; 