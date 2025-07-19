import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff, Square, Play, Pause, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface VoiceMessageRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number, waveform: number[]) => void;
  onCancel: () => void;
  maxDuration?: number; // in seconds
}

export const VoiceMessageRecorder: React.FC<VoiceMessageRecorderProps> = ({
  onRecordingComplete,
  onCancel,
  maxDuration = 120, // 2 minutes default
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [waveform, setWaveform] = useState<number[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create audio context for waveform analysis
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      
      // Start recording
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      
      // Start waveform analysis
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      const updateWaveform = () => {
        if (analyserRef.current && isRecording) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const waveformData = Array.from(dataArray).slice(0, 64); // Take first 64 values
          setWaveform(waveformData);
          requestAnimationFrame(updateWaveform);
        }
      };
      updateWaveform();
      
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to start recording. Please check microphone permissions.');
    }
  }, [maxDuration, isRecording]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    }
  }, [isRecording]);

  const playRecording = useCallback(() => {
    if (!audioBlob) return;
    
    const audioUrl = URL.createObjectURL(audioBlob);
    audioElementRef.current = new Audio(audioUrl);
    
    audioElementRef.current.onplay = () => setIsPlaying(true);
    audioElementRef.current.onpause = () => setIsPlaying(false);
    audioElementRef.current.onended = () => setIsPlaying(false);
    
    audioElementRef.current.play();
  }, [audioBlob]);

  const pauseRecording = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
  }, []);

  const deleteRecording = useCallback(() => {
    setAudioBlob(null);
    setWaveform([]);
    setRecordingTime(0);
    setIsPlaying(false);
    
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
  }, []);

  const sendRecording = useCallback(() => {
    if (!audioBlob) return;
    
    onRecordingComplete(audioBlob, recordingTime, waveform);
    deleteRecording();
  }, [audioBlob, recordingTime, waveform, onRecordingComplete, deleteRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
    };
  }, []);

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Voice Message</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>

      {/* Recording Controls */}
      {!audioBlob && (
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-4">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600"
              >
                <Mic className="w-6 h-6" />
              </Button>
            ) : (
              <Button
                onClick={stopRecording}
                className="w-16 h-16 rounded-full bg-gray-500 hover:bg-gray-600"
              >
                <Square className="w-6 h-6" />
              </Button>
            )}
          </div>

          {isRecording && (
            <div className="text-center">
              <div className="text-2xl font-mono">{formatTime(recordingTime)}</div>
              <div className="text-sm text-gray-500">
                {recordingTime >= maxDuration ? 'Maximum duration reached' : 'Recording...'}
              </div>
            </div>
          )}

          {/* Waveform Visualization */}
          {isRecording && waveform.length > 0 && (
            <div className="flex items-center justify-center space-x-1 h-8">
              {waveform.slice(0, 32).map((value, index) => (
                <div
                  key={index}
                  className="w-1 bg-blue-500 rounded"
                  style={{
                    height: `${(value / 255) * 32}px`,
                    minHeight: '2px',
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Playback Controls */}
      {audioBlob && (
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-4">
            <Button
              onClick={isPlaying ? pauseRecording : playRecording}
              variant="outline"
              size="sm"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            
            <Button
              onClick={deleteRecording}
              variant="outline"
              size="sm"
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>

          <div className="text-center">
            <div className="text-lg font-mono">{formatTime(recordingTime)}</div>
            <div className="text-sm text-gray-500">Recording duration</div>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={sendRecording}
              className="flex-1 bg-blue-500 hover:bg-blue-600"
            >
              Send Voice Message
            </Button>
            <Button
              onClick={deleteRecording}
              variant="outline"
              className="flex-1"
            >
              Record Again
            </Button>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!audioBlob && !isRecording && (
        <div className="text-center text-sm text-gray-500">
          <p>Click the microphone to start recording</p>
          <p>Maximum duration: {formatTime(maxDuration)}</p>
        </div>
      )}
    </Card>
  );
}; 