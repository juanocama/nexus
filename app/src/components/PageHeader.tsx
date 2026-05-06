import React, { ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { borderRadius, spacing } from '@/theme/colors';

type PageHeaderProps = {
  title: string;
  rightAction?: ReactNode;
};

export default function PageHeader({ title, rightAction }: PageHeaderProps) {
  const router = useRouter();
  const { colors, typography } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { backgroundColor: colors.primary.default, paddingTop: insets.top + spacing.md, paddingBottom: spacing.md, minHeight: insets.top + 72 }]}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
        <Ionicons name="arrow-back" size={24} color={colors.primary.contrast} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: colors.primary.contrast, fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold }]}>{title}</Text>
      {rightAction ? (
        <View style={styles.rightContainer}>{rightAction}</View>
      ) : (
        <View style={styles.spacer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    minHeight: 96,
  },
  backButton: { padding: spacing.xs },
  headerTitle: {},
  rightContainer: {},
  spacer: { width: 24 },
});
