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
  Image,
  Dimensions,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { colors, borderRadius, typography, spacing, shadow } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import HeaderMenu from '@/components/HeaderMenu';

const { width } = Dimensions.get('window');

const MOCK_FREQUENT_ROUTES = [
  {
    id: '1',
    name: 'Puente Madera',
    time: '7:00 AM',
    days: 'Lunes y Viernes',
    destination: 'Universidad de La Sabana',
  },
  {
    id: '2',
    name: 'Portal Norte',
    time: '7:30 AM',
    days: 'Lunes a Viernes',
    destination: 'Universidad de La Sabana',
  },
  {
    id: '3',
    name: 'Chicó Norte',
    time: '6:45 AM',
    days: 'Martes y Jueves',
    destination: 'Universidad de La Sabana',
  },
];

const MOCK_AVAILABLE_TRIPS = [
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
    price: 8000,
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
    price: 6500,
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const renderFrequentRoute = ({ item }: { item: typeof MOCK_FREQUENT_ROUTES[0] }) => (
    <TouchableOpacity style={styles.routeCard}>
      <View style={styles.routeIcon}>
        <Ionicons name="car-outline" size={20} color={colors.secondary.default} />
      </View>
      <View style={styles.routeInfo}>
        <Text style={styles.routeName}>{item.name}</Text>
        <View style={styles.routeMeta}>
          <Ionicons name="time-outline" size={12} color={colors.text.muted} />
          <Text style={styles.routeTime}>{item.time} - {item.days}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
    </TouchableOpacity>
  );

  const renderTripCard = ({ item }: { item: typeof MOCK_AVAILABLE_TRIPS[0] }) => (
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
            <Ionicons name="star" size={10} color="#F59E0B" />
            <Text style={styles.ratingText}>{item.driver_rating}</Text>
          </View>
        </View>
        <View style={styles.routeContainer}>
          <View style={styles.routePoint}>
            <Ionicons name="location" size={14} color={colors.tertiary.default} />
            <Text style={styles.routeText} numberOfLines={1}>{item.origin}</Text>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routePoint}>
            <Ionicons name="flag" size={14} color={colors.secondary.default} />
            <Text style={styles.routeText} numberOfLines={1}>{item.destination}</Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <View style={styles.tripDetails}>
            <Ionicons name="time-outline" size={14} color={colors.text.muted} />
            <Text style={styles.detailText}>{item.departure_time}</Text>
          </View>
          <View style={styles.tripDetails}>
            <Ionicons name="people-outline" size={14} color={colors.text.muted} />
            <Text style={styles.detailText}>{item.available_seats} asientos</Text>
          </View>
          <Text style={styles.priceText}>${item.price.toLocaleString('es-CO')}</Text>
        </View>
      </TouchableOpacity>
    </Link>
  );

  const quickActions = [
    {
      title: 'Publicar trayecto',
      icon: 'add',
      color: colors.tertiary.default,
      bg: colors.tertiary.default + '20',
      href: '/(app)/publish',
    },
    {
      title: 'Mis reservas',
      icon: 'checkmark-circle',
      color: colors.secondary.default,
      bg: colors.secondary.default + '20',
      href: '/(app)/bookings',
    },
    {
      title: 'Mis viajes',
      icon: 'car-sport',
      color: '#6366F1',
      bg: '#6366F120',
      href: '/(app)/bookings',
    },
    {
      title: 'Mis publicaciones',
      icon: 'document-text',
      color: '#F59E0B',
      bg: '#F59E0B20',
      href: '/(app)/bookings',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary.default} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Image source={require('../../assets/icon.png')} style={styles.avatar} />
          <View style={styles.branding}>
            <Text style={styles.brandText}>NEXUS</Text>
          </View>
          <Link href="/(app)/notifications" asChild>
            <TouchableOpacity style={styles.notifButton}>
              <Ionicons name="notifications-outline" size={24} color={colors.primary.contrast} />
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>3</Text>
              </View>
            </TouchableOpacity>
          </Link>
          <HeaderMenu />
        </View>
        <Text style={styles.greeting}>{getGreeting()}, Carlos</Text>
        <Text style={styles.subGreeting}>¿A dónde te diriges hoy?</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* CTA Card */}
        <TouchableOpacity
          style={styles.ctaCard}
          onPress={() => router.push('/(app)/search')}
        >
          <View style={styles.ctaGradient}>
            <View style={styles.ctaLeft}>
              <View style={styles.ctaIconBg}>
                <Ionicons name="search" size={28} color={colors.primary.contrast} />
              </View>
              <Text style={styles.ctaTitle}>Buscar trayecto</Text>
              <Text style={styles.ctaSubtitle}>Encuentra tu próximo viaje</Text>
            </View>
            <View style={styles.ctaRight}>
              <Ionicons name="car-sport" size={64} color={colors.primary.contrast + '40'} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Quick Actions Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accesos rápidos</Text>
          <View style={styles.grid}>
            {quickActions.map((action, i) => (
              <Link href={action.href as any} key={i} asChild>
                <TouchableOpacity style={styles.gridCard}>
                  <View style={[styles.gridIcon, { backgroundColor: action.bg }]}>
                    <Ionicons name={action.icon as any} size={22} color={action.color} />
                  </View>
                  <Text style={styles.gridText}>{action.title}</Text>
                </TouchableOpacity>
              </Link>
            ))}
          </View>
        </View>

        {/* Rutas frecuentes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Rutas frecuentes</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/bookings')}>
              <Text style={styles.seeAll}>Ver todas</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={MOCK_FREQUENT_ROUTES}
            renderItem={renderFrequentRoute}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.routeList}
          />
        </View>

        {/* Viajes disponibles */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Viajes disponibles hoy</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/search')}>
              <Text style={styles.seeAll}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={MOCK_AVAILABLE_TRIPS}
            renderItem={renderTripCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
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
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + spacing.lg : spacing.lg,
    paddingBottom: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
  },
  branding: {
    flex: 1,
    alignItems: 'center',
  },
  brandText: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.extrabold,
    color: colors.primary.contrast,
    fontFamily: typography.family.bold,
    letterSpacing: 2,
  },
  notifButton: {
    position: 'relative',
    padding: spacing.sm,
  },
  notifBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.status.error,
    borderRadius: borderRadius.full,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifBadgeText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.primary.contrast,
  },
  greeting: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary.contrast,
    fontFamily: typography.family.bold,
  },
  subGreeting: {
    fontSize: typography.sizes.md,
    color: colors.primary.contrast + 'AA',
    fontFamily: typography.family.regular,
    marginTop: spacing.xs,
  },
  content: {
    flex: 1,
  },
  ctaCard: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadow.lg,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    minHeight: 120,
    backgroundColor: colors.primary.default,
  },
  ctaLeft: {
    flex: 1,
  },
  ctaIconBg: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.contrast + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  ctaTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary.contrast,
    fontFamily: typography.family.bold,
  },
  ctaSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.primary.contrast + 'CC',
    fontFamily: typography.family.regular,
    marginTop: spacing.xs,
  },
  ctaRight: {
    alignItems: 'flex-end',
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
    fontFamily: typography.family.bold,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  seeAll: {
    fontSize: typography.sizes.sm,
    color: colors.secondary.default,
    fontWeight: typography.weights.semibold,
    fontFamily: typography.family.semibold,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  gridCard: {
    width: (width - spacing.lg * 2 - spacing.md) / 2,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadow.sm,
  },
  gridIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  gridText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    fontFamily: typography.family.semibold,
  },
  routeList: {
    gap: spacing.sm,
  },
  routeCard: {
    width: width * 0.7,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.sm,
    ...shadow.sm,
  },
  routeIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondary.default + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  routeInfo: {
    flex: 1,
  },
  routeName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    fontFamily: typography.family.semibold,
  },
  routeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  routeTime: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginLeft: spacing.xs,
    fontFamily: typography.family.regular,
  },
  tripCard: {
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
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondary.default,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    fontSize: typography.sizes.sm,
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
    fontSize: typography.sizes.xs,
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
    height: 14,
    backgroundColor: colors.border.default,
    marginLeft: 7,
    marginVertical: spacing.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  priceText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.tertiary.default,
    fontFamily: typography.family.bold,
  },
  separator: {
    height: spacing.md,
  },
});
