import React, { useState } from 'react';
import { useVoiceMessage } from '../../../hooks/useVoiceMessage';
import { Mic, Square, Send, X } from 'lucide-react';

interface VoiceMessageRecorderProps {
  conversationId: number;
  onMessageSent: () => void;
  onCancel: () => void;
}

export const VoiceMessageRecorder: React.FC<VoiceMessageRecorderProps> = ({
  conversationId,
  onMessageSent,
  onCancel,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null);
  
  const {
    startRecording,
    stopRecording,
    sendVoiceMessage,
    formatDuration,
  } = useVoiceMessage();

  const handleStartRecording = async () => {
    const success = await startRecording();
    if (success) {
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Start duration timer
      const interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      setRecordingInterval(interval);
    }
  };

  const handleStopRecording = async () => {
    const voiceData = await stopRecording();
    if (voiceData) {
      const response = await sendVoiceMessage(conversationId, voiceData);
      if (response) {
        onMessageSent();
      }
    }
    
    setIsRecording(false);
    setRecordingDuration(0);
    if (recordingInterval) {
      clearInterval(recordingInterval);
      setRecordingInterval(null);
    }
  };

  const handleCancel = () => {
    if (recordingInterval) {
      clearInterval(recordingInterval);
      setRecordingInterval(null);
    }
    setIsRecording(false);
    setRecordingDuration(0);
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-80 max-w-sm">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">
            {isRecording ? 'Recording Voice Message' : 'Voice Message'}
          </h3>
          
          {isRecording && (
            <div className="mb-4">
              <div className="flex items-center justify-center mb-2">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-red-500 font-medium">
                  {formatDuration(recordingDuration)}
                </span>
              </div>
              
              {/* Waveform visualization */}
              <div className="flex items-center justify-center space-x-1 mb-4">
                {Array.from({ length: 20 }, (_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-red-500 rounded-full animate-pulse"
                    style={{
                      height: `${20 + Math.random() * 30}px`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-center space-x-4">
            {!isRecording ? (
              <>
                <button
                  onClick={handleStartRecording}
                  className="flex items-center justify-center w-12 h-12 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                >
                  <Mic size={20} />
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center justify-center w-12 h-12 bg-gray-300 text-gray-600 rounded-full hover:bg-gray-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleStopRecording}
                  className="flex items-center justify-center w-12 h-12 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <Square size={20} />
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center justify-center w-12 h-12 bg-gray-300 text-gray-600 rounded-full hover:bg-gray-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </>
            )}
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            {isRecording 
              ? 'Tap the square to stop recording' 
              : 'Tap the microphone to start recording'
            }
          </p>
        </div>
      </div>
    </div>
  );
}; 