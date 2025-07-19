import * as React from 'react';
import { type CreatePostData as BaseCreatePostData } from '@/types/posts';
import PrivacySelector, { PrivacyOption } from './components/PrivacySelector';
import MediaUploadButton from './components/MediaUploadButton';
import { toast } from 'sonner';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { useAuth } from '@/context/AuthContext.utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

// Erweitere CreatePostData um privacy
interface CreatePostData extends BaseCreatePostData {
  privacy: PrivacyOption;
}

// Typ für Poll-Daten
interface PollData {
  question: string;
  options: string[];
  duration: number;
}

interface CreatePostBoxFacebookProps {
  onCreatePost: (data: CreatePostData) => Promise<boolean>;
  darkMode?: boolean;
  hidePrivacySelector?: boolean;
}

const API_BASE_URL = import.meta.env.VITE_DJANGO_API_URL || 'http://localhost:8080';

const CreatePostBoxFacebook: React.FC<CreatePostBoxFacebookProps> = ({ onCreatePost, darkMode = true, hidePrivacySelector = false }) => {
  const { user: profile } = useAuth();
  // State für Content, Media, Preview, Privacy, Upload, Emoji
  const [content, setContent] = React.useState('');
  const [media, setMedia] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [privacy, setPrivacy] = React.useState<PrivacyOption>('public');
  const [isUploading, setIsUploading] = React.useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [showPrivacyDropdown, setShowPrivacyDropdown] = React.useState(false);

  // --- Umfrage-Dialog State ---
  const [showPollDialog, setShowPollDialog] = React.useState(false);
  const [pollQuestion, setPollQuestion] = React.useState('');
  const [pollOptions, setPollOptions] = React.useState<string[]>(['', '']);
  const [pollDuration, setPollDuration] = React.useState(3); // Tage

  // Avatar-URL dynamisch
  const avatarUrl = profile?.avatar_url || '/media/profile_avatars/default.png';
  const displayName = profile?.display_name || profile?.username || 'User';

  // Medienauswahl-Handler
  const handleFileSelect = (file: File) => {
    setMedia(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  // Medien-Preview aufräumen
  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Post-Button aktivieren, wenn Content oder Media vorhanden
  const canPost = (content.trim().length > 0 || !!media) && !isUploading;

  // Medien-Upload an Django-API
  const uploadMediaToDjango = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      setIsUploading(true);
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Kein Access Token gefunden');
      const response = await fetch(`${API_BASE_URL}/api/upload/media/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload fehlgeschlagen: ${response.status} ${errorText}`);
      }
      const data = await response.json();
      let mediaUrl = data.url;
      if (Array.isArray(mediaUrl)) mediaUrl = mediaUrl[0] || null;
      if (typeof mediaUrl !== 'string' && mediaUrl !== null) mediaUrl = String(mediaUrl);
      return mediaUrl;
    } catch (error) {
      toast.error(`Medien-Upload fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // Emoji einfügen an Cursorposition
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    const emoji = emojiData.emoji;
    if (textareaRef.current) {
      const el = textareaRef.current;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      setContent(prev => prev.slice(0, start) + emoji + prev.slice(end));
      // Cursor nach Emoji setzen
      setTimeout(() => {
        el.focus();
        el.selectionStart = el.selectionEnd = start + emoji.length;
      }, 0);
    } else {
      setContent(prev => prev + emoji);
    }
    setShowEmojiPicker(false);
  };

  // Hilfsfunktionen für Poll-Optionen
  const handlePollOptionChange = (idx: number, value: string) => {
    setPollOptions(opts => opts.map((opt, i) => i === idx ? value : opt));
  };
  const handleAddPollOption = () => {
    if (pollOptions.length < 10) setPollOptions(opts => [...opts, '']);
  };
  const handleRemovePollOption = (idx: number) => {
    if (pollOptions.length > 2) setPollOptions(opts => opts.filter((_, i) => i !== idx));
  };
  const handleCreatePoll = () => {
    // Validierung: Frage und mindestens 2 Optionen
    if (!pollQuestion.trim() || pollOptions.filter(opt => opt.trim()).length < 2) {
      toast.error('Bitte gib eine Frage und mindestens zwei Antwortoptionen ein.');
      return;
    }
    // Hier: Poll-Objekt an onCreatePost übergeben (Backend-Integration folgt)
    const pollData: PollData = {
      question: pollQuestion.trim(),
      options: pollOptions.filter(opt => opt.trim()),
      duration: pollDuration,
    };
    // Beispiel: Post mit Poll-Daten
    onCreatePost({
      content: '',
      media_url: null,
      media_type: null,
      hashtags: [],
      privacy: 'public',
      poll: pollData,
    } as CreatePostData & { poll: PollData });
    setShowPollDialog(false);
    setPollQuestion('');
    setPollOptions(['', '']);
    setPollDuration(3);
    toast.success('Umfrage erstellt!');
  };

  // Post-Handler mit echtem Upload
  const handlePost = async () => {
    if (!canPost) return;
    let finalMediaUrl: string | null = null;
    let finalMediaType: string | null = null;
    try {
      if (media) {
        finalMediaUrl = await uploadMediaToDjango(media);
        finalMediaType = media.type.startsWith('image/') ? 'image' : media.type.startsWith('video/') ? 'video' : media.type.startsWith('audio/') ? 'audio' : null;
      } else if (previewUrl && previewUrl.startsWith('http')) {
        finalMediaUrl = previewUrl;
        finalMediaType = media ? (media.type.startsWith('image/') ? 'image' : media.type.startsWith('video/') ? 'video' : media.type.startsWith('audio/') ? 'audio' : null) : null;
      }
      // content darf nie leer sein (Backend-Pflichtfeld)
      const safeContent = content.trim().length > 0 ? content.trim() : (finalMediaUrl ? ' ' : '');
      if (!safeContent) {
        toast.error('Bitte gib einen Text ein oder lade ein Medium hoch.');
        return;
      }
      // privacy validieren und fallback
      const validPrivacy = ['public', 'friends', 'private'].includes(privacy) ? privacy : 'public';
      const postData: CreatePostData = {
        content: safeContent,
        media_url: finalMediaUrl,
        media_type: finalMediaType,
        hashtags: [],
        privacy: validPrivacy,
      };
      const success = await onCreatePost(postData);
      if (success) {
        setContent('');
        setMedia(null);
        setPreviewUrl(null);
        setPrivacy('public');
        toast.success('Post erfolgreich erstellt!');
      }
    } catch (error: unknown) {
      // Fehlertext aus Response extrahieren, falls HTML
      if (error instanceof Response) {
        const text = await error.text();
        toast.error('Fehler beim Posten: ' + text);
      } else {
        toast.error('Fehler beim Posten: ' + (error && typeof error === 'object' && 'message' in error ? (error as { message: string }).message : 'Unbekannter Fehler'));
      }
    }
  };

  return (
    <div className={`sticky top-0 z-20 w-full max-w-2xl mx-auto my-8 shadow-2xl rounded-3xl border transition-shadow duration-200 group
      ${darkMode ? 'bg-[#18191a] border-gray-900 text-gray-100' : 'bg-white border-gray-100 text-gray-900'}`}
      role="form" aria-label="Beitrag erstellen">
      {/* Header: dynamisch */}
      <div className={`flex items-start gap-5 p-7 border-b rounded-t-3xl
        ${darkMode ? 'bg-[#18191a] border-gray-900' : 'bg-white/90 border-gray-100'}`}>
        {/* Avatar */}
        <div className="flex-shrink-0">
          <img src={avatarUrl} alt={displayName} className={`w-16 h-16 rounded-full object-cover border-2 shadow-md ${darkMode ? 'border-gray-800' : 'border-gray-200'}`} />
        </div>
        {/* Input-Bereich */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            className={`w-full rounded-xl p-5 resize-none min-h-[56px] text-lg focus:ring-2 focus:ring-primary focus:outline-none transition-all placeholder:italic placeholder:text-gray-400
              ${darkMode ? 'bg-[#242526] text-gray-100' : 'bg-gray-50 text-gray-900'}
            `}
            placeholder={`Was möchtest du teilen, ${displayName}?`}
            value={content}
            onChange={e => setContent(e.target.value)}
            disabled={isUploading}
            aria-label="Beitragstext"
            aria-required="true"
          />
          {/* Emoji-Picker Popover */}
          {showEmojiPicker && (
            <div className="absolute left-0 z-30 mt-2">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                theme={darkMode ? Theme.DARK : Theme.LIGHT}
                autoFocusSearch={false}
                searchDisabled={false}
                height={350}
                width={300}
              />
            </div>
          )}
          {/* Medien-Preview */}
          {previewUrl && (
            <div className="mt-4 flex justify-center" aria-label="Medienvorschau">
              {previewUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                <img src={previewUrl} alt="Preview" className={`w-56 h-56 object-cover rounded-2xl border-2 shadow ${darkMode ? 'border-gray-800 bg-[#18191a]' : 'border-gray-200 bg-white'}`} />
              ) : previewUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                <video src={previewUrl} className={`w-56 h-56 object-cover rounded-2xl border-2 shadow ${darkMode ? 'border-gray-800 bg-[#18191a]' : 'border-gray-200 bg-white'}`} controls />
              ) : previewUrl.match(/\.(mp3|wav|ogg)$/i) ? (
                <audio src={previewUrl} controls className="w-56" />
              ) : null}
            </div>
          )}
        </div>
      </div>
      {/* Footer: komplett überarbeitet, Facebook-Style */}
      <div className={`flex flex-col md:flex-row items-center md:justify-between gap-4 px-7 py-5 rounded-b-3xl shadow-inner
        ${darkMode ? 'bg-[#18191a]' : 'bg-white/95'}`}
        aria-label="Beitrag erstellen Aktionen">
        <div className="flex flex-1 flex-row items-center justify-center gap-4 md:gap-6">
          {/* Bild/Video Button */}
          <button
            className={`flex items-center gap-2 px-5 py-3 rounded-full text-lg font-semibold shadow-sm focus:ring-2 focus:ring-blue-400 transition-all duration-150
              ${darkMode ? 'bg-[#242526] text-gray-100 hover:bg-[#3a3b3c]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            type="button"
            onClick={() => document.getElementById('media-upload-input')?.click()}
            aria-label="Bild oder Video hochladen"
            tabIndex={0}
          >
            <span role="img" aria-label="Bild/Video">🖼️</span> Bild/Video
          </button>
          {/* Umfrage-Button */}
          <button
            className={`flex items-center gap-2 px-5 py-3 rounded-full text-lg font-semibold shadow-sm focus:ring-2 focus:ring-green-400 transition-all duration-150
              ${darkMode ? 'bg-[#242526] text-green-300 hover:bg-[#3a3b3c]' : 'bg-gray-100 text-green-700 hover:bg-green-200'}`}
            type="button"
            onClick={() => setShowPollDialog(true)}
            aria-label="Umfrage erstellen"
            tabIndex={0}
          >
            <Plus className="h-5 w-5" /> Umfrage
          </button>
          {/* Verstecktes File-Input */}
          <input
            id="media-upload-input"
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={e => e.target.files && handleFileSelect(e.target.files[0])}
            disabled={isUploading}
            title="Bild oder Video auswählen"
          />
          {/* Emoji Button */}
          <button
            className={`flex items-center gap-2 px-5 py-3 rounded-full text-lg font-semibold shadow-sm focus:ring-2 focus:ring-blue-400 transition-all duration-150
              ${darkMode ? 'bg-[#242526] text-gray-100 hover:bg-[#3a3b3c]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            type="button"
            onClick={() => setShowEmojiPicker(v => !v)}
            disabled={isUploading}
            aria-label="Emoji einfügen"
            tabIndex={0}
          >
            <span role="img" aria-label="Emoji">😊</span> Emoji
          </button>
          {/* Privacy-Selector als Button (nur wenn nicht ausgeblendet) */}
          {!hidePrivacySelector && (
            <div className="relative">
              <button
                className={`flex items-center gap-2 px-5 py-3 rounded-full text-lg font-semibold shadow-sm focus:ring-2 focus:ring-blue-400 transition-all duration-150
                  ${darkMode ? 'bg-[#242526] text-gray-100 hover:bg-[#3a3b3c]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                type="button"
                aria-label="Privatsphäre auswählen"
                tabIndex={0}
                onClick={() => setShowPrivacyDropdown(v => !v)}
              >
                <span role="img" aria-label="Privacy">🌐</span> {privacy === 'public' ? 'Öffentlich' : privacy === 'friends' ? 'Freunde' : 'Privat'}
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {/* Dropdown für Privacy-Optionen */}
              {showPrivacyDropdown && (
                <div className={`absolute left-0 mt-2 w-48 rounded-xl shadow-lg z-50 ${darkMode ? 'bg-[#242526] border border-gray-800' : 'bg-white border border-gray-200'}`}>
                  <button className="w-full text-left px-4 py-3 hover:bg-blue-100 rounded-t-xl" onClick={() => { setPrivacy('public'); setShowPrivacyDropdown(false); }}>🌐 Öffentlich</button>
                  <button className="w-full text-left px-4 py-3 hover:bg-blue-100" onClick={() => { setPrivacy('friends'); setShowPrivacyDropdown(false); }}>👥 Freunde</button>
                  <button className="w-full text-left px-4 py-3 hover:bg-blue-100 rounded-b-xl" onClick={() => { setPrivacy('private'); setShowPrivacyDropdown(false); }}>🔒 Privat</button>
                </div>
              )}
            </div>
          )}
        </div>
        {/* Post-Button */}
        <div className="flex-shrink-0 flex items-center justify-center w-full md:w-auto">
          <button
            className={`flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold shadow-lg focus:ring-2 focus:ring-blue-400 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed
              ${canPost ? 'bg-blue-600 hover:bg-blue-700 text-white' : darkMode ? 'bg-[#242526] text-gray-500' : 'bg-gray-100 text-gray-400'}`}
            disabled={!canPost}
            onClick={handlePost}
            aria-label="Posten"
          >
            {isUploading ? (
              <svg className="animate-spin h-7 w-7" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
            ) : (
              <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            )}
          </button>
        </div>
      </div>
      {/* Umfrage-Dialog */}
      <Dialog open={showPollDialog} onOpenChange={setShowPollDialog}>
        <DialogContent className="bg-dark-200 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Neue Umfrage erstellen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <label htmlFor="poll-question" className="text-gray-300 font-semibold">Frage der Umfrage</label>
            <input
              id="poll-question"
              type="text"
              className="w-full rounded-lg p-3 bg-dark-100 text-white border border-gray-700"
              placeholder="Frage der Umfrage..."
              value={pollQuestion}
              onChange={e => setPollQuestion(e.target.value)}
              maxLength={255}
            />
            <div className="space-y-2">
              {pollOptions.map((opt, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <label htmlFor={`poll-option-${idx}`} className="sr-only">Antwortoption {idx + 1}</label>
                  <input
                    id={`poll-option-${idx}`}
                    type="text"
                    className="flex-1 rounded-lg p-2 bg-dark-100 text-white border border-gray-700"
                    placeholder={`Antwortoption ${idx + 1}`}
                    value={opt}
                    onChange={e => handlePollOptionChange(idx, e.target.value)}
                    maxLength={100}
                  />
                  {pollOptions.length > 2 && (
                    <button type="button" className="text-red-400 hover:text-red-600" onClick={() => handleRemovePollOption(idx)} title="Option entfernen">✕</button>
                  )}
                </div>
              ))}
              {pollOptions.length < 10 && (
                <button type="button" className="text-green-400 hover:text-green-600 text-sm mt-1" onClick={handleAddPollOption}>+ Option hinzufügen</button>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <label htmlFor="poll-duration" className="text-gray-300">Laufzeit:</label>
              <input
                id="poll-duration"
                type="number"
                min={1}
                max={14}
                value={pollDuration}
                onChange={e => setPollDuration(Number(e.target.value))}
                className="w-16 rounded bg-dark-100 text-white border border-gray-700 p-1 text-center"
                aria-label="Laufzeit in Tagen"
                placeholder="Tage"
              />
              <span className="text-gray-400">Tage</span>
            </div>
          </div>
          <DialogFooter>
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg mt-4"
              onClick={handleCreatePoll}
              type="button"
            >
              Umfrage posten
            </button>
            <DialogClose asChild>
              <button className="bg-gray-700 hover:bg-gray-800 text-white font-semibold px-6 py-2 rounded-lg mt-4" type="button">Abbrechen</button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreatePostBoxFacebook; 
