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
  Linking,
  TextStyle,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { borderRadius, spacing, shadow } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/context/AuthContext';
import { tripsApi } from '@/api/trips';
import { bookingsApi } from '@/api/bookings';
import { paymentsApi } from '@/api/payments';

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

// Abre la pasarela de MercadoPago a partir de un booking confirmado
async function launchPayment(bookingId: string, token: string): Promise<void> {
  console.log('🔵 Llamando createPreference con bookingId:', bookingId);
  const response = await paymentsApi.createPreference(token, bookingId);
  console.log('🟢 Respuesta de MercadoPago:', response);
  const url = response.checkout_url || response.sandbox_url;
  console.log('🔗 URL a abrir:', url);

  if (!url) {
    throw new Error('No se recibió una URL de pago válida de MercadoPago');
  }

  if (typeof window !== 'undefined' && window.location) {
    window.location.href = url;
    return;
  }
  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
  } else {
    throw new Error('No se puede abrir la URL de pago');
  }
}

export default function TripDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { t, language } = useSettings();
  const { colors, typography } = useTheme();
  const fontWeight = {
    semibold: typography.weights.semibold as TextStyle['fontWeight'],
    medium: typography.weights.medium as TextStyle['fontWeight'],
    bold: typography.weights.bold as TextStyle['fontWeight'],
  };
  const fontFamily = {
    semibold: typography.family.semibold as TextStyle['fontFamily'],
    medium: typography.family.medium as TextStyle['fontFamily'],
    bold: typography.family.bold as TextStyle['fontFamily'],
  };
  const { token, user } = useAuth();

  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [userBooking, setUserBooking] = useState<Booking | null>(null);

  interface Booking {
    id: string;
    payment?: {
      status: 'pending' | 'success' | 'failed' | 'refunded';
    };
  }

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
      '¿Estás seguro de que deseas cancelar esta reserva?',
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

  const confirmBooking = async (): Promise<boolean> => {
    const message = t.trip.confirmBookingMsg.replace('${price}', `$${Number(trip?.price ?? 0).toLocaleString(locale)}`);

    if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
      return window.confirm(`${t.trip.confirmBooking}\n\n${message}`);
    }

    return new Promise((resolve) => {
      Alert.alert(
        t.trip.confirmBooking,
        message,
        [
          { text: t.common.cancel, style: 'cancel', onPress: () => resolve(false) },
          { text: t.common.confirm, onPress: () => resolve(true) },
        ],
        { cancelable: true, onDismiss: () => resolve(false) }
      );
    });
  };

  // Crea la reserva y lanza el pago inmediatamente
  const handleBook = useCallback(async () => {
    if (!trip) return;
    console.log('🔵 handleBook pressed', { tripId: trip.id, tokenPresent: !!token });

    if (!token) {
      Alert.alert(t.common.error, 'Debes iniciar sesión para reservar este viaje.');
      return;
    }

    const confirmed = await confirmBooking();
    console.log('🔵 booking confirmed:', confirmed);
    if (!confirmed) return;

    setBooking(true);
    try {
      // 1. Crear la reserva
      const newBooking = (await bookingsApi.createBooking(token, { trip_id: trip.id })) as any;

      // 2. Actualizar estado local para mostrar que ya hay reserva
      setUserBooking({ id: newBooking.id });

      // 3. Lanzar pasarela de pago
      try {
        await launchPayment(newBooking.id, token);
      } catch (payError: any) {
        console.error('🔴 Payment launch failed after booking created', payError);
        Alert.alert(
          'Reserva creada',
          'Tu reserva fue creada. Puedes pagar desde Mis Viajes cuando quieras.',
          [{ text: t.common.ok, onPress: () => router.replace('/bookings') }]
        );
      }
    } catch (error: any) {
      const raw = error?.message || '';
      const knownErrors: Record<string, string> = {
        'already have a booking': t.trip.alreadyBooked,
        'No available seats': t.trip.noAvailableSeats,
        'Cannot book your own trip': t.trip.ownTripHint,
        'Trip is not available for booking': t.trip.bookingError,
      };
      const message =
        Object.entries(knownErrors).find(([key]) => raw.includes(key))?.[1] ||
        raw ||
        t.trip.bookingError;
      Alert.alert(t.common.error, message);
    } finally {
      setBooking(false);
    }
  }, [trip, token, t, router, confirmBooking]);

  // Pagar una reserva ya existente
  const handlePayExisting = useCallback(async () => {
    console.log('🔵 handlePayExisting pressed', { bookingId: userBooking?.id, tokenPresent: !!token });
    if (!userBooking) {
      Alert.alert(t.common.error, 'No se encontró ninguna reserva para pagar.');
      return;
    }
    if (!token) {
      Alert.alert(t.common.error, 'Debes iniciar sesión para pagar este viaje.');
      return;
    }

    setBooking(true);
    try {
      await launchPayment(userBooking.id, token);
    } catch (error: any) {
      Alert.alert(t.common.error, error.message || 'No se pudo iniciar el pago');
    } finally {
      setBooking(false);
    }
  }, [userBooking, token, t]);

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
          <Text style={[styles.headerTitle, { color: colors.primary.contrast, fontSize: typography.sizes.lg, fontWeight: fontWeight.semibold, fontFamily: fontFamily.semibold }]}>{t.trip.title}</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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
  const paymentStatus = userBooking?.payment?.status;
  const isPaid = paymentStatus === 'success';
  const isPaymentPending = paymentStatus === 'pending';
  const canRetryPayment = !paymentStatus || paymentStatus === 'failed' || paymentStatus === 'refunded';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      <View style={[styles.header, { backgroundColor: colors.primary.default }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary.contrast} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.primary.contrast, fontSize: typography.sizes.lg, fontWeight: fontWeight.semibold, fontFamily: fontFamily.semibold }]}>{t.trip.title}</Text>
        <TouchableOpacity onPress={handleReport} style={styles.backButton}>
          <Ionicons name="flag-outline" size={20} color={colors.primary.contrast} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* ── Driver ── */}
        <View style={[styles.driverSection, { backgroundColor: colors.background.card }]}>
          <View style={[styles.driverAvatar, { backgroundColor: colors.secondary.default }]}>
            <Text style={[styles.avatarText, { color: colors.primary.contrast, fontSize: typography.sizes.xxl, fontWeight: fontWeight.bold, fontFamily: fontFamily.bold }]}>{trip.driver?.full_name?.charAt(0) || '?'}</Text>
          </View>
          <View style={styles.driverInfo}>
            <Text style={[styles.driverName, { color: colors.text.primary, fontSize: typography.sizes.lg, fontWeight: fontWeight.bold, fontFamily: fontFamily.bold }]}>{trip.driver?.full_name || t.common.unknown}</Text>
            <Text style={[styles.driverFaculty, { color: colors.text.muted, fontSize: typography.sizes.sm, fontFamily: typography.family.regular }]}>{trip.driver?.faculty || '-'}</Text>
            <View style={styles.driverStats}>
              {typeof trip.driver?.average_rating === 'number' ? (
                <View style={[styles.statBadge, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={[styles.statText, { color: colors.text.secondary, fontSize: typography.sizes.sm, fontFamily: typography.family.medium }]}>{trip.driver.average_rating.toFixed(1)}</Text>
                </View>
              ) : null}
              {trip.driver?.total_trips ? (
                <Text style={[styles.statText, { color: colors.text.secondary, fontSize: typography.sizes.sm, fontFamily: typography.family.medium }]}>
                  {trip.driver.total_trips} {t.trip.trips}
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* ── Route ── */}
        <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary, fontWeight: fontWeight.bold, fontFamily: fontFamily.bold }]}>{t.trip.route}</Text>
          <View style={[styles.routeCard, { backgroundColor: colors.background.card, ...shadow.sm }]}>
            <View style={styles.routePoint}>
              <View style={styles.dotContainer}>
                <View style={[styles.dot, { backgroundColor: colors.tertiary.default }]} />
                <View style={[styles.dottedLine, { backgroundColor: colors.border.default }]} />
              </View>
              <View style={styles.routeDetails}>
                <Text style={[styles.routeLabel, { color: colors.text.muted, fontSize: typography.sizes.xs, fontWeight: fontWeight.medium, fontFamily: fontFamily.medium, textTransform: 'uppercase', letterSpacing: 0.5 }]}>{t.trip.origin}</Text>
                <Text style={[styles.routeName, { color: colors.text.primary, fontSize: typography.sizes.md, fontWeight: fontWeight.semibold, fontFamily: fontFamily.semibold }]}>{trip.origin_name}</Text>
              </View>
            </View>
            <View style={styles.routePoint}>
              <View style={styles.dotContainer}>
                <View style={[styles.dot, { backgroundColor: colors.secondary.default }]} />
              </View>
              <View style={styles.routeDetails}>
                <Text style={[styles.routeLabel, { color: colors.text.muted, fontSize: typography.sizes.xs, fontWeight: fontWeight.medium, fontFamily: fontFamily.medium, textTransform: 'uppercase', letterSpacing: 0.5 }]}>{t.trip.destination}</Text>
                <Text style={[styles.routeName, { color: colors.text.primary, fontSize: typography.sizes.md, fontWeight: fontWeight.semibold, fontFamily: fontFamily.semibold }]}>{trip.destination_name}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Schedule ── */}
        <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary, fontWeight: fontWeight.bold, fontFamily: fontFamily.bold }]}>{t.trip.schedule}</Text>
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

        {/* ── Vehicle ── */}
        <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary, fontWeight: fontWeight.bold, fontFamily: fontFamily.bold }]}>{t.trip.vehicle}</Text>
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

        {/* ── Seats ── */}
        <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary, fontWeight: fontWeight.bold, fontFamily: fontFamily.bold }]}>{t.trip.availableSeats}</Text>
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

        {/* ── Notes ── */}
        {trip.notes && (
          <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary, fontWeight: fontWeight.bold, fontFamily: fontFamily.bold }]}>{t.trip.driverNotes}</Text>
            <View style={[styles.notesCard, { backgroundColor: colors.background.card, ...shadow.sm, flexDirection: 'row', borderRadius: borderRadius.lg, padding: spacing.md }]}>
              <Ionicons name="document-text-outline" size={20} color={colors.text.secondary} />
              <Text style={[styles.notesText, { color: colors.text.secondary, marginLeft: spacing.sm, flex: 1, fontSize: typography.sizes.sm, fontFamily: typography.family.regular }]}>{trip.notes}</Text>
            </View>
          </View>
        )}

        {/* ── Bottom action bar ── */}
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
          // Ya tiene reserva → mostrar "Pagar" y "Cancelar"
          <View style={[styles.bookingSection, { backgroundColor: colors.background.card, borderTopColor: colors.border.default }]}>
            <View style={styles.priceContainer}>
              <Text style={[styles.priceLabel, { color: colors.text.muted, fontSize: typography.sizes.sm, fontFamily: typography.family.regular }]}>{t.trip.pricePerPerson}</Text>
              <Text style={[styles.priceValue, { color: colors.tertiary.default, fontSize: typography.sizes.xxl, fontWeight: fontWeight.bold, fontFamily: fontFamily.bold }]}>${Number(trip.price).toLocaleString(locale)}</Text>
            </View>
            <View style={styles.actionButtons}>
              {isPaid ? (
                <View style={[styles.paidBanner, { backgroundColor: colors.status.successBg }]}> 
                  <Ionicons name="checkmark-circle-outline" size={20} color={colors.status.success} />
                  <Text style={[styles.bookButtonText, { color: colors.status.success, fontSize: typography.sizes.sm, fontWeight: fontWeight.semibold, fontFamily: fontFamily.semibold }]}>Reserva pagada</Text>
                </View>
              ) : isPaymentPending ? (
                <View style={[styles.paidBanner, { backgroundColor: colors.status.warningBg }]}> 
                  <Ionicons name="time-outline" size={20} color={colors.status.warning} />
                  <Text style={[styles.bookButtonText, { color: colors.status.warning, fontSize: typography.sizes.sm, fontWeight: fontWeight.semibold, fontFamily: fontFamily.semibold }]}>Pago pendiente</Text>
                </View>
              ) : canRetryPayment ? (
                <TouchableOpacity
                style={[styles.payButton, { backgroundColor: colors.secondary.default }]}
                onPress={handlePayExisting}
                disabled={booking}
              >
                {booking ? (
                  <ActivityIndicator size="small" color={colors.primary.contrast} />
                ) : (
                  <>
                    <Ionicons name="card-outline" size={20} color={colors.primary.contrast} />
                    <Text style={[styles.bookButtonText, { color: colors.primary.contrast, fontSize: typography.sizes.sm, fontWeight: fontWeight.semibold, fontFamily: fontFamily.semibold }]}>
                      Pagar
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              ) : null}
              {/* Botón Cancelar */}
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: colors.status.error }, (isPaid || isPaymentPending) && styles.hiddenButton]}
                onPress={handleCancelBooking}
                disabled={booking || isPaid || isPaymentPending}
              >
                <Ionicons name="close-circle-outline" size={20} color={colors.primary.contrast} />
                <Text style={[styles.bookButtonText, { color: colors.primary.contrast, fontSize: typography.sizes.sm, fontWeight: fontWeight.semibold, fontFamily: fontFamily.semibold }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // Sin reserva → botón Reservar que crea reserva + lanza pago
          <View style={[styles.bookingSection, { backgroundColor: colors.background.card, borderTopColor: colors.border.default }]}>
            <View style={styles.priceContainer}>
              <Text style={[styles.priceLabel, { color: colors.text.muted, fontSize: typography.sizes.sm, fontFamily: typography.family.regular }]}>{t.trip.pricePerPerson}</Text>
              <Text style={[styles.priceValue, { color: colors.tertiary.default, fontSize: typography.sizes.xxl, fontWeight: fontWeight.bold, fontFamily: fontFamily.bold }]}>${Number(trip.price).toLocaleString(locale)}</Text>
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
                  <Text style={[styles.bookButtonText, { color: colors.primary.contrast, fontSize: typography.sizes.md, fontWeight: fontWeight.semibold, fontFamily: fontFamily.semibold }]}>
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
  // Bottom bar
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
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  hiddenButton: {
    display: 'none',
  },
  bookButtonText: { marginLeft: spacing.xs },
  paidBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  ownTripBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
  },
  ownTripLabel: {},
});
