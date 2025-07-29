import { Voice, Call as TwilioCall, CallInvite } from '@twilio/voice-react-native-sdk';
import { HTTPClient } from '../utils/HTTPClient';
import { TWILIO_CONFIG } from '../../config/twilio';
import { ITwilioService } from './ITwilioService';

export class TwilioService implements ITwilioService {
  private voice: Voice | null = null;
  private currentCall: TwilioCall | null = null;
  private accessToken: string | null = null;
  private httpClient: HTTPClient;
  private userIdentity: string | null = null;
  private callListeners = new Map<string, Function>();

  constructor() {
    this.httpClient = new HTTPClient(TWILIO_CONFIG.BACKEND_URL);
  }

  async initialize(): Promise<void> {
    try {
      this.voice = new Voice();
      
      this.voice.on(Voice.Event.Registered, () => {
        console.log('✅ Twilio Voice registered');
      });
      
      this.voice.on(Voice.Event.Error, (error: Error) => {
        console.error('❌ Twilio Voice error:', error);
        this.emit('error', error);
      });

      this.voice.on(Voice.Event.CallInvite, (callInvite: CallInvite) => {
        this.handleIncomingCallInvite(callInvite);
      });

      this.voice.on(Voice.Event.CancelledCallInvite, (callInvite: CallInvite) => {
        console.log('📞 Incoming call cancelled from:', callInvite.from);
        this.emit('callCancelled', callInvite);
      });
      
      console.log('✅ TwilioService initialized with real SDK');
    } catch (error) {
      console.error('❌ Failed to initialize Twilio Voice:', error);
      throw error;
    }
  }


  // Get access token from backend
  async refreshAccessToken(identity?: string): Promise<void> {
    try {
      const userIdentity = identity || this.userIdentity || TWILIO_CONFIG.DEFAULT_IDENTITY;
      this.userIdentity = userIdentity;

      // Try to get real token from backend
      try {
        const response = await this.httpClient.post('/twilio/token', {
          identity: userIdentity,
        });
        this.accessToken = response.token;
        console.log('🔐 Got real access token from backend');
      } catch (backendError) {
        console.warn('⚠️ Backend token request failed, using mock token:', backendError);
        this.accessToken = `mock_token_${Date.now()}`;
      }
      
      if (this.voice && this.accessToken) {
        await this.voice.register(this.accessToken);
        console.log('🔐 Twilio Voice registered with access token');
      }
    } catch (error) {
      console.error('❌ Failed to get access token:', error);
      throw error;
    }
  }

  async updateAccessToken(token: string): Promise<void> {
    this.accessToken = token;
    
    if (this.voice) {
      try {
        await this.voice.register(token);
        console.log('🔐 Twilio Voice registered with new token');
      } catch (error) {
        console.error('❌ Failed to register with Twilio:', error);
        throw error;
      }
    }
  }

  async makeCall(phoneNumber: string): Promise<TwilioCall> {
    if (!this.voice || !this.accessToken) {
      throw new Error('Twilio Voice not initialized');
    }

    if (this.currentCall) {
      throw new Error('Another call is already in progress');
    }

    try {
      // Refresh token before making call to ensure it's valid
      await this.refreshAccessToken();

      const connectOptions = {
        params: {
          To: phoneNumber,
          From: this.userIdentity,
        },
      };

      console.log('📞 Making outgoing call to:', phoneNumber);
      this.currentCall = await this.voice.connect(this.accessToken!, connectOptions);
      
      // Set up call event listeners
      this.setupCallEventListeners(this.currentCall);

      return this.currentCall;
    } catch (error) {
      console.error('❌ Failed to make call:', error);
      this.currentCall = null;
      throw error;
    }
  }

  // Handle incoming call invite
  private handleIncomingCallInvite(callInvite: CallInvite): void {
    console.log('📞 Handling incoming call from:', callInvite.from);
    
    this.emit('incomingCall', {
      callInvite,
      from: callInvite.from,
      to: callInvite.to,
      customParameters: callInvite.customParameters,
    });
  }

  // Accept incoming call
  async acceptCall(callInvite: CallInvite): Promise<TwilioCall> {
    try {
      console.log('✅ Accepting incoming call');
      this.currentCall = await callInvite.accept();
      this.setupCallEventListeners(this.currentCall);
      return this.currentCall;
    } catch (error) {
      console.error('❌ Failed to accept call:', error);
      throw error;
    }
  }

  // Reject incoming call
  async rejectCall(callInvite: CallInvite): Promise<void> {
    try {
      console.log('❌ Rejecting incoming call');
      await callInvite.reject();
    } catch (error) {
      console.error('❌ Failed to reject call:', error);
      throw error;
    }
  }

