import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  Dimensions,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import TabHeader from '@/components/TabHeader';
import { useSettings } from '@/context/SettingsContext';
import { borderRadius, spacing, shadow, colors } from '@/theme/colors';

const { width } = Dimensions.get('window');

const MOCK_FREQUENT_ROUTES = [
  { id: '1', name: 'Puente Madera', time: '7:00 AM', days: 'Lunes y Viernes', destination: 'Universidad de La Sabana' },
  { id: '2', name: 'Portal Norte', time: '7:30 AM', days: 'Lunes a Viernes', destination: 'Universidad de La Sabana' },
  { id: '3', name: 'Chicó Norte', time: '6:45 AM', days: 'Martes y Jueves', destination: 'Universidad de La Sabana' },
];

const MOCK_AVAILABLE_TRIPS = [
  { id: '1', driver_name: 'Carlos Martínez', driver_faculty: 'Ingeniería', driver_rating: 4.8, origin: 'Centro Comercial Fontanar', destination: 'Universidad de La Sabana', departure_time: '7:00 AM', arrival_time: '7:45 AM', available_seats: 3, price: 8000 },
  { id: '2', driver_name: 'María López', driver_faculty: 'Medicina', driver_rating: 4.9, origin: 'Estación Calle 100', destination: 'Universidad de La Sabana', departure_time: '7:30 AM', arrival_time: '8:15 AM', available_seats: 2, price: 6500 },
];

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useSettings();
  const { colors, typography, spacing: themeSpacing } = useTheme();
  const [searchText, setSearchText] = useState('');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.home.greeting.morning;
    if (hour < 18) return t.home.greeting.afternoon;
    return t.home.greeting.evening;
  };

  const h = t.home;
  const c = t.common;

  const renderFrequentRoute = ({ item }: { item: typeof MOCK_FREQUENT_ROUTES[0] }) => (
    <TouchableOpacity style={[styles.routeCard, { backgroundColor: colors.background.card, ...shadow.sm }]}>
      <View style={styles.routeIcon}>
        <Ionicons name="car-outline" size={20} color={colors.secondary.default} />
      </View>
      <View style={styles.routeInfo}>
        <Text style={[styles.routeName, { color: colors.text.primary, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold }]}>{item.name}</Text>
        <View style={styles.routeMeta}>
          <Ionicons name="time-outline" size={12} color={colors.text.muted} />
          <Text style={[styles.routeTime, { color: colors.text.muted, fontSize: typography.sizes.xs, fontFamily: typography.family.regular }]}>{item.time} - {item.days}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
    </TouchableOpacity>
  );

  const renderTripCard = ({ item }: { item: typeof MOCK_AVAILABLE_TRIPS[0] }) => (
    <Link href={`/trip/${item.id}`} asChild>
      <TouchableOpacity style={[styles.tripCard, { backgroundColor: colors.background.card, ...shadow.sm }]}>
        <View style={styles.cardHeader}>
          <View style={styles.driverInfo}>
            <View style={[styles.driverAvatar, { backgroundColor: colors.secondary.default }]}>
              <Text style={[styles.avatarText, { color: colors.primary.contrast, fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, fontFamily: typography.family.bold }]}>{item.driver_name.charAt(0)}</Text>
            </View>
            <View>
               <Text style={[styles.driverName, { color: colors.text.primary, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold }]}>{item.driver_name}</Text>
               <Text style={[styles.driverFaculty, { color: colors.text.muted, fontSize: typography.sizes.sm, fontFamily: typography.family.regular }]}>{item.driver_faculty}</Text>
            </View>
          </View>
          <View style={[styles.ratingBadge, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="star" size={10} color="#F59E0B" />
             <Text style={[styles.ratingText, { color: '#92400E', fontSize: typography.sizes.xs, fontWeight: typography.weights.bold, fontFamily: typography.family.bold }]}>{item.driver_rating}</Text>
          </View>
        </View>
        <View style={styles.routeContainer}>
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
          <View style={styles.tripDetails}>
            <Ionicons name="time-outline" size={14} color={colors.text.muted} />
             <Text style={[styles.detailText, { color: colors.text.secondary, fontSize: typography.sizes.sm, fontFamily: typography.family.regular }]}>{item.departure_time}</Text>
          </View>
          <View style={styles.tripDetails}>
            <Ionicons name="people-outline" size={14} color={colors.text.muted} />
             <Text style={[styles.detailText, { color: colors.text.secondary, fontSize: typography.sizes.sm, fontFamily: typography.family.regular }]}>{item.available_seats} {c.seats}</Text>
          </View>
           <Text style={[styles.priceText, { color: colors.tertiary.default, fontSize: typography.sizes.md, fontWeight: typography.weights.bold, fontFamily: typography.family.bold }]}>${item.price.toLocaleString('es-CO')}</Text>
        </View>
      </TouchableOpacity>
    </Link>
  );

  const quickActions = [
    { title: h.publishTrip, icon: 'add', color: colors.tertiary.default, bg: colors.tertiary.default + '20', href: '/(tabs)/publish' },
    { title: h.myBookings, icon: 'checkmark-circle', color: colors.secondary.default, bg: colors.secondary.default + '20', href: '/bookings' },
    { title: h.myTrips, icon: 'car-sport', color: colors.secondary.default, bg: colors.secondary.default + '20', href: '/bookings' },
    { title: h.myPublications, icon: 'document-text', color: colors.secondary.default, bg: colors.secondary.default + '20', href: '/bookings' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary.default} />

      <TabHeader />
      <View style={[styles.greetingSection, { backgroundColor: colors.primary.default, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }]}>
        <Text style={{ color: colors.primary.contrast, fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, fontFamily: typography.family.bold }}>{getGreeting()}, Carlos</Text>
        <Text style={{ color: colors.primary.contrast + 'AA', fontSize: typography.sizes.md, fontFamily: typography.family.regular }}>{h.subGreeting}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={[styles.ctaCard, { backgroundColor: colors.primary.default }]} onPress={() => router.push('/search')}>
          <View style={styles.ctaLeft}>
            <View style={[styles.ctaIconBg, { backgroundColor: colors.primary.contrast + '20' }]}>
              <Ionicons name="search" size={28} color={colors.primary.contrast} />
            </View>
             <Text style={[styles.ctaTitle, { color: colors.primary.contrast, fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, fontFamily: typography.family.bold }]}>{h.searchTrip}</Text>
             <Text style={[styles.ctaSubtitle, { color: colors.primary.contrast + 'CC', fontSize: typography.sizes.md, fontFamily: typography.family.regular }]}>{h.searchTripSub}</Text>
          </View>
          <View style={styles.ctaRight}>
            <Ionicons name="car-sport" size={64} color={colors.primary.contrast + '40'} />
          </View>
        </TouchableOpacity>

        <View style={styles.section}>
           <Text style={[styles.sectionTitle, { color: colors.text.primary, fontWeight: typography.weights.bold, fontFamily: typography.family.bold }]}>{h.quickActions}</Text>
          <View style={styles.grid}>
            {quickActions.map((action, i) => (
              <Link href={action.href as any} key={i} asChild>
                <TouchableOpacity style={[styles.gridCard, { backgroundColor: colors.background.card, ...shadow.sm }]}>
                  <View style={[styles.gridIcon, { backgroundColor: action.bg }]}>
                    <Ionicons name={action.icon as any} size={22} color={action.color} />
                  </View>
                   <Text style={[styles.gridText, { color: colors.text.primary, fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold }]}>{action.title}</Text>
                </TouchableOpacity>
              </Link>
            ))}
          </View>
        </View>

        <View style={styles.section}>
        <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary, fontWeight: typography.weights.bold, fontFamily: typography.family.bold }]}>{h.frequentRoutes}</Text>
            <TouchableOpacity onPress={() => router.push('/bookings')}>
              <Text style={[styles.seeAll, { color: colors.secondary.default, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold }]}>{h.seeAll}</Text>
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

        <View style={styles.section}>
        <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary, fontWeight: typography.weights.bold, fontFamily: typography.family.bold }]}>{h.availableTrips}</Text>
            <TouchableOpacity onPress={() => router.push('/search')}>
              <Text style={[styles.seeAll, { color: colors.secondary.default, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold }]}>{h.seeAll}</Text>
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

        <View style={{ height: themeSpacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  greetingSection: {},
  content: { flex: 1 },
  ctaCard: { marginHorizontal: spacing.lg, marginVertical: spacing.lg, borderRadius: borderRadius.xl, overflow: 'hidden' },
  ctaGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, minHeight: 120 },
  ctaLeft: { flex: 1 },
  ctaIconBg: { width: 48, height: 48, borderRadius: borderRadius.full, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
  ctaTitle: {},
  ctaSubtitle: { marginTop: spacing.xs },
  ctaRight: { alignItems: 'flex-end' },
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionTitle: { marginBottom: spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  seeAll: {},
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  gridCard: { width: (width - spacing.lg * 2 - spacing.md) / 2, borderRadius: borderRadius.lg, padding: spacing.md },
  gridIcon: { width: 44, height: 44, borderRadius: borderRadius.full, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
  gridText: {},
  routeList: { gap: spacing.sm },
  routeCard: { width: width * 0.7, borderRadius: borderRadius.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', marginRight: spacing.sm },
  routeIcon: { width: 40, height: 40, borderRadius: borderRadius.full, backgroundColor: colors.secondary.default + '15', justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm },
  routeInfo: { flex: 1 },
  routeName: {},
  routeMeta: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  routeTime: { marginLeft: spacing.xs },
  tripCard: { borderRadius: borderRadius.lg, padding: spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  driverInfo: { flexDirection: 'row', alignItems: 'center' },
  driverAvatar: { width: 36, height: 36, borderRadius: borderRadius.full, justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm },
  avatarText: {},
  driverName: {},
  driverFaculty: {},
  ratingBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm },
  ratingText: { marginLeft: spacing.xs },
  routeContainer: { marginBottom: spacing.md },
  routePoint: { flexDirection: 'row', alignItems: 'center' },
  routeText: { marginLeft: spacing.sm, flex: 1 },
  routeLine: { width: 1, height: 14, marginLeft: 7, marginVertical: spacing.xs },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tripDetails: { flexDirection: 'row', alignItems: 'center' },
  detailText: { marginLeft: spacing.xs },
  priceText: {},
  separator: { height: spacing.md },
});
