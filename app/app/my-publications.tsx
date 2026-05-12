import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { borderRadius, spacing, shadow } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useSettings } from '@/context/SettingsContext';
import PageHeader from '@/components/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { tripsApi } from '@/api/trips';

interface DriverTrip {
  id: string;
  origin_name: string;
  destination_name: string;
  departure_time: string;
  total_seats: number;
  available_seats: number;
  price: number;
  status: string;
  notes?: string;
  confirmed_passengers?: number;
}

export default function MyPublicationsScreen() {
  const router = useRouter();
  const { colors, typography } = useTheme();
  const { t } = useSettings();
  const { token } = useAuth();
  const [trips, setTrips] = useState<DriverTrip[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTrips = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await tripsApi.getMyTrips(token);
      setTrips(data as DriverTrip[] || []);
    } catch {
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const isTomorrow = d.toDateString() === tomorrow.toDateString();

      if (isToday) return `Hoy, ${d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}`;
      if (isTomorrow) return `Mañana, ${d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}`;
      return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const handleCancelTrip = (trip: DriverTrip) => {
    if (!token) return;

    if (trip.confirmed_passengers && trip.confirmed_passengers > 0) {
      Alert.alert('No disponible', 'No puedes cancelar un viaje que ya tiene pasajeros confirmados');
      return;
    }

    Alert.alert(
      'Cancelar publicación',
      'Estas seguro de que deseas cancelar esta publicación?',
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: 'Cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await tripsApi.cancelTrip(token, trip.id);
              loadTrips();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'No se pudo cancelar la publicación');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return { bg: colors.status.successBg, text: colors.status.success, label: 'Activo' };
      case 'completed': return { bg: colors.status.infoBg, text: colors.status.info, label: 'Completado' };
      case 'cancelled': return { bg: colors.status.errorBg, text: colors.status.error, label: 'Cancelado' };
      default: return { bg: colors.status.warningBg, text: colors.status.warning, label: status };
    }
  };

  const handleTripPress = (trip: DriverTrip) => {
    const canDelete = (!trip.confirmed_passengers || trip.confirmed_passengers === 0);
    const isEditable = trip.status === 'active' || trip.status === 'scheduled';

    if (!canDelete || !isEditable) return;

    Alert.alert(
      'Opciones de publicación',
      `${trip.origin_name} → ${trip.destination_name}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Editar', onPress: () => router.push({ pathname: '/(tabs)/publish', params: { tripId: trip.id, tripData: JSON.stringify(trip) } }) },
        { text: 'Eliminar', style: 'destructive', onPress: () => handleCancelTrip(trip) },
      ]
    );
  };

  const renderTrip = ({ item }: { item: DriverTrip }) => {
    const statusStyle = getStatusColor(item.status);
    const canDelete = !item.confirmed_passengers || item.confirmed_passengers === 0;
    const isEditable = item.status === 'active' || item.status === 'scheduled';

    return (
      <TouchableOpacity
        style={[styles.tripCard, { backgroundColor: colors.background.card, ...shadow.sm }]}
        onPress={() => handleTripPress(item)}
        disabled={!canDelete || !isEditable}
        activeOpacity={canDelete && isEditable ? 0.7 : 1}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text, fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold }]}>{statusStyle.label}</Text>
          </View>
          {canDelete && item.status === 'active' && (
            <TouchableOpacity onPress={() => handleCancelTrip(item)}>
              <Ionicons name="trash-outline" size={20} color={colors.status.error} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.routeInfo}>
          <View style={styles.routePoint}>
            <Ionicons name="location" size={14} color={colors.tertiary.default} />
            <Text style={[styles.routeText, { color: colors.text.primary, fontSize: typography.sizes.sm, fontFamily: typography.family.regular }]} numberOfLines={1}>{item.origin_name}</Text>
          </View>
          <View style={[styles.routeLine, { backgroundColor: colors.border.default }]} />
          <View style={styles.routePoint}>
            <Ionicons name="flag" size={14} color={colors.secondary.default} />
            <Text style={[styles.routeText, { color: colors.text.primary, fontSize: typography.sizes.sm, fontFamily: typography.family.regular }]} numberOfLines={1}>{item.destination_name}</Text>
          </View>
        </View>

        <View style={styles.cardFooterRow}>
          <View style={styles.cardFooterDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={14} color={colors.text.muted} />
              <Text style={[styles.detailText, { color: colors.text.secondary, fontSize: typography.sizes.sm, fontFamily: typography.family.regular, marginLeft: spacing.xs }]}>{formatDate(item.departure_time)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={14} color={colors.text.muted} />
              <Text style={[styles.detailText, { color: colors.text.secondary, fontSize: typography.sizes.sm, fontFamily: typography.family.regular, marginLeft: spacing.xs }]}>{formatTime(item.departure_time)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="people" size={14} color={colors.text.muted} />
              <Text style={[styles.detailText, { color: colors.text.secondary, fontSize: typography.sizes.sm, fontFamily: typography.family.regular, marginLeft: spacing.xs }]}>
                {item.confirmed_passengers || 0}/{item.total_seats}
              </Text>
            </View>
          </View>
          <Text style={[styles.priceText, { color: colors.tertiary.default, fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, fontFamily: typography.family.bold }]}>${Number(item.price).toLocaleString('es-CO')}</Text>
        </View>

        {!canDelete && item.status === 'active' && (
          <View style={[styles.warningBox, { borderTopColor: colors.border.default }]}>
            <Ionicons name="information-circle" size={14} color={colors.status.warning} />
            <Text style={[styles.warningText, { color: colors.status.warning, fontSize: typography.sizes.xs, fontFamily: typography.family.regular }]}>
              No editable - tiene pasajeros confirmados
            </Text>
          </View>
        )}
        {canDelete && isEditable && (
          <Text style={[styles.tapHint, { color: colors.text.muted, fontSize: typography.sizes.xs, fontFamily: typography.family.regular }]}>
            Toca para ver opciones
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      <PageHeader title={t.home.myPublications} />

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={[styles.emptyState, { alignItems: 'center' }]}>
            <ActivityIndicator size="large" color={colors.secondary.default} />
          </View>
        ) : trips.length === 0 ? (
          <View style={[styles.emptyState, { alignItems: 'center' }]}>
            <Ionicons name="document-text-outline" size={64} color={colors.text.muted} />
            <Text style={[styles.emptyText, { color: colors.text.primary }]}>
              No tienes publicaciones activas
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.text.muted }]}>
              Publica un viaje para comenzar
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: colors.secondary.default }]}
              onPress={() => router.push('/publish')}
            >
              <Text style={[styles.emptyButtonText, { color: colors.primary.contrast }]}>{t.home.publishTrip}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={trips}
            renderItem={renderTrip}
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
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  tripCard: { borderRadius: borderRadius.lg, padding: spacing.md },
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
  routeInfo: { marginBottom: spacing.md },
  routePoint: { flexDirection: 'row', alignItems: 'center' },
  routeText: { marginLeft: spacing.sm, flex: 1 },
  routeLine: { width: 1, height: 14, marginLeft: 7, marginVertical: spacing.xs },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardFooterDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.md,
    flex: 1,
  },
  detailItem: { flexDirection: 'row', alignItems: 'center' },
  detailText: {},
  priceText: {},
  tapHint: { textAlign: 'center', marginTop: spacing.xs },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    gap: spacing.xs,
  },
  warningText: {},
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
