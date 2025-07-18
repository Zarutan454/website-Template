import React, { useRef, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Image, Video, Smile } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { type CreatePostData } from '@/types/posts';

interface FacebookCreatePostBoxProps {
  onCreatePost: (data: CreatePostData) => Promise<void>;
  darkMode?: boolean;
}

const FacebookCreatePostBox: React.FC<FacebookCreatePostBoxProps> = ({ onCreatePost, darkMode }) => {
  const { user: profile } = useAuth();
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMedia(file);
    setMediaPreview(URL.createObjectURL(file));
    if (file.type.startsWith('image/')) setMediaType('image');
    else if (file.type.startsWith('video/')) setMediaType('video');
    else setMediaType(null);
  };

  const handleRemoveMedia = () => {
    setMedia(null);
    setMediaPreview(null);
    setMediaType(null);
  };

  const handlePost = async () => {
    if (!content.trim() && !media) return;
    setIsPosting(true);
    let mediaUrl: string | null = null;
    let uploadedMediaType: string | null = null;
    // TODO: Upload-Logik für Medien implementieren (API-Aufruf)
    // Hier nur Vorschau, kein echter Upload
    if (media && mediaPreview) {
      mediaUrl = mediaPreview;
      uploadedMediaType = mediaType;
    }
    const postData: CreatePostData = {
      content,
      media_url: mediaUrl,
      media_type: uploadedMediaType,
      hashtags: [],
    };
    await onCreatePost(postData);
    setContent('');
    handleRemoveMedia();
    setIsPosting(false);
  };

  return (
    <div className={`rounded-xl shadow-md p-4 mb-4 ${darkMode ? 'bg-dark-200 border border-gray-800' : 'bg-white border border-gray-200'}`}>
      <div className="flex items-start gap-3 mb-2">
        <Avatar className="h-10 w-10">
          {profile?.avatar_url ? (
            <AvatarImage src={profile.avatar_url} alt={profile.username || 'User'} />
          ) : (
            <AvatarFallback>{profile?.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
          )}
        </Avatar>
        <Textarea
          className={`flex-1 resize-none bg-transparent border-none shadow-none focus:ring-0 focus:outline-none text-base ${darkMode ? 'text-white placeholder:text-gray-400' : 'text-gray-900 placeholder:text-gray-500'}`}
          placeholder={`Was machst du gerade, ${profile?.username || ''}?`}
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={2}
        />
      </div>
      {mediaPreview && (
        <div className="relative mb-2">
          {mediaType === 'image' ? (
            <img src={mediaPreview} alt="Preview" className="max-h-60 rounded-lg w-auto mx-auto" />
          ) : (
            <video src={mediaPreview} controls className="max-h-60 rounded-lg w-auto mx-auto" />
          )}
          <Button size="sm" variant="ghost" className="absolute top-2 right-2 bg-red-500 text-white" onClick={handleRemoveMedia}>Entfernen</Button>
        </div>
      )}
      <div className="flex items-center gap-2 mt-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => fileInputRef.current?.click()}
        >
          <Image className="h-5 w-5" /> Foto/Video
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileChange}
          title="Foto oder Video auswählen"
          placeholder="Foto oder Video auswählen"
        />
        <Button type="button" variant="ghost" size="sm" className="flex items-center gap-1" disabled>
          <Video className="h-5 w-5" /> Live-Video
        </Button>
        <Button type="button" variant="ghost" size="sm" className="flex items-center gap-1" disabled>
          <Smile className="h-5 w-5" /> Gefühl/Aktivität
        </Button>
        <div className="flex-1" />
        <Button
          type="button"
          variant="default"
          size="sm"
          className="px-6"
          disabled={isPosting || (!content.trim() && !media)}
          onClick={handlePost}
        >
          Posten
        </Button>
      </div>
    </div>
  );
};

export default FacebookCreatePostBox; 