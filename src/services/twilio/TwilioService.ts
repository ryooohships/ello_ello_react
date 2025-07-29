// import { Voice, Call as TwilioCall, CallInvite } from '@twilio/voice-react-native-sdk';
import { HTTPClient } from '../utils/HTTPClient';

const BACKEND_URL = 'https://elloello-backend.onrender.com';

// Mock interfaces for Expo Go development
interface Voice {
  on: (event: string, handler: (data?: any) => void) => void;
  register: (token: string) => Promise<void>;
  connect: (token: string, options: any) => Promise<TwilioCall>;
  unregister: (token: string) => Promise<void>;
  getAudioDevices: () => Promise<any[]>;
  selectAudioDevice: (device: any) => Promise<void>;
}

interface TwilioCall {
  on: (event: string, handler: (data?: any) => void) => void;
  disconnect: () => Promise<void>;
  mute: (muted: boolean) => Promise<void>;
  hold: (hold: boolean) => Promise<void>;
  sendDigits: (digits: string) => Promise<void>;
  isMuted: () => boolean;
  isOnHold: () => boolean;
  getSid: () => string;
  getState: () => string;
  getStats: () => Promise<any>;
}

interface CallInvite {
  from: string;
  to: string;
  customParameters: any;
  accept: () => Promise<TwilioCall>;
  reject: () => Promise<void>;
}

// Mock implementations for Expo Go
class MockVoice implements Voice {
  static Event = {
    Registered: 'registered',
    Error: 'error',
    CallInvite: 'callInvite',
    CancelledCallInvite: 'cancelledCallInvite',
  };

  private listeners = new Map<string, Function>();

  on(event: string, handler: Function) {
    this.listeners.set(event, handler);
  }

  async register(token: string): Promise<void> {
    console.log('🔐 Mock: Twilio Voice registered');
    setTimeout(() => this.emit('registered'), 1000);
  }

  async connect(token: string, options: any): Promise<TwilioCall> {
    console.log('📞 Mock: Making call to', options.params.To);
    const call = new MockTwilioCall();
    setTimeout(() => call.emit('ringing'), 1000);
    setTimeout(() => call.emit('connected'), 3000);
    return call;
  }

  async unregister(token: string): Promise<void> {
    console.log('🔐 Mock: Twilio Voice unregistered');
  }

  async getAudioDevices(): Promise<any[]> {
    return [{ name: 'iPhone', type: 'builtin' }, { name: 'Speaker', type: 'speaker' }];
  }

  async selectAudioDevice(device: any): Promise<void> {
    console.log('🔊 Mock: Selected audio device:', device.name);
  }

  private emit(event: string, data?: any) {
    const handler = this.listeners.get(event);
    if (handler) handler(data);
  }
}

class MockTwilioCall implements TwilioCall {
  static Event = {
    Connected: 'connected',
    Disconnected: 'disconnected',
    ConnectFailure: 'connectFailure',
    Reconnecting: 'reconnecting',
    Reconnected: 'reconnected',
    Ringing: 'ringing',
    QualityWarningsChanged: 'qualityWarningsChanged',
  };

  private listeners = new Map<string, Function>();
  private muted = false;
  private onHold = false;
  private callSid = `CA${Date.now()}`;

  on(event: string, handler: Function) {
    this.listeners.set(event, handler);
  }

  async disconnect(): Promise<void> {
    console.log('📞 Mock: Call disconnected');
    this.emit('disconnected');
  }

  async mute(muted: boolean): Promise<void> {
    this.muted = muted;
    console.log(`🔇 Mock: Call ${muted ? 'muted' : 'unmuted'}`);
  }

  async hold(hold: boolean): Promise<void> {
    this.onHold = hold;
    console.log(`⏸️ Mock: Call ${hold ? 'held' : 'resumed'}`);
  }

  async sendDigits(digits: string): Promise<void> {
    console.log('📱 Mock: Sent DTMF digits:', digits);
  }

  isMuted(): boolean {
    return this.muted;
  }

