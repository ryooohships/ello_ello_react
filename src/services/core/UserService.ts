import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserSettings {
  phoneNumber?: string;
  displayName?: string;
  isVerified: boolean;
  subscriptionActive: boolean;
}

export class UserService {
  private static readonly USER_SETTINGS_KEY = 'user_settings';
  private userSettings: UserSettings | null = null;

  async loadUserSettings(): Promise<UserSettings> {
    if (this.userSettings) {
      return this.userSettings;
    }

    try {
      const stored = await AsyncStorage.getItem(UserService.USER_SETTINGS_KEY);
      if (stored) {
        this.userSettings = JSON.parse(stored);
      } else {
        this.userSettings = {
          isVerified: false,
          subscriptionActive: false,
        };
      }
      return this.userSettings;
    } catch (error) {
      console.error('Failed to load user settings:', error);
      return {
        isVerified: false,
        subscriptionActive: false,
      };
    }
  }

  async saveUserSettings(settings: Partial<UserSettings>): Promise<void> {
    try {
      const current = await this.loadUserSettings();
      this.userSettings = { ...current, ...settings };
      await AsyncStorage.setItem(
        UserService.USER_SETTINGS_KEY,
        JSON.stringify(this.userSettings)
      );
    } catch (error) {
      console.error('Failed to save user settings:', error);
      throw error;
    }
  }

  async getUserSettings(): Promise<UserSettings> {
    return this.loadUserSettings();
  }

  async clearUserSettings(): Promise<void> {
    try {
      await AsyncStorage.removeItem(UserService.USER_SETTINGS_KEY);
      this.userSettings = null;
    } catch (error) {
      console.error('Failed to clear user settings:', error);
      throw error;
    }
  }
}