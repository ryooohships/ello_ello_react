import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, RefreshControl, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../resources/theme';
import { useServices } from '../../services/ServiceProvider';
import { CallLogEntry } from '../../models/CallLog';
import { PhoneNumberFormatter } from '../../utils/PhoneNumberFormatter';

export default function HistoryTabView() {
  const [callHistory, setCallHistory] = useState<CallLogEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const { callLogService, callManager } = useServices();

  useEffect(() => {
    loadCallHistory();
  }, []);

  const loadCallHistory = async () => {
    try {
      const history = await callLogService.getRecentCalls(50);
      setCallHistory(history);
    } catch (error) {
      console.error('Failed to load call history:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCallHistory();
    setRefreshing(false);
  };

  const handleCallBack = async (phoneNumber: string, displayName?: string) => {
    try {
      const formattedNumber = PhoneNumberFormatter.formatForDialing(phoneNumber);
      await callManager.initiateCall(formattedNumber, displayName);
    } catch (error) {
      console.error('Failed to call back:', error);
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
    if (seconds === 0) return 'Missed';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Filter call history based on search text
  const filteredCallHistory = callHistory.filter(call => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      (call.displayName && call.displayName.toLowerCase().includes(searchLower)) ||
      call.phoneNumber.includes(searchText)
    );
  });
  const getCallIcon = (type: CallLogEntry['type']) => {
    switch (type) {
      case 'incoming':
        return <Ionicons name="call-outline" size={20} color={Colors.success} />;
      case 'outgoing':
        return <Ionicons name="call-outline" size={20} color={Colors.brandPrimary} style={{ transform: [{ rotate: '135deg' }] }} />;
      case 'missed':
        return <Ionicons name="call-outline" size={20} color={Colors.error} />;
    }
  };

  const renderCallItem = ({ item }: { item: CallLogEntry }) => (
    <TouchableOpacity 
      style={styles.callItem}
      onPress={() => handleCallBack(item.phoneNumber, item.displayName)}
    >
      <View style={styles.callIcon}>{getCallIcon(item.type)}</View>
      <View style={styles.callInfo}>
        <Text style={styles.contactName}>
          {item.displayName || 'Unknown'}
        </Text>
        <Text style={styles.phoneNumber}>
          {PhoneNumberFormatter.formatPhoneNumber(item.phoneNumber)}
        </Text>
      </View>
      <View style={styles.callMeta}>
        <Text style={styles.callTime}>{formatTime(item.timestamp)}</Text>
        <Text style={styles.callDuration}>{formatDuration(item.duration)}</Text>
      </View>
      <TouchableOpacity 
        style={styles.callBackButton}
        onPress={(e) => {
          e.stopPropagation();
          handleCallBack(item.phoneNumber, item.displayName);
        }}
      >
        <Ionicons name="call" size={20} color={Colors.brandPrimary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
      </View>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search calls"
          placeholderTextColor={Colors.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
      <FlatList
        data={filteredCallHistory}
        renderItem={renderCallItem}
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
            <Ionicons name="call-outline" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>No call history</Text>
            <Text style={styles.emptySubtext}>Your recent calls will appear here</Text>
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
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBackground,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textOnDark,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.medium,
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
  callItem: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  callIcon: {
    marginRight: Spacing.md,
  },
  callInfo: {
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
  callMeta: {
    alignItems: 'flex-end',
  },
  callTime: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  callDuration: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.cardBackground,
    marginLeft: Spacing.lg + 36,
  },
  callBackButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.sm,
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