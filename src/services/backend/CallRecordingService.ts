import AsyncStorage from '@react-native-async-storage/async-storage';
import { HTTPClient } from '../utils/HTTPClient';

// Backend URL - matches the existing elloello-backend
const BACKEND_URL = 'https://elloello-backend.onrender.com';

export interface CallRecording {
  id: string;
  callSid: string; // Twilio call SID
  phoneNumber: string;
  displayName?: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in seconds
  recordingUrl: string; // URL to download/stream recording
  recordingStatus: 'processing' | 'completed' | 'failed';
  isIncoming: boolean;
  fileSize?: number;
  transcription?: string;
}

export class CallRecordingService {
  private httpClient: HTTPClient;
  private recordings: CallRecording[] = [];
  private static readonly CACHE_KEY = 'cached_recordings';

  constructor() {
    this.httpClient = new HTTPClient();
    this.httpClient.setBaseURL(BACKEND_URL);
  }

  async initialize(): Promise<void> {
    try {
      await this.loadCachedRecordings();
    } catch (error) {
      console.error('Failed to initialize CallRecordingService:', error);
    }
  }

  // Enable recording for a call (tells backend to start recording)
  async enableRecordingForCall(callSid: string): Promise<void> {
    try {
      await this.httpClient.post('/api/calls/enable-recording', {
        callSid,
        record: true,
      });
      
      console.log('Recording enabled for call:', callSid);
    } catch (error) {
      console.error('Failed to enable recording:', error);
      throw error;
    }
  }

  // Disable recording for a call
  async disableRecordingForCall(callSid: string): Promise<void> {
    try {
      await this.httpClient.post('/api/calls/disable-recording', {
        callSid,
        record: false,
      });
      
      console.log('Recording disabled for call:', callSid);
    } catch (error) {
      console.error('Failed to disable recording:', error);
      throw error;
    }
  }

  // Fetch call history with recordings (matches backend /users/:identity/calls)
  async fetchRecordings(userIdentity: string, limit: number = 50): Promise<CallRecording[]> {
    try {
      const response = await this.httpClient.get(`/users/${userIdentity}/calls`);
      
      // Filter only calls that have recordings
      const callsWithRecordings = response.calls.filter((call: any) => 
        call.recordingUrl && call.recordingStatus === 'completed'
      );

      const recordings: CallRecording[] = callsWithRecordings.map((call: any) => ({
        id: call._id,
        callSid: call.callSid,
        phoneNumber: call.from === userIdentity ? call.to : call.from,
        displayName: call.displayName,
        startTime: new Date(call.createdAt),
        endTime: new Date(call.completedAt || call.createdAt),
        duration: call.duration || 0,
        recordingUrl: call.recordingUrl,
        recordingStatus: call.recordingStatus,
        isIncoming: call.to === userIdentity,
        fileSize: call.recordingSize,
        transcription: call.transcription,
      }));

      this.recordings = recordings;
      await this.cacheRecordings();
      
      return recordings;
    } catch (error) {
      console.error('Failed to fetch recordings:', error);
      // Return cached recordings if network fails
      return this.recordings;
    }
  }

  // Fetch recordings for specific phone number
  async fetchRecordingsByNumber(phoneNumber: string): Promise<CallRecording[]> {
    try {
      const response = await this.httpClient.get(`/api/recordings/by-number/${encodeURIComponent(phoneNumber)}`);
      
      return response.recordings.map((r: any) => ({
        ...r,
        startTime: new Date(r.startTime),
        endTime: new Date(r.endTime),
      }));
    } catch (error) {
      console.error('Failed to fetch recordings by number:', error);
      // Fallback to cached recordings
      return this.recordings.filter(r => r.phoneNumber === phoneNumber);
    }
  }

