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

export default function AddCardScreen() {
  const router = useRouter();
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [cardType, setCardType] = useState<'credit' | 'debit'>('credit');

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

  const handleSave = () => {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (cleaned.length < 16 || !cardHolder || expiry.length < 5 || cvv.length < 3) {
      Alert.alert('Error', 'Por favor completa todos los campos correctamente');
      return;
    }

    Alert.alert(
      'Tarjeta Guardada',
      'Tu tarjeta ha sido agregada exitosamente',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const cardBrand = detectCardType(cardNumber);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary.contrast} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agregar Tarjeta</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.cardPreview}>
          <View style={[styles.previewInner, cardType === 'credit' ? styles.creditCard : styles.debitCard]}>
            <View style={styles.previewTop}>
              <Text style={styles.previewChip}>CHIP</Text>
              {cardBrand && <Text style={styles.previewBrand}>{cardBrand}</Text>}
            </View>
            <Text style={styles.previewNumber}>
              {cardNumber || '**** **** **** ****'}
            </Text>
            <View style={styles.previewBottom}>
              <View>
                <Text style={styles.previewLabel}>Titular</Text>
                <Text style={styles.previewValue}>
                  {cardHolder || 'TU NOMBRE'}
                </Text>
              </View>
              <View>
                <Text style={styles.previewLabel}>Vence</Text>
                <Text style={styles.previewValue}>
                  {expiry || 'MM/YY'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.typeToggle}>
          <TouchableOpacity
            style={[styles.typeBtn, cardType === 'credit' && styles.typeBtnActive]}
            onPress={() => setCardType('credit')}
          >
            <Ionicons
              name="card-outline"
              size={18}
              color={cardType === 'credit' ? colors.primary.contrast : colors.text.secondary}
            />
            <Text style={[
              styles.typeText,
              cardType === 'credit' && styles.typeTextActive
            ]}>Crédito</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, cardType === 'debit' && styles.typeBtnActive]}
            onPress={() => setCardType('debit')}
          >
            <Ionicons
              name="wallet-outline"
              size={18}
              color={cardType === 'debit' ? colors.primary.contrast : colors.text.secondary}
            />
            <Text style={[
              styles.typeText,
              cardType === 'debit' && styles.typeTextActive
            ]}>Débito</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Número de Tarjeta *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="card-outline" size={20} color={colors.text.muted} />
              <TextInput
                style={styles.input}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor={colors.text.muted}
                value={cardNumber}
                onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                keyboardType="number-pad"
                maxLength={19}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre del Titular *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color={colors.text.muted} />
              <TextInput
                style={styles.input}
                placeholder="Como aparece en la tarjeta"
                placeholderTextColor={colors.text.muted}
                value={cardHolder}
                onChangeText={setCardHolder}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfInput]}>
              <Text style={styles.label}>Fecha de Vencimiento *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="calendar-outline" size={20} color={colors.text.muted} />
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  placeholderTextColor={colors.text.muted}
                  value={expiry}
                  onChangeText={(text) => setExpiry(formatExpiry(text))}
                  keyboardType="number-pad"
                  maxLength={5}
                />
              </View>
            </View>
            <View style={[styles.inputGroup, styles.halfInput]}>
              <Text style={styles.label}>CVV *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.text.muted} />
                <TextInput
                  style={styles.input}
                  placeholder="123"
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

          <View style={styles.defaultRow}>
            <Ionicons name="star-outline" size={20} color={colors.text.secondary} />
            <Text style={styles.defaultLabel}>Establecer como tarjeta principal</Text>
            <Switch
              value={setAsDefault}
              onValueChange={setSetAsDefault}
              trackColor={{ false: colors.border.default, true: colors.secondary.default }}
            />
          </View>

          <View style={styles.securityNote}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.tertiary.default} />
            <Text style={styles.securityText}>
              Tu información de pago está protegida con encriptación de 256 bits
            </Text>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Ionicons name="checkmark" size={20} color={colors.primary.contrast} />
            <Text style={styles.saveButtonText}>Guardar Tarjeta</Text>
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
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + spacing.md : spacing.md,
    paddingBottom: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.primary.contrast,
    fontFamily: typography.family.semibold,
  },
  content: {
    flex: 1,
  },
  cardPreview: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  previewInner: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    height: 180,
    justifyContent: 'space-between',
    ...shadow.lg,
  },
  creditCard: {
    backgroundColor: colors.primary.default,
  },
  debitCard: {
    backgroundColor: colors.tertiary.default,
  },
  previewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewChip: {
    fontSize: typography.sizes.xs,
    color: colors.primary.contrast + '80',
    fontWeight: typography.weights.medium,
    fontFamily: typography.family.medium,
  },
  previewBrand: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary.contrast,
    fontFamily: typography.family.bold,
  },
  previewNumber: {
    fontSize: typography.sizes.xl,
    color: colors.primary.contrast,
    letterSpacing: 2,
    fontFamily: typography.family.medium,
  },
  previewBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewLabel: {
    fontSize: typography.sizes.xs,
    color: colors.primary.contrast + '80',
    fontFamily: typography.family.regular,
  },
  previewValue: {
    fontSize: typography.sizes.md,
    color: colors.primary.contrast,
    fontWeight: typography.weights.medium,
    fontFamily: typography.family.medium,
  },
  typeToggle: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  typeBtnActive: {
    backgroundColor: colors.secondary.default,
    borderColor: colors.secondary.default,
  },
  typeText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
    fontFamily: typography.family.medium,
  },
  typeTextActive: {
    color: colors.primary.contrast,
  },
  form: {
    paddingHorizontal: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    fontFamily: typography.family.semibold,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    marginLeft: spacing.sm,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    fontFamily: typography.family.regular,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  defaultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  defaultLabel: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
    marginRight: spacing.sm,
    fontFamily: typography.family.regular,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.tertiary.default + '10',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  securityText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.tertiary.dark,
    marginLeft: spacing.sm,
    fontFamily: typography.family.regular,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary.default,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    ...shadow.md,
  },
  saveButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.primary.contrast,
    marginLeft: spacing.sm,
    fontFamily: typography.family.semibold,
  },
});
