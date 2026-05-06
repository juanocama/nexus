import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { borderRadius, spacing, shadow } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import TabHeader from '@/components/TabHeader';
import { useTheme } from '@/hooks/useTheme';

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, typography } = useTheme();

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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      <TabHeader />

      <ScrollView style={styles.content}>
        <View style={[styles.profileSection, { backgroundColor: colors.background.card }]}>
          <Text style={[styles.greeting, { fontSize: typography.sizes.xl, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold, color: colors.text.primary }]}>Hola, {displayName}!</Text>
          <View style={[styles.avatar, { backgroundColor: colors.secondary.default }]}>
            <Text style={[styles.avatarTextLarge, { fontSize: typography.sizes.xxxl, fontWeight: typography.weights.bold, fontFamily: typography.family.bold, color: colors.primary.contrast }]}>{mockUser.name.charAt(0)}</Text>
          </View>
          <Text style={[styles.userName, { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, fontFamily: typography.family.bold, color: colors.text.primary }]}>{mockUser.name}</Text>
          <Text style={[styles.userFaculty, { fontSize: typography.sizes.md, fontFamily: typography.family.regular, color: colors.text.muted }]}>{mockUser.faculty}</Text>
          <View style={[styles.statsRow, { backgroundColor: colors.background.default, borderRadius: borderRadius.lg }]}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={18} color="#F59E0B" />
              <Text style={[styles.statValue, { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, fontFamily: typography.family.bold, color: colors.text.primary }]}>{mockUser.rating}</Text>
              <Text style={[styles.statLabel, { fontSize: typography.sizes.xs, fontFamily: typography.family.regular, color: colors.text.muted }]}>Rating</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border.default }]} />
            <View style={styles.statItem}>
              <Ionicons name="car-sport-outline" size={18} color={colors.secondary.default} />
              <Text style={[styles.statValue, { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, fontFamily: typography.family.bold, color: colors.text.primary }]}>{mockUser.trips}</Text>
              <Text style={[styles.statLabel, { fontSize: typography.sizes.xs, fontFamily: typography.family.regular, color: colors.text.muted }]}>Viajes</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border.default }]} />
            <View style={styles.statItem}>
              <Ionicons name="trophy-outline" size={18} color="#F59E0B" />
              <Text style={[styles.statValue, { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, fontFamily: typography.family.bold, color: colors.text.primary }]}>{mockUser.sabana_coins}</Text>
              <Text style={[styles.statLabel, { fontSize: typography.sizes.xs, fontFamily: typography.family.regular, color: colors.text.muted }]}>Coins</Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
          <Text style={[styles.sectionTitle, { fontSize: typography.sizes.md, fontWeight: typography.weights.bold, fontFamily: typography.family.bold, color: colors.text.primary }]}>Información Personal</Text>
          <View style={[styles.card, { backgroundColor: colors.background.card, ...shadow.sm }]}>
            <View style={[styles.infoRow, { paddingHorizontal: spacing.md, paddingVertical: spacing.md }]}>
              <Ionicons name="mail-outline" size={20} color={colors.secondary.default} />
              <Text style={[styles.infoLabel, { fontSize: typography.sizes.sm, fontFamily: typography.family.regular, color: colors.text.muted }]}>Email</Text>
              <Text style={[styles.infoValue, { fontSize: typography.sizes.sm, fontFamily: typography.family.medium, color: colors.text.primary }]}>{mockUser.email}</Text>
            </View>
            <View style={[styles.infoDivider, { backgroundColor: colors.border.default, marginHorizontal: spacing.md }]} />
            <View style={[styles.infoRow, { paddingHorizontal: spacing.md, paddingVertical: spacing.md }]}>
              <Ionicons name="call-outline" size={20} color={colors.secondary.default} />
              <Text style={[styles.infoLabel, { fontSize: typography.sizes.sm, fontFamily: typography.family.regular, color: colors.text.muted }]}>Teléfono</Text>
              <Text style={[styles.infoValue, { fontSize: typography.sizes.sm, fontFamily: typography.family.medium, color: colors.text.primary }]}>{mockUser.phone}</Text>
            </View>
            <View style={[styles.infoDivider, { backgroundColor: colors.border.default, marginHorizontal: spacing.md }]} />
            <View style={[styles.infoRow, { paddingHorizontal: spacing.md, paddingVertical: spacing.md }]}>
              <Ionicons name="business-outline" size={20} color={colors.secondary.default} />
              <Text style={[styles.infoLabel, { fontSize: typography.sizes.sm, fontFamily: typography.family.regular, color: colors.text.muted }]}>Facultad</Text>
              <Text style={[styles.infoValue, { fontSize: typography.sizes.sm, fontFamily: typography.family.medium, color: colors.text.primary }]}>{mockUser.faculty}</Text>
            </View>
            <View style={[styles.infoDivider, { backgroundColor: colors.border.default, marginHorizontal: spacing.md }]} />
            <View style={[styles.infoRow, { paddingHorizontal: spacing.md, paddingVertical: spacing.md }]}>
              <Ionicons name="calendar-outline" size={20} color={colors.secondary.default} />
              <Text style={[styles.infoLabel, { fontSize: typography.sizes.sm, fontFamily: typography.family.regular, color: colors.text.muted }]}>Miembro desde</Text>
              <Text style={[styles.infoValue, { fontSize: typography.sizes.sm, fontFamily: typography.family.medium, color: colors.text.primary }]}>{mockUser.member_since}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
          <Text style={[styles.sectionTitle, { fontSize: typography.sizes.md, fontWeight: typography.weights.bold, fontFamily: typography.family.bold, color: colors.text.primary }]}>Opciones</Text>
          <View style={[styles.card, { backgroundColor: colors.background.card, ...shadow.sm }]}>
            <Link href="/bookings" asChild>
              <TouchableOpacity style={[styles.optionRow, { paddingHorizontal: spacing.md, paddingVertical: spacing.md }]}>
                <View style={styles.optionLeft}>
                  <Ionicons name="car-outline" size={20} color={colors.secondary.default} />
                  <Text style={[styles.optionText, { fontSize: typography.sizes.md, fontFamily: typography.family.medium, color: colors.text.primary }]}>Mis Viajes</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
              </TouchableOpacity>
            </Link>
            <View style={[styles.optionDivider, { backgroundColor: colors.border.default, marginHorizontal: spacing.md }]} />
            <Link href="/payments" asChild>
              <TouchableOpacity style={[styles.optionRow, { paddingHorizontal: spacing.md, paddingVertical: spacing.md }]}>
                <View style={styles.optionLeft}>
                  <Ionicons name="card-outline" size={20} color={colors.secondary.default} />
                  <Text style={[styles.optionText, { fontSize: typography.sizes.md, fontFamily: typography.family.medium, color: colors.text.primary }]}>Métodos de Pago</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
              </TouchableOpacity>
            </Link>
            <View style={[styles.optionDivider, { backgroundColor: colors.border.default, marginHorizontal: spacing.md }]} />
            <Link href="/notifications" asChild>
              <TouchableOpacity style={[styles.optionRow, { paddingHorizontal: spacing.md, paddingVertical: spacing.md }]}>
                <View style={styles.optionLeft}>
                  <Ionicons name="notifications-outline" size={20} color={colors.secondary.default} />
                  <Text style={[styles.optionText, { fontSize: typography.sizes.md, fontFamily: typography.family.medium, color: colors.text.primary }]}>Notificaciones</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
              </TouchableOpacity>
            </Link>
            <View style={[styles.optionDivider, { backgroundColor: colors.border.default, marginHorizontal: spacing.md }]} />
            <Link href="/help" asChild>
              <TouchableOpacity style={[styles.optionRow, { paddingHorizontal: spacing.md, paddingVertical: spacing.md }]}>
                <View style={styles.optionLeft}>
                  <Ionicons name="help-circle-outline" size={20} color={colors.secondary.default} />
                  <Text style={[styles.optionText, { fontSize: typography.sizes.md, fontFamily: typography.family.medium, color: colors.text.primary }]}>Centro de Ayuda</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
              </TouchableOpacity>
            </Link>
            <View style={[styles.optionDivider, { backgroundColor: colors.border.default, marginHorizontal: spacing.md }]} />
            <Link href="/settings" asChild>
              <TouchableOpacity style={[styles.optionRow, { paddingHorizontal: spacing.md, paddingVertical: spacing.md }]}>
                <View style={styles.optionLeft}>
                  <Ionicons name="settings-outline" size={20} color={colors.secondary.default} />
                  <Text style={[styles.optionText, { fontSize: typography.sizes.md, fontFamily: typography.family.medium, color: colors.text.primary }]}>Configuración</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        <TouchableOpacity style={[styles.logoutButton, { borderColor: colors.border.error, borderWidth: 1, borderRadius: borderRadius.md, marginHorizontal: spacing.lg, paddingVertical: spacing.md }]}>
          <Ionicons name="log-out-outline" size={20} color={colors.status.error} />
          <Text style={[styles.logoutText, { fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold, color: colors.status.error }]}>Cerrar Sesión</Text>
        </TouchableOpacity>
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  profileSection: {
    alignItems: 'center',
    paddingBottom: spacing.lg,
    marginBottom: spacing.md,
  },
  greeting: { marginTop: spacing.lg, marginBottom: spacing.sm },
  avatar: { width: 90, height: 90, borderRadius: borderRadius.full, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  avatarTextLarge: {},
  userName: {},
  userFaculty: { marginBottom: spacing.lg },
  statsRow: {
    flexDirection: 'row',
    width: '80%',
    padding: spacing.md,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { marginTop: spacing.xs },
  statLabel: {},
  statDivider: { width: 1 },
  section: { marginBottom: spacing.md },
  sectionTitle: { marginBottom: spacing.sm },
  card: { borderRadius: borderRadius.lg },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoLabel: { marginLeft: spacing.md, width: 70 },
  infoValue: { flex: 1 },
  infoDivider: { height: 1 },
  optionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  optionLeft: { flexDirection: 'row', alignItems: 'center' },
  optionText: { marginLeft: spacing.md },
  optionDivider: { height: 1 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  logoutText: { marginLeft: spacing.sm },
});
