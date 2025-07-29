import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../resources/theme';

interface ToggleButtonProps {
  activeIcon: string;
  inactiveIcon?: string;
  isActive: boolean;
  activeColor?: string;
  size?: number;
  onPress: () => void;
  style?: ViewStyle;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({
  activeIcon,
  inactiveIcon,
  isActive,
  activeColor = Colors.brandPrimary,
  size = 60,
  onPress,
  style,
}) => {
  const iconName = isActive ? activeIcon : (inactiveIcon || activeIcon);
  const iconColor = isActive ? activeColor : Colors.textSecondary;
  
  // Create proper glow effect with rgba transparency
  const getBackgroundColor = () => {
    if (!isActive) return Colors.darkBackground;
    
    // Convert RGB colors to rgba with 20% opacity
    if (activeColor === Colors.callMuted) {
      return 'rgba(255, 204, 0, 0.2)'; // Yellow with opacity
    } else if (activeColor === Colors.speakerActive || activeColor === Colors.brandPrimary) {
      return 'rgba(123, 97, 255, 0.2)'; // Purple with opacity
    }
    return Colors.darkBackground;
  };
  
  const backgroundColor = getBackgroundColor();
  const borderColor = isActive ? activeColor : 'transparent';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
          borderColor,
          borderWidth: 2, // Always 2px border, but transparent when inactive
        },
        style,
      ]}
      onPress={onPress}
    >
      <Ionicons
        name={iconName as any}
        size={Math.floor(size * 0.47)}
        color={iconColor}
      />
    </TouchableOpacity>
  );
};

// Convenience components matching iOS exactly
export const MuteToggleButton: React.FC<{
  isMuted: boolean;
  onPress: () => void;
}> = ({ isMuted, onPress }) => (
  <ToggleButton
    activeIcon="mic-off"
    inactiveIcon="mic"
    isActive={isMuted}
    activeColor={Colors.brandPrimary}
    onPress={onPress}
  />
);

export const SpeakerToggleButton: React.FC<{
  isSpeakerOn: boolean;
  onPress: () => void;
}> = ({ isSpeakerOn, onPress }) => (
  <ToggleButton
    activeIcon="volume-high"
    inactiveIcon="volume-high-outline"
    isActive={isSpeakerOn}
    activeColor={Colors.speakerActive}
    onPress={onPress}
  />
);

export const TranscriptionToggleButton: React.FC<{
  isActive: boolean;
  onPress: () => void;
}> = ({ isActive, onPress }) => (
  <ToggleButton
    activeIcon="pulse"
    inactiveIcon="pulse-outline"
    isActive={isActive}
    activeColor={Colors.brandPrimary}
    onPress={onPress}
  />
);

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
});

export default ToggleButton;