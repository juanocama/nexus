import React, { useState } from 'react';
import { ActivityIndicator, Alert, TouchableOpacity, Text, View, Linking, StyleSheet } from 'react-native';
import { paymentsApi } from '@/api/payments';
import { useAuth } from '@/context/AuthContext';

interface PaymentButtonProps {
  bookingId: string;
  label?: string;
}

/**
 * Función reutilizable para lanzar la pasarela de MercadoPago.
 * Usa sandbox en __DEV__ y checkout real en producción.
 */
export async function launchPayment(bookingId: string, token: string): Promise<void> {
  console.log('🔵 Llamando createPreference con bookingId:', bookingId);
  const response = await paymentsApi.createPreference(token, bookingId);
  console.log('🟢 Respuesta de MercadoPago:', response);
  const url = response.payment_url || response.checkout_url || response.sandbox_url;
  console.log('🔗 URL a abrir:', url);

  if (!url) {
    throw new Error('No se recibió una URL de pago válida de MercadoPago');
  }

  // Web
  if (typeof window !== 'undefined' && window.location) {
    window.location.href = url;
    return;
  }

  // Móvil
  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
  } else {
    throw new Error('No se puede abrir la URL de pago. Verifica tu conexión.');
  }
}

/**
 * Botón de pago autónomo (para usar donde no tengas el botón integrado).
 * Recibe el bookingId y maneja el estado de carga internamente.
 */
export function PaymentButton({ bookingId, label = 'Pagar viaje' }: PaymentButtonProps) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const onPress = async () => {
    if (!token) {
      Alert.alert('Error', 'Usuario no autenticado. Inicia sesión para pagar.');
      return;
    }

    try {
      setLoading(true);
      await launchPayment(bookingId, token);
    } catch (error: any) {
      Alert.alert('Error de pago', error?.message || 'No se pudo iniciar el pago. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, (loading || !token) && styles.buttonDisabled]}
        onPress={onPress}
        disabled={loading || !token}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>{label}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 16 },
  button: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
