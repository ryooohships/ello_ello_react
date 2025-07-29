import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../../resources/theme';

interface TabBarItemProps {
  isSelected: boolean;
  icon: string;
  label: string;
  onPress: () => void;
}

const TabBarItem: React.FC<TabBarItemProps> = ({ isSelected, icon, label, onPress }) => {
  // Handle icon variations for filled/outlined versions
  const getIconName = (iconName: string, selected: boolean) => {
    if (selected) {
      switch (iconName) {
        case 'recording': return 'recording';
        case 'time': return 'time';
        case 'people': return 'people';
        case 'settings': return 'settings';
        default: return iconName;
      }
    } else {
      switch (iconName) {
        case 'recording': return 'recording-outline';
        case 'time': return 'time-outline';
        case 'people': return 'people-outline';
        case 'settings': return 'settings-outline';
        default: return `${iconName}-outline`;
      }
    }
  };

  return (
    <TouchableOpacity style={styles.tabItem} onPress={onPress}>
      <Ionicons
        name={getIconName(icon, isSelected) as any}
        size={20}
        color={isSelected ? Colors.textOnDark : Colors.textSecondary}
      />
      <Text
        style={[
          styles.tabLabel,
          { color: isSelected ? Colors.textOnDark : Colors.textSecondary }
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

interface CustomTabBarProps {
  selectedTab: number;
  onTabPress: (index: number) => void;
}

const CustomTabBar: React.FC<CustomTabBarProps> = ({ selectedTab, onTabPress }) => {
  return (
    <View style={styles.container}>
      {/* Voicemail Tab */}
      <TabBarItem
        isSelected={selectedTab === 3}
        icon="recording"
        label="Voicemail"
        onPress={() => onTabPress(3)}
      />

      {/* History Tab */}
      <TabBarItem
        isSelected={selectedTab === 1}
        icon="time"
        label="History"
        onPress={() => onTabPress(1)}
      />

      {/* Dialpad Tab (Elevated Center Button) */}
      <View style={styles.centerButtonContainer}>
        <TouchableOpacity
          style={styles.centerButton}
          onPress={() => onTabPress(2)}
        >
          <Ionicons
            name="keypad"
            size={28}
            color={Colors.textOnDark}
          />
        </TouchableOpacity>
      </View>

      {/* Contacts Tab */}
      <TabBarItem
        isSelected={selectedTab === 0}
        icon="people"
        label="Contacts"
        onPress={() => onTabPress(0)}
      />

      {/* Settings Tab */}
      <TabBarItem
        isSelected={selectedTab === 4}
        icon="settings"
        label="Settings"
        onPress={() => onTabPress(4)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.darkBackground,
    paddingTop: 20,
    paddingBottom: Spacing.xl,
    alignItems: 'flex-end',
    height: 90,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  tabLabel: {
    fontSize: Typography.fontSize.xs,
    marginTop: 4,
    fontWeight: Typography.fontWeight.regular,
  },
  centerButtonContainer: {
    flex: 1,
    alignItems: 'center',
    marginBottom: 10, // Lower the dialpad button even more
  },
  centerButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.brandPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.pureBlack,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8, // Android shadow
  },
});

export default CustomTabBar;