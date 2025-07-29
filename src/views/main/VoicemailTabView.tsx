import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../resources/theme';
import { PhoneNumberFormatter } from '../../utils/PhoneNumberFormatter';
import { useServices } from '../../services/ServiceProvider';
import { VoicemailMessage } from '../../services/backend/VoicemailService';


export default function VoicemailTabView() {
  const [voicemails, setVoicemails] = useState<VoicemailMessage[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { voicemailService, callManager } = useServices();

  useEffect(() => {
    loadVoicemails();
  }, []);

  const loadVoicemails = async () => {
    try {
      // In a real app, you'd get the user identity from authentication
      const userIdentity = '+1234567890'; // Mock user identity
      const fetchedVoicemails = await voicemailService.fetchVoicemails(userIdentity);
      setVoicemails(fetchedVoicemails);
    } catch (error) {
      console.error('Failed to load voicemails:', error);
      Alert.alert('Error', 'Failed to load voicemails. Please try again.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVoicemails();
    setRefreshing(false);
  };

  const markAsRead = async (id: string) => {
    try {
      await voicemailService.markAsRead(id);
      setVoicemails(prevVoicemails =>
        prevVoicemails.map(vm =>
          vm.id === id ? { ...vm, isRead: true } : vm
        )
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const deleteVoicemail = (id: string) => {
    Alert.alert(
      'Delete Voicemail',
      'Are you sure you want to delete this voicemail?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await voicemailService.deleteVoicemail(id);
              setVoicemails(prevVoicemails =>
                prevVoicemails.filter(vm => vm.id !== id)
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to delete voicemail');
            }
          },
        },
      ]
    );
  };

  const playVoicemail = (voicemail: VoicemailMessage) => {
    if (!voicemail.isRead) {
      markAsRead(voicemail.id);
    }
    
    // In real implementation, this would play the audio file
    Alert.alert('Play Voicemail', `Playing voicemail from ${voicemail.displayName || 'Unknown'}`);
  };

  const callBack = async (phoneNumber: string) => {
    try {
      await callManager.initiateCall(phoneNumber);
    } catch (error) {
      Alert.alert('Error', 'Failed to initiate call');
    }
  };

  const formatTime = (timestamp: Date): string => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days === 1) {
      return 'Yesterday';
    } else {
      return timestamp.toLocaleDateString();
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderVoicemailItem = ({ item }: { item: VoicemailMessage }) => (
    <TouchableOpacity 
      style={[styles.voicemailItem, !item.isRead && styles.unreadItem]}
      onPress={() => playVoicemail(item)}
    >
      <View style={styles.voicemailHeader}>
        <View style={styles.contactInfo}>
          <View style={styles.nameContainer}>
            <Text style={[styles.contactName, !item.isRead && styles.unreadText]}>
              {item.displayName || 'Unknown'}
            </Text>
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.phoneNumber}>
            {PhoneNumberFormatter.formatPhoneNumber(item.phoneNumber)}
          </Text>
        </View>
        <View style={styles.metaInfo}>
          <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
          <Text style={styles.duration}>{formatDuration(item.duration)}</Text>
        </View>
      </View>

      {item.transcription && (
        <Text style={styles.transcription} numberOfLines={2}>
          {item.transcription}
        </Text>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => playVoicemail(item)}
        >
          <Ionicons name="play" size={20} color={Colors.brandPrimary} />
          <Text style={styles.actionButtonText}>Play</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => callBack(item.phoneNumber)}
        >
          <Ionicons name="call" size={20} color={Colors.success} />
          <Text style={styles.actionButtonText}>Call Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => deleteVoicemail(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color={Colors.error} />
          <Text style={[styles.actionButtonText, { color: Colors.error }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Voicemail</Text>
        <Text style={styles.unreadCount}>
          {voicemails.filter(vm => !vm.isRead).length} unread
        </Text>
      </View>
      
      <FlatList
        data={voicemails}
        renderItem={renderVoicemailItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.brandPrimary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="recording-outline" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>No voicemails</Text>
            <Text style={styles.emptySubtext}>Your voicemail messages will appear here</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBackground,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textOnDark,
  },
  unreadCount: {
    fontSize: Typography.fontSize.sm,
    color: Colors.brandPrimary,
    fontWeight: Typography.fontWeight.medium,
  },
  listContent: {
    paddingVertical: Spacing.sm,
  },
  voicemailItem: {
    backgroundColor: Colors.cardBackground,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.xs,
    borderRadius: BorderRadius.medium,
    padding: Spacing.md,
  },
  unreadItem: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.brandPrimary,
  },
  voicemailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  contactInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  contactName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textOnDark,
  },
  unreadText: {
    fontWeight: Typography.fontWeight.semibold,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.brandPrimary,
    marginLeft: Spacing.xs,
  },
  phoneNumber: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  metaInfo: {
    alignItems: 'flex-end',
  },
  timestamp: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  duration: {
    fontSize: Typography.fontSize.xs,
    color: Colors.brandPrimary,
    marginTop: 2,
    fontWeight: Typography.fontWeight.medium,
  },
  transcription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.appBackground,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  actionButtonText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.cardBackground,
    marginHorizontal: Spacing.lg,
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