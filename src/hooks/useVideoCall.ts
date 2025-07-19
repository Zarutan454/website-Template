import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.utils';

interface VideoCallData {
  roomId: string;
  participants: string[];
  isInitiator: boolean;
}

interface VideoCallState {
  isCallActive: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  participants: string[];
}

export const useVideoCall = () => {
  const [callState, setCallState] = useState<VideoCallState>({
    isCallActive: false,
    isMuted: false,
    isVideoEnabled: true,
    isScreenSharing: false,
    localStream: null,
    remoteStreams: new Map(),
    participants: [],
  });

  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const { user } = useAuth();

  // Initialize local media stream
  const initializeLocalStream = useCallback(async (videoEnabled: boolean = true) => {
    try {
      const constraints = {
        audio: true,
        video: videoEnabled ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        } : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      
      setCallState(prev => ({
        ...prev,
        localStream: stream,
        isVideoEnabled: videoEnabled,
      }));

      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }, []);

  // Create peer connection
  const createPeerConnection = useCallback((participantId: string): RTCPeerConnection => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    // Add local stream tracks to peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStreamRef.current!);
      });
    }

    // Handle incoming remote streams
    peerConnection.ontrack = (event) => {
      setCallState(prev => ({
        ...prev,
        remoteStreams: new Map(prev.remoteStreams.set(participantId, event.streams[0])),
      }));
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Send ICE candidate to signaling server
        // This would be implemented with your WebSocket connection
        console.log('ICE candidate:', event.candidate);
      }
    };

    peerConnectionsRef.current.set(participantId, peerConnection);
    return peerConnection;
  }, []);

  // Start video call
  const startCall = useCallback(async (participants: string[], roomId: string) => {
    try {
      await initializeLocalStream();
      
      setCallState(prev => ({
        ...prev,
        isCallActive: true,
        participants,
      }));

      // Create peer connections for each participant
      participants.forEach(participantId => {
        if (participantId !== user?.id) {
          createPeerConnection(participantId);
        }
      });

      return true;
    } catch (error) {
      console.error('Error starting call:', error);
      return false;
    }
  }, [initializeLocalStream, createPeerConnection, user?.id]);

  // End call
  const endCall = useCallback(() => {
    // Stop all local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    // Stop screen sharing
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }

    // Close all peer connections
    peerConnectionsRef.current.forEach(connection => {
      connection.close();
    });
    peerConnectionsRef.current.clear();

    setCallState({
      isCallActive: false,
      isMuted: false,
      isVideoEnabled: true,
      isScreenSharing: false,
      localStream: null,
      remoteStreams: new Map(),
      participants: [],
    });
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setCallState(prev => ({
          ...prev,
          isMuted: !audioTrack.enabled,
        }));
      }
    }
  }, []);

  // Toggle video
  const toggleVideo = useCallback(async () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCallState(prev => ({
          ...prev,
          isVideoEnabled: videoTrack.enabled,
        }));
      }
    }
  }, []);

  // Toggle screen sharing
  const toggleScreenSharing = useCallback(async () => {
    try {
      if (!callState.isScreenSharing) {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });

        screenStreamRef.current = screenStream;

        // Replace video track in all peer connections
        const screenVideoTrack = screenStream.getVideoTracks()[0];
        peerConnectionsRef.current.forEach(connection => {
          const sender = connection.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenVideoTrack);
          }
        });

        setCallState(prev => ({
          ...prev,
          isScreenSharing: true,
        }));
      } else {
        // Stop screen sharing
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach(track => track.stop());
          screenStreamRef.current = null;
        }

        // Restore camera video track
        if (localStreamRef.current) {
          const cameraVideoTrack = localStreamRef.current.getVideoTracks()[0];
          peerConnectionsRef.current.forEach(connection => {
            const sender = connection.getSenders().find(s => s.track?.kind === 'video');
            if (sender && cameraVideoTrack) {
              sender.replaceTrack(cameraVideoTrack);
            }
          });
        }

        setCallState(prev => ({
          ...prev,
          isScreenSharing: false,
        }));
      }
    } catch (error) {
      console.error('Error toggling screen sharing:', error);
    }
  }, [callState.isScreenSharing]);

  // Handle incoming call
  const handleIncomingCall = useCallback(async (callData: VideoCallData) => {
    try {
      await initializeLocalStream();
      
      setCallState(prev => ({
        ...prev,
        isCallActive: true,
        participants: callData.participants,
      }));

      // Create peer connections for other participants
      callData.participants.forEach(participantId => {
        if (participantId !== user?.id) {
          createPeerConnection(participantId);
        }
      });

      return true;
    } catch (error) {
      console.error('Error handling incoming call:', error);
      return false;
    }
  }, [initializeLocalStream, createPeerConnection, user?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

  return {
    ...callState,
    startCall,
    endCall,
    toggleMute,
    toggleVideo,
    toggleScreenSharing,
    handleIncomingCall,
  };
}; 