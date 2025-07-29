import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { HTTPClient } from '../utils/HTTPClient';
import { TWILIO_CONFIG } from '../../config/twilio';

export interface NotificationData {
  type: 'missed_call' | 'incoming_call' | 'voicemail';
  caller?: string;
  timestamp?: string;
  callSid?: string;
}

export class PushNotificationService {
  private httpClient: HTTPClient;
  private deviceToken: string | null = null;
  private isInitialized = false;

  constructor() {
    this.httpClient = new HTTPClient(TWILIO_CONFIG.BACKEND_URL);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Configure notification handling
      await this.configureNotifications();

      // Request permissions
      const hasPermissions = await this.requestPermissions();
      
      if (hasPermissions) {
        // Try to register for push notifications, but don't fail if it doesn't work
        try {
          await this.registerForPushNotifications();
        } catch (tokenError) {
          console.warn('⚠️ Could not get push token, continuing without push notifications:', tokenError);
        }
      }

      this.isInitialized = true;
      console.log('✅ Push notifications initialized');
    } catch (error) {
      console.error('❌ Failed to initialize push notifications:', error);
      // Don't throw - just continue without push notifications
      this.isInitialized = true;
    }
  }

  private async configureNotifications(): Promise<void> {
    // Set notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Configure notification categories for actions
    await Notifications.setNotificationCategoryAsync('MISSED_CALL', [
      {
        identifier: 'CALL_BACK',
        buttonTitle: 'Call Back',
        options: { opensAppToForeground: true },
      },
      {
        identifier: 'DISMISS',
        buttonTitle: 'Dismiss',
        options: { opensAppToForeground: false },
      },
    ]);

    await Notifications.setNotificationCategoryAsync('INCOMING_CALL', [
      {
        identifier: 'ANSWER',
        buttonTitle: 'Answer',
        options: { opensAppToForeground: true },
      },
      {
        identifier: 'DECLINE',
        buttonTitle: 'Decline',
        options: { opensAppToForeground: false },
      },
    ]);
  }

  async requestPermissions(): Promise<boolean> {
    try {
      if (!Device.isDevice) {
        console.warn('⚠️ Push notifications not available on simulator');
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('⚠️ Push notification permissions not granted');
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Failed to request push permissions:', error);
      return false;
    }
  }

  async registerForPushNotifications(): Promise<void> {
    try {
      if (!Device.isDevice) {
        console.warn('⚠️ Cannot register for push notifications on simulator');
        return;
      }

      // Get the Expo push token for regular notifications
      const expoPushToken = await Notifications.getExpoPushTokenAsync({
        projectId: 'b13f5170-c75c-4780-8c59-d20102569283' // Your EAS project ID
      });
      
      this.deviceToken = expoPushToken.data;
      console.log('📱 Expo Push Token:', this.deviceToken);
      
      // Register with backend
      await this.registerDeviceTokenWithBackend();
    } catch (error) {
      console.error('❌ Failed to get push token:', error);
      throw error;
    }
  }

  async registerWithBackend(userIdentity: string): Promise<void> {
    if (!this.deviceToken) {
      console.warn('⚠️ No device token available for backend registration');
      return;
    }

    try {
      await this.httpClient.post(`/users/${userIdentity}/device-token`, {
        deviceToken: this.deviceToken,
        deviceType: Platform.OS,
      });

      console.log('📱 Device token registered with backend');
    } catch (error) {
      console.error('❌ Failed to register device token with backend:', error);
      throw error;
    }
  }

  // Set up notification listeners
  addNotificationListener(handler: (notification: any) => void): () => void {
    const subscription = Notifications.addNotificationReceivedListener(handler);
    return () => subscription.remove();
  }

  addNotificationResponseListener(handler: (response: any) => void): () => void {
    const subscription = Notifications.addNotificationResponseReceivedListener(handler);
    return () => subscription.remove();
  }

  // Handle notification actions
  async handleNotificationAction(action: string, data: NotificationData): Promise<void> {
    switch (action) {
      case 'CALL_BACK':
        if (data.caller) {
          // Trigger callback - you would integrate this with your CallManager
          console.log('📞 Callback requested for:', data.caller);
          // callManager.initiateCall(data.caller);
        }
        break;
      
      case 'ANSWER':
        if (data.callSid) {
          // Accept incoming call
          console.log('📞 Answer requested for call:', data.callSid);
          // callManager.acceptCall();
        }
        break;
      
      case 'DECLINE':
        if (data.callSid) {
          // Decline incoming call
          console.log('📞 Decline requested for call:', data.callSid);
          // callManager.rejectCall();
        }
        break;
      
      case 'DISMISS':
        // Just dismiss notification
        break;
    }
  }

  // Local notification methods (for testing)
  async sendLocalNotification(
    title: string, 
    body: string, 
    data?: NotificationData
  ): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          categoryIdentifier: data?.type === 'missed_call' ? 'MISSED_CALL' : undefined,
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('❌ Failed to send local notification:', error);
    }
  }

  // Simulate missed call notification (for testing)
  async simulateMissedCallNotification(callerNumber: string, callerName?: string): Promise<void> {
    const displayName = callerName || callerNumber;
    await this.sendLocalNotification(
      'Missed Call',
      `Missed call from ${displayName}`,
      {
        type: 'missed_call',
        caller: callerNumber,
        timestamp: new Date().toISOString(),
      }
    );
  }

  // Clear all notifications
  async clearAllNotifications(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
      console.log('🧹 All notifications cleared');
    } catch (error) {
      console.error('❌ Failed to clear notifications:', error);
    }
  }

  // Get notification history
  async getNotificationHistory(userIdentity: string): Promise<any[]> {
    try {
      const response = await this.httpClient.get(`/users/${userIdentity}/notifications`);
      return response.notifications || [];
    } catch (error) {
      console.error('❌ Failed to get notification history:', error);
      return [];
    }
  }

  // Badge management
  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('❌ Failed to set badge count:', error);
    }
  }

  async clearBadge(): Promise<void> {
    await this.setBadgeCount(0);
  }

  // Get current device token
  getDeviceToken(): string | null {
    return this.deviceToken;
  }

  // Check if notifications are enabled
  async areNotificationsEnabled(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('❌ Failed to check notification status:', error);
      return false;
    }
  }
}