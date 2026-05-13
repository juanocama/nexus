import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { borderRadius, spacing } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import TabHeader from '@/components/TabHeader';
import LocationSelector from '@/components/LocationSelector';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/context/AuthContext';
import { tripsApi } from '@/api/trips';
import { vehiclesApi, Vehicle } from '@/api/vehicles';

interface EditTripData {
  id: string;
  origin_name: string;
  origin_lat: number;
  origin_lng: number;
  destination_name: string;
  destination_lat: number;
  destination_lng: number;
  departure_time: string;
  total_seats: number;
  price: number;
  notes?: string;
  vehicle_id?: string;
}

export default function PublishTripScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t, language } = useSettings();
  const { colors, typography } = useTheme();
  const { token } = useAuth();

  const isEditing = !!params.tripId;

  const [origin, setOrigin] = useState<{ name: string; lat: number; lng: number } | null>(null);
  const [destination, setDestination] = useState<{ name: string; lat: number; lng: number } | null>(null);
  const [totalSeats, setTotalSeats] = useState(4);
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [date, setDate] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [showVehiclePicker, setShowVehiclePicker] = useState(false);

  React.useEffect(() => {
    if (isInitialized || !params.tripData) return;

    try {
      const trip = JSON.parse(params.tripData as string) as EditTripData;
      setOrigin({
        name: trip.origin_name,
        lat: trip.origin_lat,
        lng: trip.origin_lng,
      });
      setDestination({
        name: trip.destination_name,
        lat: trip.destination_lat,
        lng: trip.destination_lng,
      });
      if (trip.total_seats) setTotalSeats(trip.total_seats);
      if (trip.price) setPrice(String(trip.price));
      if (trip.notes) setNotes(trip.notes);
      setSelectedVehicleId((trip as any).vehicle_id || null);

      if (trip.departure_time) {
        const departure = new Date(trip.departure_time);
        setSelectedDate(departure);
        setSelectedTime(departure);
        const pad = (n: number) => n.toString().padStart(2, '0');
        setDate(`${pad(departure.getDate())}/${pad(departure.getMonth() + 1)}/${departure.getFullYear()}`);
        setDepartureTime(`${pad(departure.getHours())}:${pad(departure.getMinutes())}`);
      }
      setIsInitialized(true);
    } catch (e) {
      // ignore parse errors
    }
  }, [params.tripData, isInitialized]);

  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      vehiclesApi.getMyVehicles(token).then(setVehicles).catch(() => {});
    }, [token])
  );

  const sameLocation = origin && destination && origin.name === destination.name;

  const swapLocations = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const formatDate = (d: Date): string => {
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (d: Date): string => {
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleDateChange = (_event: any, date?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      setDate(formatDate(date));
    }
  };

  const handleTimeChange = (_event: any, time?: Date) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (time) {
      setSelectedTime(time);
      setDepartureTime(formatTime(time));
    }
  };

  const handlePublish = async () => {
    if (!origin || !destination || !date || !departureTime || !price) {
      Alert.alert('Error', t.publish.fillRequired);
      return;
    }

    if (!selectedVehicleId) {
      Alert.alert('Error', 'Debes seleccionar un vehículo para publicar un viaje');
      return;
    }

    if (sameLocation) {
      Alert.alert('Error', 'El origen y el destino no pueden ser iguales');
      return;
    }

    const priceNum = parseInt(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Error', 'Ingresa un precio valido');
      return;
    }

    const [day, month, year] = date.split('/').map(Number);
    const [hours, minutes] = departureTime.split(':').map(Number);
    const departureDate = new Date(year, month - 1, day, hours, minutes);
    if (isNaN(departureDate.getTime()) || departureDate <= new Date()) {
      Alert.alert('Error', 'Selecciona una fecha y hora valida');
      return;
    }

    if (!token) {
      Alert.alert('Error', 'Debes iniciar sesion para publicar un viaje');
      return;
    }

    const confirmTitle = isEditing ? 'Confirmar cambios' : t.publish.publishConfirm;
    const confirmMsg = isEditing
      ? '¿Deseas guardar los cambios realizados a esta publicación?'
      : t.publish.publishConfirmMsg.replace('${price}', `$${priceNum.toLocaleString(language === 'en' ? 'en-US' : 'es-CO')}`);

    Alert.alert(
      confirmTitle,
      confirmMsg,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.confirm,
          onPress: async () => {
            setIsPublishing(true);
            try {
              if (isEditing && params.tripId) {
                await tripsApi.updateTrip(token, params.tripId as string, {
                  origin_name: origin.name,
                  origin_lat: origin.lat,
                  origin_lng: origin.lng,
                  destination_name: destination!.name,
                  destination_lat: destination!.lat,
                  destination_lng: destination!.lng,
                  departure_time: departureDate.toISOString(),
                  total_seats: totalSeats,
                  price: priceNum,
                  notes: notes || undefined,
                  vehicle_id: selectedVehicleId || undefined,
                });
                Alert.alert(t.common.success, 'Viaje actualizado correctamente', [
                  { text: 'OK', onPress: () => router.replace('/my-publications') },
                ]);
              } else {
                await tripsApi.createTrip(token, {
                  origin_name: origin.name,
                  origin_lat: origin.lat,
                  origin_lng: origin.lng,
                  destination_name: destination!.name,
                  destination_lat: destination!.lat,
                  destination_lng: destination!.lng,
                  departure_time: departureDate.toISOString(),
                  total_seats: totalSeats,
                  price: priceNum,
                  notes: notes || undefined,
                  vehicle_id: selectedVehicleId || undefined,
                });
                Alert.alert(t.common.success, t.publish.publishSuccess, [
                  { text: 'OK', onPress: () => router.replace('/(tabs)/home') },
                ]);
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'No se pudo guardar el viaje');
            } finally {
              setIsPublishing(false);
            }
          },
        },
      ]
    );
  };

  const NumberSelector = ({ value, onIncrement, onDecrement, label, min = 1, max = 4 }: { value: number; onIncrement: () => void; onDecrement: () => void; label: string; min?: number; max?: number }) => (
    <View style={styles.numberSelector}>
      <Text style={[styles.label, { color: colors.text.primary, fontSize: typography.sizes.md, fontWeight: typography.weights.medium, fontFamily: typography.family.medium }]}>{label}</Text>
      <View style={styles.selectorRow}>
        <TouchableOpacity
          style={[styles.selectorBtn, { borderColor: colors.border.default }, value <= min && styles.selectorBtnDisabled]}
          onPress={onDecrement}
          disabled={value <= min}
        >
          <Ionicons name="remove" size={20} color={value <= min ? colors.text.muted : colors.secondary.default} />
        </TouchableOpacity>
        <Text style={[styles.selectorValue, { color: colors.text.primary, fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, fontFamily: typography.family.bold }]}>{value}</Text>
        <TouchableOpacity
          style={[styles.selectorBtn, { borderColor: colors.border.default }, value >= max && styles.selectorBtnDisabled]}
          onPress={onIncrement}
          disabled={value >= max}
        >
          <Ionicons name="add" size={20} color={value >= max ? colors.text.muted : colors.secondary.default} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      <TabHeader />

      <ScrollView style={styles.content}>
        <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary, fontWeight: typography.weights.bold, fontFamily: typography.family.bold }]}>{t.publish.route}</Text>

          <Text style={[styles.inputLabel, { color: colors.text.primary, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold }]}>{t.publish.origin}</Text>
          <LocationSelector
            value={origin?.name || ''}
            onSelect={setOrigin}
            placeholder="Selecciona punto de origen"
            mode="origin"
            iconColor={colors.tertiary.default}
          />

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

          <Text style={[styles.inputLabel, { color: colors.text.primary, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold }]}>{t.publish.destination}</Text>
          <LocationSelector
            value={destination?.name || ''}
            onSelect={setDestination}
            placeholder="Selecciona punto de destino"
            mode="destination"
            iconColor={colors.secondary.default}
          />

          {sameLocation && (
            <View style={[styles.errorBox, { backgroundColor: colors.status.errorBg }]}>
              <Ionicons name="alert-circle" size={16} color={colors.status.error} />
              <Text style={[styles.errorText, { color: colors.status.error, fontSize: typography.sizes.sm, fontFamily: typography.family.medium }]}>
                Origen y destino no pueden ser iguales
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary, fontWeight: typography.weights.bold, fontFamily: typography.family.bold }]}>{t.publish.dateTime}</Text>
          <View style={[styles.card, { backgroundColor: colors.background.card, borderColor: colors.border.default }]}>
            <TouchableOpacity
              style={[styles.dateButton, { backgroundColor: colors.background.default, borderColor: colors.border.default }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color={colors.secondary.default} />
              <Text style={[styles.dateText, { color: colors.text.primary, fontSize: typography.sizes.md, fontFamily: typography.family.medium }, !date && { color: colors.text.muted }]}>
                {date || t.publish.selectDate}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dateButton, { backgroundColor: colors.background.default, borderColor: colors.border.default }]}
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons name="time-outline" size={20} color={colors.secondary.default} />
              <Text style={[styles.dateText, { color: colors.text.primary, fontSize: typography.sizes.md, fontFamily: typography.family.medium }, !departureTime && { color: colors.text.muted }]}>
                {departureTime || t.publish.departureTime}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}
        {showTimePicker && (
          <DateTimePicker
            value={selectedTime || new Date()}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
          />
        )}

        <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary, fontWeight: typography.weights.bold, fontFamily: typography.family.bold }]}>Vehículo</Text>
          {vehicles.length === 0 ? (
            <View style={[styles.card, { backgroundColor: colors.background.card, borderColor: colors.border.default, alignItems: 'center', paddingVertical: spacing.lg }]}>
              <Ionicons name="car-sport-outline" size={40} color={colors.text.muted} />
              <Text style={[{ color: colors.text.primary, fontSize: typography.sizes.md, fontWeight: typography.weights.medium, fontFamily: typography.family.medium, textAlign: 'center', marginTop: spacing.sm }]}>
                Necesitas registrar un vehículo para publicar viajes
              </Text>
              <TouchableOpacity
                style={[{ backgroundColor: colors.secondary.default, borderRadius: borderRadius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, marginTop: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }]}
                onPress={() => router.push('/my-vehicles')}
              >
                <Ionicons name="add" size={18} color={colors.primary.contrast} />
                <Text style={[{ color: colors.primary.contrast, fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold }]}>
                  Registrar Vehículo
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.card, { backgroundColor: colors.background.card, borderColor: colors.border.default }]}>
              {vehicles.map((v) => (
                <TouchableOpacity
                  key={v.id}
                  style={[styles.vehicleOption, { borderBottomColor: colors.border.default }, selectedVehicleId === v.id && { backgroundColor: colors.secondary.default + '15' }]}
                  onPress={() => setSelectedVehicleId(selectedVehicleId === v.id ? null : v.id)}
                >
                  <Ionicons
                    name={selectedVehicleId === v.id ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={selectedVehicleId === v.id ? colors.secondary.default : colors.text.muted}
                  />
                  <View style={styles.vehicleOptionInfo}>
                    <Text style={[styles.vehicleOptionName, { color: colors.text.primary, fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, fontFamily: typography.family.medium }]}>
                      {v.brand} {v.model}
                    </Text>
                    <Text style={[styles.vehicleOptionDetail, { color: colors.text.muted, fontSize: typography.sizes.xs, fontFamily: typography.family.regular }]}>
                      {v.color} - {v.plate}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary, fontWeight: typography.weights.bold, fontFamily: typography.family.bold }]}>{t.publish.seatsPrice}</Text>
          <View style={[styles.card, { backgroundColor: colors.background.card, borderColor: colors.border.default }]}>
            <NumberSelector
              value={totalSeats}
              label={t.publish.seatCount}
              onIncrement={() => setTotalSeats(prev => Math.min(4, prev + 1))}
              onDecrement={() => setTotalSeats(prev => Math.max(1, prev - 1))}
              max={4}
            />
            <Text style={[styles.inputLabel, { color: colors.text.primary, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold }]}>{t.publish.pricePerPerson}</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.background.default, borderColor: colors.border.default }]}>
              <Text style={[styles.currencySymbol, { color: colors.tertiary.default, fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, fontFamily: typography.family.bold }]}>$</Text>
              <TextInput
                style={[styles.input, { color: colors.text.primary, fontSize: typography.sizes.md, fontFamily: typography.family.regular }]}
                placeholder="0"
                placeholderTextColor={colors.text.muted}
                value={price}
                onChangeText={setPrice}
                keyboardType="number-pad"
              />
            </View>
          </View>
        </View>

        <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary, fontWeight: typography.weights.bold, fontFamily: typography.family.bold }]}>{t.publish.additionalNotes}</Text>
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.background.card, borderColor: colors.border.default, color: colors.text.primary, fontSize: typography.sizes.md, fontFamily: typography.family.regular }]}
            placeholder={t.publish.notesPlaceholder}
            placeholderTextColor={colors.text.muted}
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={[styles.publishSection, { paddingHorizontal: spacing.lg }]}>
          <TouchableOpacity
            style={[styles.publishButton, { backgroundColor: isPublishing ? colors.border.default : colors.tertiary.default }]}
            onPress={handlePublish}
            disabled={isPublishing}
          >
            {isPublishing ? (
              <ActivityIndicator size="small" color={colors.primary.contrast} />
            ) : (
              <>
                <Ionicons name="send-outline" size={20} color={colors.primary.contrast} />
                <Text style={[styles.publishButtonText, { color: colors.primary.contrast, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold }]}>{isEditing ? 'Guardar cambios' : t.publish.publishTrip}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  section: { marginBottom: spacing.md },
  sectionTitle: { marginBottom: spacing.sm },
  inputLabel: { marginBottom: spacing.sm, marginTop: spacing.xs },
  swapRow: { alignItems: 'center', marginVertical: spacing.xs },
  swapLine: { width: 1, height: 24 },
  swapButton: { width: 36, height: 36, borderRadius: borderRadius.full, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  errorBox: { flexDirection: 'row', alignItems: 'center', borderRadius: borderRadius.md, padding: spacing.sm, marginTop: spacing.sm, gap: spacing.sm },
  errorText: {},
  card: { borderRadius: borderRadius.lg, padding: spacing.md, borderWidth: 1 },
  dateButton: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, marginBottom: spacing.sm },
  dateText: { marginLeft: spacing.sm },
  numberSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  label: {},
  selectorRow: { flexDirection: 'row', alignItems: 'center' },
  selectorBtn: { width: 40, height: 40, borderRadius: borderRadius.full, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  selectorBtnDisabled: { opacity: 0.4 },
  selectorValue: { marginHorizontal: spacing.lg },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, marginBottom: spacing.sm },
  currencySymbol: { marginRight: spacing.xs },
  input: { flex: 1, paddingVertical: spacing.md },
  textInput: { minHeight: 60, paddingTop: spacing.md, borderWidth: 1, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  publishSection: { paddingTop: spacing.md },
  publishButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: borderRadius.md, paddingVertical: spacing.md },
  publishButtonText: { marginLeft: spacing.sm },
  vehicleOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.sm, borderRadius: borderRadius.md, marginBottom: spacing.xs },
  vehicleOptionInfo: { marginLeft: spacing.md, flex: 1 },
  vehicleOptionName: {},
  vehicleOptionDetail: { marginTop: 2 },
});
