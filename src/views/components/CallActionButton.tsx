import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../resources/theme';

interface CallActionButtonProps {
  iconName: keyof typeof Ionicons.glyphMap;
  label?: string;
  onPress: () => void;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'danger';
  isActive?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export default function CallActionButton({
  iconName,
  label,
  onPress,
  size = 'medium',
  variant = 'secondary',
  isActive = false,
  disabled = false,
  style,
}: CallActionButtonProps) {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { width: 60, height: 60, iconSize: 24 };
      case 'large':
        return { width: 90, height: 90, iconSize: 36 };
      default:
        return { width: 80, height: 80, iconSize: 32 };
    }
  };

  const getVariantStyles = () => {
    if (disabled) {
      return {
        backgroundColor: Colors.cardBackground,
        iconColor: Colors.textSecondary,
      };
    }

    if (isActive) {
      switch (variant) {
        case 'primary':
          return {
            backgroundColor: Colors.brandPrimary,
            iconColor: Colors.buttonText,
          };
        case 'danger':
          return {
            backgroundColor: Colors.callEnd,
            iconColor: Colors.buttonText,
          };
        default:
          return {
            backgroundColor: Colors.darkBackground,
            iconColor: Colors.brandPrimary,
          };
      }
    }

    switch (variant) {
      case 'primary':
        return {
          backgroundColor: Colors.callActive,
          iconColor: Colors.buttonText,
        };
      case 'danger':
        return {
          backgroundColor: Colors.callEnd,
          iconColor: Colors.buttonText,
        };
      default:
        return {
          backgroundColor: Colors.cardBackground,
          iconColor: Colors.textOnDark,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          width: sizeStyles.width,
          height: sizeStyles.height,
          backgroundColor: variantStyles.backgroundColor,
        },
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Ionicons
        name={iconName}
        size={sizeStyles.iconSize}
        color={variantStyles.iconColor}
      />
      {label && (
        <Text style={[styles.label, { color: variantStyles.iconColor }]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: Colors.pureBlack,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  label: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});