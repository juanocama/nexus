import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { borderRadius, spacing, shadow } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import TabHeader from '@/components/TabHeader';
import LocationSelector from '@/components/LocationSelector';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/context/AuthContext';
import { tripsApi } from '@/api/trips';

interface Trip {
  id: string;
  driver: {
    id: string;
    full_name: string;
    faculty?: string;
    average_rating?: number;
  };
  origin_name: string;
  destination_name: string;
  departure_time: string;
  available_seats: number;
  total_seats: number;
  price: number;
  status: string;
  notes?: string;
}

export default function SearchScreen() {
  const router = useRouter();
  const { t } = useSettings();
  const { colors, typography } = useTheme();
  const { token } = useAuth();
  const [origin, setOrigin] = useState<{ name: string; lat: number; lng: number } | null>(null);
  const [destination, setDestination] = useState<{ name: string; lat: number; lng: number } | null>(null);
  const [results, setResults] = useState<Trip[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const s = t.search;
  const c = t.common;

  const swapLocations = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const clearOrigin = () => setOrigin(null);
  const clearDestination = () => setDestination(null);
  const clearAll = () => {
    setOrigin(null);
    setDestination(null);
    setResults([]);
    setHasSearched(false);
  };

  const sameLocation = origin && destination && origin.name === destination.name;

  const handleSearch = async () => {
    if (sameLocation) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const data = await tripsApi.searchTrips(token!, {
        origin: origin?.name || undefined,
        destination: destination?.name || undefined,
      });
      setResults(data as Trip[] || []);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const renderTripCard = ({ item }: { item: Trip }) => (
    <TouchableOpacity
      style={[styles.tripCard, { backgroundColor: colors.background.card, ...shadow.md }]}
      onPress={() => router.push(`/trip/${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.driverInfo}>
          <View style={[styles.driverAvatar, { backgroundColor: colors.secondary.default }]}>
            <Text style={[styles.avatarText, { color: colors.primary.contrast, fontSize: typography.sizes.md, fontWeight: typography.weights.bold, fontFamily: typography.family.bold }]}>{item.driver?.full_name?.charAt(0) || '?'}</Text>
          </View>
          <View>
            <Text style={[styles.driverName, { color: colors.text.primary, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold }]}>{item.driver?.full_name || 'Desconocido'}</Text>
            <Text style={[styles.driverFaculty, { color: colors.text.muted, fontSize: typography.sizes.sm, fontFamily: typography.family.regular }]}>{item.driver?.faculty || '-'}</Text>
          </View>
        </View>
        {typeof item.driver?.average_rating === 'number' && (
          <View style={[styles.ratingBadge, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={[styles.ratingText, { color: '#92400E', fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, fontFamily: typography.family.bold }]}>
              {item.driver.average_rating.toFixed(1)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.routePoint}>
          <Ionicons name="location" size={16} color={colors.tertiary.default} />
          <Text style={[styles.routeText, { color: colors.text.primary, fontSize: typography.sizes.sm, fontFamily: typography.family.regular }]} numberOfLines={1}>{item.origin_name}</Text>
        </View>
        <View style={[styles.routeLine, { backgroundColor: colors.border.default }]} />
        <View style={styles.routePoint}>
          <Ionicons name="flag" size={16} color={colors.secondary.default} />
          <Text style={[styles.routeText, { color: colors.text.primary, fontSize: typography.sizes.sm, fontFamily: typography.family.regular }]} numberOfLines={1}>{item.destination_name}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.tripDetails}>
          <Ionicons name="time-outline" size={14} color={colors.text.muted} />
          <Text style={[styles.detailText, { color: colors.text.secondary, fontSize: typography.sizes.sm, fontFamily: typography.family.regular }]}>{formatTime(item.departure_time)}</Text>
        </View>
        <View style={styles.tripDetails}>
          <Ionicons name="people-outline" size={14} color={colors.text.muted} />
          <Text style={[styles.detailText, { color: colors.text.secondary, fontSize: typography.sizes.sm, fontFamily: typography.family.regular }]}>{item.available_seats} {c.seats}</Text>
        </View>
      </View>

      <View style={styles.cardBottom}>
        <Text style={[styles.priceText, { color: colors.tertiary.default, fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, fontFamily: typography.family.bold }]}>${Number(item.price).toLocaleString('es-CO')}</Text>
        <View style={[styles.bookButton, { backgroundColor: colors.secondary.default }]}>
          <Text style={[styles.bookButtonText, { color: colors.primary.contrast, fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold }]}>{s.viewDetails}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  React.useEffect(() => {
    if (token && !hasSearched) {
      tripsApi.searchTrips(token).then(data => {
        setResults((data as Trip[]) || []);
        setHasSearched(true);
      }).catch(() => setResults([]));
    }
  }, [token, hasSearched]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      <TabHeader />

      <ScrollView style={styles.content}>
        <View style={[styles.searchForm, { paddingHorizontal: spacing.lg }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary, fontWeight: typography.weights.bold, fontFamily: typography.family.bold }]}>{s.title}</Text>

          <Text style={[styles.inputLabel, { color: colors.text.primary, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold }]}>{s.origin}</Text>
          <View style={styles.selectorRow}>
            <View style={styles.selectorWrapper}>
              <LocationSelector
                value={origin?.name || ''}
                onSelect={setOrigin}
                placeholder={s.originPlaceholder}
                mode="origin"
                iconColor={colors.tertiary.default}
              />
            </View>
            {origin && (
              <TouchableOpacity style={styles.clearBtn} onPress={clearOrigin}>
                <Ionicons name="close-circle" size={22} color={colors.text.muted} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.swapRow}>
            <View style={[styles.swapLine, { backgroundColor: colors.border.default }]} />
            <TouchableOpacity
              style={[styles.swapButton, { backgroundColor: colors.background.card, borderColor: colors.border.default }]}
              onPress={swapLocations}
              disabled={!origin && !destination}
            >
              <Ionicons name="swap-vertical" size={18} color={colors.secondary.default} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.inputLabel, { color: colors.text.primary, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold }]}>{s.destination}</Text>
          <View style={styles.selectorRow}>
            <View style={styles.selectorWrapper}>
              <LocationSelector
                value={destination?.name || ''}
                onSelect={setDestination}
                placeholder={s.destinationPlaceholder}
                mode="destination"
                iconColor={colors.secondary.default}
              />
            </View>
            {destination && (
              <TouchableOpacity style={styles.clearBtn} onPress={clearDestination}>
                <Ionicons name="close-circle" size={22} color={colors.text.muted} />
              </TouchableOpacity>
            )}
          </View>

          {sameLocation && (
            <View style={[styles.errorBox, { backgroundColor: colors.status.errorBg }]}>
              <Ionicons name="alert-circle" size={16} color={colors.status.error} />
              <Text style={[styles.errorText, { color: colors.status.error, fontSize: typography.sizes.sm, fontFamily: typography.family.medium }]}>
                Origen y destino no pueden ser iguales
              </Text>
            </View>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.searchButton, { backgroundColor: sameLocation ? colors.text.muted : colors.secondary.default, flex: 1 }]}
              onPress={handleSearch}
              disabled={isSearching || sameLocation}
            >
              {isSearching ? (
                <ActivityIndicator size="small" color={colors.primary.contrast} />
              ) : (
                <>
                  <Ionicons name="search" size={20} color={colors.primary.contrast} />
                  <Text style={[styles.searchButtonText, { color: colors.primary.contrast, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold }]}>{s.findTrips}</Text>
                </>
              )}
            </TouchableOpacity>
            {hasSearched && (
              <TouchableOpacity style={[styles.clearAllButton, { borderColor: colors.border.default }]} onPress={clearAll}>
                <Ionicons name="refresh" size={20} color={colors.text.muted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {hasSearched && (
          <View style={[styles.resultsSection, { paddingHorizontal: spacing.lg }]}>
            {isSearching ? (
              <View style={[styles.emptyState, { alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.secondary.default} />
                <Text style={[styles.emptyText, { color: colors.text.primary, fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold, marginTop: spacing.md }]}>Buscando viajes...</Text>
              </View>
            ) : (
              <>
                <Text style={[styles.resultsTitle, { color: colors.text.primary, fontWeight: typography.weights.bold, fontFamily: typography.family.bold }]}>{results.length} {s.resultsFound}</Text>
                {results.length === 0 ? (
                  <View style={[styles.emptyState, { alignItems: 'center' }]}>
                    <Ionicons name="car-sport-outline" size={64} color={colors.text.muted} />
                    <Text style={[styles.emptyText, { color: colors.text.primary, fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold }]}>{s.noTrips}</Text>
                    <Text style={[styles.emptySubtext, { color: colors.text.muted, fontSize: typography.sizes.sm, fontFamily: typography.family.regular }]}>{s.noTripsSub}</Text>
                  </View>
                ) : (
                  <FlatList data={results} renderItem={renderTripCard} keyExtractor={(item) => item.id} scrollEnabled={false} ItemSeparatorComponent={() => <View style={styles.separator} />} />
                )}
              </>
            )}
          </View>
        )}
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  searchForm: { paddingTop: spacing.lg },
  sectionTitle: { marginBottom: spacing.md },
  inputLabel: { marginBottom: spacing.sm, marginTop: spacing.xs },
  selectorRow: { flexDirection: 'row', alignItems: 'center' },
  selectorWrapper: { flex: 1 },
  clearBtn: { paddingLeft: spacing.sm, paddingBottom: spacing.sm },
  swapRow: { alignItems: 'center', marginVertical: -spacing.xs },
  swapLine: { width: 1, height: 20 },
  swapButton: { width: 36, height: 36, borderRadius: borderRadius.full, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginTop: -18 },
  errorBox: { flexDirection: 'row', alignItems: 'center', borderRadius: borderRadius.md, padding: spacing.sm, marginTop: spacing.sm, gap: spacing.sm },
  errorText: {},
  buttonRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, gap: spacing.sm },
  searchButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: borderRadius.md, paddingVertical: spacing.md },
  clearAllButton: { width: 48, height: 48, borderRadius: borderRadius.md, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  searchButtonText: { marginLeft: spacing.sm },
  resultsSection: { marginTop: spacing.lg },
  resultsTitle: { marginBottom: spacing.md },
  tripCard: { borderRadius: borderRadius.lg, padding: spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  driverInfo: { flexDirection: 'row', alignItems: 'center' },
  driverAvatar: { width: 40, height: 40, borderRadius: borderRadius.full, justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm },
  avatarText: {},
  driverName: {},
  driverFaculty: {},
  ratingBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm },
  ratingText: { marginLeft: spacing.xs },
  routeContainer: { marginBottom: spacing.md },
  routePoint: { flexDirection: 'row', alignItems: 'center' },
  routeText: { marginLeft: spacing.sm, flex: 1 },
  routeLine: { width: 1, height: 16, marginLeft: 8, marginVertical: spacing.xs },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  tripDetails: { flexDirection: 'row', alignItems: 'center' },
  detailText: { marginLeft: spacing.xs },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceText: {},
  bookButton: { borderRadius: borderRadius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  bookButtonText: { marginLeft: spacing.sm },
  separator: { height: spacing.md },
  emptyState: { paddingVertical: spacing.xxxl },
  emptyText: { marginTop: spacing.md },
  emptySubtext: { marginTop: spacing.xs },
});
