import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  RefreshControl,
  Alert,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../resources/theme';
import { useServices } from '../../services/ServiceProvider';
import { Contact } from '../../services/managers/ContactsManager';
import { PhoneNumberFormatter } from '../../utils/PhoneNumberFormatter';

export default function ContactsTabView() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { contactsManager, callManager } = useServices();

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    // Debounce search for better performance
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch(searchQuery);
      } else {
        setFilteredContacts(contacts);
      }
    }, 200); // 200ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, contacts]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const loadedContacts = await contactsManager.loadContacts();
      setContacts(loadedContacts);
      setFilteredContacts(loadedContacts);
    } catch (error) {
      console.error('Failed to load contacts:', error);
      Alert.alert(
        'Permission Required',
        'Please allow access to contacts to view your contact list.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: loadContacts },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const refreshedContacts = await contactsManager.refreshContacts();
      setContacts(refreshedContacts);
    } catch (error) {
      console.error('Failed to refresh contacts:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = (query: string) => {
    console.log('🔍 Search triggered with query:', `"${query}"`);
    console.log('📱 Total contacts:', contacts.length);
    
    if (!query.trim()) {
      console.log('📝 Empty query, showing all contacts');
      setFilteredContacts(contacts);
      return;
    }

    try {
      const lowercaseQuery = query.toLowerCase().trim();
      console.log('🔍 Searching for:', `"${lowercaseQuery}"`);
      
      // Simple search - just names for now
      const results = contacts.filter(contact => {
        if (!contact.name && !contact.displayName) return false;
        
        const name = (contact.name || '').toLowerCase();
        const displayName = (contact.displayName || '').toLowerCase();
        
        return name.includes(lowercaseQuery) || displayName.includes(lowercaseQuery);
      });
      
      console.log('💡 Simple name search results:', results.length);
      
      console.log('🎯 Search results:', results.length);
      
      // Show first few results for debugging
      if (results.length > 0 && results.length < 10) {
        console.log('📋 First few results:');
        results.slice(0, 3).forEach((contact, index) => {
          console.log(`  ${index + 1}. ${contact.displayName || contact.name} - ${contact.phoneNumber}`);
        });
      }
      
      setFilteredContacts(results);
    } catch (error) {
      console.error('Search failed:', error);
      setFilteredContacts([]);
    }
  };

  const handleCall = async (contact: Contact) => {
    try {
      await callManager.initiateCall(contact.phoneNumber, contact.displayName);
    } catch (error) {
      console.error('Failed to initiate call:', error);
      Alert.alert('Call Failed', 'Unable to place call. Please try again.');
    }
  };

  const renderContactItem = ({ item }: { item: Contact }) => (
    <TouchableOpacity style={styles.contactItem} onPress={() => handleCall(item)}>
      <View style={styles.avatarContainer}>
        {item.avatarUri ? (
          <Image source={{ uri: item.avatarUri }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.displayName}</Text>
        <Text style={styles.phoneNumber}>
          {PhoneNumberFormatter.formatPhoneNumber(item.phoneNumber)}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.callButton}
        onPress={() => handleCall(item)}
      >
        <Ionicons name="call" size={20} color={Colors.brandPrimary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderSectionHeader = (letter: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{letter}</Text>
    </View>
  );

  const groupedContacts = filteredContacts.reduce((groups, contact) => {
    const firstLetter = contact.name.charAt(0).toUpperCase();
    if (!groups[firstLetter]) {
      groups[firstLetter] = [];
    }
    groups[firstLetter].push(contact);
    return groups;
  }, {} as Record<string, Contact[]>);

  const sections = Object.keys(groupedContacts)
    .sort()
    .map(letter => ({
      title: letter,
      data: groupedContacts[letter],
    }));

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading contacts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Contacts</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts"
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={(text) => {
              console.log('🔤 Text input changed:', text);
              setSearchQuery(text);
            }}
          />
        </View>
      </View>

      <FlatList
        data={filteredContacts}
        renderItem={renderContactItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.brandPrimary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No contacts found' : 'No contacts available'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Allow contact access to see your contacts'
              }
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.appBackground,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBackground,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textOnDark,
    marginBottom: Spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.medium,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    color: Colors.textOnDark,
  },
  listContent: {
    paddingVertical: Spacing.sm,
  },
  contactItem: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: Spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.brandPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textOnDark,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textOnDark,
  },
  phoneNumber: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  callButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.darkBackground,
  },
  sectionHeaderText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.brandPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Spacing.xxl * 2,
  },
  emptyText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});