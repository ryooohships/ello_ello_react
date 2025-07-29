// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface TokenResponse {
  token: string;
  identity: string;
  expiresAt: number;
}

export interface VerificationResponse {
  verificationSid: string;
  status: 'pending' | 'approved' | 'canceled';
}

export interface CallResponse {
  callSid: string;
  status: 'queued' | 'ringing' | 'in-progress' | 'completed' | 'failed';
  duration?: number;
}

// Request Types
export interface TokenRequest {
  identity: string;
  phoneNumber: string;
}

export interface VerificationRequest {
  phoneNumber: string;
  channel: 'sms' | 'call';
}

export interface VerificationCheckRequest {
  phoneNumber: string;
  code: string;
}

export interface CallRequest {
  to: string;
  from: string;
  url?: string;
}

// User Profile Types
export interface UserProfile {
  id: string;
  phoneNumber: string;
  displayName?: string;
  email?: string;
  isVerified: boolean;
  subscriptionStatus: 'active' | 'inactive' | 'trial' | 'expired';
  createdAt: string;
  updatedAt: string;
}

// Subscription Types
export interface Subscription {
  id: string;
  userId: string;
  plan: 'basic' | 'premium';
  status: 'active' | 'canceled' | 'past_due' | 'trial';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

// Usage Statistics
export interface UsageStats {
  userId: string;
  totalCalls: number;
  totalMinutes: number;
  transcriptionsUsed: number;
  recordingsUsed: number;
  periodStart: string;
  periodEnd: string;
}