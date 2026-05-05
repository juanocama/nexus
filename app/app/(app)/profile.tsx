import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { colors, borderRadius, typography, spacing, shadow } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import HeaderMenu from '@/components/HeaderMenu';

export default function ProfileScreen() {
  const router = useRouter();

  const mockUser = {
    name: 'Estudiante Unisabana',
    email: 'estudiante@unisabana.edu.co',
    faculty: 'Ingeniería',
    phone: '+57 300 123 4567',
    rating: 4.8,
    trips: 12,
    sabana_coins: 150,
    member_since: '2024',
  };

  const displayName = mockUser.name.split(' ')[0];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarText}>{mockUser.name.charAt(0)}</Text>
          </View>
          <Text style={styles.headerBrand}>NEXUS</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Ionicons name="notifications-outline" size={24} color={colors.primary.contrast} />
            <View style={styles.badge} />
          </TouchableOpacity>
          <HeaderMenu />
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <Text style={styles.greeting}>Hola, {displayName}!</Text>
          <View style={styles.avatar}>
            <Text style={styles.avatarTextLarge}>{mockUser.name.charAt(0)}</Text>
          </View>
          <Text style={styles.userName}>{mockUser.name}</Text>
          <Text style={styles.userFaculty}>{mockUser.faculty}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={18} color="#F59E0B" />
              <Text style={styles.statValue}>{mockUser.rating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="car-sport-outline" size={18} color={colors.secondary.default} />
              <Text style={styles.statValue}>{mockUser.trips}</Text>
              <Text style={styles.statLabel}>Viajes</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="trophy-outline" size={18} color="#F59E0B" />
              <Text style={styles.statValue}>{mockUser.sabana_coins}</Text>
              <Text style={styles.statLabel}>Coins</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color={colors.secondary.default} />
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{mockUser.email}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color={colors.secondary.default} />
              <Text style={styles.infoLabel}>Teléfono</Text>
              <Text style={styles.infoValue}>{mockUser.phone}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Ionicons name="business-outline" size={20} color={colors.secondary.default} />
              <Text style={styles.infoLabel}>Facultad</Text>
              <Text style={styles.infoValue}>{mockUser.faculty}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color={colors.secondary.default} />
              <Text style={styles.infoLabel}>Miembro desde</Text>
              <Text style={styles.infoValue}>{mockUser.member_since}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Opciones</Text>
          <View style={styles.card}>
            <Link href="/(app)/bookings" asChild>
              <TouchableOpacity style={styles.optionRow}>
                <View style={styles.optionLeft}>
                  <Ionicons name="car-outline" size={20} color={colors.secondary.default} />
                  <Text style={styles.optionText}>Mis Viajes</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
              </TouchableOpacity>
            </Link>
            <View style={styles.optionDivider} />
            <Link href="/(app)/payments" asChild>
              <TouchableOpacity style={styles.optionRow}>
                <View style={styles.optionLeft}>
                  <Ionicons name="card-outline" size={20} color={colors.secondary.default} />
                  <Text style={styles.optionText}>Métodos de Pago</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
              </TouchableOpacity>
            </Link>
            <View style={styles.optionDivider} />
            <Link href="/(app)/notifications" asChild>
              <TouchableOpacity style={styles.optionRow}>
                <View style={styles.optionLeft}>
                  <Ionicons name="notifications-outline" size={20} color={colors.secondary.default} />
                  <Text style={styles.optionText}>Notificaciones</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
              </TouchableOpacity>
            </Link>
            <View style={styles.optionDivider} />
            <Link href="/(app)/help" asChild>
              <TouchableOpacity style={styles.optionRow}>
                <View style={styles.optionLeft}>
                  <Ionicons name="help-circle-outline" size={20} color={colors.secondary.default} />
                  <Text style={styles.optionText}>Centro de Ayuda</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
              </TouchableOpacity>
            </Link>
            <View style={styles.optionDivider} />
            <Link href="/(app)/settings" asChild>
              <TouchableOpacity style={styles.optionRow}>
                <View style={styles.optionLeft}>
                  <Ionicons name="settings-outline" size={20} color={colors.secondary.default} />
                  <Text style={styles.optionText}>Configuración</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={20} color={colors.status.error} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary.default,
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + spacing.md : spacing.md,
    paddingBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerBrand: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.primary.contrast,
    fontFamily: typography.family.bold,
    letterSpacing: 2,
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondary.default,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.primary.contrast,
    fontFamily: typography.family.bold,
  },
  avatarTextLarge: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colors.primary.contrast,
    fontFamily: typography.family.bold,
  },
  headerIconBtn: {
    padding: spacing.sm,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.status.error,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    backgroundColor: colors.background.card,
    paddingBottom: spacing.lg,
    marginBottom: spacing.md,
  },
  greeting: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    fontFamily: typography.family.semibold,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondary.default,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  userName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    fontFamily: typography.family.bold,
  },
  userFaculty: {
    fontSize: typography.sizes.md,
    color: colors.text.muted,
    marginBottom: spacing.lg,
    fontFamily: typography.family.regular,
  },
  statsRow: {
    flexDirection: 'row',
    width: '80%',
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: spacing.xs,
    fontFamily: typography.family.bold,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    fontFamily: typography.family.regular,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border.default,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    fontFamily: typography.family.bold,
  },
  card: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    ...shadow.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  infoLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    marginLeft: spacing.md,
    width: 70,
    fontFamily: typography.family.regular,
  },
  infoValue: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    flex: 1,
    fontFamily: typography.family.medium,
  },
  infoDivider: {
    height: 1,
    backgroundColor: colors.border.default,
    marginHorizontal: spacing.md,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    marginLeft: spacing.md,
    fontFamily: typography.family.medium,
  },
  optionDivider: {
    height: 1,
    backgroundColor: colors.border.default,
    marginHorizontal: spacing.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.error,
  },
  logoutText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.status.error,
    marginLeft: spacing.sm,
    fontFamily: typography.family.semibold,
  },
});
