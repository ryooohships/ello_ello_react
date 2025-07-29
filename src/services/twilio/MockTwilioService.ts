import { Call as TwilioCall, CallInvite } from '@twilio/voice-react-native-sdk';
import { ITwilioService } from './ITwilioService';

// This is a mock implementation of the TwilioService for use in development and testing.
// It simulates the behavior of the real TwilioService without connecting to the Twilio backend.

class MockTwilioCall {
  private muted = false;
  private onHold = false;
  private callSid = `CA${Date.now()}`;

  on(event: string, handler: Function) {}

  disconnect(): Promise<void> {
    console.log('📞 Mock: Call disconnected');
    return Promise.resolve();
  }

  mute(muted: boolean): Promise<void> {
    this.muted = muted;
    console.log(`🔇 Mock: Call ${muted ? 'muted' : 'unmuted'}`);
    return Promise.resolve();
  }

  hold(hold: boolean): Promise<void> {
    this.onHold = hold;
    console.log(`⏸️ Mock: Call ${hold ? 'held' : 'resumed'}`);
    return Promise.resolve();
  }

  sendDigits(digits: string): Promise<void> {
    console.log('📱 Mock: Sent DTMF digits:', digits);
    return Promise.resolve();
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

  getStats(): Promise<any> {
    return Promise.resolve({ audioLevel: -30, jitter: 5, rtt: 120 });
  }
}

class MockCallInvite {
  constructor(public from: string, public to: string, public customParameters: any = {}) {}

  accept(): Promise<TwilioCall> {
    console.log('✅ Mock: Accepting call from', this.from);
    return Promise.resolve(new MockTwilioCall() as unknown as TwilioCall);
  }

  reject(): Promise<void> {
    console.log('❌ Mock: Rejecting call from', this.from);
    return Promise.resolve();
  }
}

export class MockTwilioService implements ITwilioService {
  private currentCall: MockTwilioCall | null = null;
  private callListeners = new Map<string, Function>();

  async initialize(): Promise<void> {
    console.log('✅ MockTwilioService initialized');
  }

  async refreshAccessToken(identity?: string): Promise<void> {
    console.log('🔐 Mock: Refreshed access token');
  }

  async updateAccessToken(token: string): Promise<void> {
    console.log('🔐 Mock: Updated access token');
  }

  async makeCall(phoneNumber: string): Promise<TwilioCall> {
    console.log('📞 Mock: Making outgoing call to:', phoneNumber);
    this.currentCall = new MockTwilioCall();
    return this.currentCall as unknown as TwilioCall;
  }

  async acceptCall(callInvite: CallInvite): Promise<TwilioCall> {
    console.log('✅ Mock: Accepting incoming call');
    this.currentCall = new MockTwilioCall();
    return this.currentCall as unknown as TwilioCall;
  }

  async rejectCall(callInvite: CallInvite): Promise<void> {
    console.log('❌ Mock: Rejecting incoming call');
  }

  async endCall(): Promise<void> {
    console.log('📞 Mock: Ending call');
    this.currentCall = null;
  }

  async toggleMute(): Promise<boolean> {
    if (this.currentCall) {
      const isMuted = this.currentCall.isMuted();
      await this.currentCall.mute(!isMuted);
      return !isMuted;
    }
    return false;
  }

  async holdCall(): Promise<boolean> {
    if (this.currentCall) {
      const isOnHold = this.currentCall.isOnHold();
      await this.currentCall.hold(!isOnHold);
      return !isOnHold;
    }
    return false;
  }

  async sendDigits(digits: string): Promise<void> {
    if (this.currentCall) {
      await this.currentCall.sendDigits(digits);
    }
  }

  getCurrentCall(): TwilioCall | null {
    return this.currentCall as unknown as TwilioCall;
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

  async getAudioDevices(): Promise<any[]> {
    return Promise.resolve([]);
  }

  async selectAudioDevice(device: any): Promise<void> {}

  async getCallStats(): Promise<any> {
    return Promise.resolve(null);
  }

  async cleanup(): Promise<void> {
    console.log('🧹 MockTwilioService cleaned up');
  }
}