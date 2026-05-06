import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LoginButton } from '@/components/LoginButton';
import { colors, borderRadius, typography, spacing } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';

export default function LoginPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = (params.email as string) || '';
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleLogin = useCallback(async () => {
    setPasswordError('');

    if (!password.trim()) {
      setPasswordError('Password is required');
      return;
    }

    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.replace('/(tabs)/home');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  }, [password, router]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary.dark} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary.contrast} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Iniciar Sesión</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.emailDisplay}>
            <Ionicons name="mail-outline" size={20} color={colors.secondary.default} />
            <Text style={styles.emailText}>{email || 'correo@unisabana.edu.co'}</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input,
                  passwordError && styles.inputError,
                ]}
                placeholder="Ingresa tu contraseña"
                placeholderTextColor={colors.text.muted}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError('');
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color={colors.text.muted}
                />
              </TouchableOpacity>
            </View>
            {passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : null}
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <LoginButton
            title="Iniciar Sesión"
            onPress={handleLogin}
            loading={loading}
            disabled={!password.trim()}
            variant="primary"
            style={styles.button}
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingVertical: spacing.md,
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  emailDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  emailText: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    fontFamily: typography.family.regular,
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    paddingRight: spacing.xl + spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    fontFamily: typography.family.regular,
  },
  inputError: {
    borderColor: colors.border.error,
  },
  eyeButton: {
    position: 'absolute',
    right: spacing.md,
    padding: spacing.xs,
  },
  errorText: {
    fontSize: typography.sizes.xs,
    color: colors.status.error,
    marginTop: spacing.xs,
    fontFamily: typography.family.medium,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.xl,
  },
  forgotPasswordText: {
    fontSize: typography.sizes.sm,
    color: colors.secondary.default,
    fontWeight: typography.weights.medium,
    fontFamily: typography.family.medium,
  },
  button: {
    marginTop: spacing.sm,
  },
});