  isOnHold(): boolean {
    return this.onHold;
  }

  getSid(): string {
    return this.callSid;
  }

  getState(): string {
    return 'connected';
  }

  async getStats(): Promise<any> {
    return { audioLevel: -30, jitter: 5, rtt: 120 };
  }

  emit(event: string, data?: any) {
    const handler = this.listeners.get(event);
    if (handler) handler(data);
  }
}

class MockCallInvite implements CallInvite {
  constructor(public from: string, public to: string, public customParameters: any = {}) {}

  async accept(): Promise<TwilioCall> {
    console.log('✅ Mock: Accepting call from', this.from);
    const call = new MockTwilioCall();
    setTimeout(() => call.emit('connected'), 1000);
    return call;
  }

  async reject(): Promise<void> {
    console.log('❌ Mock: Rejecting call from', this.from);
  }
}

// Use mock for Expo Go, real SDK for development build
const Voice = MockVoice;
const TwilioCall = MockTwilioCall;  
const CallInvite = MockCallInvite;

export class TwilioService {
  private voice: Voice | null = null;
  private currentCall: TwilioCall | null = null;
  private accessToken: string | null = null;
  private httpClient: HTTPClient;
  private userIdentity: string | null = null;
  private callListeners = new Map<string, Function>();

  constructor() {
    this.httpClient = new HTTPClient();
    this.httpClient.setBaseURL(BACKEND_URL);
  }

  async initialize(): Promise<void> {
    try {
      // Initialize Voice SDK
      this.voice = new Voice();
      
      // Set up core Voice event listeners
      this.voice.on(Voice.Event.Registered, () => {
        console.log('✅ Twilio Voice registered successfully');
      });

      this.voice.on(Voice.Event.Error, (error) => {
        console.error('❌ Twilio Voice error:', error);
        this.emit('error', error);
      });

      this.voice.on(Voice.Event.CallInvite, (callInvite: CallInvite) => {
        console.log('📞 Incoming call invite:', callInvite);
        this.handleIncomingCallInvite(callInvite);
      });

      this.voice.on(Voice.Event.CancelledCallInvite, (cancelledCallInvite) => {
        console.log('📞 Call invite cancelled:', cancelledCallInvite);
        this.emit('callInviteCancelled', cancelledCallInvite);
      });

      // Get initial access token from backend
      await this.refreshAccessToken();

      console.log('✅ TwilioService initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Twilio Voice:', error);
      throw error;
    }
  }

  // Get access token from backend
  async refreshAccessToken(identity?: string): Promise<void> {
    try {
      const userIdentity = identity || this.userIdentity || '+1234567890'; // Mock identity
      this.userIdentity = userIdentity;

      const response = await this.httpClient.post('/twilio/token', {
        identity: userIdentity,
      });

      this.accessToken = response.token;
      
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
    call.on(TwilioCall.Event.Connected, () => {
      console.log('✅ Call connected');
      this.emit('callConnected', call);
    });

    call.on(TwilioCall.Event.Disconnected, (error) => {
      console.log('📞 Call disconnected:', error);
      this.emit('callDisconnected', { call, error });
      this.currentCall = null;
    });

    call.on(TwilioCall.Event.ConnectFailure, (error) => {
      console.error('❌ Call failed to connect:', error);
      this.emit('callConnectFailure', { call, error });
      this.currentCall = null;
    });

    call.on(TwilioCall.Event.Reconnecting, (error) => {
      console.log('🔄 Call reconnecting:', error);
      this.emit('callReconnecting', { call, error });
    });

    call.on(TwilioCall.Event.Reconnected, () => {
      console.log('✅ Call reconnected');
      this.emit('callReconnected', call);
    });

    call.on(TwilioCall.Event.Ringing, () => {
      console.log('📞 Call ringing');
      this.emit('callRinging', call);
    });

    call.on(TwilioCall.Event.QualityWarningsChanged, (warnings) => {
      console.log('⚠️ Call quality warnings:', warnings);
      this.emit('callQualityWarnings', { call, warnings });
    });
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