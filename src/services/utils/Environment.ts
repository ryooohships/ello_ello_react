import Constants from 'expo-constants';

interface EnvironmentConfig {
  backendUrl: string;
  apiVersion: string;
  twilioAccountSid?: string;
  twilioApiKey?: string;
  twilioApiSecret?: string;
  appEnv: 'development' | 'staging' | 'production';
  debugMode: boolean;
}

class Environment {
  private config: EnvironmentConfig;

  constructor() {
    // In Expo, environment variables are accessed through Constants.expoConfig
    const extra = Constants.expoConfig?.extra || {};
    
    this.config = {
      backendUrl: extra.BACKEND_URL || 'http://localhost:3000',
      apiVersion: extra.API_VERSION || 'v1',
      twilioAccountSid: extra.TWILIO_ACCOUNT_SID,
      twilioApiKey: extra.TWILIO_API_KEY,
      twilioApiSecret: extra.TWILIO_API_SECRET,
      appEnv: extra.APP_ENV || 'development',
      debugMode: extra.DEBUG_MODE === 'true' || extra.DEBUG_MODE === true,
    };
  }

  get backendUrl(): string {
    return this.config.backendUrl;
  }

  get apiUrl(): string {
    return `${this.config.backendUrl}/api/${this.config.apiVersion}`;
  }

  get twilioConfig() {
    return {
      accountSid: this.config.twilioAccountSid,
      apiKey: this.config.twilioApiKey,
      apiSecret: this.config.twilioApiSecret,
    };
  }

  get isProduction(): boolean {
    return this.config.appEnv === 'production';
  }

  get isDevelopment(): boolean {
    return this.config.appEnv === 'development';
  }

  get debugMode(): boolean {
    return this.config.debugMode;
  }

  get appEnv(): string {
    return this.config.appEnv;
  }

  // Helper method to log configuration (excluding sensitive data)
  logConfiguration(): void {
    if (this.debugMode) {
      console.log('Environment Configuration:', {
        backendUrl: this.config.backendUrl,
        apiVersion: this.config.apiVersion,
        appEnv: this.config.appEnv,
        debugMode: this.config.debugMode,
        twilioConfigured: !!(this.config.twilioAccountSid && this.config.twilioApiKey),
      });
    }
  }
}

export default new Environment();