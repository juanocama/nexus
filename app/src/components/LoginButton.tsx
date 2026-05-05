import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { colors, borderRadius, typography, spacing } from '@/theme/colors';

interface LoginButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'microsoft' | 'outline';
  style?: ViewStyle;
}

export const LoginButton: React.FC<LoginButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
}) => {
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'microsoft':
        return {
          backgroundColor: colors.microsoft.blue,
          borderColor: colors.microsoft.blue,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: colors.border.default,
          borderWidth: 1,
        };
      default:
        return {
          backgroundColor: colors.secondary.default,
          borderColor: colors.secondary.default,
        };
    }
  };

  const getTextColor = (): string => {
    return variant === 'outline'
      ? colors.text.primary
      : colors.primary.contrast;
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getVariantStyles(),
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={getTextColor()}
          size="small"
        />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    fontFamily: typography.family.semibold,
  },
  disabled: {
    opacity: 0.5,
  },
});
