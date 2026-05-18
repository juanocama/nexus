import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/context/AuthContext';
import { paymentsApi } from '@/api/payments';

function readParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] || '';
  return value || '';
}

export default function PendingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors, typography, borderRadius, shadow } = useTheme();
  const { token } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);

  const paymentStatus = useMemo(
    () => readParam(params.collection_status) || readParam(params.status) || 'pending',
    [params.collection_status, params.status]
  );
  const externalReference = useMemo(
    () => readParam(params.external_reference) || readParam(params.externalReference),
    [params.external_reference, params.externalReference]
  );
  const preferenceId = useMemo(
    () => readParam(params.preference_id) || readParam(params.preferenceId),
    [params.preference_id, params.preferenceId]
  );

  useEffect(() => {
    let mounted = true;

    async function verifyPayment() {
      if (!token || !externalReference) {
        if (mounted) setIsVerifying(false);
        return;
      }

      try {
        await paymentsApi.verifyPayment(token, {
          external_reference: externalReference,
          preference_id: preferenceId || undefined,
          collection_status: paymentStatus || 'pending',
        });
      } finally {
        if (mounted) setIsVerifying(false);
      }
    }

    verifyPayment();
    return () => {
      mounted = false;
    };
  }, [externalReference, paymentStatus, preferenceId, token]);

  const description = isVerifying
    ? 'Estamos actualizando el estado pendiente de tu pago.'
    : paymentStatus
      ? `El pago quedo en estado ${paymentStatus}. Revisa Mis viajes para confirmar la reserva.`
      : 'Tu pago esta en proceso. Revisa el estado nuevamente en unos minutos desde Mis viajes.';
  const referenceText = externalReference ? `Reserva: #${externalReference}` : 'Puedes verificar tu reserva en Mis viajes cuando este disponible.';

  return (
    <View style={[styles.container, { backgroundColor: colors.background.default }]}>
      <View style={[styles.card, { backgroundColor: colors.background.card, borderColor: colors.border.default, ...shadow.md, borderRadius: borderRadius.lg }]}>
        <View style={[styles.iconBox, { backgroundColor: colors.status.warningBg }]}>
          {isVerifying ? (
            <ActivityIndicator size="large" color={colors.status.warning} />
          ) : (
            <Ionicons name="time" size={52} color={colors.status.warning} />
          )}
        </View>
        <Text style={[styles.title, { color: colors.text.primary, fontFamily: typography.family.bold }]}>Pago pendiente</Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary, fontFamily: typography.family.regular }]}>{description}</Text>
        <Text style={[styles.note, { color: colors.text.muted, fontFamily: typography.family.medium }]}>{referenceText}</Text>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.secondary.default }]}
            onPress={() => router.replace('/bookings')}
            activeOpacity={0.8}
            disabled={isVerifying}
          >
            <Text style={[styles.buttonText, { color: colors.secondary.contrast, fontFamily: typography.family.semibold }]}>Ver Mis viajes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.secondary.default, opacity: isVerifying ? 0.6 : 1 }]}
            onPress={() => router.replace('/(tabs)/home')}
            activeOpacity={0.8}
            disabled={isVerifying}
          >
            <Text style={[styles.secondaryText, { color: colors.secondary.default, fontFamily: typography.family.semibold }]}>Volver al menu</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 460,
    padding: 28,
    alignItems: 'center',
    gap: 18,
  },
  iconBox: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  note: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  buttonsContainer: {
    width: '100%',
    marginTop: 20,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 16,
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  secondaryText: {
    fontSize: 16,
  },
});
