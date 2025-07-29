import React, { useState, useEffect } from 'react';
import { Modal } from 'react-native';
import { useServices } from '../../services/ServiceProvider';
import ActiveCallView from '../call/ActiveCallView';
import IncomingCallView from '../call/IncomingCallView';
import { Call, CallState } from '../../services/managers/CallManager';

export default function CallOverlay() {
  const [currentCall, setCurrentCall] = useState<Call | null>(null);
  const { callManager } = useServices();

  useEffect(() => {
    const handleCallStateChange = (call: Call | null) => {
      setCurrentCall(call);
    };

    callManager.addStateListener(handleCallStateChange);

    // Get initial call state
    const initialCall = callManager.getCurrentCall();
    if (initialCall) {
      setCurrentCall(initialCall);
    }

    return () => {
      callManager.removeStateListener(handleCallStateChange);
    };
  }, [callManager]);

  const handleEndCall = async () => {
    try {
      await callManager.endCall();
    } catch (error) {
      console.error('Failed to end call:', error);
    }
  };

  const handleAcceptCall = async () => {
    try {
      await callManager.acceptCall();
    } catch (error) {
      console.error('Failed to accept call:', error);
    }
  };

  const handleRejectCall = async () => {
    try {
      await callManager.rejectCall();
    } catch (error) {
      console.error('Failed to reject call:', error);
    }
  };

  const handleToggleMute = () => {
    try {
      callManager.toggleMute();
    } catch (error) {
      console.error('Failed to toggle mute:', error);
    }
  };

  const handleToggleSpeaker = () => {
    try {
      callManager.toggleSpeaker();
    } catch (error) {
      console.error('Failed to toggle speaker:', error);
    }
  };

  // Show modal when there's an active call (not ended/failed)
  const shouldShowModal = currentCall && 
    currentCall.state !== CallState.ENDED && 
    currentCall.state !== CallState.FAILED &&
    currentCall.state !== CallState.IDLE;

  if (!shouldShowModal || !currentCall) {
    return null;
  }

  // Determine which call view to show
  const isIncomingCall = currentCall?.isIncoming && currentCall.state === CallState.RINGING;

  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      {isIncomingCall ? (
        <IncomingCallView
          call={currentCall}
          onAccept={handleAcceptCall}
          onDecline={handleRejectCall}
        />
      ) : (
        <ActiveCallView
          call={currentCall}
          onEndCall={handleEndCall}
          onToggleMute={handleToggleMute}
          onToggleSpeaker={handleToggleSpeaker}
        />
      )}
    </Modal>
  );
}