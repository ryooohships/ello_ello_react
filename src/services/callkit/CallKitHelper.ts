import { Platform } from 'react-native';
import { ContactsManager } from '../managers/ContactsManager';

/**
 * CallKit Helper
 * Ensures proper display of caller information in the native iOS call UI
 * According to Apple guidelines, we should show contact names when available
 */
export class CallKitHelper {
  private contactsManager: ContactsManager;

  constructor(contactsManager: ContactsManager) {
    this.contactsManager = contactsManager;
  }

  /**
   * Format caller info for CallKit display
   * This is used by the Twilio SDK to show proper caller identification
   */
  async formatCallerInfo(phoneNumber: string): Promise<{
    displayName: string;
    handle: string;
  }> {
    if (Platform.OS !== 'ios') {
      return {
        displayName: phoneNumber,
        handle: phoneNumber,
      };
    }

    try {
      // Try to find contact name
      const contact = await this.contactsManager.findContactByPhoneNumber(phoneNumber);
      
      if (contact && contact.name) {
        return {
          displayName: contact.name,
          handle: phoneNumber,
        };
      }
    } catch (error) {
      console.warn('Failed to lookup contact for CallKit:', error);
    }

    // Fallback to formatted phone number
    return {
      displayName: this.formatPhoneNumber(phoneNumber),
      handle: phoneNumber,
    };
  }

  /**
   * Format phone number for display
   * Formats like: +1 (555) 123-4567
   */
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digits
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // US phone number formatting
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned[0] === '1') {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    
    // Return original if can't format
    return phoneNumber;
  }

  /**
   * Check if CallKit is available
   * CallKit is iOS only and requires iOS 10+
   */
  static isCallKitAvailable(): boolean {
    return Platform.OS === 'ios' && parseInt(Platform.Version as string, 10) >= 10;
  }

  /**
   * Handle CallKit configuration updates
   * This can be used to update the display name after app launch
   */
  async updateCallKitConfiguration(appName?: string): Promise<void> {
    if (!CallKitHelper.isCallKitAvailable()) {
      return;
    }

    // The Twilio SDK handles CallKit configuration internally
    // This is here for future customization if needed
    console.log('📱 CallKit configuration updated');
  }
}