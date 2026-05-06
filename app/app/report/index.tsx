import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { borderRadius, spacing, shadow, colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/hooks/useTheme';
import PageHeader from '@/components/PageHeader';

const MOCK_RECENT_TRIPS = [
  {
    id: '1',
    driver_name: 'Carlos Martínez',
    origin: 'Centro Comercial Fontanar',
    destination: 'Universidad de La Sabana',
    date: '4 de Mayo, 2026',
    time: '7:00 AM',
    role: 'Pasajero',
    roleIcon: 'person',
  },
  {
    id: '2',
    driver_name: 'María López',
    origin: 'Portal Norte',
    destination: 'Universidad de La Sabana',
    date: '3 de Mayo, 2026',
    time: '6:30 AM',
    role: 'Pasajero',
    roleIcon: 'person',
  },
  {
    id: '3',
    passenger_name: 'Andrés Gómez',
    origin: 'Chicó Norte',
    destination: 'Universidad de La Sabana',
    date: '2 de Mayo, 2026',
    time: '7:30 AM',
    role: 'Conductor',
    roleIcon: 'car-sport',
  },
  {
    id: '4',
    driver_name: 'Laura Herrera',
    origin: 'Estación Calle 100',
    destination: 'Universidad de La Sabana',
    date: '1 de Mayo, 2026',
    time: '8:00 AM',
    role: 'Pasajero',
    roleIcon: 'person',
  },
];

export default function ReportsScreen() {
  const router = useRouter();
  const { t } = useSettings();
  const { colors, typography } = useTheme();
  const a = t.report;
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);

  const handleContinue = () => {
    if (!selectedTrip) return;
    router.push(`/report/${selectedTrip}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      <PageHeader title={a.title} />

      <ScrollView style={styles.content}>
        <View style={[styles.infoCard, { backgroundColor: colors.secondary.default + '15', borderRadius: borderRadius.lg, padding: spacing.md, marginHorizontal: spacing.lg, marginTop: spacing.lg }]}>
          <Ionicons name="information-circle" size={24} color={colors.secondary.default} />
          <Text style={[styles.infoText, { color: colors.text.primary, marginLeft: spacing.sm, flex: 1, fontSize: typography.sizes.sm, fontFamily: typography.family.regular, lineHeight: typography.sizes.sm * typography.lineHeight.normal }]}>
            {a.selectTrip}
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text.primary, fontSize: typography.sizes.md, fontWeight: typography.weights.bold, fontFamily: typography.family.bold, marginBottom: spacing.sm, marginHorizontal: spacing.lg, marginTop: spacing.lg }]}>{a.recentTrips}</Text>

        {MOCK_RECENT_TRIPS.map(trip => (
          <TouchableOpacity
            key={trip.id}
            style={[
              styles.tripCard,
              { backgroundColor: colors.background.card, borderRadius: borderRadius.lg, padding: spacing.md, marginHorizontal: spacing.lg, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border.default },
              selectedTrip === trip.id && { borderColor: colors.secondary.default, backgroundColor: colors.secondary.default + '08' },
            ]}
            onPress={() => setSelectedTrip(trip.id)}
          >
            <View style={[styles.tripHeader, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }]}>
              <View style={[styles.roleBadge, { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background.default, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm, gap: spacing.xs }]}>
                <Ionicons
                  name={trip.roleIcon as any}
                  size={14}
                  color={colors.secondary.default}
                />
                <Text style={[styles.roleText, { fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.text.secondary, fontFamily: typography.family.semibold }]}>{trip.role}</Text>
              </View>
              <Text style={[styles.tripDate, { fontSize: typography.sizes.xs, color: colors.text.muted, fontFamily: typography.family.regular }]}>{trip.date}</Text>
            </View>

            <View style={[styles.routeInfo, { marginBottom: spacing.sm }]}>
              <View style={[styles.routePoint, { flexDirection: 'row', alignItems: 'center' }]}>
                <Ionicons name="location" size={14} color={colors.tertiary.default} />
                <Text style={[styles.routeText, { fontSize: typography.sizes.sm, color: colors.text.primary, fontFamily: typography.family.regular, marginLeft: spacing.sm, flex: 1 }]} numberOfLines={1}>{trip.origin}</Text>
              </View>
              <View style={[styles.routeLine, { width: 1, height: 14, backgroundColor: colors.border.default, marginLeft: 7, marginVertical: spacing.xs }]} />
              <View style={[styles.routePoint, { flexDirection: 'row', alignItems: 'center' }]}>
                <Ionicons name="flag" size={14} color={colors.secondary.default} />
                <Text style={[styles.routeText, { fontSize: typography.sizes.sm, color: colors.text.primary, fontFamily: typography.family.regular, marginLeft: spacing.sm, flex: 1 }]} numberOfLines={1}>{trip.destination}</Text>
              </View>
            </View>

            <View style={[styles.tripFooter, { flexDirection: 'row', alignItems: 'center', gap: spacing.xs }]}>
              <Ionicons name="time-outline" size={14} color={colors.text.muted} />
              <Text style={[styles.detailText, { fontSize: typography.sizes.xs, color: colors.text.muted, fontFamily: typography.family.regular }]}>
                {trip.time} — {trip.role === 'Conductor' ? trip.passenger_name : trip.driver_name}
              </Text>
            </View>

            {selectedTrip === trip.id && (
              <View style={[styles.selectedIndicator, { position: 'absolute', top: spacing.md, right: spacing.md }]}>
                <Ionicons name="checkmark-circle" size={20} color={colors.secondary.default} />
              </View>
            )}
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[
            styles.submitButton,
            { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.secondary.default, borderRadius: borderRadius.md, paddingVertical: spacing.md, marginHorizontal: spacing.lg, marginTop: spacing.lg },
            !selectedTrip && { backgroundColor: colors.border.default },
          ]}
          onPress={handleContinue}
          disabled={!selectedTrip}
        >
          <Ionicons name="document-text-outline" size={20} color={colors.primary.contrast} />
          <Text style={[styles.submitButtonText, { color: colors.primary.contrast, marginLeft: spacing.sm, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold }]}>{a.selectTrip}</Text>
        </TouchableOpacity>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  infoCard: {},
  infoText: {},
  sectionTitle: {},
  tripCard: { ...shadow.sm },
  tripCardSelected: {},
  tripHeader: {},
  roleBadge: {},
  roleText: {},
  tripDate: {},
  routeInfo: {},
  routePoint: {},
  routeText: {},
  routeLine: {},
  tripFooter: {},
  detailText: {},
  selectedIndicator: {},
  submitButton: { ...shadow.md },
  submitButtonDisabled: { shadowOpacity: 0, elevation: 0 },
  submitButtonText: {},
});
