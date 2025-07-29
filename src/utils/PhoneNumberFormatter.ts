export class PhoneNumberFormatter {
  static formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Handle different lengths
    if (cleaned.length === 10) {
      // US format: (XXX) XXX-XXXX
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      // US with country code: +1 (XXX) XXX-XXXX
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length > 11) {
      // International format
      return `+${cleaned}`;
    }
    
    // Return as-is if doesn't match expected patterns
    return cleaned;
  }

  static formatForDialing(phoneNumber: string): string {
    // Clean and ensure proper format for dialing
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`;
    }
    
    return `+${cleaned}`;
  }

  static isValidPhoneNumber(phoneNumber: string): boolean {
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // US phone numbers: 10 digits or 11 with country code
    if (cleaned.length === 10) {
      return /^[2-9]\d{2}[2-9]\d{6}$/.test(cleaned);
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return /^1[2-9]\d{2}[2-9]\d{6}$/.test(cleaned);
    }
    
    // International: at least 7 digits, max 15
    return cleaned.length >= 7 && cleaned.length <= 15;
  }

  static extractDigits(input: string): string {
    return input.replace(/\D/g, '');
  }

  static formatAsTyped(input: string): string {
    const digits = this.extractDigits(input);
    
    if (digits.length === 0) return '';
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    if (digits.length <= 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    
    // Handle longer numbers
    return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 11)}`;
  }
}