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
import { borderRadius, spacing, shadow, colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/context/AuthContext';
import { paymentsApi } from '@/api/payments';
import { CONFIG } from '@/utils/config';

export default function AddCardScreen() {
  const router = useRouter();
  const { t } = useSettings();
  const { colors, typography } = useTheme();
  const { token } = useAuth();
  const a = t.addCard;

  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [cardType, setCardType] = useState<'credit' | 'debit'>('credit');
  const [isSaving, setIsSaving] = useState(false);

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 16);
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    return cleaned;
  };

  const detectCardType = (number: string) => {
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.startsWith('4')) return 'Visa';
    if (cleaned.startsWith('5')) return 'Mastercard';
    return null;
  };

  const buildCardPayload = () => {
    const cleaned = cardNumber.replace(/\s/g, '');
    const [month, year] = expiry.split('/');

    return {
      dev_card_data: {
        card_number: cleaned,
        expiration_month: month,
        expiration_year: `20${year}`,
        security_code: cvv,
      },
      is_default: setAsDefault,
    };
  };

  const handleSave = async () => {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (cleaned.length < 13 || !cardHolder || expiry.length < 5 || cvv.length < 3) {
      Alert.alert(a.error, a.fillAllFields);
      return;
    }

    if (!token) {
      Alert.alert(a.error, 'Debes iniciar sesion para guardar tarjetas.');
      return;
    }

    if (!CONFIG.PAYMENTS.ALLOW_DEV_CARD_TOKENIZATION && !CONFIG.PAYMENTS.MERCADO_PAGO_PUBLIC_KEY) {
      Alert.alert(a.error, 'Configura la llave publica de Mercado Pago para tokenizar la tarjeta.');
      return;
    }

    setIsSaving(true);
    try {
      await paymentsApi.addCard(token, buildCardPayload());
      Alert.alert(
        a.cardSaved,
        a.cardSavedMsg,
        [{ text: t.common.ok, onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert(a.error, error.message || 'No se pudo guardar la tarjeta.');
    } finally {
      setIsSaving(false);
    }
  };

  const cardBrand = detectCardType(cardNumber);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary.default} />

      <View style={[styles.header, { backgroundColor: colors.primary.default }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary.contrast} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.primary.contrast, fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold }]}>{a.title}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.cardPreview, { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md }]}>
          <View style={[styles.previewInner, cardType === 'credit' && { backgroundColor: colors.primary.default }, cardType === 'debit' && { backgroundColor: colors.tertiary.default }]}>
            <View style={[styles.previewTop, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
              <Text style={[styles.previewChip, { fontSize: typography.sizes.xs, color: colors.primary.contrast + '80', fontWeight: typography.weights.medium, fontFamily: typography.family.medium }]}>{a.chip}</Text>
              {cardBrand && <Text style={[styles.previewBrand, { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.primary.contrast, fontFamily: typography.family.bold }]}>{cardBrand}</Text>}
            </View>
            <Text style={[styles.previewNumber, { fontSize: typography.sizes.xl, color: colors.primary.contrast, letterSpacing: 2, fontFamily: typography.family.medium }]}>
              {cardNumber || '**** **** **** ****'}
            </Text>
            <View style={[styles.previewBottom, { flexDirection: 'row', justifyContent: 'space-between' }]}>
              <View>
                <Text style={[styles.previewLabel, { fontSize: typography.sizes.xs, color: colors.primary.contrast + '80', fontFamily: typography.family.regular }]}>{a.holder}</Text>
                <Text style={[styles.previewValue, { fontSize: typography.sizes.md, color: colors.primary.contrast, fontWeight: typography.weights.medium, fontFamily: typography.family.medium }]}>
                  {cardHolder || 'TU NOMBRE'}
                </Text>
              </View>
              <View>
                <Text style={[styles.previewLabel, { fontSize: typography.sizes.xs, color: colors.primary.contrast + '80', fontFamily: typography.family.regular }]}>{a.expires}</Text>
                <Text style={[styles.previewValue, { fontSize: typography.sizes.md, color: colors.primary.contrast, fontWeight: typography.weights.medium, fontFamily: typography.family.medium }]}>
                  {expiry || 'MM/YY'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.typeToggle, { flexDirection: 'row', paddingHorizontal: spacing.lg, marginBottom: spacing.md, gap: spacing.md }]}>
          <TouchableOpacity
            style={[styles.typeBtn, { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.md, borderRadius: borderRadius.md, backgroundColor: colors.background.card, borderWidth: 1, borderColor: colors.border.default },
              cardType === 'credit' && { backgroundColor: colors.secondary.default, borderColor: colors.secondary.default }]}
            onPress={() => setCardType('credit')}
          >
            <Ionicons
              name="card-outline"
              size={18}
              color={cardType === 'credit' ? colors.primary.contrast : colors.text.secondary}
            />
            <Text style={[styles.typeText, { fontSize: typography.sizes.md, fontWeight: typography.weights.medium, fontFamily: typography.family.medium, marginLeft: spacing.sm },
              cardType === 'credit' && { color: colors.primary.contrast }]}>{a.credit}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.md, borderRadius: borderRadius.md, backgroundColor: colors.background.card, borderWidth: 1, borderColor: colors.border.default },
              cardType === 'debit' && { backgroundColor: colors.secondary.default, borderColor: colors.secondary.default }]}
            onPress={() => setCardType('debit')}
          >
            <Ionicons
              name="wallet-outline"
              size={18}
              color={cardType === 'debit' ? colors.primary.contrast : colors.text.secondary}
            />
            <Text style={[styles.typeText, { fontSize: typography.sizes.md, fontWeight: typography.weights.medium, fontFamily: typography.family.medium, marginLeft: spacing.sm },
              cardType === 'debit' && { color: colors.primary.contrast }]}>{a.debit}</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.form, { paddingHorizontal: spacing.lg }]}>
          <View style={[styles.inputGroup, { marginBottom: spacing.md }]}>
            <Text style={[styles.label, { color: colors.text.primary, fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold, marginBottom: spacing.sm }]}>{a.cardNumber} *</Text>
            <View style={[styles.inputWrapper, { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background.card, borderWidth: 1, borderColor: colors.border.default, borderRadius: borderRadius.md, paddingHorizontal: spacing.md }]}>
              <Ionicons name="card-outline" size={20} color={colors.text.muted} />
              <TextInput
                style={[styles.input, { flex: 1, paddingVertical: spacing.md, marginLeft: spacing.sm, fontSize: typography.sizes.md, color: colors.text.primary, fontFamily: typography.family.regular }]}
                placeholder={a.cardNumberPlaceholder}
                placeholderTextColor={colors.text.muted}
                value={cardNumber}
                onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                keyboardType="number-pad"
                maxLength={19}
              />
            </View>
          </View>

          <View style={[styles.inputGroup, { marginBottom: spacing.md }]}>
            <Text style={[styles.label, { color: colors.text.primary, fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold, marginBottom: spacing.sm }]}>{a.cardHolder} *</Text>
            <View style={[styles.inputWrapper, { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background.card, borderWidth: 1, borderColor: colors.border.default, borderRadius: borderRadius.md, paddingHorizontal: spacing.md }]}>
              <Ionicons name="person-outline" size={20} color={colors.text.muted} />
              <TextInput
                style={[styles.input, { flex: 1, paddingVertical: spacing.md, marginLeft: spacing.sm, fontSize: typography.sizes.md, color: colors.text.primary, fontFamily: typography.family.regular }]}
                placeholder={a.cardHolderPlaceholder}
                placeholderTextColor={colors.text.muted}
                value={cardHolder}
                onChangeText={setCardHolder}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={[styles.row, { flexDirection: 'row', gap: spacing.md }]}>
            <View style={[styles.inputGroup, styles.halfInput, { flex: 1, marginBottom: spacing.md }]}>
              <Text style={[styles.label, { color: colors.text.primary, fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold, marginBottom: spacing.sm }]}>{a.expiry} *</Text>
              <View style={[styles.inputWrapper, { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background.card, borderWidth: 1, borderColor: colors.border.default, borderRadius: borderRadius.md, paddingHorizontal: spacing.md }]}>
                <Ionicons name="calendar-outline" size={20} color={colors.text.muted} />
                <TextInput
                  style={[styles.input, { flex: 1, paddingVertical: spacing.md, marginLeft: spacing.sm, fontSize: typography.sizes.md, color: colors.text.primary, fontFamily: typography.family.regular }]}
                  placeholder={a.expiryPlaceholder}
                  placeholderTextColor={colors.text.muted}
                  value={expiry}
                  onChangeText={(text) => setExpiry(formatExpiry(text))}
                  keyboardType="number-pad"
                  maxLength={5}
                />
              </View>
            </View>
            <View style={[styles.inputGroup, styles.halfInput, { flex: 1, marginBottom: spacing.md }]}>
              <Text style={[styles.label, { color: colors.text.primary, fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold, marginBottom: spacing.sm }]}>{a.cvv} *</Text>
              <View style={[styles.inputWrapper, { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background.card, borderWidth: 1, borderColor: colors.border.default, borderRadius: borderRadius.md, paddingHorizontal: spacing.md }]}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.text.muted} />
                <TextInput
                  style={[styles.input, { flex: 1, paddingVertical: spacing.md, marginLeft: spacing.sm, fontSize: typography.sizes.md, color: colors.text.primary, fontFamily: typography.family.regular }]}
                  placeholder={a.cvvPlaceholder}
                  placeholderTextColor={colors.text.muted}
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>
          </View>

          <View style={[styles.defaultRow, { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background.card, padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.lg }]}>
            <Ionicons name="star-outline" size={20} color={colors.text.secondary} />
            <Text style={[styles.defaultLabel, { flex: 1, fontSize: typography.sizes.sm, color: colors.text.secondary, marginLeft: spacing.sm, marginRight: spacing.sm, fontFamily: typography.family.regular }]}>{a.setAsDefault}</Text>
            <Switch
              value={setAsDefault}
              onValueChange={setSetAsDefault}
              trackColor={{ false: colors.border.default, true: colors.secondary.default }}
            />
          </View>

          <View style={[styles.securityNote, { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.tertiary.default + '10', padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.lg }]}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.tertiary.default} />
            <Text style={[styles.securityText, { flex: 1, fontSize: typography.sizes.sm, color: colors.tertiary.dark, marginLeft: spacing.sm, fontFamily: typography.family.regular }]}>
              {a.securityNote}
            </Text>
          </View>

          <TouchableOpacity disabled={isSaving} style={[styles.saveButton, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.secondary.default, borderRadius: borderRadius.md, paddingVertical: spacing.md, opacity: isSaving ? 0.7 : 1, ...shadow.md }]} onPress={handleSave}>
            <Ionicons name={isSaving ? 'hourglass-outline' : 'checkmark'} size={20} color={colors.primary.contrast} />
            <Text style={[styles.saveButtonText, { fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, color: colors.primary.contrast, marginLeft: spacing.sm, fontFamily: typography.family.semibold }]}>{isSaving ? 'Guardando...' : a.saveCard}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + spacing.md : spacing.md,
    paddingBottom: spacing.md,
  },
  backButton: { padding: spacing.xs },
  headerTitle: {},
  content: { flex: 1 },
  cardPreview: {},
  previewInner: { borderRadius: borderRadius.xl, padding: spacing.lg, height: 180, justifyContent: 'space-between', ...shadow.lg },
  previewTop: {},
  previewChip: {},
  previewBrand: {},
  previewNumber: {},
  previewBottom: {},
  previewLabel: {},
  previewValue: {},
  typeToggle: {},
  typeBtn: {},
  typeText: {},
  form: {},
  inputGroup: {},
  label: {},
  inputWrapper: {},
  input: {},
  row: {},
  halfInput: { flex: 1 },
  defaultRow: {},
  defaultLabel: {},
  securityNote: {},
  securityText: {},
  saveButton: { ...shadow.md },
  saveButtonText: {},
});
