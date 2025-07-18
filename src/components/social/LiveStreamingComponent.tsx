import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, MicOff, Video, VideoOff, Camera, CameraOff, Radio, Square } from 'lucide-react';

interface LiveStream {
  id: string;
  title: string;
  hostId: string;
  hostName: string;
  isLive: boolean;
  viewerCount: number;
  startedAt: Date;
  description: string;
  tags: string[];
  thumbnail?: string;
}

interface LiveStreamMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'reaction' | 'gift';
}

interface LiveStreamProps {
  streamId?: string;
  isHost?: boolean;
  onStreamEnd?: () => void;
}

const LiveStreamingComponent: React.FC<LiveStreamProps> = ({
  streamId,
  isHost = false,
  onStreamEnd,
}) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [messages, setMessages] = useState<LiveStreamMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [streamTitle, setStreamTitle] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [streamQuality, setStreamQuality] = useState('720p');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isHost) {
      initializeStream();
    } else {
      joinStream();
    }
  }, [streamId, isHost]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeStream = async () => {
    try {
      // Request camera and microphone permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      
      setMediaStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      console.log('Initializing stream...');
      setIsStreaming(true);
      
      // Start viewer count simulation
      startViewerCountSimulation();
      
      // Start message simulation
      startMessageSimulation();
      
    } catch (error) {
      console.error('Failed to initialize stream:', error);
      alert('Failed to start stream - please allow camera and microphone access');
    }
  };

  const joinStream = async () => {
    try {
      console.log('Joining stream...');
      
      // Join existing stream
      startViewerCountSimulation();
      startMessageSimulation();
      
    } catch (error) {
      console.error('Failed to join stream:', error);
      alert('Failed to join stream');
    }
  };

  const startViewerCountSimulation = () => {
    const interval = setInterval(() => {
      setViewerCount(prev => {
        const change = Math.floor(Math.random() * 10) - 5;
        return Math.max(0, prev + change);
      });
    }, 5000);
    
    return () => clearInterval(interval);
  };

  const startMessageSimulation = () => {
    const sampleMessages = [
      'Great stream!',
      'Hello everyone!',
      '🔥🔥🔥',
      'Amazing content!',
      'Thanks for streaming!',
    ];
    
    const interval = setInterval(() => {
      const randomMessage = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
      const newMsg: LiveStreamMessage = {
        id: Date.now().toString(),
        userId: `user_${Math.floor(Math.random() * 1000)}`,
        username: `User${Math.floor(Math.random() * 1000)}`,
        message: randomMessage,
        timestamp: new Date(),
        type: 'text',
      };
      
      setMessages(prev => [...prev, newMsg]);
    }, 3000);
    
    return () => clearInterval(interval);
  };

  const handleStartStream = async () => {
    if (!streamTitle.trim()) {
      alert('Please enter a stream title');
      return;
    }
    
    try {
      await initializeStream();
    } catch (error) {
      console.error('Failed to start stream:', error);
    }
  };

  const handleEndStream = async () => {
    if (confirm('Are you sure you want to end this stream?')) {
      // Stop media stream
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        setMediaStream(null);
      }
      
      setIsStreaming(false);
      onStreamEnd?.();
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message: LiveStreamMessage = {
      id: Date.now().toString(),
      userId: 'current_user',
      username: 'You',
      message: newMessage,
      timestamp: new Date(),
      type: 'text',
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const toggleMute = () => {
    if (mediaStream) {
      const audioTrack = mediaStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleCamera = () => {
    if (mediaStream) {
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const switchCamera = async () => {
    try {
      // Stop current stream
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      
      // Get new stream with different camera
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: true,
      });
      
      setMediaStream(newStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (error) {
      console.error('Failed to switch camera:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black text-white">
      {/* Stream Preview */}
      <div className="relative h-80">
        {isHost && isStreaming ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-900 flex items-center justify-center">
            <div className="text-center">
              <Camera className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-600">
                {isHost ? 'Start your stream' : 'Stream will begin soon'}
              </p>
            </div>
          </div>
        )}
        
        {/* Stream Info Overlay */}
        <div className="absolute top-4 left-4">
          <Badge variant="destructive" className="mb-2">
            LIVE
          </Badge>
          <p className="text-white font-bold">{viewerCount} viewers</p>
        </div>
        
        {/* Stream Controls */}
        {isHost && (
          <div className="absolute bottom-4 right-4 flex gap-2">
            <Button
              size="icon"
              variant={isMuted ? "destructive" : "secondary"}
              onClick={toggleMute}
              className="w-12 h-12 rounded-full"
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </Button>
            
            <Button
              size="icon"
              variant={!isCameraOn ? "destructive" : "secondary"}
              onClick={toggleCamera}
              className="w-12 h-12 rounded-full"
            >
              {isCameraOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </Button>
            
            <Button
              size="icon"
              variant={isRecording ? "destructive" : "secondary"}
              onClick={toggleRecording}
              className="w-12 h-12 rounded-full"
            >
              {isRecording ? <Square className="w-6 h-6" /> : <Radio className="w-6 h-6" />}
            </Button>
            
            <Button
              size="icon"
              variant="secondary"
              onClick={switchCamera}
              className="w-12 h-12 rounded-full"
            >
              <CameraOff className="w-6 h-6" />
            </Button>
          </div>
        )}
      </div>

      {/* Stream Title and Description */}
      <Card className="m-4">
        <CardHeader>
          <CardTitle>
            {isHost ? 'Your Stream' : 'Live Stream'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isHost && !isStreaming ? (
            <Input
              placeholder="Enter stream title..."
              value={streamTitle}
              onChange={(e) => setStreamTitle(e.target.value)}
              className="mb-4"
            />
          ) : (
            <p className="text-lg font-bold mb-4">
              {streamTitle || 'Live Stream'}
            </p>
          )}
          
          {isHost && !isStreaming && (
            <Button onClick={handleStartStream} className="w-full">
              Start Stream
            </Button>
          )}
          
          {isHost && isStreaming && (
            <Button
              variant="destructive"
              onClick={handleEndStream}
              className="w-full"
            >
              End Stream
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Live Chat */}
      <Card className="m-4 flex-1">
        <CardHeader>
          <CardTitle>Live Chat</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-80">
            <div className="space-y-2">
              {messages.map((message) => (
                <div key={message.id} className="p-2 bg-gray-100 rounded-lg">
                  <p className="font-bold text-sm text-gray-800">{message.username}</p>
                  <p className="text-sm text-gray-600">{message.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <div className="flex gap-2 mt-4">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} size="sm">
              Send
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stream Quality Selector */}
      {isHost && (
        <Card className="m-4">
          <CardHeader>
            <CardTitle>Stream Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {['480p', '720p', '1080p'].map((quality) => (
                <Button
                  key={quality}
                  variant={streamQuality === quality ? "default" : "outline"}
                  onClick={() => setStreamQuality(quality)}
                  size="sm"
                >
                  {quality}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LiveStreamingComponent; 