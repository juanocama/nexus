import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  Switch,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, borderRadius, typography, spacing, shadow } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import HeaderMenu from '@/components/HeaderMenu';

export default function PublishTripScreen() {
  const router = useRouter();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originDetail, setOriginDetail] = useState('');
  const [destinationDetail, setDestinationDetail] = useState('');
  const [date, setDate] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [totalSeats, setTotalSeats] = useState('3');
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [allowLuggage, setAllowLuggage] = useState(false);
  const [allowPets, setAllowPets] = useState(false);
  const [acceptSabanaCoins, setAcceptSabanaCoins] = useState(true);

  const handlePublish = () => {
    if (!origin || !destination || !date || !departureTime || !price) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    Alert.alert(
      'Publicar Viaje',
      '¿Deseas publicar este viaje?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Publicar',
          onPress: () => {
            Alert.alert('Éxito', 'Tu viaje ha sido publicado');
            router.replace('/(app)/home');
          },
        },
      ]
    );
  };

  const NumberSelector = ({ value, onIncrement, onDecrement, label, min = 1, max = 7 }: any) => (
    <View style={styles.numberSelector}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.selectorRow}>
        <TouchableOpacity
          style={[styles.selectorBtn, value <= min && styles.selectorBtnDisabled]}
          onPress={onDecrement}
          disabled={value <= min}
        >
          <Ionicons name="remove" size={20} color={value <= min ? colors.text.muted : colors.secondary.default} />
        </TouchableOpacity>
        <Text style={styles.selectorValue}>{value}</Text>
        <TouchableOpacity
          style={[styles.selectorBtn, value >= max && styles.selectorBtnDisabled]}
          onPress={onIncrement}
          disabled={value >= max}
        >
          <Ionicons name="add" size={20} color={value >= max ? colors.text.muted : colors.secondary.default} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const seats = parseInt(totalSeats) || 1;

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
          <HeaderMenu />
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ruta</Text>
          <View style={styles.card}>
            <Text style={styles.inputLabel}>Punto de Origen *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="location-outline" size={20} color={colors.tertiary.default} />
              <TextInput
                style={styles.input}
                placeholder="Ej: Centro Comercial Fontanar"
                placeholderTextColor={colors.text.muted}
                value={origin}
                onChangeText={setOrigin}
              />
            </View>

            <Text style={styles.inputLabel}>Detalle del origen</Text>
            <TextInput
              style={[styles.input, styles.textInput]}
              placeholder="Ej: Entrada principal, parqueadero"
              placeholderTextColor={colors.text.muted}
              value={originDetail}
              onChangeText={setOriginDetail}
              multiline
            />

            <Text style={styles.inputLabel}>Punto de Destino *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="flag-outline" size={20} color={colors.secondary.default} />
              <TextInput
                style={styles.input}
                placeholder="Ej: Universidad de La Sabana"
                placeholderTextColor={colors.text.muted}
                value={destination}
                onChangeText={setDestination}
              />
            </View>

            <Text style={styles.inputLabel}>Detalle del destino</Text>
            <TextInput
              style={[styles.input, styles.textInput]}
              placeholder="Ej: Entrada principal, puente"
              placeholderTextColor={colors.text.muted}
              value={destinationDetail}
              onChangeText={setDestinationDetail}
              multiline
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fecha y Hora</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.dateButton}>
              <Ionicons name="calendar-outline" size={20} color={colors.secondary.default} />
              <Text style={[styles.dateText, !date && { color: colors.text.muted }]}>
                {date || 'Seleccionar fecha'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateButton}>
              <Ionicons name="time-outline" size={20} color={colors.secondary.default} />
              <Text style={[styles.dateText, !departureTime && { color: colors.text.muted }]}>
                {departureTime || 'Hora de salida'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Asientos y Precio</Text>
          <View style={styles.card}>
            <NumberSelector
              value={seats}
              label="Número de asientos"
              onIncrement={() => setTotalSeats(String(seats + 1))}
              onDecrement={() => setTotalSeats(String(seats - 1))}
              max={7}
            />
            <Text style={styles.inputLabel}>Precio por persona (COP) *</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={colors.text.muted}
                value={price}
                onChangeText={setPrice}
                keyboardType="number-pad"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferencias</Text>
          <View style={styles.card}>
            <View style={styles.preferenceRow}>
              <View style={styles.preferenceInfo}>
                <Ionicons name="briefcase-outline" size={22} color={colors.text.secondary} />
                <View style={styles.preferenceText}>
                  <Text style={styles.preferenceLabel}>Permitir equipaje</Text>
                  <Text style={styles.preferenceSubtext}>Maletas pequeñas</Text>
                </View>
              </View>
              <Switch
                value={allowLuggage}
                onValueChange={setAllowLuggage}
                trackColor={{ false: colors.border.default, true: colors.tertiary.default }}
              />
            </View>
            <View style={styles.preferenceDivider} />
            <View style={styles.preferenceRow}>
              <View style={styles.preferenceInfo}>
                <Ionicons name="paw-outline" size={22} color={colors.text.secondary} />
                <View style={styles.preferenceText}>
                  <Text style={styles.preferenceLabel}>Permitir mascotas</Text>
                  <Text style={styles.preferenceSubtext}>Mascotas pequeñas</Text>
                </View>
              </View>
              <Switch
                value={allowPets}
                onValueChange={setAllowPets}
                trackColor={{ false: colors.border.default, true: colors.tertiary.default }}
              />
            </View>
            <View style={styles.preferenceDivider} />
            <View style={styles.preferenceRow}>
              <View style={styles.preferenceInfo}>
                <Ionicons name="logo-bitcoin" size={22} color={colors.text.secondary} />
                <View style={styles.preferenceText}>
                  <Text style={styles.preferenceLabel}>Acepto Sabana Coins</Text>
                  <Text style={styles.preferenceSubtext}>Pago con monedas virtuales</Text>
                </View>
              </View>
              <Switch
                value={acceptSabanaCoins}
                onValueChange={setAcceptSabanaCoins}
                trackColor={{ false: colors.border.default, true: colors.tertiary.default }}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notas Adicionales</Text>
          <TextInput
            style={[styles.input, styles.textInput, styles.notesInput]}
            placeholder="Información adicional para los pasajeros..."
            placeholderTextColor={colors.text.muted}
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.publishSection}>
          <TouchableOpacity style={styles.publishButton} onPress={handlePublish}>
            <Ionicons name="send-outline" size={20} color={colors.primary.contrast} />
            <Text style={styles.publishButtonText}>Publicar Viaje</Text>
          </TouchableOpacity>
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
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    fontFamily: typography.family.bold,
  },
  card: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadow.sm,
  },
  inputLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
    fontFamily: typography.family.semibold,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  currencySymbol: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.tertiary.default,
    marginRight: spacing.xs,
    fontFamily: typography.family.bold,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    fontFamily: typography.family.regular,
  },
  textInput: {
    minHeight: 80,
    paddingTop: spacing.md,
  },
  notesInput: {
    minHeight: 100,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  dateText: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    fontFamily: typography.family.medium,
  },
  numberSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    fontFamily: typography.family.semibold,
  },
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectorBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectorBtnDisabled: {
    opacity: 0.4,
  },
  selectorValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginHorizontal: spacing.lg,
    fontFamily: typography.family.bold,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  preferenceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  preferenceText: {
    marginLeft: spacing.md,
  },
  preferenceLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    fontFamily: typography.family.medium,
  },
  preferenceSubtext: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    fontFamily: typography.family.regular,
  },
  preferenceDivider: {
    height: 1,
    backgroundColor: colors.border.default,
  },
  publishSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  publishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tertiary.default,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    ...shadow.md,
  },
  publishButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.primary.contrast,
    marginLeft: spacing.sm,
    fontFamily: typography.family.semibold,
  },
});
