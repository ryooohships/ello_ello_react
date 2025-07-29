export enum CallState {
  IDLE = 'idle',
  DIALING = 'dialing',
  RINGING = 'ringing',
  CONNECTED = 'connected',
  MUTED = 'muted',
  ON_HOLD = 'on_hold',
  ENDED = 'ended',
  FAILED = 'failed'
}

export interface Call {
  id: string;
  callSid?: string; // Twilio call SID for backend operations
  phoneNumber: string;
  displayName?: string;
  state: CallState;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  isIncoming: boolean;
  isMuted: boolean;
  isSpeakerOn: boolean;
  isRecording: boolean;
  callInvite?: any; // Twilio CallInvite object for incoming calls
}

export class CallManager {
  private currentCall: Call | null = null;
  private callStateListeners: ((call: Call | null) => void)[] = [];
  private callLogService: any; // Will be injected
  private contactsManager: any; // Will be injected
  private audioManager: any; // Will be injected
  private callRecordingService: any; // Will be injected
  private twilioService: any; // Will be injected

  setCallLogService(callLogService: any) {
    this.callLogService = callLogService;
  }

  setContactsManager(contactsManager: any) {
    this.contactsManager = contactsManager;
  }

  setAudioManager(audioManager: any) {
    this.audioManager = audioManager;
  }

  setCallRecordingService(callRecordingService: any) {
    this.callRecordingService = callRecordingService;
  }

  setTwilioService(twilioService: any) {
    this.twilioService = twilioService;
    this.setupTwilioEventListeners();
  }

  private setupTwilioEventListeners() {
    if (!this.twilioService) return;

    this.twilioService.on('incomingCall', (data: any) => {
      this.handleIncomingTwilioCall(data);
    });

    this.twilioService.on('callConnected', (call: any) => {
      this.handleCallConnected(call);
    });

    this.twilioService.on('callDisconnected', (data: any) => {
      this.handleCallDisconnected(data);
    });

    this.twilioService.on('callRinging', (call: any) => {
      this.handleCallRinging(call);
    });
  }

  private handleIncomingTwilioCall(data: any) {
    this.receiveIncomingCall(data.from, data.displayName).then(() => {
      // Store the CallInvite for accepting/rejecting
      if (this.currentCall) {
        this.currentCall.callInvite = data.callInvite;
      }
    });
  }

  private handleCallConnected(call: any) {
    if (this.currentCall) {
      this.updateCallState(CallState.CONNECTED);
    }
  }

  private handleCallDisconnected(data: any) {
    if (this.currentCall) {
      this.endCall();
    }
  }

  private handleCallRinging(call: any) {
    if (this.currentCall && !this.currentCall.isIncoming) {
      this.updateCallState(CallState.RINGING);
      
      if (this.audioManager) {
        this.audioManager.playOutgoingRingtone();
      }
    }
  }

  async receiveIncomingCall(phoneNumber: string, displayName?: string): Promise<void> {
    if (this.currentCall) {
      // For now, reject the incoming call if we already have one active
      console.log('Rejecting incoming call - another call in progress');
      return;
    }

    // Try to get display name from contacts if not provided
    let resolvedDisplayName = displayName;
    if (!resolvedDisplayName && this.contactsManager) {
      try {
        const contact = await this.contactsManager.getContactByPhoneNumber(phoneNumber);
        resolvedDisplayName = contact?.displayName;
      } catch (error) {
        console.warn('Failed to resolve contact name:', error);
      }
    }

    const call: Call = {
      id: this.generateCallId(),
      phoneNumber,
      displayName: resolvedDisplayName,
      state: CallState.RINGING,
      startTime: new Date(),
      isIncoming: true,
      isMuted: false,
      isSpeakerOn: false,
    };

    this.currentCall = call;
    this.notifyStateChange();

    // Play ringtone for incoming call
    if (this.audioManager) {
      this.audioManager.playRingtone();
    }

    // Auto-reject after 30 seconds if not answered
    setTimeout(() => {
      if (this.currentCall?.id === call.id && this.currentCall.state === CallState.RINGING) {
        this.rejectCall();
      }
    }, 30000);
  }

  async acceptCall(): Promise<void> {
    if (!this.currentCall || !this.currentCall.isIncoming || this.currentCall.state !== CallState.RINGING) {
      throw new Error('No incoming call to accept');
    }

    try {
      // Accept call through Twilio Voice SDK if available
      if (this.twilioService && this.currentCall.callInvite) {
        const twilioCall = await this.twilioService.acceptCall(this.currentCall.callInvite);
        this.currentCall.callSid = this.twilioService.getCallSid();
      }
    } catch (error) {
      console.error('Failed to accept Twilio call:', error);
      throw error;
    }

    this.updateCallState(CallState.CONNECTED);
    
    if (this.audioManager) {
      this.audioManager.stopRingtone();
      this.audioManager.playCallConnectedSound();
    }
  }

  async rejectCall(): Promise<void> {
    if (!this.currentCall || !this.currentCall.isIncoming) {
      throw new Error('No incoming call to reject');
    }

    this.currentCall.endTime = new Date();
    this.currentCall.duration = 0; // Rejected call has 0 duration
    this.updateCallState(CallState.ENDED);

    if (this.audioManager) {
      this.audioManager.stopRingtone();
    }

    // Log as missed call
    if (this.callLogService) {
      try {
        await this.callLogService.addCallEntry({
          phoneNumber: this.currentCall.phoneNumber,
          displayName: this.currentCall.displayName,
          timestamp: this.currentCall.startTime!,
          duration: 0,
          type: 'missed',
        });
      } catch (error) {
        console.error('Failed to log missed call:', error);
      }
    }

    // Clear current call after a brief delay
    setTimeout(() => {
      this.currentCall = null;
      this.notifyStateChange();
    }, 1000);
  }

