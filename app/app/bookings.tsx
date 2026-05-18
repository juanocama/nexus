import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Alert,
  ActivityIndicator,
  Linking,
  TextStyle,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { borderRadius, spacing, shadow } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useSettings } from '@/context/SettingsContext';
import PageHeader from '@/components/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { bookingsApi, Booking } from '@/api/bookings';
import { paymentsApi } from '@/api/payments';

type TabType = 'upcoming' | 'past';

// Abre la pasarela de MercadoPago a partir de un bookingId
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

export default function BookingsScreen() {
  const router = useRouter();
  const { colors, typography } = useTheme();
  const fontWeight = {
    semibold: typography.weights.semibold as TextStyle['fontWeight'],
    medium: typography.weights.medium as TextStyle['fontWeight'],
    bold: typography.weights.bold as TextStyle['fontWeight'],
  };
  const { t, language } = useSettings();
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await bookingsApi.getMyBookings(token);
      setBookings(data);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      if (!token) {
        setLoading(false);
        return;
      }
      setLoading(true);
      (async () => {
        try {
          const data = await bookingsApi.getMyBookings(token);
          setBookings(data);
        } catch {
          setBookings([]);
        } finally {
          setLoading(false);
        }
      })();
    }, [token])
  );

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const isTomorrow = d.toDateString() === tomorrow.toDateString();

      if (isToday) return `${t.common.today}, ${d.toLocaleDateString(language === 'en' ? 'en-US' : 'es-CO', { day: 'numeric', month: 'short' })}`;
      if (isTomorrow) return `${t.common.tomorrow}, ${d.toLocaleDateString(language === 'en' ? 'en-US' : 'es-CO', { day: 'numeric', month: 'short' })}`;
      return d.toLocaleDateString(language === 'en' ? 'en-US' : 'es-CO', { day: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString(language === 'en' ? 'en-US' : 'es-CO', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return { bg: colors.status.successBg, text: colors.status.success, label: t.bookings.confirmed };
      case 'pending':   return { bg: colors.status.warningBg, text: colors.status.warning, label: t.bookings.pending };
      case 'completed': return { bg: colors.status.infoBg,    text: colors.status.info,    label: t.bookings.completed };
      default:          return { bg: colors.status.errorBg,   text: colors.status.error,   label: t.bookings.cancelled };
    }
  };

  const handleCancel = (booking: Booking) => {
    if (!token) return;
    Alert.alert(
      t.bookings.cancelBooking,
      '¿Estás seguro de que deseas cancelar esta reserva?',
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.confirm,
          style: 'destructive',
          onPress: async () => {
            try {
              await bookingsApi.cancelBooking(token, booking.id);
              loadBookings();
            } catch (error: any) {
              Alert.alert(t.common.error, error.message || t.trip.bookingError);
            }
          },
        },
      ]
    );
  };

  const handlePay = async (booking: Booking) => {
    if (!token) return;
    setPayingId(booking.id);
    try {
      await launchPayment(booking.id, token);
    } catch (error: any) {
      Alert.alert(t.common.error, error.message || 'No se pudo iniciar el pago');
    } finally {
      setPayingId(null);
    }
  };

  const now = new Date();
  const upcoming = bookings.filter(b => {
    const tripDate = new Date(b.trip.departure_time);
    return (b.status === 'confirmed' || b.status === 'pending') && tripDate >= now;
  });
  const past = bookings.filter(b => {
    const tripDate = new Date(b.trip.departure_time);
    return b.status === 'completed' || b.status === 'cancelled' || tripDate < now;
  });
  const items = activeTab === 'upcoming' ? upcoming : past;

  const renderBooking = ({ item }: { item: Booking }) => {
    const statusStyle = getStatusColor(item.status);
    const isDriver = user?.id === item.trip.driver?.id;
    const isFutureTrip = new Date(item.trip.departure_time) >= now;
    const paymentStatus = item.payment?.status;
    const isPaid = paymentStatus === 'success';
    const isPaymentPending = paymentStatus === 'pending';
    const isPaymentRetryable = !paymentStatus || paymentStatus === 'failed' || paymentStatus === 'refunded';
    const isPayable = !isDriver && item.status === 'confirmed' && isFutureTrip && isPaymentRetryable;
    const isCancellable = !isDriver && item.status === 'confirmed' && isFutureTrip && !isPaid && !isPaymentPending;
    const isPaying = payingId === item.id;
    const shouldShowActions = isPaid || isPaymentPending || isPayable || isCancellable;

    return (
      <TouchableOpacity
        style={[styles.bookingCard, { backgroundColor: colors.background.card, ...shadow.sm }]}
        onPress={() => router.push(`/trip/${item.trip.id}` as any)}
        activeOpacity={0.7}
      >
        {/* Header: status + role badge */}
        <View style={styles.cardHeader}>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text, fontSize: typography.sizes.xs, fontWeight: fontWeight.semibold, fontFamily: typography.family.semibold }]}>{statusStyle.label}</Text>
          </View>
          <View style={[styles.typeBadge, { backgroundColor: colors.background.default }]}>
            <Ionicons name={isDriver ? 'car-sport' : 'person'} size={14} color={colors.secondary.default} />
            <Text style={[styles.typeText, { color: colors.secondary.default, fontSize: typography.sizes.sm, fontWeight: fontWeight.medium, fontFamily: typography.family.medium }]}>
              {isDriver ? t.common.driver : t.common.passenger}
            </Text>
          </View>
        </View>

        {/* Route */}
        <View style={styles.routeInfo}>
          <View style={styles.routePoint}>
            <Ionicons name="location" size={14} color={colors.tertiary.default} />
            <Text style={[styles.routeText, { color: colors.text.primary, fontSize: typography.sizes.sm, fontFamily: typography.family.regular }]} numberOfLines={1}>{item.trip.origin_name}</Text>
          </View>
          <View style={[styles.routeLine, { backgroundColor: colors.border.default }]} />
          <View style={styles.routePoint}>
            <Ionicons name="flag" size={14} color={colors.secondary.default} />
            <Text style={[styles.routeText, { color: colors.text.primary, fontSize: typography.sizes.sm, fontFamily: typography.family.regular }]} numberOfLines={1}>{item.trip.destination_name}</Text>
          </View>
        </View>

        {/* Footer: date / time / price */}
        <View style={styles.cardFooter}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={14} color={colors.text.muted} />
            <Text style={[styles.detailText, { color: colors.text.secondary, fontSize: typography.sizes.sm, fontFamily: typography.family.regular, marginLeft: spacing.xs }]}>{formatDate(item.trip.departure_time)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={14} color={colors.text.muted} />
            <Text style={[styles.detailText, { color: colors.text.secondary, fontSize: typography.sizes.sm, fontFamily: typography.family.regular, marginLeft: spacing.xs }]}>{formatTime(item.trip.departure_time)}</Text>
          </View>
          <Text style={[styles.priceText, { color: colors.tertiary.default, fontSize: typography.sizes.lg, fontWeight: fontWeight.bold, fontFamily: typography.family.bold }]}>${Number(item.trip.price).toLocaleString(language === 'en' ? 'en-US' : 'es-CO')}</Text>
        </View>

        {/* Acciones: Pagar + Cancelar (solo pasajero, confirmado, futuro) */}
        {shouldShowActions && (
          <View style={[styles.actionsRow, { borderTopColor: colors.border.default }]}> 
            {isPaid ? (
              <View style={[styles.paidBadge, { backgroundColor: colors.status.successBg }]}> 
                <Ionicons name="checkmark-circle" size={16} color={colors.status.success} />
                <Text style={[styles.paidText, { color: colors.status.success, fontFamily: typography.family.semibold }]}>Pagado</Text>
              </View>
            ) : isPaymentPending ? (
              <View style={[styles.paidBadge, { backgroundColor: colors.status.warningBg }]}> 
                <Ionicons name="time-outline" size={16} color={colors.status.warning} />
                <Text style={[styles.paidText, { color: colors.status.warning, fontFamily: typography.family.semibold }]}>Pago pendiente</Text>
              </View>
            ) : isPayable ? (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.secondary.default }]}
                onPress={() => handlePay(item)}
                disabled={isPaying}
              >
                {isPaying ? (
                  <ActivityIndicator size="small" color={colors.primary.contrast} />
                ) : (
                  <>
                    <Ionicons name="card-outline" size={16} color={colors.primary.contrast} />
                    <Text style={[styles.actionButtonText, { color: colors.primary.contrast }]}>Pagar</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : null}
            {isCancellable && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.status.errorBg, borderWidth: 1, borderColor: colors.status.error }]}
                  onPress={() => handleCancel(item)}
                >
                  <Ionicons name="close-outline" size={16} color={colors.status.error} />
                  <Text style={[styles.actionButtonText, { color: colors.status.error }]}>{t.bookings.cancelBooking}</Text>
                </TouchableOpacity>
            )}
          </View>
        )}

        {/* Info del pasajero (vista conductor) */}
        {isDriver && item.status === 'pending' && (
          <View style={[styles.passengerInfo, { borderTopColor: colors.border.default }]}>
            <Ionicons name="person-outline" size={14} color={colors.text.muted} />
            <Text style={[styles.detailText, { color: colors.text.secondary, fontSize: typography.sizes.sm, fontFamily: typography.family.regular, marginLeft: spacing.xs }]}>
              {item.passenger?.full_name || t.common.passenger}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      <PageHeader title={t.bookings.title} />

      {/* Tabs */}
      <View style={[styles.tabContainer, { backgroundColor: colors.background.card, borderBottomColor: colors.border.default }]}>
        <TouchableOpacity
          style={[styles.tab, { marginRight: spacing.lg }, activeTab === 'upcoming' && { borderBottomColor: colors.secondary.default }]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, { color: colors.text.muted }, activeTab === 'upcoming' && { color: colors.secondary.default, fontWeight: fontWeight.semibold }]}>
            {t.bookings.upcoming}
          </Text>
          {upcoming.length > 0 && (
            <View style={[styles.tabBadge, { backgroundColor: colors.text.muted }, activeTab === 'upcoming' && { backgroundColor: colors.secondary.default + '30' }]}>
              <Text style={[styles.tabBadgeText, { color: colors.background.card }, activeTab === 'upcoming' && { color: colors.secondary.default }]}>
                {upcoming.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, { marginRight: spacing.lg }, activeTab === 'past' && { borderBottomColor: colors.secondary.default }]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, { color: colors.text.muted }, activeTab === 'past' && { color: colors.secondary.default, fontWeight: fontWeight.semibold }]}>
            {t.bookings.history}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={[styles.emptyState, { alignItems: 'center' }]}>
            <ActivityIndicator size="large" color={colors.secondary.default} />
          </View>
        ) : items.length === 0 ? (
          <View style={[styles.emptyState, { alignItems: 'center' }]}>
            <Ionicons name="car-sport-outline" size={64} color={colors.text.muted} />
            <Text style={[styles.emptyText, { color: colors.text.primary }]}>
              {activeTab === 'upcoming' ? t.bookings.noUpcoming : t.bookings.noHistory}
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.text.muted }]}>
              {activeTab === 'upcoming' ? t.bookings.noUpcomingSub : t.bookings.noHistorySub}
            </Text>
            {activeTab === 'upcoming' && (
              <TouchableOpacity
                style={[styles.emptyButton, { backgroundColor: colors.secondary.default }]}
                onPress={() => router.push('/search')}
              >
                <Text style={[styles.emptyButtonText, { color: colors.primary.contrast }]}>{t.bookings.searchTrips}</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={items}
            renderItem={renderBooking}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderBottomWidth: 1,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {},
  tabBadge: {
    borderRadius: borderRadius.full,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  tabBadgeText: {},
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  bookingCard: { borderRadius: borderRadius.lg, padding: spacing.md },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {},
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  typeText: {},
  routeInfo: { marginBottom: spacing.md },
  routePoint: { flexDirection: 'row', alignItems: 'center' },
  routeText: { marginLeft: spacing.sm, flex: 1 },
  routeLine: { width: 1, height: 14, marginLeft: 7, marginVertical: spacing.xs },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  detailItem: { flexDirection: 'row', alignItems: 'center' },
  detailText: { marginLeft: spacing.xs },
  priceText: {},
  // Fila de acciones Pagar / Cancelar
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
    borderTopWidth: 1,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  paidBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  paidText: {
    fontSize: 14,
  },
  passengerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    gap: spacing.xs,
  },
  separator: { height: spacing.md },
  emptyState: { paddingVertical: spacing.xxxl },
  emptyText: { marginTop: spacing.md },
  emptySubtext: { marginTop: spacing.xs, textAlign: 'center' },
  emptyButton: {
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
  },
  emptyButtonText: {},
});
