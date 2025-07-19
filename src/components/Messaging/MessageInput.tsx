
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizontal, Paperclip, Smile, Mic, Image, Video, File } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { handleError } from '@/components/common/ErrorHandler.utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onSendVoiceMessage?: (audioBlob: Blob) => void;
  onSendMedia?: (file: File) => void;
  isDisabled: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  isRecording?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  onSendVoiceMessage,
  onSendMedia,
  isDisabled,
  placeholder = "Schreibe eine Nachricht...",
  autoFocus = true,
  isRecording = false
}) => {
  const { theme } = useTheme();
  const [message, setMessage] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Emoji-Liste
  const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
    '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
    '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
    '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😯', '😦', '😧',
    '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢',
    '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '💩', '👻', '💀',
    '☠️', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !isDisabled) {
      try {
        onSendMessage(message.trim());
        setMessage('');
        
        // Textarea nach dem Senden fokussieren
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.style.height = 'auto';
        }
      } catch (error) {
        handleError(error, 'unknown');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Nachricht bei Enter (ohne Shift) senden
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Automatische Höhenanpassung der Textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setMessage(prev => prev + emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onSendMedia) {
      // Dateigröße prüfen (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Datei zu groß. Maximale Größe: 10MB');
        return;
      }
      
      onSendMedia(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };
      
      recorder.onstop = () => {
        const audioBlob = new Blob(recordedChunks, { type: 'audio/webm' });
        if (onSendVoiceMessage) {
          onSendVoiceMessage(audioBlob);
        }
        setRecordedChunks([]);
        stream.getTracks().forEach(track => track.stop());
      };
      
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecordingVoice(true);
      toast.success('Sprachaufnahme gestartet');
    } catch (error) {
      toast.error('Mikrofon-Zugriff verweigert');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder && isRecordingVoice) {
      mediaRecorder.stop();
      setIsRecordingVoice(false);
      toast.success('Sprachaufnahme beendet');
    }
  };

  // Textarea fokussieren, wenn die Komponente eingebunden wird
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 dark:border-gray-700">
      <div className={`flex items-end space-x-2 rounded-xl p-3 ${
        theme === 'dark' ? 'bg-gray-800/80' : 'bg-gray-100'
      }`}>
        {/* Media Upload Button */}
        <div className="flex space-x-1 flex-shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            type="button"
            disabled={isDisabled}
            size="icon"
            variant="ghost"
            className="rounded-full h-9 w-9 text-gray-500 hover:text-primary"
            title="Anhang hinzufügen"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip size={18} />
          </Button>
        </div>
        
        {/* Text Input */}
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isDisabled || isRecordingVoice}
          className={`min-h-[40px] max-h-[150px] flex-grow resize-none border-0 focus-visible:ring-0 ${
            theme === 'dark' ? 'bg-gray-800/80 text-white' : 'bg-gray-100 text-gray-900'
          }`}
        />
        
        {/* Action Buttons */}
        <div className="flex space-x-1 flex-shrink-0">
          {/* Emoji Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                disabled={isDisabled}
                size="icon"
                variant="ghost"
                className="rounded-full h-9 w-9 text-gray-500 hover:text-primary"
                title="Emoji einfügen"
              >
                <Smile size={18} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-2" align="end">
              <div className="grid grid-cols-10 gap-1 max-h-60 overflow-y-auto">
                {emojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleEmojiClick(emoji)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-lg transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Voice Recording Button */}
          {onSendVoiceMessage && (
            <Button
              type="button"
              disabled={isDisabled}
              size="icon"
              variant={isRecordingVoice ? "destructive" : "ghost"}
              className={`rounded-full h-9 w-9 ${
                isRecordingVoice 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'text-gray-500 hover:text-primary'
              }`}
              title={isRecordingVoice ? "Aufnahme stoppen" : "Sprachnachricht aufnehmen"}
              onClick={isRecordingVoice ? stopVoiceRecording : startVoiceRecording}
            >
              <Mic size={18} />
            </Button>
          )}
          
          {/* Send Button */}
          <Button
            type="submit"
            disabled={!message.trim() || isDisabled || isRecordingVoice}
            size="icon"
            className="rounded-full h-9 w-9 bg-primary hover:bg-primary/90 disabled:bg-gray-400 disabled:opacity-50"
            title="Nachricht senden"
          >
            <SendHorizontal size={18} className="text-white" />
          </Button>
        </div>
      </div>
      
      {/* Recording Indicator */}
      {isRecordingVoice && (
        <div className="mt-2 flex items-center gap-2 text-red-500 text-sm">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span>Aufnahme läuft...</span>
          <Badge variant="destructive" className="text-xs">
            Klicke zum Stoppen
          </Badge>
        </div>
      )}
    </form>
  );
};

export default MessageInput;
