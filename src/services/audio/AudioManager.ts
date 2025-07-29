import { Audio } from 'expo-audio';
import * as Haptics from 'expo-haptics';

export class AudioManager {
  private dialtoneSounds: { [key: string]: Audio.Sound } = {};
  private ringtoneSounds: { [key: string]: Audio.Sound } = {};
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Set audio mode for voice calls
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: false,
      });

      // Load common sounds
      await this.loadDialtoneSounds();
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize AudioManager:', error);
      throw error;
    }
  }

  private async loadDialtoneSounds(): Promise<void> {
    const dialtoneMap = {
      '1': 697, '2': 697, '3': 697,
      '4': 770, '5': 770, '6': 770,
      '7': 852, '8': 852, '9': 852,
      '*': 941, '0': 941, '#': 941,
    };

    // In a real app, you'd load actual DTMF sound files
    // For now, we'll create placeholder references
    for (const [digit, frequency] of Object.entries(dialtoneMap)) {
      try {
        // This would load actual sound files in production
        // const { sound } = await Audio.Sound.createAsync(
        //   require(`../../assets/sounds/dtmf_${digit}.mp3`)
        // );
        // this.dialtoneSounds[digit] = sound;
      } catch (error) {
        console.warn(`Failed to load dialtone for ${digit}:`, error);
      }
    }
  }

  async playDialtone(digit: string): Promise<void> {
    try {
      // Haptic feedback for button press
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Play dialtone sound if available
      const sound = this.dialtoneSounds[digit];
      if (sound) {
        await sound.replayAsync();
      }
    } catch (error) {
      console.warn('Failed to play dialtone:', error);
    }
  }

  async playRingtone(): Promise<void> {
    try {
      // In production, load and play ringtone
      // const { sound } = await Audio.Sound.createAsync(
      //   require('../../assets/sounds/ringtone.mp3'),
      //   { shouldPlay: true, isLooping: true }
      // );
      
      // Vibration pattern for incoming call
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.warn('Failed to play ringtone:', error);
    }
  }

  async stopRingtone(): Promise<void> {
    try {
      // Stop all ringtone sounds
      for (const sound of Object.values(this.ringtoneSounds)) {
        await sound.stopAsync();
      }
    } catch (error) {
      console.warn('Failed to stop ringtone:', error);
    }
  }

  async playCallConnectedSound(): Promise<void> {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.warn('Failed to play call connected sound:', error);
    }
  }

  async playCallEndedSound(): Promise<void> {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      console.warn('Failed to play call ended sound:', error);
    }
  }

  async enableSpeaker(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Failed to enable speaker:', error);
    }
  }

  async disableSpeaker(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: true,
      });
    } catch (error) {
      console.error('Failed to disable speaker:', error);
    }
  }

  async cleanup(): Promise<void> {
    try {
      // Unload all sounds
      for (const sound of Object.values(this.dialtoneSounds)) {
        await sound.unloadAsync();
      }
      for (const sound of Object.values(this.ringtoneSounds)) {
        await sound.unloadAsync();
      }

      this.dialtoneSounds = {};
      this.ringtoneSounds = {};
      this.isInitialized = false;
    } catch (error) {
      console.error('Failed to cleanup AudioManager:', error);
    }
  }
}