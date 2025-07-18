import React, { useRef, useEffect } from 'react';
import { useVideoCall } from '../../../hooks/useVideoCall';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  MonitorOff,
  Users,
  Settings
} from 'lucide-react';

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: string[];
  roomId: string;
  isInitiator: boolean;
}

export const VideoCallModal: React.FC<VideoCallModalProps> = ({
  isOpen,
  onClose,
  participants,
  roomId,
  isInitiator,
}) => {
  const {
    isCallActive,
    isMuted,
    isVideoEnabled,
    isScreenSharing,
    localStream,
    remoteStreams,
    startCall,
    endCall,
    toggleMute,
    toggleVideo,
    toggleScreenSharing,
  } = useVideoCall();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Initialize call when modal opens
  useEffect(() => {
    if (isOpen && !isCallActive) {
      startCall(participants, roomId);
    }
  }, [isOpen, isCallActive, startCall, participants, roomId]);

  // Set up video streams
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStreams.size > 0 && remoteVideoRef.current) {
      const firstRemoteStream = Array.from(remoteStreams.values())[0];
      remoteVideoRef.current.srcObject = firstRemoteStream;
    }
  }, [remoteStreams]);

  const handleEndCall = () => {
    endCall();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Phone className="text-green-500" size={20} />
            <span className="font-semibold">Video Call</span>
            <span className="text-sm text-gray-500">({participants.length} participants)</span>
          </div>
          <button
            onClick={handleEndCall}
            className="p-2 text-gray-500 hover:text-red-500 transition-colors"
          >
            <PhoneOff size={20} />
          </button>
        </div>

        {/* Video Container */}
        <div className="flex-1 relative bg-gray-900">
          {/* Remote Video (Main) */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          
          {/* Local Video (Picture-in-Picture) */}
          <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {!isVideoEnabled && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <VideoOff size={24} className="text-white" />
              </div>
            )}
          </div>

          {/* Participants List */}
          <div className="absolute top-4 left-4 bg-black bg-opacity-50 rounded-lg p-2">
            <div className="flex items-center space-x-1 text-white text-sm">
              <Users size={16} />
              <span>{participants.length} participants</span>
            </div>
          </div>

          {/* Screen Sharing Indicator */}
          {isScreenSharing && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-3 py-1 rounded-full text-sm">
              <Monitor size={16} className="inline mr-1" />
              Screen Sharing
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4 p-4 bg-gray-100">
          {/* Mute/Unmute */}
          <button
            onClick={toggleMute}
            className={`p-3 rounded-full transition-colors ${
              isMuted 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {/* Video On/Off */}
          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full transition-colors ${
              !isVideoEnabled 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
          </button>

          {/* Screen Sharing */}
          <button
            onClick={toggleScreenSharing}
            className={`p-3 rounded-full transition-colors ${
              isScreenSharing 
                ? 'bg-orange-500 text-white hover:bg-orange-600' 
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            {isScreenSharing ? <MonitorOff size={20} /> : <Monitor size={20} />}
          </button>

          {/* Settings */}
          <button className="p-3 bg-gray-300 text-gray-700 hover:bg-gray-400 rounded-full transition-colors">
            <Settings size={20} />
          </button>

          {/* End Call */}
          <button
            onClick={handleEndCall}
            className="p-3 bg-red-500 text-white hover:bg-red-600 rounded-full transition-colors"
          >
            <PhoneOff size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}; 