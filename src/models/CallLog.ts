export interface CallLog {
  id: string;
  phoneNumber: string;
  displayName?: string;
  contactName?: string;
  timestamp: Date;
  duration: number; // in seconds
  isIncoming: boolean;
  isMissed: boolean;
  isAnswered: boolean;
  transcription?: string;
  audioRecordingUrl?: string;
}

export interface CallLogEntry {
  id: string;
  phoneNumber: string;
  displayName?: string;
  timestamp: Date;
  duration: number;
  type: 'incoming' | 'outgoing' | 'missed';
  transcription?: string;
}

export class CallLogService {
  private static readonly CALL_LOG_KEY = 'call_log_history';
  private callHistory: CallLog[] = [];

  async loadCallHistory(): Promise<CallLog[]> {
    // TODO: Load from AsyncStorage
    return this.callHistory;
  }

  async addCallLog(callLog: Omit<CallLog, 'id'>): Promise<void> {
    const newLog: CallLog = {
      ...callLog,
      id: this.generateId(),
    };
    
    this.callHistory.unshift(newLog);
    
    // Keep only last 100 entries
    if (this.callHistory.length > 100) {
      this.callHistory = this.callHistory.slice(0, 100);
    }
    
    // TODO: Save to AsyncStorage
  }

  async getRecentCalls(limit: number = 20): Promise<CallLogEntry[]> {
    const history = await this.loadCallHistory();
    
    return history.slice(0, limit).map(log => ({
      id: log.id,
      phoneNumber: log.phoneNumber,
      displayName: log.displayName || log.contactName,
      timestamp: log.timestamp,
      duration: log.duration,
      type: log.isMissed ? 'missed' : (log.isIncoming ? 'incoming' : 'outgoing'),
      transcription: log.transcription,
    }));
  }

  async clearCallHistory(): Promise<void> {
    this.callHistory = [];
    // TODO: Clear AsyncStorage
  }

  private generateId(): string {
    return `call_log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}