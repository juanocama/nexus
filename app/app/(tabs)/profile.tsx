import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { borderRadius, spacing, shadow } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import TabHeader from '@/components/TabHeader';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { usersApi, ProfileData } from '@/api/users';

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, typography } = useTheme();
  const { user, token, login, logout } = useAuth();
  const { t, language } = useSettings();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingRoles, setUpdatingRoles] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await usersApi.getProfile(token);
      setProfile(data);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const p = t.profile;
  const c = t.common;
  const displayName = profile?.full_name?.split(' ')[0] || user?.full_name?.split(' ')[0] || c.user;
  const fullName = profile?.full_name || user?.full_name || '';
  const userEmail = profile?.email || user?.email || '';
  const userFaculty = profile?.faculty || user?.faculty || '';
  const userPhone = profile?.phone || user?.phone || '';
  const userRating = typeof profile?.average_rating === 'number' ? profile.average_rating : (typeof user?.average_rating === 'number' ? user.average_rating : 0);
  const userTrips = profile?.total_trips || user?.total_trips || 0;
  const userRoles = profile?.roles || user?.roles || [];
  const isPassenger = userRoles.includes('passenger');
  const isDriver = userRoles.includes('driver');

  const toggleRole = async (role: 'driver' | 'passenger') => {
    if (!token || !profile) return;
    const currentRoles = [...profile.roles];
    let newRoles: string[];
    if (currentRoles.includes(role)) {
      if (currentRoles.length <= 1) {
        Alert.alert(t.common.error, p.minOneRole);
        return;
      }
      newRoles = currentRoles.filter(r => r !== role);
    } else {
      newRoles = [...currentRoles, role];
    }
    setUpdatingRoles(true);
    try {
      const updated = await usersApi.updateRoles(token, newRoles);
      const { accessToken, ...profileData } = updated;
      setProfile(profileData);
      await login({ accessToken, ...profileData });
    } catch (error: any) {
      Alert.alert(t.common.error, error.message || p.roleUpdateError);
    } finally {
      setUpdatingRoles(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      p.logout,
      p.logoutConfirm,
      [
        { text: c.cancel, style: 'cancel' },
        { text: p.logout, style: 'destructive', onPress: () => {
          logout();
          router.replace('/(auth)/login');
        } },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
        <TabHeader />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.secondary.default} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      <TabHeader />

      <ScrollView style={styles.content}>
        <View style={[styles.profileSection, { backgroundColor: colors.background.card }]}>
          <Text style={[styles.greeting, { fontSize: typography.sizes.xl, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold, color: colors.text.primary }]}>{p.hello}, {displayName}!</Text>
          <View style={[styles.avatar, { backgroundColor: colors.secondary.default }]}>
            <Text style={[styles.avatarTextLarge, { fontSize: typography.sizes.xxxl, fontWeight: typography.weights.bold, fontFamily: typography.family.bold, color: colors.primary.contrast }]}>{fullName.charAt(0)}</Text>
          </View>
          <Text style={[styles.userName, { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, fontFamily: typography.family.bold, color: colors.text.primary }]}>{fullName}</Text>
          <Text style={[styles.userFaculty, { fontSize: typography.sizes.md, fontFamily: typography.family.regular, color: colors.text.muted }]}>{userFaculty}</Text>
          <View style={[styles.statsRow, { backgroundColor: colors.background.default, borderRadius: borderRadius.lg }]}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={18} color="#F59E0B" />
              <Text style={[styles.statValue, { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, fontFamily: typography.family.bold, color: colors.text.primary }]}>{userRating.toFixed(1)}</Text>
              <Text style={[styles.statLabel, { fontSize: typography.sizes.xs, fontFamily: typography.family.regular, color: colors.text.muted }]}>{p.rating}</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border.default }]} />
            <View style={styles.statItem}>
              <Ionicons name="car-sport-outline" size={18} color={colors.secondary.default} />
              <Text style={[styles.statValue, { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, fontFamily: typography.family.bold, color: colors.text.primary }]}>{userTrips}</Text>
              <Text style={[styles.statLabel, { fontSize: typography.sizes.xs, fontFamily: typography.family.regular, color: colors.text.muted }]}>{p.trips}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
          <Text style={[styles.sectionTitle, { fontSize: typography.sizes.md, fontWeight: typography.weights.bold, fontFamily: typography.family.bold, color: colors.text.primary }]}>{p.featuredReviews}</Text>
          <View style={[styles.card, { backgroundColor: colors.background.card, ...shadow.sm, padding: spacing.md }]}>
            <View style={styles.tagsRow}>
              {['Puntual', 'Amable', 'Seguro', 'Respetuoso', 'Vehículo limpio'].map((tag, i) => (
                <View key={i} style={[styles.tagChip, { backgroundColor: colors.secondary.default + '20' }]}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.secondary.default} />
                  <Text style={[styles.tagText, { color: colors.secondary.default, fontSize: typography.sizes.xs, fontFamily: typography.family.semibold }]}>{tag}</Text>
                </View>
              ))}
            </View>
            <View style={[styles.reviewDivider, { backgroundColor: colors.border.default, marginVertical: spacing.sm }]} />
            <View style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <Text style={[styles.reviewerName, { color: colors.text.primary, fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold }]}>María López</Text>
                <View style={styles.reviewStars}>
                  {[1,2,3,4,5].map(s => <Ionicons key={s} name="star" size={12} color="#F59E0B" />)}
                </View>
              </View>
              <Text style={[styles.reviewComment, { color: colors.text.secondary, fontSize: typography.sizes.sm, fontFamily: typography.family.regular, marginTop: spacing.xs }]}>Muy buen conductor, puntual y amable. El viaje fue muy cómodo.</Text>
            </View>
            <View style={[styles.reviewDivider, { backgroundColor: colors.border.default, marginVertical: spacing.sm }]} />
            <View style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <Text style={[styles.reviewerName, { color: colors.text.primary, fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold }]}>Carlos Martínez</Text>
                <View style={styles.reviewStars}>
                  {[1,2,3,4,5].map(s => <Ionicons key={s} name="star" size={12} color="#F59E0B" />)}
                </View>
              </View>
              <Text style={[styles.reviewComment, { color: colors.text.secondary, fontSize: typography.sizes.sm, fontFamily: typography.family.regular, marginTop: spacing.xs }]}>Siempre llega a tiempo y es muy respetuoso. Recomendado!</Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
          <Text style={[styles.sectionTitle, { fontSize: typography.sizes.md, fontWeight: typography.weights.bold, fontFamily: typography.family.bold, color: colors.text.primary }]}>{p.myRoles}</Text>
          <View style={[styles.card, { backgroundColor: colors.background.card, ...shadow.sm }]}>
            <View style={[styles.roleContainer, { padding: spacing.md }]}>
              <TouchableOpacity
                style={[styles.roleChip, { borderColor: colors.border.default, backgroundColor: colors.background.default },
                  isPassenger && { backgroundColor: colors.secondary.default, borderColor: colors.secondary.default }]}
                onPress={() => toggleRole('passenger')}
                disabled={updatingRoles}
              >
                <Ionicons
                  name="person"
                  size={18}
                  color={isPassenger ? colors.primary.contrast : colors.text.secondary}
                />
                  <Text style={[styles.roleText, { color: colors.text.secondary, fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, fontFamily: typography.family.medium },
                  isPassenger && { color: colors.primary.contrast, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold }]}>
                  {c.passenger}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleChip, { borderColor: colors.border.default, backgroundColor: colors.background.default },
                  isDriver && { backgroundColor: colors.secondary.default, borderColor: colors.secondary.default }]}
                onPress={() => toggleRole('driver')}
                disabled={updatingRoles}
              >
                <Ionicons
                  name="car-sport"
                  size={18}
                  color={isDriver ? colors.primary.contrast : colors.text.secondary}
                />
                  <Text style={[styles.roleText, { color: colors.text.secondary, fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, fontFamily: typography.family.medium },
                  isDriver && { color: colors.primary.contrast, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold }]}>
                  {c.driver}
                </Text>
              </TouchableOpacity>
            </View>
            {updatingRoles && (
              <ActivityIndicator size="small" color={colors.secondary.default} style={{ marginBottom: spacing.sm }} />
            )}
          </View>
        </View>

        <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
          <Text style={[styles.sectionTitle, { fontSize: typography.sizes.md, fontWeight: typography.weights.bold, fontFamily: typography.family.bold, color: colors.text.primary }]}>{p.personalInfo}</Text>
          <View style={[styles.card, { backgroundColor: colors.background.card, ...shadow.sm }]}>
            <View style={[styles.infoRow, { paddingHorizontal: spacing.md, paddingVertical: spacing.md }]}>
              <Ionicons name="mail-outline" size={20} color={colors.secondary.default} />
              <Text style={[styles.infoLabel, { fontSize: typography.sizes.sm, fontFamily: typography.family.regular, color: colors.text.muted }]}>{p.email}</Text>
              <Text style={[styles.infoValue, { fontSize: typography.sizes.sm, fontFamily: typography.family.medium, color: colors.text.primary }]}>{showEmail ? userEmail : '••••••••'}</Text>
              <TouchableOpacity onPress={() => setShowEmail(!showEmail)} style={styles.toggleBtn}>
                <Ionicons name={showEmail ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.text.muted} />
              </TouchableOpacity>
            </View>
            <View style={[styles.infoDivider, { backgroundColor: colors.border.default, marginHorizontal: spacing.md }]} />
            <View style={[styles.infoRow, { paddingHorizontal: spacing.md, paddingVertical: spacing.md }]}>
              <Ionicons name="call-outline" size={20} color={colors.secondary.default} />
              <Text style={[styles.infoLabel, { fontSize: typography.sizes.sm, fontFamily: typography.family.regular, color: colors.text.muted }]}>{p.phone}</Text>
              <Text style={[styles.infoValue, { fontSize: typography.sizes.sm, fontFamily: typography.family.medium, color: colors.text.primary }]}>{showPhone ? (userPhone || '-') : '••••••••'}</Text>
              <TouchableOpacity onPress={() => setShowPhone(!showPhone)} style={styles.toggleBtn}>
                <Ionicons name={showPhone ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.text.muted} />
              </TouchableOpacity>
            </View>
            <View style={[styles.infoDivider, { backgroundColor: colors.border.default, marginHorizontal: spacing.md }]} />
            <View style={[styles.infoRow, { paddingHorizontal: spacing.md, paddingVertical: spacing.md }]}>
              <Ionicons name="business-outline" size={20} color={colors.secondary.default} />
              <Text style={[styles.infoLabel, { fontSize: typography.sizes.sm, fontFamily: typography.family.regular, color: colors.text.muted }]}>{p.faculty}</Text>
              <Text style={[styles.infoValue, { fontSize: typography.sizes.sm, fontFamily: typography.family.medium, color: colors.text.primary }]}>{userFaculty || '-'}</Text>
            </View>
            <View style={[styles.infoDivider, { backgroundColor: colors.border.default, marginHorizontal: spacing.md }]} />
            <View style={[styles.infoRow, { paddingHorizontal: spacing.md, paddingVertical: spacing.md }]}>
              <Ionicons name="calendar-outline" size={20} color={colors.secondary.default} />
              <Text style={[styles.infoLabel, { fontSize: typography.sizes.sm, fontFamily: typography.family.regular, color: colors.text.muted }]}>{p.memberSince}</Text>
              <Text style={[styles.infoValue, { fontSize: typography.sizes.sm, fontFamily: typography.family.medium, color: colors.text.primary }]}>
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString(language === 'en' ? 'en-US' : 'es-CO', { month: 'long', year: 'numeric' })
                  : '-'}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
          <Text style={[styles.sectionTitle, { fontSize: typography.sizes.md, fontWeight: typography.weights.bold, fontFamily: typography.family.bold, color: colors.text.primary }]}>{p.options}</Text>
          <View style={[styles.card, { backgroundColor: colors.background.card, ...shadow.sm }]}>
            <TouchableOpacity style={[styles.optionRow, { paddingHorizontal: spacing.md, paddingVertical: spacing.md }]} onPress={() => router.push('/bookings')}>
              <View style={styles.optionLeft}>
                <Ionicons name="car-outline" size={20} color={colors.secondary.default} />
                <Text style={[styles.optionText, { fontSize: typography.sizes.md, fontFamily: typography.family.medium, color: colors.text.primary }]}>{p.myTrips}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
            </TouchableOpacity>
            <View style={[styles.optionDivider, { backgroundColor: colors.border.default, marginHorizontal: spacing.md }]} />
            <TouchableOpacity style={[styles.optionRow, { paddingHorizontal: spacing.md, paddingVertical: spacing.md }]} onPress={() => router.push('/payments')}>
              <View style={styles.optionLeft}>
                <Ionicons name="card-outline" size={20} color={colors.secondary.default} />
                <Text style={[styles.optionText, { fontSize: typography.sizes.md, fontFamily: typography.family.medium, color: colors.text.primary }]}>{p.paymentMethods}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
            </TouchableOpacity>
            <View style={[styles.optionDivider, { backgroundColor: colors.border.default, marginHorizontal: spacing.md }]} />
            <TouchableOpacity style={[styles.optionRow, { paddingHorizontal: spacing.md, paddingVertical: spacing.md }]} onPress={() => router.push('/notifications')}>
              <View style={styles.optionLeft}>
                <Ionicons name="notifications-outline" size={20} color={colors.secondary.default} />
                <Text style={[styles.optionText, { fontSize: typography.sizes.md, fontFamily: typography.family.medium, color: colors.text.primary }]}>{p.notifications}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
            </TouchableOpacity>
            <View style={[styles.optionDivider, { backgroundColor: colors.border.default, marginHorizontal: spacing.md }]} />
            <TouchableOpacity style={[styles.optionRow, { paddingHorizontal: spacing.md, paddingVertical: spacing.md }]} onPress={() => router.push('/help')}>
              <View style={styles.optionLeft}>
                <Ionicons name="help-circle-outline" size={20} color={colors.secondary.default} />
                <Text style={[styles.optionText, { fontSize: typography.sizes.md, fontFamily: typography.family.medium, color: colors.text.primary }]}>{p.helpCenter}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
            </TouchableOpacity>
            <View style={[styles.optionDivider, { backgroundColor: colors.border.default, marginHorizontal: spacing.md }]} />
            <TouchableOpacity style={[styles.optionRow, { paddingHorizontal: spacing.md, paddingVertical: spacing.md }]} onPress={() => router.push('/settings/support-report')}>
              <View style={styles.optionLeft}>
                <Ionicons name="bug-outline" size={20} color={colors.status.error} />
                <Text style={[styles.optionText, { fontSize: typography.sizes.md, fontFamily: typography.family.medium, color: colors.text.primary }]}>Reportar bug o sugerencia</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
            </TouchableOpacity>
            <View style={[styles.optionDivider, { backgroundColor: colors.border.default, marginHorizontal: spacing.md }]} />
            <TouchableOpacity style={[styles.optionRow, { paddingHorizontal: spacing.md, paddingVertical: spacing.md }]} onPress={() => router.push('/settings')}>
              <View style={styles.optionLeft}>
                <Ionicons name="settings-outline" size={20} color={colors.secondary.default} />
                <Text style={[styles.optionText, { fontSize: typography.sizes.md, fontFamily: typography.family.medium, color: colors.text.primary }]}>{p.settings}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={[styles.logoutButton, { borderColor: colors.status.error, borderWidth: 1, borderRadius: borderRadius.md, marginHorizontal: spacing.lg, paddingVertical: spacing.md }]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.status.error} />
          <Text style={[styles.logoutText, { fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold, color: colors.status.error }]}>{p.logout}</Text>
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
  roleContainer: { flexDirection: 'row', gap: spacing.sm },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  roleText: {},
  toggleBtn: { padding: spacing.xs, marginLeft: spacing.sm },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  tagChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.full, gap: spacing.xs },
  tagText: {},
  reviewDivider: { height: 1 },
  reviewItem: {},
  reviewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reviewerName: {},
  reviewStars: { flexDirection: 'row', gap: 2 },
  reviewComment: {},
});
