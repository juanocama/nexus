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
} from 'react-native';
import { useRouter } from 'expo-router';
import { borderRadius, spacing, shadow } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import TabHeader from '@/components/TabHeader';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/hooks/useTheme';

export default function PublishTripScreen() {
  const router = useRouter();
  const { t } = useSettings();
  const { colors, typography } = useTheme();
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
      Alert.alert('Error', t.publish.fillRequired);
      return;
    }

    Alert.alert(
      t.publish.publishConfirm,
      t.publish.publishConfirmMsg.replace('${price}', `$${parseInt(price).toLocaleString('es-CO')}`),
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.confirm,
          onPress: () => {
            Alert.alert(t.common.success, t.publish.publishSuccess);
            router.replace('/(tabs)/home');
          },
        },
      ]
    );
  };

  const NumberSelector = ({ value, onIncrement, onDecrement, label, min = 1, max = 7 }: any) => (
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

  const seats = parseInt(totalSeats) || 1;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      <TabHeader />

      <ScrollView style={styles.content}>
        <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary, fontWeight: typography.weights.bold, fontFamily: typography.family.bold }]}>{t.publish.route}</Text>
          <View style={[styles.card, { backgroundColor: colors.background.card, ...shadow.sm, borderColor: colors.border.default }]}>
            <Text style={[styles.inputLabel, { color: colors.text.primary, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold }]}>{t.publish.origin}</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.background.default, borderColor: colors.border.default }]}>
              <Ionicons name="location-outline" size={20} color={colors.tertiary.default} />
              <TextInput
                style={[styles.input, { color: colors.text.primary, fontSize: typography.sizes.md, fontFamily: typography.family.regular }]}
                placeholder={t.publish.originPlaceholder}
                placeholderTextColor={colors.text.muted}
                value={origin}
                onChangeText={setOrigin}
              />
            </View>

            <Text style={[styles.inputLabel, { color: colors.text.primary, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold }]}>{t.publish.originDetail}</Text>
            <TextInput
              style={[styles.input, styles.textInput, { backgroundColor: colors.background.card, borderColor: colors.border.default, color: colors.text.primary, fontSize: typography.sizes.md, fontFamily: typography.family.regular }]}
              placeholder={t.publish.originDetailPlaceholder}
              placeholderTextColor={colors.text.muted}
              value={originDetail}
              onChangeText={setOriginDetail}
              multiline
            />

            <Text style={[styles.inputLabel, { color: colors.text.primary, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold }]}>{t.publish.destination}</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.background.default, borderColor: colors.border.default }]}>
              <Ionicons name="flag-outline" size={20} color={colors.secondary.default} />
              <TextInput
                style={[styles.input, { color: colors.text.primary, fontSize: typography.sizes.md, fontFamily: typography.family.regular }]}
                placeholder={t.publish.destinationPlaceholder}
                placeholderTextColor={colors.text.muted}
                value={destination}
                onChangeText={setDestination}
              />
            </View>

            <Text style={[styles.inputLabel, { color: colors.text.primary, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold }]}>{t.publish.destinationDetail}</Text>
            <TextInput
              style={[styles.input, styles.textInput, { backgroundColor: colors.background.card, borderColor: colors.border.default, color: colors.text.primary, fontSize: typography.sizes.md, fontFamily: typography.family.regular }]}
              placeholder={t.publish.destinationDetailPlaceholder}
              placeholderTextColor={colors.text.muted}
              value={destinationDetail}
              onChangeText={setDestinationDetail}
              multiline
            />
          </View>
        </View>

        <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary, fontWeight: typography.weights.bold, fontFamily: typography.family.bold }]}>{t.publish.dateTime}</Text>
          <View style={[styles.card, { backgroundColor: colors.background.card, ...shadow.sm, borderColor: colors.border.default }]}>
            <TouchableOpacity style={[styles.dateButton, { backgroundColor: colors.background.default, borderColor: colors.border.default }]}>
              <Ionicons name="calendar-outline" size={20} color={colors.secondary.default} />
              <Text style={[styles.dateText, { color: colors.text.primary, fontSize: typography.sizes.md, fontFamily: typography.family.medium }, !date && { color: colors.text.muted }]}>
                {date || t.publish.selectDate}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.dateButton, { backgroundColor: colors.background.default, borderColor: colors.border.default }]}>
              <Ionicons name="time-outline" size={20} color={colors.secondary.default} />
              <Text style={[styles.dateText, { color: colors.text.primary, fontSize: typography.sizes.md, fontFamily: typography.family.medium }, !departureTime && { color: colors.text.muted }]}>
                {departureTime || t.publish.departureTime}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary, fontWeight: typography.weights.bold, fontFamily: typography.family.bold }]}>{t.publish.seatsPrice}</Text>
          <View style={[styles.card, { backgroundColor: colors.background.card, ...shadow.sm, borderColor: colors.border.default }]}>
            <NumberSelector
              value={seats}
              label={t.publish.seatCount}
              onIncrement={() => setTotalSeats(String(seats + 1))}
              onDecrement={() => setTotalSeats(String(seats - 1))}
              max={7}
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
          <Text style={[styles.sectionTitle, { color: colors.text.primary, fontWeight: typography.weights.bold, fontFamily: typography.family.bold }]}>{t.publish.preferences}</Text>
          <View style={[styles.card, { backgroundColor: colors.background.card, ...shadow.sm, borderColor: colors.border.default }]}>
            <View style={styles.preferenceRow}>
              <View style={styles.preferenceInfo}>
                <Ionicons name="briefcase-outline" size={22} color={colors.text.secondary} />
                <View style={styles.preferenceText}>
                  <Text style={[styles.preferenceLabel, { color: colors.text.primary, fontSize: typography.sizes.md, fontWeight: typography.weights.medium, fontFamily: typography.family.medium }]}>{t.publish.allowLuggage}</Text>
                  <Text style={[styles.preferenceSubtext, { color: colors.text.muted, fontSize: typography.sizes.sm, fontFamily: typography.family.regular }]}>{t.publish.luggageSub}</Text>
                </View>
              </View>
              <Switch
                value={allowLuggage}
                onValueChange={setAllowLuggage}
                trackColor={{ false: colors.border.default, true: colors.tertiary.default }}
              />
            </View>
            <View style={[styles.preferenceDivider, { backgroundColor: colors.border.default }]} />
            <View style={styles.preferenceRow}>
              <View style={styles.preferenceInfo}>
                <Ionicons name="paw-outline" size={22} color={colors.text.secondary} />
                <View style={styles.preferenceText}>
                  <Text style={[styles.preferenceLabel, { color: colors.text.primary, fontSize: typography.sizes.md, fontWeight: typography.weights.medium, fontFamily: typography.family.medium }]}>{t.publish.allowPets}</Text>
                  <Text style={[styles.preferenceSubtext, { color: colors.text.muted, fontSize: typography.sizes.sm, fontFamily: typography.family.regular }]}>{t.publish.petsSub}</Text>
                </View>
              </View>
              <Switch
                value={allowPets}
                onValueChange={setAllowPets}
                trackColor={{ false: colors.border.default, true: colors.tertiary.default }}
              />
            </View>
            <View style={[styles.preferenceDivider, { backgroundColor: colors.border.default }]} />
            <View style={styles.preferenceRow}>
              <View style={styles.preferenceInfo}>
                <Ionicons name="logo-bitcoin" size={22} color={colors.text.secondary} />
                <View style={styles.preferenceText}>
                  <Text style={[styles.preferenceLabel, { color: colors.text.primary, fontSize: typography.sizes.md, fontWeight: typography.weights.medium, fontFamily: typography.family.medium }]}>{t.publish.acceptSabanaCoins}</Text>
                  <Text style={[styles.preferenceSubtext, { color: colors.text.muted, fontSize: typography.sizes.sm, fontFamily: typography.family.regular }]}>{t.publish.sabanaCoinsSub}</Text>
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

        <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary, fontWeight: typography.weights.bold, fontFamily: typography.family.bold }]}>{t.publish.additionalNotes}</Text>
          <TextInput
            style={[styles.input, styles.textInput, styles.notesInput, { backgroundColor: colors.background.card, borderColor: colors.border.default, color: colors.text.primary, fontSize: typography.sizes.md, fontFamily: typography.family.regular }]}
            placeholder={t.publish.notesPlaceholder}
            placeholderTextColor={colors.text.muted}
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={[styles.publishSection, { paddingHorizontal: spacing.lg }]}>
          <TouchableOpacity style={[styles.publishButton, { backgroundColor: colors.tertiary.default, ...shadow.md }]} onPress={handlePublish}>
            <Ionicons name="send-outline" size={20} color={colors.primary.contrast} />
            <Text style={[styles.publishButtonText, { color: colors.primary.contrast, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold }]}>{t.publish.publishTrip}</Text>
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
  card: { borderRadius: borderRadius.lg, padding: spacing.md, borderWidth: 1 },
  inputLabel: { marginBottom: spacing.sm, marginTop: spacing.sm },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, marginBottom: spacing.sm },
  currencySymbol: { marginRight: spacing.xs },
  input: { flex: 1, paddingVertical: spacing.md },
  textInput: { minHeight: 80, paddingTop: spacing.md },
  notesInput: { minHeight: 100 },
  dateButton: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, marginBottom: spacing.sm },
  dateText: { marginLeft: spacing.sm },
  numberSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  label: {},
  selectorRow: { flexDirection: 'row', alignItems: 'center' },
  selectorBtn: { width: 40, height: 40, borderRadius: borderRadius.full, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  selectorBtnDisabled: { opacity: 0.4 },
  selectorValue: { marginHorizontal: spacing.lg },
  preferenceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  preferenceInfo: { flexDirection: 'row', alignItems: 'center' },
  preferenceText: { marginLeft: spacing.md },
  preferenceLabel: {},
  preferenceSubtext: {},
  preferenceDivider: { height: 1 },
  publishSection: { paddingTop: spacing.md },
  publishButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: borderRadius.md, paddingVertical: spacing.md },
  publishButtonText: { marginLeft: spacing.sm },
});
