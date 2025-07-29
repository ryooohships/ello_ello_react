import * as Contacts from 'expo-contacts';
import { PhoneNumberFormatter } from '../../utils/PhoneNumberFormatter';

export interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  displayName: string;
  avatarUri?: string;
}

export class ContactsManager {
  private contacts: Contact[] = [];
  private permissionGranted = false;

  async requestPermission(): Promise<boolean> {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      this.permissionGranted = status === 'granted';
      return this.permissionGranted;
    } catch (error) {
      console.error('Failed to request contacts permission:', error);
      return false;
    }
  }

  async loadContacts(): Promise<Contact[]> {
    if (!this.permissionGranted) {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        throw new Error('Contacts permission not granted');
      }
    }

    try {
      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Image,
        ],
        sort: Contacts.SortTypes.FirstName,
      });

      this.contacts = this.processContacts(data);
      return this.contacts;
    } catch (error) {
      console.error('Failed to load contacts:', error);
      throw error;
    }
  }

  async searchContacts(query: string): Promise<Contact[]> {
    if (!this.contacts.length) {
      await this.loadContacts();
    }

    const lowercaseQuery = query.toLowerCase();
    return this.contacts.filter(contact => 
      contact.name.toLowerCase().includes(lowercaseQuery) ||
      contact.phoneNumber.includes(query) ||
      PhoneNumberFormatter.stripFormatting(contact.phoneNumber).includes(PhoneNumberFormatter.stripFormatting(query))
    );
  }

  async getContactByPhoneNumber(phoneNumber: string): Promise<Contact | null> {
    if (!this.contacts.length) {
      await this.loadContacts();
    }

    const normalizedInput = PhoneNumberFormatter.stripFormatting(phoneNumber);
    
    return this.contacts.find(contact => {
      const normalizedContact = PhoneNumberFormatter.stripFormatting(contact.phoneNumber);
      return normalizedContact === normalizedInput || 
             normalizedContact.endsWith(normalizedInput.slice(-10)) || // Last 10 digits match
             normalizedInput.endsWith(normalizedContact.slice(-10));
    }) || null;
  }

  getLoadedContacts(): Contact[] {
    return this.contacts;
  }

  async refreshContacts(): Promise<Contact[]> {
    this.contacts = [];
    return await this.loadContacts();
  }

  private processContacts(rawContacts: Contacts.Contact[]): Contact[] {
    const processedContacts: Contact[] = [];

    rawContacts.forEach(contact => {
      if (!contact.phoneNumbers || contact.phoneNumbers.length === 0) {
        return; // Skip contacts without phone numbers
      }

      contact.phoneNumbers.forEach(phoneNumber => {
        if (phoneNumber.number) {
          const formattedNumber = PhoneNumberFormatter.formatForDialing(phoneNumber.number);
          const displayName = this.getDisplayName(contact);
          
          processedContacts.push({
            id: `${contact.id}_${phoneNumber.id || Math.random()}`,
            name: displayName,
            phoneNumber: formattedNumber,
            displayName,
            avatarUri: contact.image?.uri,
          });
        }
      });
    });

    // Sort alphabetically
    return processedContacts.sort((a, b) => a.name.localeCompare(b.name));
  }

  private getDisplayName(contact: Contacts.Contact): string {
    if (contact.name) {
      return contact.name;
    }
    
    if (contact.firstName && contact.lastName) {
      return `${contact.firstName} ${contact.lastName}`;
    }
    
    if (contact.firstName) {
      return contact.firstName;
    }
    
    if (contact.lastName) {
      return contact.lastName;
    }
    
    return 'Unknown Contact';
  }
}