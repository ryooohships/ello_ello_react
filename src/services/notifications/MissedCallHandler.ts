import { PushNotificationService } from './PushNotificationService';
import { CallManager } from '../calls/CallManager';

export interface MissedCallInfo {
  from: string;
  displayName?: string;
  timestamp: Date;
  duration: number;
  callSid: string;
}

export class MissedCallHandler {
  private pushService: PushNotificationService;
  private callManager: CallManager;

  constructor(pushService: PushNotificationService, callManager: CallManager) {
    this.pushService = pushService;
    this.callManager = callManager;
  }

  /**
   * Handle a missed call event from Twilio
   * This should be triggered when a call ends without being answered
   */
  async handleMissedCall(callInfo: MissedCallInfo): Promise<void> {
    const displayName = callInfo.displayName || callInfo.from;
    
    // Send local notification immediately
    await this.pushService.sendLocalNotification(
      'Missed Call',
      `Missed call from ${displayName}`,
      {
        type: 'missed_call',
        caller: callInfo.from,
        timestamp: callInfo.timestamp.toISOString(),
        callSid: callInfo.callSid,
      }
    );

    // Update badge count
    const currentBadge = await this.getCurrentBadgeCount();
    await this.pushService.setBadgeCount(currentBadge + 1);

    // Store missed call in local storage for call history
    await this.storeMissedCall(callInfo);
  }

  /**
   * Handle when user taps on a missed call notification
   */
  async handleMissedCallResponse(phoneNumber: string): Promise<void> {
    console.log('📞 User wants to call back:', phoneNumber);
    
    // Clear the notification badge
    await this.pushService.clearBadge();
    
    // Initiate the call
    try {
      await this.callManager.makeCall(phoneNumber);
    } catch (error) {
      console.error('❌ Failed to initiate callback:', error);
      // Show error to user
    }
  }

  /**
   * Clear all missed call notifications
   */
  async clearMissedCalls(): Promise<void> {
    await this.pushService.clearAllNotifications();
    await this.pushService.clearBadge();
  }

  /**
   * Get current badge count from storage
   */
  private async getCurrentBadgeCount(): Promise<number> {
    // In a real app, you'd store this in AsyncStorage or similar
    // For now, return 0
    return 0;
  }

  /**
   * Store missed call info for later retrieval
   */
  private async storeMissedCall(callInfo: MissedCallInfo): Promise<void> {
    // In a real app, store in AsyncStorage or local database
    console.log('📝 Storing missed call:', callInfo);
  }

  /**
   * Integration with Twilio Voice SDK
   * This should be called from your Twilio event handlers
   */
  setupTwilioIntegration(): void {
    // Example: Listen for call events from Twilio
    // This would be integrated with your TwilioService
    
    /*
    twilioService.on('callDidDisconnect', (call) => {
      if (call.state === 'REJECTED' || call.state === 'UNANSWERED') {
        this.handleMissedCall({
          from: call.from,
          displayName: call.fromFormatted,
          timestamp: new Date(),
          duration: 0,
          callSid: call.sid,
        });
      }
    });
    */
  }
}