  // Setup call event listeners
  private setupCallEventListeners(call: TwilioCall): void {
    const eventConstants = TwilioCall.Event;
    
    call.on(eventConstants.Connected, () => {
      console.log('✅ Call connected');
      this.emit('callConnected', call);
    });

    call.on(eventConstants.Disconnected, (error: any) => {
      console.log('📞 Call disconnected:', error);
      this.emit('callDisconnected', { call, error });
      this.currentCall = null;
    });

    call.on(eventConstants.ConnectFailure, (error: any) => {
      console.error('❌ Call failed to connect:', error);
      this.emit('callConnectFailure', { call, error });
      this.currentCall = null;
    });

    call.on(eventConstants.Reconnecting, (error: any) => {
      console.log('🔄 Call reconnecting:', error);
      this.emit('callReconnecting', { call, error });
    });

    call.on(eventConstants.Reconnected, () => {
      console.log('✅ Call reconnected');
      this.emit('callReconnected', call);
    });

    call.on(eventConstants.Ringing, () => {
      console.log('📞 Call ringing');
      this.emit('callRinging', call);
    });

    if (eventConstants.QualityWarningsChanged) {
      call.on(eventConstants.QualityWarningsChanged, (warnings: any) => {
        console.log('⚠️ Call quality warnings:', warnings);
        this.emit('callQualityWarnings', { call, warnings });
      });
    }
  }

  async endCall(): Promise<void> {
    if (this.currentCall) {
      try {
        console.log('📞 Ending call');
        await this.currentCall.disconnect();
        this.currentCall = null;
      } catch (error) {
        console.error('❌ Failed to end call:', error);
        throw error;
      }
    }
  }

  async toggleMute(): Promise<boolean> {
    if (this.currentCall) {
      try {
        const isMuted = this.currentCall.isMuted();
        await this.currentCall.mute(!isMuted);
        console.log(`🔇 Call ${!isMuted ? 'muted' : 'unmuted'}`);
        return !isMuted;
      } catch (error) {
        console.error('❌ Failed to toggle mute:', error);
        throw error;
      }
    }
    return false;
  }

  async holdCall(): Promise<boolean> {
    if (this.currentCall) {
      try {
        const isOnHold = this.currentCall.isOnHold();
        await this.currentCall.hold(!isOnHold);
        console.log(`⏸️ Call ${!isOnHold ? 'held' : 'resumed'}`);
        return !isOnHold;
      } catch (error) {
        console.error('❌ Failed to hold call:', error);
        throw error;
      }
    }
    return false;
  }

  // Send DTMF digits during call
  async sendDigits(digits: string): Promise<void> {
    if (this.currentCall) {
      try {
        await this.currentCall.sendDigits(digits);
        console.log('📱 Sent DTMF digits:', digits);
      } catch (error) {
        console.error('❌ Failed to send DTMF digits:', error);
        throw error;
      }
    }
  }

  getCurrentCall(): TwilioCall | null {
    return this.currentCall;
  }

  isCallInProgress(): boolean {
    return this.currentCall !== null;
  }

  getCallSid(): string | null {
    return this.currentCall?.getSid() || null;
  }

  getCallState(): string | null {
    return this.currentCall?.getState() || null;
  }

  isCallMuted(): boolean {
    return this.currentCall?.isMuted() || false;
  }

  isCallOnHold(): boolean {
    return this.currentCall?.isOnHold() || false;
  }

  // Event listener management
  on(event: string, listener: Function): void {
    this.callListeners.set(event, listener);
  }

  off(event: string): void {
    this.callListeners.delete(event);
  }

  private emit(event: string, data?: any): void {
    const listener = this.callListeners.get(event);
    if (listener) {
      listener(data);
    }
  }

  // Audio routing (iOS specific)
  async getAudioDevices(): Promise<any[]> {
    try {
      if (this.voice) {
        return await this.voice.getAudioDevices();
      }
      return [];
    } catch (error) {
      console.error('❌ Failed to get audio devices:', error);
      return [];
    }
  }

  async selectAudioDevice(device: any): Promise<void> {
    try {
      if (this.voice) {
        await this.voice.selectAudioDevice(device);
        console.log('🔊 Selected audio device:', device);
      }
    } catch (error) {
      console.error('❌ Failed to select audio device:', error);
      throw error;
    }
  }

  // Get call statistics
  async getCallStats(): Promise<any> {
    if (this.currentCall) {
      try {
        return await this.currentCall.getStats();
      } catch (error) {
        console.error('❌ Failed to get call stats:', error);
        return null;
      }
    }
    return null;
  }

  async cleanup(): Promise<void> {
    try {
      if (this.currentCall) {
        await this.endCall();
      }

      if (this.voice && this.accessToken) {
        await this.voice.unregister(this.accessToken);
        this.voice = null;
      }

      this.callListeners.clear();
      console.log('🧹 TwilioService cleaned up');
    } catch (error) {
      console.error('❌ Failed to cleanup Twilio Voice:', error);
    }
  }
}