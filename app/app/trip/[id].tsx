import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, borderRadius, typography, spacing, shadow } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';

export default function TripDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const trip = {
    id: id as string,
    driver_name: 'Carlos Martínez',
    driver_faculty: 'Ingeniería',
    driver_rating: 4.8,
    driver_trips: 45,
    origin: 'Centro Comercial Fontanar',
    origin_detail: 'Entrada principal, frente a la estación de policía',
    destination: 'Universidad de La Sabana',
    destination_detail: 'Entrada principal, puente peatonal',
    departure_time: '7:00 AM',
    arrival_time: '7:45 AM',
    date: 'Hoy, 4 de Mayo 2026',
    available_seats: 3,
    total_seats: 4,
    price: 8000,
    vehicle: 'Chevrolet Spark GT - Blanco',
    plate: 'ABC 123',
    notes: 'Paso por el puente peatonal del norte. Llevo maletas pequeñas sin problema.',
  };

  const handleBook = () => {
    Alert.alert(
      'Confirmar Reserva',
      `¿Deseas reservar un asiento en este viaje por $${trip.price.toLocaleString('es-CO')}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            Alert.alert('Éxito', 'Tu reserva ha sido creada exitosamente');
            router.replace('/bookings');
          },
        },
      ]
    );
  };

  const handleReport = () => {
    router.push(`/report/${trip.id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary.contrast} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle del Viaje</Text>
        <TouchableOpacity onPress={handleReport} style={styles.backButton}>
          <Ionicons name="flag-outline" size={20} color={colors.primary.contrast} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.driverSection}>
          <View style={styles.driverAvatar}>
            <Text style={styles.avatarText}>{trip.driver_name.charAt(0)}</Text>
          </View>
          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>{trip.driver_name}</Text>
            <Text style={styles.driverFaculty}>{trip.driver_faculty}</Text>
            <View style={styles.driverStats}>
              <View style={styles.statBadge}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={styles.statText}>{trip.driver_rating}</Text>
              </View>
              <Text style={styles.statText}>
                {trip.driver_trips} viajes
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ruta</Text>
          <View style={styles.routeCard}>
            <View style={styles.routePoint}>
              <View style={styles.dotContainer}>
                <View style={[styles.dot, { backgroundColor: colors.tertiary.default }]} />
                {true && <View style={styles.dottedLine} />}
              </View>
              <View style={styles.routeDetails}>
                <Text style={styles.routeLabel}>Origen</Text>
                <Text style={styles.routeName}>{trip.origin}</Text>
                <Text style={styles.routeSubtext}>{trip.origin_detail}</Text>
              </View>
            </View>
            <View style={styles.routePoint}>
              <View style={styles.dotContainer}>
                <View style={[styles.dot, { backgroundColor: colors.secondary.default }]} />
              </View>
              <View style={styles.routeDetails}>
                <Text style={styles.routeLabel}>Destino</Text>
                <Text style={styles.routeName}>{trip.destination}</Text>
                <Text style={styles.routeSubtext}>{trip.destination_detail}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Horario</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color={colors.secondary.default} />
              <Text style={styles.infoLabel}>Fecha</Text>
              <Text style={styles.infoValue}>{trip.date}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color={colors.secondary.default} />
              <Text style={styles.infoLabel}>Horario</Text>
              <Text style={styles.infoValue}>{trip.departure_time} - {trip.arrival_time}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehículo</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="car-sport-outline" size={20} color={colors.secondary.default} />
              <Text style={styles.infoLabel}>Vehículo</Text>
              <Text style={styles.infoValue}>{trip.vehicle}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Ionicons name="information-circle-outline" size={20} color={colors.secondary.default} />
              <Text style={styles.infoLabel}>Placa</Text>
              <Text style={styles.infoValue}>{trip.plate}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Asientos Disponibles</Text>
          <View style={styles.seatsContainer}>
            {[...Array(trip.total_seats)].map((_, i) => (
              <Ionicons
                key={i}
                name={i < trip.available_seats ? 'person' : 'person-outline'}
                size={24}
                color={i < trip.available_seats ? colors.tertiary.default : colors.text.muted}
              />
            ))}
            <Text style={styles.seatsText}>
              {trip.available_seats} de {trip.total_seats} disponibles
            </Text>
          </View>
        </View>

        {trip.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notas del Conductor</Text>
            <View style={styles.notesCard}>
              <Ionicons name="document-text-outline" size={20} color={colors.text.secondary} />
              <Text style={styles.notesText}>{trip.notes}</Text>
            </View>
          </View>
        )}

        <View style={styles.bookingSection}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Precio por persona</Text>
            <Text style={styles.priceValue}>${trip.price.toLocaleString('es-CO')}</Text>
          </View>
          <TouchableOpacity style={styles.bookButton} onPress={handleBook}>
            <Ionicons name="checkmark-circle-outline" size={22} color={colors.primary.contrast} />
            <Text style={styles.bookButtonText}>Reservar Ahora</Text>
          </TouchableOpacity>
        </View>
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
  driverSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  driverAvatar: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondary.default,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.primary.contrast,
    fontFamily: typography.family.bold,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    fontFamily: typography.family.bold,
  },
  driverFaculty: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    fontFamily: typography.family.regular,
  },
  driverStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
  },
  statText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
    fontFamily: typography.family.medium,
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
  routeCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadow.sm,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  dotContainer: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: borderRadius.full,
  },
  dottedLine: {
    width: 2,
    height: 30,
    backgroundColor: colors.border.default,
    borderStyle: 'dashed',
  },
  routeDetails: {
    flex: 1,
  },
  routeLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: typography.family.medium,
  },
  routeName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    fontFamily: typography.family.semibold,
  },
  routeSubtext: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: 2,
    fontFamily: typography.family.regular,
  },
  infoCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadow.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    marginLeft: spacing.md,
    width: 80,
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
  },
  seatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadow.sm,
  },
  seatsText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
    fontFamily: typography.family.medium,
  },
  notesCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadow.sm,
  },
  notesText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
    fontFamily: typography.family.regular,
    lineHeight: typography.sizes.sm * typography.lineHeight.normal,
  },
  bookingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.card,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    fontFamily: typography.family.regular,
  },
  priceValue: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.tertiary.default,
    fontFamily: typography.family.bold,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary.default,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  bookButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.primary.contrast,
    marginLeft: spacing.sm,
    fontFamily: typography.family.semibold,
  },
});
