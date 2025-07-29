import { HTTPClient } from '../utils/HTTPClient';

const BACKEND_URL = 'https://elloello-backend.onrender.com';

export interface VoicemailMessage {
  id: string;
  callSid: string;
  phoneNumber: string;
  displayName?: string;
  timestamp: Date;
  duration: number;
  isRead: boolean;
  transcription?: string;
  audioUrl?: string;
  recordingStatus: 'processing' | 'completed' | 'failed';
}

export interface CallForwardingSettings {
  enabled: boolean;
  forwardToNumber?: string;
  forwardOnBusy: boolean;
  forwardOnNoAnswer: boolean;
  forwardOnUnreachable: boolean;
  noAnswerTimeout: number; // seconds
}

export class VoicemailService {
  private httpClient: HTTPClient;

  constructor() {
    this.httpClient = new HTTPClient(BACKEND_URL);
  }

  async initialize(): Promise<void> {
    console.log('✅ VoicemailService initialized');
  }

  // Fetch voicemails for user
  async fetchVoicemails(userIdentity: string): Promise<VoicemailMessage[]> {
    try {
      const response = await this.httpClient.get(`/users/${userIdentity}/voicemails`);
      
      return response.voicemails.map((vm: any) => ({
        id: vm._id,
        callSid: vm.callSid,
        phoneNumber: vm.from,
        displayName: vm.displayName,
        timestamp: new Date(vm.createdAt),
        duration: vm.duration || 0,
        isRead: vm.isRead || false,
        transcription: vm.transcription,
        audioUrl: vm.recordingUrl,
        recordingStatus: vm.recordingStatus || 'completed',
      }));
    } catch (error) {
      console.error('Failed to fetch voicemails:', error);
      return [];
    }
  }

  // Mark voicemail as read
  async markAsRead(voicemailId: string): Promise<void> {
    try {
      await this.httpClient.put(`/api/voicemails/${voicemailId}/read`, {
        isRead: true,
      });
    } catch (error) {
      console.error('Failed to mark voicemail as read:', error);
      throw error;
    }
  }

  // Delete voicemail
  async deleteVoicemail(voicemailId: string): Promise<void> {
    try {
      await this.httpClient.delete(`/api/voicemails/${voicemailId}`);
    } catch (error) {
      console.error('Failed to delete voicemail:', error);
      throw error;
    }
  }

  // Get voicemail audio URL for playback
  async getVoicemailAudioUrl(voicemailId: string): Promise<string | null> {
    try {
      const response = await this.httpClient.get(`/api/voicemails/${voicemailId}/audio-url`);
      return response.audioUrl;
    } catch (error) {
      console.error('Failed to get voicemail audio URL:', error);
      return null;
    }
  }

  // Call forwarding settings
  async getCallForwardingSettings(userIdentity: string): Promise<CallForwardingSettings> {
    try {
      const response = await this.httpClient.get(`/users/${userIdentity}/call-forwarding`);
      return {
        enabled: response.enabled || false,
        forwardToNumber: response.forwardToNumber,
        forwardOnBusy: response.forwardOnBusy || false,
        forwardOnNoAnswer: response.forwardOnNoAnswer || false,
        forwardOnUnreachable: response.forwardOnUnreachable || false,
        noAnswerTimeout: response.noAnswerTimeout || 30,
      };
    } catch (error) {
      console.error('Failed to get call forwarding settings:', error);
      return {
        enabled: false,
        forwardOnBusy: false,
        forwardOnNoAnswer: false,
        forwardOnUnreachable: false,
        noAnswerTimeout: 30,
      };
    }
  }

  // Update call forwarding settings
  async updateCallForwardingSettings(
    userIdentity: string, 
    settings: CallForwardingSettings
  ): Promise<void> {
    try {
      await this.httpClient.put(`/users/${userIdentity}/call-forwarding`, settings);
      console.log('Call forwarding settings updated');
    } catch (error) {
      console.error('Failed to update call forwarding settings:', error);
      throw error;
    }
  }

  // Setup voicemail greeting
  async uploadVoicemailGreeting(
    userIdentity: string, 
    audioFile: Blob | File
  ): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('greeting', audioFile);
      
      await this.httpClient.post(`/users/${userIdentity}/voicemail-greeting`, formData, {
        'Content-Type': 'multipart/form-data',
      });
      
      console.log('Voicemail greeting uploaded');
    } catch (error) {
      console.error('Failed to upload voicemail greeting:', error);
      throw error;
    }
  }

  // Get current voicemail greeting URL
  async getVoicemailGreetingUrl(userIdentity: string): Promise<string | null> {
    try {
      const response = await this.httpClient.get(`/users/${userIdentity}/voicemail-greeting`);
      return response.greetingUrl;
    } catch (error) {
      console.error('Failed to get voicemail greeting:', error);
      return null;
    }
  }

  // Setup voicemail for user phone number
  async setupVoicemail(userIdentity: string, phoneNumber: string): Promise<void> {
    try {
      await this.httpClient.post(`/users/${userIdentity}/setup-voicemail`, {
        phoneNumber,
      });
      
      console.log('Voicemail setup completed');
    } catch (error) {
      console.error('Failed to setup voicemail:', error);
      throw error;
    }
  }

  // Get voicemail statistics
  getVoicemailStats(voicemails: VoicemailMessage[]): {
    totalVoicemails: number;
    unreadVoicemails: number;
    totalDuration: number;
  } {
    return {
      totalVoicemails: voicemails.length,
      unreadVoicemails: voicemails.filter(vm => !vm.isRead).length,
      totalDuration: voicemails.reduce((sum, vm) => sum + vm.duration, 0),
    };
  }
}