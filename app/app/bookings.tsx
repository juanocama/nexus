import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { borderRadius, spacing, shadow } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useSettings } from '@/context/SettingsContext';
import PageHeader from '@/components/PageHeader';

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
  const { colors, typography } = useTheme();
  const { t } = useSettings();
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');

  const upcoming = MOCK_BOOKINGS.filter(b => b.status === 'confirmed' || b.status === 'pending');
  const past = MOCK_BOOKINGS.filter(b => b.status === 'completed' || b.status === 'cancelled');
  const items = activeTab === 'upcoming' ? upcoming : past;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return { bg: colors.status.successBg, text: colors.status.success, label: t.bookings.confirmed };
      case 'pending': return { bg: colors.status.warningBg, text: colors.status.warning, label: t.bookings.pending };
      case 'completed': return { bg: colors.status.infoBg, text: colors.status.info, label: t.bookings.completed };
      default: return { bg: colors.status.errorBg, text: colors.status.error, label: t.bookings.cancelled };
    }
  };

  const renderBooking = ({ item }: { item: typeof MOCK_BOOKINGS[0] }) => {
    const statusStyle = getStatusColor(item.status);

    return (
      <Link href={`/trip/${item.id}`} asChild>
        <TouchableOpacity style={[styles.bookingCard, { backgroundColor: colors.background.card, ...shadow.sm }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusText, { color: statusStyle.text, fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold }]}>{statusStyle.label}</Text>
            </View>
            <View style={[styles.typeBadge, { backgroundColor: colors.background.default }]}>
              <Ionicons
                name={item.is_driver ? 'car-sport' : 'person'}
                size={14}
                color={colors.secondary.default}
              />
              <Text style={[styles.typeText, { color: colors.secondary.default, fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, fontFamily: typography.family.medium }]}>
                {item.is_driver ? t.common.driver : t.common.passenger}
              </Text>
            </View>
          </View>

          <View style={styles.routeInfo}>
            <View style={styles.routePoint}>
              <Ionicons name="location" size={14} color={colors.tertiary.default} />
              <Text style={[styles.routeText, { color: colors.text.primary, fontSize: typography.sizes.sm, fontFamily: typography.family.regular }]} numberOfLines={1}>{item.origin}</Text>
            </View>
            <View style={[styles.routeLine, { backgroundColor: colors.border.default }]} />
            <View style={styles.routePoint}>
              <Ionicons name="flag" size={14} color={colors.secondary.default} />
              <Text style={[styles.routeText, { color: colors.text.primary, fontSize: typography.sizes.sm, fontFamily: typography.family.regular }]} numberOfLines={1}>{item.destination}</Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={14} color={colors.text.muted} />
              <Text style={[styles.detailText, { color: colors.text.secondary, fontSize: typography.sizes.sm, fontFamily: typography.family.regular, marginLeft: spacing.xs }]}>{item.date}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={14} color={colors.text.muted} />
              <Text style={[styles.detailText, { color: colors.text.secondary, fontSize: typography.sizes.sm, fontFamily: typography.family.regular, marginLeft: spacing.xs }]}>{item.time}</Text>
            </View>
            <Text style={[styles.priceText, { color: colors.tertiary.default, fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, fontFamily: typography.family.bold }]}>${item.price.toLocaleString('es-CO')}</Text>
          </View>

          {!item.is_driver && item.status === 'confirmed' && (
            <TouchableOpacity
              style={[styles.cancelButton, { borderTopColor: colors.border.default }]}
              onPress={() => {}}
            >
              <Text style={[styles.cancelButtonText, { color: colors.status.error, fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, fontFamily: typography.family.medium }]}>Cancelar Reserva</Text>
            </TouchableOpacity>
          )}

          {item.is_driver && (
            <View style={[styles.passengerInfo, { borderTopColor: colors.border.default }]}>
              <Ionicons name="people-outline" size={14} color={colors.text.muted} />
<Text style={[styles.detailText, { color: colors.text.secondary, fontSize: typography.sizes.sm, fontFamily: typography.family.regular, marginLeft: spacing.xs }]}>
                 {item.passengers} {item.passengers === 1 ? t.bookings.passenger : t.bookings.passengers}
               </Text>
            </View>
          )}
        </TouchableOpacity>
      </Link>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      <PageHeader title={t.bookings.title} />

      <View style={[styles.tabContainer, { backgroundColor: colors.background.card, borderBottomColor: colors.border.default }]}>
        <TouchableOpacity
          style={[styles.tab, { marginRight: spacing.lg }, activeTab === 'upcoming' && { borderBottomColor: colors.secondary.default }]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, { color: colors.text.muted }, activeTab === 'upcoming' && { color: colors.secondary.default, fontWeight: typography.weights.semibold }]}>
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
          <Text style={[styles.tabText, { color: colors.text.muted }, activeTab === 'past' && { color: colors.secondary.default, fontWeight: typography.weights.semibold }]}>
            {t.bookings.history}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {items.length === 0 ? (
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
  cancelButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    marginTop: spacing.sm,
  },
  cancelButtonText: {},
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
