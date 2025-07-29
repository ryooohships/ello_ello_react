import { Audio } from 'expo-audio';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CallRecording {
  id: string;
  callId: string;
  phoneNumber: string;
  displayName?: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  filePath: string;
  fileSize: number;
  isIncoming: boolean;
}

export class CallRecorder {
  private currentRecording: Audio.Recording | null = null;
  private isRecording = false;
  private recordingUri: string | null = null;
  private recordings: CallRecording[] = [];
  private static readonly RECORDINGS_KEY = 'call_recordings';

  async initialize(): Promise<void> {
    try {
      // Request recording permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Recording permission not granted');
      }

      // Load existing recordings
      await this.loadRecordings();
    } catch (error) {
      console.error('Failed to initialize CallRecorder:', error);
      throw error;
    }
  }

  async startRecording(callId: string, phoneNumber: string, displayName?: string, isIncoming: boolean = false): Promise<void> {
    if (this.isRecording) {
      console.warn('Recording already in progress');
      return;
    }

    try {
      // Set recording options
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        staysActiveInBackground: true,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: false,
      });

      const recordingOptions = {
        android: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      };

      this.currentRecording = new Audio.Recording();
      await this.currentRecording.prepareToRecordAsync(recordingOptions);
      await this.currentRecording.startAsync();

      this.isRecording = true;
      this.recordingUri = this.currentRecording.getURI();

      console.log('Call recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      this.currentRecording = null;
      this.isRecording = false;
      throw error;
    }
  }

  async stopRecording(callId: string, phoneNumber: string, displayName?: string, isIncoming: boolean = false): Promise<CallRecording | null> {
    if (!this.isRecording || !this.currentRecording) {
      console.warn('No recording in progress');
      return null;
    }

    try {
      await this.currentRecording.stopAndUnloadAsync();
      
      const recordingUri = this.currentRecording.getURI();
      if (!recordingUri) {
        throw new Error('No recording URI available');
      }

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(recordingUri);
      if (!fileInfo.exists) {
        throw new Error('Recording file does not exist');
      }

      // Create permanent file path
      const recordingId = this.generateRecordingId();
      const fileName = `call_${recordingId}.m4a`;
      const permanentUri = `${FileSystem.documentDirectory}recordings/${fileName}`;

      // Ensure recordings directory exists
      const recordingsDir = `${FileSystem.documentDirectory}recordings/`;
      const dirInfo = await FileSystem.getInfoAsync(recordingsDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(recordingsDir, { intermediates: true });
      }

      // Move recording to permanent location
      await FileSystem.moveAsync({
        from: recordingUri,
        to: permanentUri,
      });

      // Create recording metadata
      const recording: CallRecording = {
        id: recordingId,
        callId,
        phoneNumber,
        displayName,
        startTime: new Date(Date.now() - (fileInfo.size / 16000)), // Rough duration estimate
        endTime: new Date(),
        duration: Math.floor(fileInfo.size / 16000), // Rough duration estimate in seconds
        filePath: permanentUri,
        fileSize: fileInfo.size,
        isIncoming,
      };

      // Add to recordings list
      this.recordings.unshift(recording);
      await this.saveRecordings();

      // Reset recording state
      this.currentRecording = null;
      this.isRecording = false;
      this.recordingUri = null;

      console.log('Call recording saved:', recording.id);
      return recording;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      this.currentRecording = null;
      this.isRecording = false;
      this.recordingUri = null;
      return null;
    }
  }

  async getRecordings(): Promise<CallRecording[]> {
    return this.recordings;
  }

  async getRecordingsByNumber(phoneNumber: string): Promise<CallRecording[]> {
    return this.recordings.filter(recording => recording.phoneNumber === phoneNumber);
  }

  async deleteRecording(recordingId: string): Promise<void> {
    try {
      const recording = this.recordings.find(r => r.id === recordingId);
      if (!recording) {
        throw new Error('Recording not found');
      }

      // Delete file
      const fileInfo = await FileSystem.getInfoAsync(recording.filePath);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(recording.filePath);
      }

      // Remove from list
      this.recordings = this.recordings.filter(r => r.id !== recordingId);
      await this.saveRecordings();

      console.log('Recording deleted:', recordingId);
    } catch (error) {
      console.error('Failed to delete recording:', error);
      throw error;
    }
  }

  async playRecording(recordingId: string): Promise<Audio.Sound | null> {
    try {
      const recording = this.recordings.find(r => r.id === recordingId);
      if (!recording) {
        throw new Error('Recording not found');
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: recording.filePath },
        { shouldPlay: true }
      );

      return sound;
    } catch (error) {
      console.error('Failed to play recording:', error);
      return null;
    }
  }

  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  private async loadRecordings(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(CallRecorder.RECORDINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.recordings = parsed.map((r: any) => ({
          ...r,
          startTime: new Date(r.startTime),
          endTime: r.endTime ? new Date(r.endTime) : undefined,
        }));
      }
    } catch (error) {
      console.error('Failed to load recordings:', error);
      this.recordings = [];
    }
  }

  private async saveRecordings(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        CallRecorder.RECORDINGS_KEY,
        JSON.stringify(this.recordings)
      );
    } catch (error) {
      console.error('Failed to save recordings:', error);
    }
  }

  private generateRecordingId(): string {
    return `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async cleanup(): Promise<void> {
    try {
      if (this.isRecording && this.currentRecording) {
        await this.currentRecording.stopAndUnloadAsync();
      }
      this.currentRecording = null;
      this.isRecording = false;
      this.recordingUri = null;
    } catch (error) {
      console.error('Failed to cleanup CallRecorder:', error);
    }
  }
}