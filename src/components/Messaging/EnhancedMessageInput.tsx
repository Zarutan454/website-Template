import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { 
  SendHorizontal, 
  Paperclip, 
  Smile, 
  X, 
  Image as ImageIcon, 
  FileText, 
  Film, 
  Music,
  Mic,
  Send
} from 'lucide-react';
import { VoiceMessageRecorder } from './components/VoiceMessageRecorder';
import { useTheme } from '../ThemeProvider.utils';
import { handleError } from '../common/ErrorHandler.utils';
import { uploadFile, UploadResult } from '../../utils/storageUtils';
import { Progress } from '../ui/progress';
import { toast } from 'sonner';

interface EnhancedMessageInputProps {
  onSendMessage: (content: string, attachment?: UploadResult) => void;
  isDisabled: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  onTyping?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const EnhancedMessageInput: React.FC<EnhancedMessageInputProps> = ({ 
  onSendMessage, 
  isDisabled,
  placeholder = "Schreibe eine Nachricht...",
  autoFocus = true,
  onTyping
}) => {
  const { theme } = useTheme();
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [attachment, setAttachment] = useState<UploadResult | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((message.trim() || attachment) && !isDisabled && !isUploading) {
      try {
        onSendMessage(message.trim(), attachment || undefined);
        setMessage('');
        setAttachment(null);
        
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
    onTyping?.(e);
  };

  const handleAttachmentClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    try {
      const result = await uploadFile(file);
      
      if (result.error) {
        toast.error(result.error);
        setIsUploading(false);
        clearInterval(progressInterval);
        setUploadProgress(0);
        return;
      }

      setAttachment(result);
      setUploadProgress(100);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error('Fehler beim Hochladen der Datei');
      console.error('File upload error:', error);
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
  };

  const handleVoiceMessageSent = () => {
    setShowVoiceRecorder(false);
    // The parent component will handle message refresh
  };

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const getAttachmentIcon = () => {
    if (!attachment) return null;
    
    const type = attachment.type.split('/')[0];
    
    switch (type) {
      case 'image':
        return <ImageIcon size={16} />;
      case 'video':
        return <Film size={16} />;
      case 'audio':
        return <Music size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 dark:border-gray-700">
      {isUploading && (
        <div className="px-2 mb-2">
          <Progress value={uploadProgress} className="h-2 mb-1" />
          <p className="text-xs text-muted-foreground">Datei wird hochgeladen... {uploadProgress}%</p>
        </div>
      )}
      
      {attachment && !isUploading && (
        <div className={`flex items-center gap-2 p-2 mb-2 rounded-md ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
        }`}>
          {getAttachmentIcon()}
          <span className="text-sm truncate flex-1">{attachment.name}</span>
          <span className="text-xs text-muted-foreground">
            {Math.round(attachment.size / 1024)} KB
          </span>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={removeAttachment}
          >
            <X size={14} />
          </Button>
        </div>
      )}
      
      <div className={`flex items-end space-x-2 rounded-lg p-2 ${
        theme === 'dark' ? 'bg-gray-800/80' : 'bg-gray-100'
      }`}>
        <div className="flex space-x-1 flex-shrink-0">
          <Button
            type="button"
            disabled={isDisabled || isUploading}
            size="icon"
            variant="ghost"
            className="rounded-full h-9 w-9 text-gray-500 hover:text-primary"
            title="Anhang hinzufügen"
            onClick={handleAttachmentClick}
          >
            <Paperclip size={18} />
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept="image/*,video/*,audio/*,application/pdf"
            aria-label="Datei auswählen"
            title="Datei auswählen"
          />
        </div>
        
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={attachment ? "Beschreibe deinen Anhang..." : placeholder}
          disabled={isDisabled || isUploading}
          className={`min-h-[40px] max-h-[150px] flex-grow resize-none border-0 focus-visible:ring-0 ${
            theme === 'dark' ? 'bg-gray-800/80 text-white' : 'bg-gray-100 text-gray-900'
          }`}
        />
        
        <div className="flex space-x-1 flex-shrink-0">
          <Button
            type="button"
            disabled={isDisabled || isUploading}
            size="icon"
            variant="ghost"
            className="rounded-full h-9 w-9 text-gray-500 hover:text-primary"
            title="Emoji einfügen"
          >
            <Smile size={18} />
          </Button>
          
          <Button
            type="button"
            disabled={isDisabled || isUploading}
            size="icon"
            variant="ghost"
            className="rounded-full h-9 w-9 text-gray-500 hover:text-primary"
            title="Sprachnachricht aufnehmen"
            onClick={() => setShowVoiceRecorder(true)}
          >
            <Mic size={18} />
          </Button>

          <Button
            type="submit"
            disabled={(!message.trim() && !attachment) || isDisabled || isUploading}
            size="icon"
            className="rounded-full h-9 w-9 bg-primary hover:bg-primary/90 disabled:bg-gray-400 disabled:opacity-50"
            title="Nachricht senden"
          >
            <SendHorizontal size={18} className="text-white" />
          </Button>
        </div>
      </div>

      {/* Voice Message Recorder */}
      {showVoiceRecorder && (
        <VoiceMessageRecorder
          conversationId={1} // This should be passed from parent
          onMessageSent={handleVoiceMessageSent}
          onCancel={() => setShowVoiceRecorder(false)}
        />
      )}
    </form>
  );
};

export default EnhancedMessageInput;
