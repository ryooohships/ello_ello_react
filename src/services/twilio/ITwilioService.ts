import { Call as TwilioCall, CallInvite } from '@twilio/voice-react-native-sdk';

export interface ITwilioService {
  initialize(): Promise<void>;
  refreshAccessToken(identity?: string): Promise<void>;
  updateAccessToken(token: string): Promise<void>;
  makeCall(phoneNumber: string): Promise<TwilioCall>;
  acceptCall(callInvite: CallInvite): Promise<TwilioCall>;
  rejectCall(callInvite: CallInvite): Promise<void>;
  endCall(): Promise<void>;
  toggleMute(): Promise<boolean>;
  holdCall(): Promise<boolean>;
  sendDigits(digits: string): Promise<void>;
  getCurrentCall(): TwilioCall | null;
  isCallInProgress(): boolean;
  getCallSid(): string | null;
  getCallState(): string | null;
  isCallMuted(): boolean;
  isCallOnHold(): boolean;
  on(event: string, listener: Function): void;
  off(event: string): void;
  getAudioDevices(): Promise<any[]>;
  selectAudioDevice(device: any): Promise<void>;
  getCallStats(): Promise<any>;
  cleanup(): Promise<void>;
}
