import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, borderRadius, typography, spacing, shadow } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';

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
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);

  const handleContinue = () => {
    if (!selectedTrip) return;
    router.push(`/report/${selectedTrip}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary.contrast} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reportes</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={colors.secondary.default} />
          <Text style={styles.infoText}>
            Selecciona el viaje sobre el cual deseas presentar un reporte.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Viajes Recientes</Text>

        {MOCK_RECENT_TRIPS.map(trip => (
          <TouchableOpacity
            key={trip.id}
            style={[
              styles.tripCard,
              selectedTrip === trip.id && styles.tripCardSelected,
            ]}
            onPress={() => setSelectedTrip(trip.id)}
          >
            <View style={styles.tripHeader}>
              <View style={styles.roleBadge}>
                <Ionicons
                  name={trip.roleIcon as any}
                  size={14}
                  color={colors.secondary.default}
                />
                <Text style={styles.roleText}>{trip.role}</Text>
              </View>
              <Text style={styles.tripDate}>{trip.date}</Text>
            </View>

            <View style={styles.routeInfo}>
              <View style={styles.routePoint}>
                <Ionicons name="location" size={14} color={colors.tertiary.default} />
                <Text style={styles.routeText} numberOfLines={1}>{trip.origin}</Text>
              </View>
              <View style={styles.routeLine} />
              <View style={styles.routePoint}>
                <Ionicons name="flag" size={14} color={colors.secondary.default} />
                <Text style={styles.routeText} numberOfLines={1}>{trip.destination}</Text>
              </View>
            </View>

            <View style={styles.tripFooter}>
              <Ionicons name="time-outline" size={14} color={colors.text.muted} />
              <Text style={styles.detailText}>
                {trip.time} — {trip.role === 'Conductor' ? trip.passenger_name : trip.driver_name}
              </Text>
            </View>

            {selectedTrip === trip.id && (
              <View style={styles.selectedIndicator}>
                <Ionicons name="checkmark-circle" size={20} color={colors.secondary.default} />
              </View>
            )}
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[
            styles.submitButton,
            !selectedTrip && styles.submitButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedTrip}
        >
          <Ionicons name="document-text-outline" size={20} color={colors.primary.contrast} />
          <Text style={styles.submitButtonText}>Continuar con Reporte</Text>
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
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + spacing.md : spacing.md,
    paddingBottom: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.primary.contrast,
    fontFamily: typography.family.semibold,
  },
  content: {
    flex: 1,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.secondary.default + '15',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    lineHeight: typography.sizes.sm * typography.lineHeight.normal,
    fontFamily: typography.family.regular,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    fontFamily: typography.family.bold,
  },
  tripCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
    ...shadow.sm,
  },
  tripCardSelected: {
    borderColor: colors.secondary.default,
    backgroundColor: colors.secondary.default + '08',
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.default,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  roleText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    fontFamily: typography.family.semibold,
  },
  tripDate: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    fontFamily: typography.family.regular,
  },
  routeInfo: {
    marginBottom: spacing.sm,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeText: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    flex: 1,
    fontFamily: typography.family.regular,
  },
  routeLine: {
    width: 1,
    height: 14,
    backgroundColor: colors.border.default,
    marginLeft: 7,
    marginVertical: spacing.xs,
  },
  tripFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    fontFamily: typography.family.regular,
  },
  selectedIndicator: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary.default,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    ...shadow.md,
  },
  submitButtonDisabled: {
    backgroundColor: colors.border.default,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.primary.contrast,
    marginLeft: spacing.sm,
    fontFamily: typography.family.semibold,
  },
});
