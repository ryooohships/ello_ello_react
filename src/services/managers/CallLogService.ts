import AsyncStorage from '@react-native-async-storage/async-storage';
import { CallLogEntry } from '../../models/CallLog';

export class CallLogService {
  private static readonly STORAGE_KEY = 'call_history';
  private static readonly MAX_ENTRIES = 1000;

  async addCallEntry(entry: Omit<CallLogEntry, 'id'>): Promise<void> {
    try {
      const history = await this.getRecentCalls();
      const newEntry: CallLogEntry = {
        ...entry,
        id: this.generateId(),
      };

      // Add to beginning of array (most recent first)
      history.unshift(newEntry);

      // Keep only the most recent entries
      const trimmedHistory = history.slice(0, CallLogService.MAX_ENTRIES);

      await AsyncStorage.setItem(CallLogService.STORAGE_KEY, JSON.stringify(trimmedHistory));
    } catch (error) {
      console.error('Failed to add call entry:', error);
      throw error;
    }
  }

  async getRecentCalls(limit?: number): Promise<CallLogEntry[]> {
    try {
      const stored = await AsyncStorage.getItem(CallLogService.STORAGE_KEY);
      if (!stored) {
        return [];
      }

      const history: CallLogEntry[] = JSON.parse(stored);
      
      // Convert timestamp strings back to Date objects
      const processedHistory = history.map(entry => ({
        ...entry,
        timestamp: new Date(entry.timestamp),
      }));

      return limit ? processedHistory.slice(0, limit) : processedHistory;
    } catch (error) {
      console.error('Failed to get call history:', error);
      return [];
    }
  }

  async getCallsByNumber(phoneNumber: string): Promise<CallLogEntry[]> {
    try {
      const allCalls = await this.getRecentCalls();
      return allCalls.filter(call => call.phoneNumber === phoneNumber);
    } catch (error) {
      console.error('Failed to get calls by number:', error);
      return [];
    }
  }

  async deleteCallEntry(id: string): Promise<void> {
    try {
      const history = await this.getRecentCalls();
      const filteredHistory = history.filter(entry => entry.id !== id);
      await AsyncStorage.setItem(CallLogService.STORAGE_KEY, JSON.stringify(filteredHistory));
    } catch (error) {
      console.error('Failed to delete call entry:', error);
      throw error;
    }
  }

  async clearAllHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CallLogService.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear call history:', error);
      throw error;
    }
  }

  async getCallStats(): Promise<{
    totalCalls: number;
    incomingCalls: number;
    outgoingCalls: number;
    missedCalls: number;
    totalDuration: number;
  }> {
    try {
      const history = await this.getRecentCalls();
      
      return {
        totalCalls: history.length,
        incomingCalls: history.filter(call => call.type === 'incoming').length,
        outgoingCalls: history.filter(call => call.type === 'outgoing').length,
        missedCalls: history.filter(call => call.type === 'missed').length,
        totalDuration: history.reduce((sum, call) => sum + call.duration, 0),
      };
    } catch (error) {
      console.error('Failed to get call stats:', error);
      return {
        totalCalls: 0,
        incomingCalls: 0,
        outgoingCalls: 0,
        missedCalls: 0,
        totalDuration: 0,
      };
    }
  }

  private generateId(): string {
    return `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}