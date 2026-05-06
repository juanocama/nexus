import React, { ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import HeaderMenu from '@/components/HeaderMenu';
import { useTheme } from '@/hooks/useTheme';
import { borderRadius, spacing } from '@/theme/colors';

type TabHeaderProps = {
  children?: ReactNode;
};

export default function TabHeader({ children }: TabHeaderProps) {
  const { colors, typography } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { backgroundColor: colors.primary.default, paddingTop: insets.top + spacing.md, paddingBottom: spacing.md, minHeight: insets.top + 72 }]}>
      <View style={styles.topRow}>
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/icon.png')} style={styles.logo} resizeMode="contain" />
          <Text style={[styles.brandText, { color: colors.primary.contrast, fontSize: typography.sizes.xxl, fontWeight: typography.weights.extrabold, fontFamily: typography.family.bold, letterSpacing: 2 }]}>NEXUS</Text>
        </View>
        <View style={styles.actionsRow}>
          <Link href="/notifications" asChild>
            <TouchableOpacity style={styles.notifButton} activeOpacity={0.7}>
              <Ionicons name="notifications-outline" size={24} color={colors.primary.contrast} />
              <View style={[styles.notifBadge, { backgroundColor: colors.status.error }]}>
                <Text style={[styles.notifBadgeText, { color: colors.primary.contrast, fontSize: 9, fontWeight: typography.weights.bold, fontFamily: typography.family.bold }]}>3</Text>
              </View>
            </TouchableOpacity>
          </Link>
          <HeaderMenu />
        </View>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  brandText: {},
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notifButton: {
    position: 'relative',
    padding: spacing.sm,
  },
  notifBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    borderRadius: borderRadius.full,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifBadgeText: {},
});