  async initiateCall(phoneNumber: string, displayName?: string): Promise<void> {
    if (this.currentCall) {
      throw new Error('Another call is already in progress');
    }

    // Try to get display name from contacts if not provided
    let resolvedDisplayName = displayName;
    if (!resolvedDisplayName && this.contactsManager) {
      try {
        const contact = await this.contactsManager.getContactByPhoneNumber(phoneNumber);
        resolvedDisplayName = contact?.displayName;
      } catch (error) {
        console.warn('Failed to resolve contact name:', error);
      }
    }

    const call: Call = {
      id: this.generateCallId(),
      phoneNumber,
      displayName: resolvedDisplayName,
      state: CallState.DIALING,
      startTime: new Date(),
      isIncoming: false,
      isMuted: false,
      isSpeakerOn: false,
      isRecording: false,
    };

    this.currentCall = call;
    this.notifyStateChange();

    try {
      // Use real Twilio Voice SDK
      if (this.twilioService) {
        const twilioCall = await this.twilioService.makeCall(phoneNumber);
        this.currentCall.callSid = this.twilioService.getCallSid();
      } else {
        // Fallback to mock behavior
        this.simulateCall();
      }
    } catch (error) {
      console.error('Failed to initiate call:', error);
      this.updateCallState(CallState.FAILED);
      throw error;
    }

    // Simulate call progression with audio feedback
    setTimeout(() => {
      if (this.currentCall?.id === call.id) {
        this.updateCallState(CallState.RINGING);
        if (this.audioManager) {
          this.audioManager.playRingtone();
        }
      }
    }, 1000);

    setTimeout(() => {
      if (this.currentCall?.id === call.id) {
        this.updateCallState(CallState.CONNECTED);
        if (this.audioManager) {
          this.audioManager.stopRingtone();
          this.audioManager.playCallConnectedSound();
        }
      }
    }, 3000);
  }

  async endCall(): Promise<void> {
    if (!this.currentCall) {
      return;
    }

    this.currentCall.endTime = new Date();
    this.currentCall.duration = this.calculateDuration();
    this.updateCallState(CallState.ENDED);

    // Play call ended sound
    if (this.audioManager) {
      this.audioManager.stopRingtone();
      this.audioManager.playCallEndedSound();
    }

    // Log the call to history
    if (this.callLogService && this.currentCall.state === CallState.ENDED) {
      try {
        await this.callLogService.addCallEntry({
          phoneNumber: this.currentCall.phoneNumber,
          displayName: this.currentCall.displayName,
          timestamp: this.currentCall.startTime!,
          duration: this.currentCall.duration || 0,
          type: this.currentCall.isIncoming ? 'incoming' : 'outgoing',
        });
      } catch (error) {
        console.error('Failed to log call:', error);
      }
    }

    // Clear current call after a brief delay
    setTimeout(() => {
      this.currentCall = null;
      this.notifyStateChange();
    }, 1000);
  }

  async toggleMute(): Promise<void> {
    if (this.currentCall) {
      try {
        // Use Twilio Voice SDK for muting
        if (this.twilioService) {
          const newMutedState = await this.twilioService.toggleMute();
          this.currentCall.isMuted = newMutedState;
        } else {
          this.currentCall.isMuted = !this.currentCall.isMuted;
        }
        
        this.updateCallState(this.currentCall.isMuted ? CallState.MUTED : CallState.CONNECTED);
      } catch (error) {
        console.error('Failed to toggle mute:', error);
      }
    }
  }

  toggleSpeaker(): void {
    if (this.currentCall) {
      this.currentCall.isSpeakerOn = !this.currentCall.isSpeakerOn;
      
      // Update audio routing
      if (this.audioManager) {
        if (this.currentCall.isSpeakerOn) {
          this.audioManager.enableSpeaker();
        } else {
          this.audioManager.disableSpeaker();
        }
      }
      
      this.notifyStateChange();
    }
  }

  getCurrentCall(): Call | null {
    return this.currentCall;
  }

  addStateListener(listener: (call: Call | null) => void): void {
    this.callStateListeners.push(listener);
  }

  removeStateListener(listener: (call: Call | null) => void): void {
    const index = this.callStateListeners.indexOf(listener);
    if (index > -1) {
      this.callStateListeners.splice(index, 1);
    }
  }

  private updateCallState(newState: CallState): void {
    if (this.currentCall) {
      this.currentCall.state = newState;
      this.notifyStateChange();
    }
  }

  private notifyStateChange(): void {
    this.callStateListeners.forEach(listener => {
      listener(this.currentCall);
    });
  }

  private generateCallId(): string {
    return `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateDuration(): number {
    if (!this.currentCall?.startTime) {
      return 0;
    }
    const now = new Date();
    return Math.floor((now.getTime() - this.currentCall.startTime.getTime()) / 1000);
  }

  // Development helper - simulate incoming call
  async simulateIncomingCall(phoneNumber: string = '+1234567890', displayName?: string): Promise<void> {
    const mockDisplayName = displayName || 'John Doe';
    await this.receiveIncomingCall(phoneNumber, mockDisplayName);
  }
}