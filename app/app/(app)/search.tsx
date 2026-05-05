import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  FlatList,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { colors, borderRadius, typography, spacing, shadow } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';

const MOCK_RESULTS = [
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
  },
  {
    id: '5',
    driver_name: 'Diego Herrera',
    driver_faculty: 'Derecho',
    driver_rating: 4.6,
    origin: 'Usaquén',
    destination: 'Universidad de La Sabana',
    departure_time: '7:15 AM',
    arrival_time: '8:00 AM',
    available_seats: 3,
    total_seats: 4,
    price: 7500,
  },
];

export default function SearchScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('Universidad de La Sabana');
  const [date, setDate] = useState('Hoy');
  const [results, setResults] = useState<typeof MOCK_RESULTS>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    setHasSearched(true);
    if (origin.trim() || destination.trim()) {
      setResults(MOCK_RESULTS);
    } else {
      setResults([]);
    }
  };

  const handleBookTrip = (tripId: string) => {
    router.push(`/(app)/trip/${tripId}`);
  };

  const renderTripCard = ({ item }: { item: typeof MOCK_RESULTS[0] }) => (
    <TouchableOpacity
      style={styles.tripCard}
      onPress={() => handleBookTrip(item.id)}
    >
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
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => handleBookTrip(item.id)}
        >
          <Text style={styles.bookButtonText}>Ver Detalles</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarSmall}>
            <Text style={styles.headerAvatarText}>N</Text>
          </View>
          <Text style={styles.headerBrand}>NEXUS</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Ionicons name="notifications-outline" size={24} color={colors.primary.contrast} />
            <View style={styles.badge} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.searchForm}>
          <Text style={styles.sectionTitle}>Buscar Viajes</Text>
          <View style={styles.inputGroup}>
            <Ionicons name="location-outline" size={20} color={colors.tertiary.default} />
            <TextInput
              style={styles.input}
              placeholder="Punto de origen"
              placeholderTextColor={colors.text.muted}
              value={origin}
              onChangeText={setOrigin}
            />
          </View>

          <View style={styles.inputGroup}>
            <Ionicons name="flag-outline" size={20} color={colors.secondary.default} />
            <TextInput
              style={styles.input}
              placeholder="Destino"
              placeholderTextColor={colors.text.muted}
              value={destination}
              onChangeText={setDestination}
            />
          </View>

          <TouchableOpacity style={styles.dateButton}>
            <Ionicons name="calendar-outline" size={20} color={colors.text.secondary} />
            <Text style={styles.dateText}>{date}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Ionicons name="search" size={20} color={colors.primary.contrast} />
            <Text style={styles.searchButtonText}>Buscar</Text>
          </TouchableOpacity>
        </View>

        {hasSearched && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>
              {results.length} viajes encontrados
            </Text>
            {results.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="car-sport-outline" size={64} color={colors.text.muted} />
                <Text style={styles.emptyText}>No se encontraron viajes</Text>
                <Text style={styles.emptySubtext}>
                  Intenta con otros criterios de búsqueda
                </Text>
              </View>
            ) : (
              <FlatList
                data={results}
                renderItem={renderTripCard}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            )}
          </View>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerBrand: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.primary.contrast,
    fontFamily: typography.family.bold,
    letterSpacing: 2,
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondary.default,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.primary.contrast,
    fontFamily: typography.family.bold,
  },
  headerIconBtn: {
    padding: spacing.sm,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.status.error,
  },
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
    fontFamily: typography.family.bold,
  },
  content: {
    flex: 1,
  },
  searchForm: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  input: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    fontFamily: typography.family.regular,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  dateText: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    fontFamily: typography.family.regular,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary.default,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  searchButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.primary.contrast,
    marginLeft: spacing.sm,
    fontFamily: typography.family.semibold,
  },
  resultsSection: {
    paddingHorizontal: spacing.lg,
  },
  resultsTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
    fontFamily: typography.family.bold,
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
    fontFamily: typography.family.regular,
  },
});
