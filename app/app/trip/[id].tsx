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
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { borderRadius, spacing, shadow } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/context/AuthContext';
import { tripsApi } from '@/api/trips';
import { bookingsApi } from '@/api/bookings';

interface TripDetail {
  id: string;
  origin_name: string;
  origin_lat: number;
  origin_lng: number;
  destination_name: string;
  destination_lat: number;
  destination_lng: number;
  departure_time: string;
  total_seats: number;
  available_seats: number;
  price: number;
  status: string;
  notes?: string;
  driver: {
    id: string;
    full_name: string;
    faculty?: string;
    average_rating?: number;
    total_trips?: number;
  };
  vehicle?: {
    brand: string;
    model: string;
    color: string;
    plate: string;
  };
}

export default function TripDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { t, language } = useSettings();
  const { colors, typography } = useTheme();
  const { token, user } = useAuth();

  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [userBooking, setUserBooking] = useState<{ id: string } | null>(null);

  useEffect(() => {
    const loadTrip = async () => {
      if (!token || !id) return;
      try {
        const [tripData, myBookings] = await Promise.all([
          tripsApi.getTrip(token, id as string),
          bookingsApi.getMyBookings(token),
        ]);
        setTrip(tripData as any);
        const found = (myBookings as any[]).find(
          (b: any) => b.trip?.id === id && b.status !== 'cancelled' && b.status !== 'completed'
        );
        setUserBooking(found || null);
      } catch {
        Alert.alert(t.common.error, t.trip.loadError);
        router.back();
      } finally {
        setLoading(false);
      }
    };
    loadTrip();
  }, [id, token]);

  const handleCancelBooking = useCallback(() => {
    if (!userBooking) return;
    Alert.alert(
      t.bookings.cancelBooking,
      t.bookings.cancelBooking,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.confirm,
          style: 'destructive',
          onPress: async () => {
            if (!token) return;
            setBooking(true);
            try {
              await bookingsApi.cancelBooking(token, userBooking.id);
              setUserBooking(null);
              Alert.alert(t.common.success, 'Reserva cancelada');
            } catch (error: any) {
              Alert.alert(t.common.error, error.message || t.trip.bookingError);
            } finally {
              setBooking(false);
            }
          },
        },
      ]
    );
  }, [userBooking, token, t]);

  const locale = language === 'en' ? 'en-US' : 'es-CO';

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const isTomorrow = d.toDateString() === tomorrow.toDateString();

      if (isToday) return `${t.common.today}, ${d.toLocaleDateString(locale, { day: 'numeric', month: 'long' })}`;
      if (isTomorrow) return `${t.common.tomorrow}, ${d.toLocaleDateString(locale, { day: 'numeric', month: 'long' })}`;
      return d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const handleBook = useCallback(() => {
    if (!trip) return;

    Alert.alert(
      t.trip.confirmBooking,
      t.trip.confirmBookingMsg.replace('${price}', `$${Number(trip.price).toLocaleString(locale)}`),
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.confirm,
          onPress: async () => {
            if (!token) return;
            setBooking(true);
            try {
              await bookingsApi.createBooking(token, { trip_id: trip.id });
              Alert.alert(t.common.success, t.trip.bookingSuccess, [
                { text: t.common.ok, onPress: () => router.replace('/bookings') },
              ]);
            } catch (error: any) {
              const raw = error?.message || '';
              const knownErrors: Record<string, string> = {
                'already have a booking': t.trip.alreadyBooked,
                'No available seats': t.trip.noAvailableSeats,
                'Cannot book your own trip': t.trip.ownTripHint,
                'Trip is not available for booking': t.trip.bookingError,
              };
              const message = Object.entries(knownErrors).find(([key]) => raw.includes(key))?.[1] || raw || t.trip.bookingError;
              Alert.alert(t.common.error, message);
            } finally {
              setBooking(false);
            }
          },
        },
      ]
    );
  }, [trip, token, t, router]);

  const handleReport = () => {
    router.push(`/report/${trip?.id}`);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
        <View style={[styles.header, { backgroundColor: colors.primary.default }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.primary.contrast} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.primary.contrast, fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold }]}>{t.trip.title}</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={[styles.loadingContainer, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={colors.secondary.default} />
        </View>
      </SafeAreaView>
    );
  }

  if (!trip) return null;

  const vehicleText = trip.vehicle
    ? `${trip.vehicle.brand} ${trip.vehicle.model} - ${trip.vehicle.color}`
    : t.trip.vehicleUnspecified;

  const isOwnTrip = user?.id === trip.driver?.id;
  const isPastTrip = new Date(trip.departure_time) < new Date();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      <View style={[styles.header, { backgroundColor: colors.primary.default }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary.contrast} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.primary.contrast, fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold }]}>{t.trip.title}</Text>
        <TouchableOpacity onPress={handleReport} style={styles.backButton}>
          <Ionicons name="flag-outline" size={20} color={colors.primary.contrast} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.driverSection, { backgroundColor: colors.background.card }]}>
          <View style={[styles.driverAvatar, { backgroundColor: colors.secondary.default }]}>
            <Text style={[styles.avatarText, { color: colors.primary.contrast, fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold, fontFamily: typography.family.bold }]}>{trip.driver?.full_name?.charAt(0) || '?'}</Text>
          </View>
          <View style={styles.driverInfo}>
            <Text style={[styles.driverName, { color: colors.text.primary, fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, fontFamily: typography.family.bold }]}>{trip.driver?.full_name || t.common.unknown}</Text>
            <Text style={[styles.driverFaculty, { color: colors.text.muted, fontSize: typography.sizes.sm, fontFamily: typography.family.regular }]}>{trip.driver?.faculty || '-'}</Text>
            <View style={styles.driverStats}>
              {typeof trip.driver?.average_rating === 'number' && (
                <View style={[styles.statBadge, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={[styles.statText, { color: colors.text.secondary, fontSize: typography.sizes.sm, fontFamily: typography.family.medium }]}>{trip.driver.average_rating.toFixed(1)}</Text>
                </View>
              )}
              {trip.driver?.total_trips ? (
                <Text style={[styles.statText, { color: colors.text.secondary, fontSize: typography.sizes.sm, fontFamily: typography.family.medium }]}>
                  {trip.driver.total_trips} {t.trip.trips}
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary, fontWeight: typography.weights.bold, fontFamily: typography.family.bold }]}>{t.trip.route}</Text>
          <View style={[styles.routeCard, { backgroundColor: colors.background.card, ...shadow.sm }]}>
            <View style={styles.routePoint}>
              <View style={styles.dotContainer}>
                <View style={[styles.dot, { backgroundColor: colors.tertiary.default }]} />
                <View style={[styles.dottedLine, { backgroundColor: colors.border.default }]} />
              </View>
              <View style={styles.routeDetails}>
                <Text style={[styles.routeLabel, { color: colors.text.muted, fontSize: typography.sizes.xs, fontWeight: typography.weights.medium, fontFamily: typography.family.medium, textTransform: 'uppercase', letterSpacing: 0.5 }]}>{t.trip.origin}</Text>
                <Text style={[styles.routeName, { color: colors.text.primary, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold }]}>{trip.origin_name}</Text>
              </View>
            </View>
            <View style={styles.routePoint}>
              <View style={styles.dotContainer}>
                <View style={[styles.dot, { backgroundColor: colors.secondary.default }]} />
              </View>
              <View style={styles.routeDetails}>
                <Text style={[styles.routeLabel, { color: colors.text.muted, fontSize: typography.sizes.xs, fontWeight: typography.weights.medium, fontFamily: typography.family.medium, textTransform: 'uppercase', letterSpacing: 0.5 }]}>{t.trip.destination}</Text>
                <Text style={[styles.routeName, { color: colors.text.primary, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold }]}>{trip.destination_name}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary, fontWeight: typography.weights.bold, fontFamily: typography.family.bold }]}>{t.trip.schedule}</Text>
          <View style={[styles.infoCard, { backgroundColor: colors.background.card, ...shadow.sm }]}>
            <View style={[styles.infoRow, { paddingVertical: spacing.sm, paddingHorizontal: spacing.md }]}>
              <Ionicons name="calendar-outline" size={20} color={colors.secondary.default} />
              <Text style={[styles.infoLabel, { color: colors.text.muted, marginLeft: spacing.md, width: 80, fontSize: typography.sizes.sm, fontFamily: typography.family.regular }]}>{t.trip.date}</Text>
              <Text style={[styles.infoValue, { color: colors.text.primary, flex: 1, fontSize: typography.sizes.sm, fontFamily: typography.family.medium }]}>{formatDate(trip.departure_time)}</Text>
            </View>
            <View style={[styles.infoDivider, { backgroundColor: colors.border.default, marginHorizontal: spacing.md }]} />
            <View style={[styles.infoRow, { paddingVertical: spacing.sm, paddingHorizontal: spacing.md }]}>
              <Ionicons name="time-outline" size={20} color={colors.secondary.default} />
              <Text style={[styles.infoLabel, { color: colors.text.muted, marginLeft: spacing.md, width: 80, fontSize: typography.sizes.sm, fontFamily: typography.family.regular }]}>{t.trip.time}</Text>
              <Text style={[styles.infoValue, { color: colors.text.primary, flex: 1, fontSize: typography.sizes.sm, fontFamily: typography.family.medium }]}>{formatTime(trip.departure_time)}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary, fontWeight: typography.weights.bold, fontFamily: typography.family.bold }]}>{t.trip.vehicle}</Text>
          <View style={[styles.infoCard, { backgroundColor: colors.background.card, ...shadow.sm }]}>
            <View style={[styles.infoRow, { paddingVertical: spacing.sm, paddingHorizontal: spacing.md }]}>
              <Ionicons name="car-sport-outline" size={20} color={colors.secondary.default} />
              <Text style={[styles.infoLabel, { color: colors.text.muted, marginLeft: spacing.md, width: 80, fontSize: typography.sizes.sm, fontFamily: typography.family.regular }]}>{t.trip.vehicle}</Text>
              <Text style={[styles.infoValue, { color: colors.text.primary, flex: 1, fontSize: typography.sizes.sm, fontFamily: typography.family.medium }]}>{vehicleText}</Text>
            </View>
            {trip.vehicle?.plate && (
              <>
                <View style={[styles.infoDivider, { backgroundColor: colors.border.default, marginHorizontal: spacing.md }]} />
                <View style={[styles.infoRow, { paddingVertical: spacing.sm, paddingHorizontal: spacing.md }]}>
                  <Ionicons name="information-circle-outline" size={20} color={colors.secondary.default} />
                  <Text style={[styles.infoLabel, { color: colors.text.muted, marginLeft: spacing.md, width: 80, fontSize: typography.sizes.sm, fontFamily: typography.family.regular }]}>{t.trip.plate}</Text>
                  <Text style={[styles.infoValue, { color: colors.text.primary, flex: 1, fontSize: typography.sizes.sm, fontFamily: typography.family.medium }]}>{trip.vehicle.plate}</Text>
                </View>
              </>
            )}
          </View>
        </View>

        <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary, fontWeight: typography.weights.bold, fontFamily: typography.family.bold }]}>{t.trip.availableSeats}</Text>
          <View style={[styles.seatsContainer, { backgroundColor: colors.background.card, ...shadow.sm, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm, borderRadius: borderRadius.lg, padding: spacing.md }]}>
            {[...Array(trip.total_seats)].map((_, i) => (
              <Ionicons
                key={i}
                name={i < trip.available_seats ? 'person' : 'person-outline'}
                size={24}
                color={i < trip.available_seats ? colors.tertiary.default : colors.text.muted}
              />
            ))}
            <Text style={[styles.seatsText, { color: colors.text.secondary, fontSize: typography.sizes.sm, fontFamily: typography.family.medium, marginLeft: spacing.sm }]}>
              {trip.available_seats} {t.trip.availableOf} {trip.total_seats} {t.trip.available}
            </Text>
          </View>
        </View>

        {trip.notes && (
          <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary, fontWeight: typography.weights.bold, fontFamily: typography.family.bold }]}>{t.trip.driverNotes}</Text>
            <View style={[styles.notesCard, { backgroundColor: colors.background.card, ...shadow.sm, flexDirection: 'row', borderRadius: borderRadius.lg, padding: spacing.md }]}>
              <Ionicons name="document-text-outline" size={20} color={colors.text.secondary} />
              <Text style={[styles.notesText, { color: colors.text.secondary, marginLeft: spacing.sm, flex: 1, fontSize: typography.sizes.sm, fontFamily: typography.family.regular }]}>{trip.notes}</Text>
            </View>
          </View>
        )}

        {isOwnTrip ? (
          <View style={[styles.ownTripBanner, { backgroundColor: colors.background.card, borderTopColor: colors.border.default }]}>
            <Ionicons name="information-circle-outline" size={18} color={colors.text.muted} />
            <Text style={[styles.ownTripLabel, { color: colors.text.muted, fontSize: typography.sizes.sm, fontFamily: typography.family.medium }]}>{t.trip.ownTripHint}</Text>
          </View>
        ) : isPastTrip ? (
          <View style={[styles.ownTripBanner, { backgroundColor: colors.background.card, borderTopColor: colors.border.default }]}>
            <Ionicons name="checkmark-circle-outline" size={18} color={colors.text.muted} />
            <Text style={[styles.ownTripLabel, { color: colors.text.muted, fontSize: typography.sizes.sm, fontFamily: typography.family.medium }]}>Viaje completado</Text>
          </View>
        ) : userBooking ? (
          <View style={[styles.bookingSection, { backgroundColor: colors.background.card, borderTopColor: colors.border.default }]}>
            <View style={styles.priceContainer}>
              <Text style={[styles.priceLabel, { color: colors.text.muted, fontSize: typography.sizes.sm, fontFamily: typography.family.regular }]}>{t.trip.pricePerPerson}</Text>
              <Text style={[styles.priceValue, { color: colors.tertiary.default, fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold, fontFamily: typography.family.bold }]}>${Number(trip.price).toLocaleString(locale)}</Text>
            </View>
            <TouchableOpacity
              style={[styles.bookButton, { backgroundColor: colors.status.error }]}
              onPress={handleCancelBooking}
              disabled={booking}
            >
              {booking ? (
                <ActivityIndicator size="small" color={colors.primary.contrast} />
              ) : (
                <>
                  <Ionicons name="close-circle-outline" size={22} color={colors.primary.contrast} />
                  <Text style={[styles.bookButtonText, { color: colors.primary.contrast, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold }]}>
                    Cancelar Reserva
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
        <View style={[styles.bookingSection, { backgroundColor: colors.background.card, borderTopColor: colors.border.default }]}>
          <View style={styles.priceContainer}>
            <Text style={[styles.priceLabel, { color: colors.text.muted, fontSize: typography.sizes.sm, fontFamily: typography.family.regular }]}>{t.trip.pricePerPerson}</Text>
            <Text style={[styles.priceValue, { color: colors.tertiary.default, fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold, fontFamily: typography.family.bold }]}>${Number(trip.price).toLocaleString(locale)}</Text>
          </View>
          <TouchableOpacity
            style={[styles.bookButton, { backgroundColor: trip.available_seats > 0 ? colors.secondary.default : colors.text.muted }]}
            onPress={handleBook}
            disabled={booking || trip.available_seats === 0}
          >
            {booking ? (
              <ActivityIndicator size="small" color={colors.primary.contrast} />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={22} color={colors.primary.contrast} />
                <Text style={[styles.bookButtonText, { color: colors.primary.contrast, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold }]}>
                  {trip.available_seats === 0 ? t.trip.noSeats : t.trip.bookNow}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        )}
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + spacing.md : spacing.md,
    paddingBottom: spacing.md,
  },
  backButton: { padding: spacing.xs },
  headerTitle: {},
  content: { flex: 1 },
  driverSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  driverAvatar: { width: 60, height: 60, borderRadius: borderRadius.full, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  avatarText: {},
  driverInfo: { flex: 1 },
  driverName: {},
  driverFaculty: { marginTop: 2 },
  driverStats: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs, gap: spacing.sm },
  statBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm, marginRight: spacing.sm },
  statText: { marginLeft: spacing.xs },
  section: { marginBottom: spacing.md },
  sectionTitle: { marginBottom: spacing.sm },
  routeCard: { borderRadius: borderRadius.lg, padding: spacing.md },
  routePoint: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md },
  dotContainer: { alignItems: 'center', marginRight: spacing.md },
  dot: { width: 12, height: 12, borderRadius: borderRadius.full },
  dottedLine: { width: 2, height: 30 },
  routeDetails: { flex: 1 },
  routeLabel: {},
  routeName: {},
  infoCard: { borderRadius: borderRadius.lg, padding: spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoLabel: {},
  infoValue: {},
  infoDivider: { height: 1 },
  seatsContainer: {},
  seatsText: {},
  notesCard: {},
  notesText: {},
  bookingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderTopWidth: 1,
  },
  priceContainer: { flex: 1 },
  priceLabel: {},
  priceValue: {},
  bookButton: { flexDirection: 'row', alignItems: 'center', borderRadius: borderRadius.md, paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  bookButtonText: { marginLeft: spacing.sm },
  ownTripBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.lg, borderTopWidth: 1 },
  ownTripLabel: {},
});
