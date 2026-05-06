import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { colors, borderRadius, typography, spacing, shadow } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';

const MOCK_BOOKINGS = [
  {
    id: '1',
    driver_name: 'Carlos Martínez',
    origin: 'Centro Comercial Fontanar',
    destination: 'Universidad de La Sabana',
    date: 'Hoy',
    time: '7:00 AM',
    price: 8000,
    status: 'confirmed' as const,
    is_driver: false,
  },
  {
    id: '2',
    driver_name: 'María López',
    origin: 'Estación Calle 100',
    destination: 'Universidad de La Sabana',
    date: 'Mañana',
    time: '7:30 AM',
    price: 6500,
    status: 'pending' as const,
    is_driver: false,
  },
  {
    id: '3',
    origin: 'Portal Norte',
    destination: 'Universidad de La Sabana',
    date: '3 Mayo',
    time: '8:00 AM',
    price: 5000,
    status: 'completed' as const,
    is_driver: true,
    passengers: 3,
  },
  {
    id: '4',
    driver_name: 'Laura Gómez',
    origin: 'Chicó Norte',
    destination: 'Universidad de La Sabana',
    date: '1 Mayo',
    time: '6:45 AM',
    price: 7000,
    status: 'completed' as const,
    is_driver: false,
  },
];

type TabType = 'upcoming' | 'past';

export default function BookingsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');

  const upcoming = MOCK_BOOKINGS.filter(b => b.status === 'confirmed' || b.status === 'pending');
  const past = MOCK_BOOKINGS.filter(b => b.status === 'completed' || b.status === 'cancelled');
  const items = activeTab === 'upcoming' ? upcoming : past;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return { bg: colors.status.successBg, text: colors.status.success, label: 'Confirmado' };
      case 'pending': return { bg: colors.status.warningBg, text: colors.status.warning, label: 'Pendiente' };
      case 'completed': return { bg: colors.status.infoBg, text: colors.status.info, label: 'Completado' };
      default: return { bg: colors.status.errorBg, text: colors.status.error, label: 'Cancelado' };
    }
  };

  const renderBooking = ({ item }: { item: typeof MOCK_BOOKINGS[0] }) => {
    const statusStyle = getStatusColor(item.status);

    return (
      <Link href={`/trip/${item.id}`} asChild>
        <TouchableOpacity style={styles.bookingCard}>
          <View style={styles.cardHeader}>
            <View style={styles.statusBadge}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>{statusStyle.label}</Text>
            </View>
            <View style={styles.typeBadge}>
              <Ionicons
                name={item.is_driver ? 'car-sport' : 'person'}
                size={14}
                color={colors.secondary.default}
              />
              <Text style={styles.typeText}>
                {item.is_driver ? 'Conductor' : 'Pasajero'}
              </Text>
            </View>
          </View>

          <View style={styles.routeInfo}>
            <View style={styles.routePoint}>
              <Ionicons name="location" size={14} color={colors.tertiary.default} />
              <Text style={styles.routeText}>{item.origin}</Text>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routePoint}>
              <Ionicons name="flag" size={14} color={colors.secondary.default} />
              <Text style={styles.routeText}>{item.destination}</Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={14} color={colors.text.muted} />
              <Text style={styles.detailText}>{item.date}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={14} color={colors.text.muted} />
              <Text style={styles.detailText}>{item.time}</Text>
            </View>
            <Text style={styles.priceText}>${item.price.toLocaleString('es-CO')}</Text>
          </View>

          {!item.is_driver && item.status === 'confirmed' && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {}}
            >
              <Text style={styles.cancelButtonText}>Cancelar Reserva</Text>
            </TouchableOpacity>
          )}

          {item.is_driver && (
            <View style={styles.passengerInfo}>
              <Ionicons name="people-outline" size={14} color={colors.text.muted} />
              <Text style={styles.detailText}>
                {item.passengers} {item.passengers === 1 ? 'pasajero' : 'pasajeros'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Link>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary.contrast} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Viajes</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'upcoming' && styles.activeTabText
          ]}>Próximos</Text>
          {upcoming.length > 0 && (
            <View style={[styles.tabBadge, activeTab === 'upcoming' && styles.activeTabBadge]}>
              <Text style={[styles.tabBadgeText, activeTab === 'upcoming' && styles.activeTabBadgeText]}>
                {upcoming.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.activeTab]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'past' && styles.activeTabText
          ]}>Historial</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="car-sport-outline" size={64} color={colors.text.muted} />
            <Text style={styles.emptyText}>
              {activeTab === 'upcoming' ? 'No tienes viajes próximos' : 'No hay viajes en el historial'}
            </Text>
            <Text style={styles.emptySubtext}>
              {activeTab === 'upcoming' ? 'Busca un viaje o publica uno nuevo' : 'Tus viajes completados aparecerán aquí'}
            </Text>
            {activeTab === 'upcoming' && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push('/search')}
              >
                <Text style={styles.emptyButtonText}>Buscar Viajes</Text>
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
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.primary.contrast,
    fontFamily: typography.family.semibold,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background.card,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginRight: spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.secondary.default,
  },
  tabText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.muted,
    fontFamily: typography.family.medium,
  },
  activeTabText: {
    color: colors.secondary.default,
    fontWeight: typography.weights.semibold,
  },
  tabBadge: {
    backgroundColor: colors.text.muted,
    borderRadius: borderRadius.full,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  activeTabBadge: {
    backgroundColor: colors.secondary.default + '30',
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.background.card,
  },
  activeTabBadgeText: {
    color: colors.secondary.default,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  bookingCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadow.sm,
  },
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
    backgroundColor: colors.status.successBg,
  },
  statusText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    fontSize: typography.sizes.sm,
    color: colors.secondary.default,
    marginLeft: spacing.xs,
    fontFamily: typography.family.medium,
  },
  routeInfo: {
    marginBottom: spacing.md,
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
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
    fontFamily: typography.family.regular,
  },
  priceText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.tertiary.default,
    fontFamily: typography.family.bold,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    marginTop: spacing.sm,
  },
  cancelButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.status.error,
    fontWeight: typography.weights.medium,
    fontFamily: typography.family.medium,
  },
  passengerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  separator: {
    height: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginTop: spacing.md,
    fontFamily: typography.family.semibold,
  },
  emptySubtext: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    marginTop: spacing.xs,
    textAlign: 'center',
    fontFamily: typography.family.regular,
  },
  emptyButton: {
    backgroundColor: colors.secondary.default,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
  },
  emptyButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.primary.contrast,
    fontFamily: typography.family.semibold,
  },
});