  // Get single call with recording details (matches backend /calls/:callSid)
  async getRecording(callSid: string): Promise<CallRecording | null> {
    try {
      const response = await this.httpClient.get(`/calls/${callSid}`);
      const call = response.call;
      
      if (!call.recordingUrl) {
        return null;
      }

      return {
        id: call._id,
        callSid: call.callSid,
        phoneNumber: call.from,
        displayName: call.displayName,
        startTime: new Date(call.createdAt),
        endTime: new Date(call.completedAt || call.createdAt),
        duration: call.duration || 0,
        recordingUrl: call.recordingUrl,
        recordingStatus: call.recordingStatus,
        isIncoming: call.direction === 'inbound',
        fileSize: call.recordingSize,
        transcription: call.transcription,
      };
    } catch (error) {
      console.error('Failed to get recording:', error);
      // Fallback to cached recording
      return this.recordings.find(r => r.callSid === callSid) || null;
    }
  }

  // Delete recording (backend operation)
  async deleteRecording(recordingId: string): Promise<void> {
    try {
      await this.httpClient.delete(`/api/recordings/${recordingId}`);
      
      // Remove from cache
      this.recordings = this.recordings.filter(r => r.id !== recordingId);
      await this.cacheRecordings();
      
      console.log('Recording deleted:', recordingId);
    } catch (error) {
      console.error('Failed to delete recording:', error);
      throw error;
    }
  }

  // Get recording download URL (for offline playback)
  async getRecordingDownloadUrl(recordingId: string): Promise<string | null> {
    try {
      const response = await this.httpClient.get(`/api/recordings/${recordingId}/download-url`);
      return response.downloadUrl;
    } catch (error) {
      console.error('Failed to get download URL:', error);
      return null;
    }
  }

  // Get recording transcription
  async getRecordingTranscription(recordingId: string): Promise<string | null> {
    try {
      const response = await this.httpClient.get(`/api/recordings/${recordingId}/transcription`);
      return response.transcription;
    } catch (error) {
      console.error('Failed to get transcription:', error);
      return null;
    }
  }

  // Check if recording is enabled for user
  async isRecordingEnabled(): Promise<boolean> {
    try {
      const response = await this.httpClient.get('/api/user/recording-settings');
      return response.recordingEnabled || false;
    } catch (error) {
      console.error('Failed to check recording settings:', error);
      return false;
    }
  }

  // Enable/disable recording for user account
  async setRecordingEnabled(enabled: boolean): Promise<void> {
    try {
      await this.httpClient.post('/api/user/recording-settings', {
        recordingEnabled: enabled,
      });
      
      console.log('Recording setting updated:', enabled);
    } catch (error) {
      console.error('Failed to update recording setting:', error);
      throw error;
    }
  }

  // Get cached recordings (for offline access)
  getCachedRecordings(): CallRecording[] {
    return this.recordings;
  }

  // Search recordings
  searchRecordings(query: string): CallRecording[] {
    const lowercaseQuery = query.toLowerCase();
    return this.recordings.filter(recording => 
      recording.displayName?.toLowerCase().includes(lowercaseQuery) ||
      recording.phoneNumber.includes(query) ||
      recording.transcription?.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Get recording statistics
  getRecordingStats(): {
    totalRecordings: number;
    totalDuration: number;
    incomingRecordings: number;
    outgoingRecordings: number;
  } {
    return {
      totalRecordings: this.recordings.length,
      totalDuration: this.recordings.reduce((sum, r) => sum + r.duration, 0),
      incomingRecordings: this.recordings.filter(r => r.isIncoming).length,
      outgoingRecordings: this.recordings.filter(r => !r.isIncoming).length,
    };
  }

  private async loadCachedRecordings(): Promise<void> {
    try {
      const cached = await AsyncStorage.getItem(CallRecordingService.CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        this.recordings = parsed.map((r: any) => ({
          ...r,
          startTime: new Date(r.startTime),
          endTime: new Date(r.endTime),
        }));
      }
    } catch (error) {
      console.error('Failed to load cached recordings:', error);
      this.recordings = [];
    }
  }

  private async cacheRecordings(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        CallRecordingService.CACHE_KEY,
        JSON.stringify(this.recordings)
      );
    } catch (error) {
      console.error('Failed to cache recordings:', error);
    }
  }
}