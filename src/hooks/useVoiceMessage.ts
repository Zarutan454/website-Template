import { useState, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.utils';

interface VoiceMessageData {
  audioBlob: Blob;
  duration: number;
  waveform: number[];
}

interface VoiceMessageResponse {
  id: number;
  voice_file: string;
  voice_duration: number;
  voice_waveform: number[];
}

export const useVoiceMessage = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [currentPlayingId, setCurrentPlayingId] = useState<number | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { user } = useAuth();

  // Initialize audio context
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
  }, []);

  // Generate waveform data from audio blob
  const generateWaveform = useCallback(async (audioBlob: Blob): Promise<number[]> => {
    try {
      initAudioContext();
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
      const channelData = audioBuffer.getChannelData(0);
      
      // Sample the audio data to create waveform
      const samples = 50; // Number of waveform points
      const blockSize = Math.floor(channelData.length / samples);
      const waveform: number[] = [];
      
      for (let i = 0; i < samples; i++) {
        const start = blockSize * i;
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(channelData[start + j]);
        }
        waveform.push(sum / blockSize);
      }
      
      return waveform;
    } catch (error) {
      console.error('Error generating waveform:', error);
      return [];
    }
  }, [initAudioContext]);

  // Start recording
  const startRecording = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Start duration timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      return false;
    }
  }, []);

  // Stop recording
  const stopRecording = useCallback(async (): Promise<VoiceMessageData | null> => {
    if (!mediaRecorderRef.current || !isRecording) {
      return null;
    }
    
    return new Promise((resolve) => {
      mediaRecorderRef.current!.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const waveform = await generateWaveform(audioBlob);
        
        // Stop all tracks
        mediaRecorderRef.current!.stream.getTracks().forEach(track => track.stop());
        
        setIsRecording(false);
        setRecordingDuration(0);
        
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }
        
        resolve({
          audioBlob,
          duration: recordingDuration,
          waveform
        });
      };
      
      mediaRecorderRef.current!.stop();
    });
  }, [isRecording, recordingDuration, generateWaveform]);

  // Send voice message
  const sendVoiceMessage = useCallback(async (
    conversationId: number, 
    voiceData: VoiceMessageData
  ): Promise<VoiceMessageResponse | null> => {
    try {
      const formData = new FormData();
      formData.append('audio', voiceData.audioBlob, 'voice-message.wav');
      formData.append('duration', voiceData.duration.toString());
      formData.append('waveform', JSON.stringify(voiceData.waveform));
      
      const response = await fetch(`/api/messaging/conversations/${conversationId}/voice-message/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to send voice message');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error sending voice message:', error);
      return null;
    }
  }, []);

  // Play voice message
  const playVoiceMessage = useCallback(async (messageId: number): Promise<boolean> => {
    try {
      // Stop any currently playing audio
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
      
      const response = await fetch(`/api/messaging/messages/${messageId}/voice/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch voice message');
      }
      
      const voiceData = await response.json();
      
      // Create audio element
      const audio = new Audio(voiceData.voice_file);
      audioElementRef.current = audio;
      setCurrentPlayingId(messageId);
      setIsPlaying(true);
      
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentPlayingId(null);
        audioElementRef.current = null;
      };
      
      audio.onerror = () => {
        setIsPlaying(false);
        setCurrentPlayingId(null);
        audioElementRef.current = null;
      };
      
      await audio.play();
      return true;
    } catch (error) {
      console.error('Error playing voice message:', error);
      return false;
    }
  }, []);

  // Stop playing
  const stopPlaying = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    setIsPlaying(false);
    setCurrentPlayingId(null);
  }, []);

  // Format duration
  const formatDuration = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    isRecording,
    isPlaying,
    recordingDuration,
    currentPlayingId,
    startRecording,
    stopRecording,
    sendVoiceMessage,
    playVoiceMessage,
    stopPlaying,
    formatDuration,
  };
}; 