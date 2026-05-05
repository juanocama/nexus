import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  FlatList,
  Platform,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { colors, borderRadius, typography, spacing, shadow } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';

const MOCK_TRIPS = [
  {
    id: '1',
    driver_name: 'Carlos Martínez',
    driver_faculty: 'Ingeniería',
    driver_rating: 4.8,
    origin: 'Centro Comercial Fontanar',
    destination: 'Universidad de La Sabana',
    departure_time: '7:00 AM',
    arrival_time: '7:45 AM',
    available_seats: 3,
    total_seats: 4,
    price: 8000,
    date: 'Hoy',
  },
  {
    id: '2',
    driver_name: 'María López',
    driver_faculty: 'Medicina',
    driver_rating: 4.9,
    origin: 'Estación Calle 100',
    destination: 'Universidad de La Sabana',
    departure_time: '7:30 AM',
    arrival_time: '8:15 AM',
    available_seats: 2,
    total_seats: 4,
    price: 6500,
    date: 'Hoy',
  },
  {
    id: '3',
    driver_name: 'Andrés Rodríguez',
    driver_faculty: 'Economía',
    driver_rating: 4.5,
    origin: 'Portal Norte',
    destination: 'Universidad de La Sabana',
    departure_time: '8:00 AM',
    arrival_time: '8:40 AM',
    available_seats: 1,
    total_seats: 4,
    price: 5000,
    date: 'Hoy',
  },
  {
    id: '4',
    driver_name: 'Laura Gómez',
    driver_faculty: 'Comunicación',
    driver_rating: 4.7,
    origin: 'Chicó Norte',
    destination: 'Universidad de La Sabana',
    departure_time: '6:45 AM',
    arrival_time: '7:30 AM',
    available_seats: 2,
    total_seats: 3,
    price: 7000,
    date: 'Hoy',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [searchOrigin, setSearchOrigin] = useState('');
  const [searchDest] = useState('Universidad de La Sabana');

  const renderTripCard = ({ item }: { item: typeof MOCK_TRIPS[0] }) => (
    <Link href={`/(app)/trip/${item.id}`} asChild>
      <TouchableOpacity style={styles.tripCard}>
        <View style={styles.cardHeader}>
          <View style={styles.driverInfo}>
            <View style={styles.driverAvatar}>
              <Text style={styles.avatarText}>{item.driver_name.charAt(0)}</Text>
            </View>
            <View>
              <Text style={styles.driverName}>{item.driver_name}</Text>
              <Text style={styles.driverFaculty}>{item.driver_faculty}</Text>
            </View>
          </View>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={styles.ratingText}>{item.driver_rating}</Text>
          </View>
        </View>

        <View style={styles.routeContainer}>
          <View style={styles.routePoint}>
            <Ionicons name="location" size={16} color={colors.tertiary.default} />
            <Text style={styles.routeText} numberOfLines={1}>{item.origin}</Text>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routePoint}>
            <Ionicons name="flag" size={16} color={colors.secondary.default} />
            <Text style={styles.routeText} numberOfLines={1}>{item.destination}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.tripDetails}>
            <Ionicons name="time-outline" size={14} color={colors.text.muted} />
            <Text style={styles.detailText}>{item.departure_time} - {item.arrival_time}</Text>
          </View>
          <View style={styles.tripDetails}>
            <Ionicons name="people-outline" size={14} color={colors.text.muted} />
            <Text style={styles.detailText}>{item.available_seats} asientos</Text>
          </View>
        </View>

        <View style={styles.cardBottom}>
          <Text style={styles.priceText}>${item.price.toLocaleString('es-CO')}</Text>
          <View style={styles.bookButton}>
            <Text style={styles.bookButtonText}>Reservar</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary.default} />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Buenos días</Text>
            <Text style={styles.userName}>Estudiante Unisabana</Text>
          </View>
          <View style={styles.headerActions}>
            <Link href="/(app)/notifications" asChild>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="notifications-outline" size={22} color={colors.primary.contrast} />
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>3</Text>
                </View>
              </TouchableOpacity>
            </Link>
            <Link href="/(app)/settings" asChild>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="settings-outline" size={22} color={colors.primary.contrast} />
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        <View style={styles.coinsBadge}>
          <Ionicons name="trophy-outline" size={16} color="#F59E0B" />
          <Text style={styles.coinsText}>150 Sabana Coins</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Buscar Viaje</Text>
          <View style={styles.searchContainer}>
            <Ionicons name="location-outline" size={20} color={colors.tertiary.default} />
            <TextInput
              style={styles.searchInput}
              placeholder="¿Desde dónde sales?"
              placeholderTextColor={colors.text.muted}
              value={searchOrigin}
              onChangeText={setSearchOrigin}
              onFocus={() => router.push('/(app)/search')}
            />
          </View>
          <View style={[styles.searchContainer, styles.destContainer]}>
            <Ionicons name="flag-outline" size={20} color={colors.secondary.default} />
            <TextInput
              style={styles.searchInput}
              value={searchDest}
              editable={false}
            />
          </View>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => router.push('/(app)/search')}
          >
            <Ionicons name="search" size={18} color={colors.primary.contrast} />
            <Text style={styles.searchButtonText}>Buscar viajes disponibles</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Viajes Disponibles Hoy</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/search')}>
              <Text style={styles.seeAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={MOCK_TRIPS}
            renderItem={renderTripCard}
            keyExtractor={(item) => item.id}
            horizontal={false}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.actionsGrid}>
            <Link href="/(app)/publish" asChild>
              <TouchableOpacity style={styles.actionCard}>
                <View style={[styles.actionIcon, { backgroundColor: colors.tertiary.default + '20' }]}>
                  <Ionicons name="car-sport" size={24} color={colors.tertiary.default} />
                </View>
                <Text style={styles.actionText}>Publicar Viaje</Text>
              </TouchableOpacity>
            </Link>
            <Link href="/(app)/bookings" asChild>
              <TouchableOpacity style={styles.actionCard}>
                <View style={[styles.actionIcon, { backgroundColor: colors.secondary.default + '20' }]}>
                  <Ionicons name="calendar-outline" size={24} color={colors.secondary.default} />
                </View>
                <Text style={styles.actionText}>Mis Reservas</Text>
              </TouchableOpacity>
            </Link>
            <Link href="/(app)/payments" asChild>
              <TouchableOpacity style={styles.actionCard}>
                <View style={[styles.actionIcon, { backgroundColor: '#F59E0B20' }]}>
                  <Ionicons name="card-outline" size={24} color="#F59E0B" />
                </View>
                <Text style={styles.actionText}>Métodos de Pago</Text>
              </TouchableOpacity>
            </Link>
            <Link href="/(app)/help" asChild>
              <TouchableOpacity style={styles.actionCard}>
                <View style={[styles.actionIcon, { backgroundColor: '#EC489920' }]}>
                  <Ionicons name="help-circle-outline" size={24} color="#EC4899" />
                </View>
                <Text style={styles.actionText}>Centro de Ayuda</Text>
              </TouchableOpacity>
            </Link>
          </View>
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
    backgroundColor: colors.primary.default,
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + spacing.md : spacing.md,
    paddingBottom: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  greeting: {
    fontSize: typography.sizes.sm,
    color: colors.primary.contrast + 'CC',
    fontFamily: typography.family.regular,
  },
  userName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary.contrast,
    fontFamily: typography.family.bold,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconButton: {
    position: 'relative',
    padding: spacing.sm,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: colors.status.error,
    borderRadius: borderRadius.full,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.primary.contrast,
  },
  coinsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.light,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  coinsText: {
    fontSize: typography.sizes.sm,
    color: '#F59E0B',
    marginLeft: spacing.xs,
    fontFamily: typography.family.semibold,
  },
  content: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background.card,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
    fontFamily: typography.family.bold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  destContainer: {
    opacity: 0.8,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    fontFamily: typography.family.regular,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary.default,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  searchButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.primary.contrast,
    marginLeft: spacing.sm,
    fontFamily: typography.family.semibold,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  seeAllText: {
    fontSize: typography.sizes.sm,
    color: colors.secondary.default,
    fontWeight: typography.weights.medium,
    fontFamily: typography.family.medium,
  },
  tripCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadow.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondary.default,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.primary.contrast,
    fontFamily: typography.family.bold,
  },
  driverName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    fontFamily: typography.family.semibold,
  },
  driverFaculty: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    fontFamily: typography.family.regular,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  ratingText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#92400E',
    marginLeft: spacing.xs,
    fontFamily: typography.family.bold,
  },
  routeContainer: {
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
    height: 16,
    backgroundColor: colors.border.default,
    marginLeft: 8,
    marginVertical: spacing.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  tripDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
    fontFamily: typography.family.regular,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.tertiary.default,
    fontFamily: typography.family.bold,
  },
  bookButton: {
    backgroundColor: colors.secondary.default,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  bookButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary.contrast,
    fontFamily: typography.family.semibold,
  },
  separator: {
    height: spacing.md,
  },
  quickActions: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actionCard: {
    width: '47%',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadow.sm,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    textAlign: 'center',
    fontFamily: typography.family.medium,
  },
});
