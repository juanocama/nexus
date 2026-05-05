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
import { useRouter, Link } from 'expo-router';
import { LoginButton } from '@/components/LoginButton';
import { colors, borderRadius, typography, spacing } from '@/theme/colors';
import { validateInstitutionalEmail } from '@/utils/config';
import { apiClient } from '@/api/auth';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLogin = useCallback(async () => {
    setErrors({});

    if (!email.trim()) {
      setErrors({ email: 'Email is required' });
      return;
    }

    if (!validateInstitutionalEmail(email)) {
      setErrors({ email: 'Use your @unisabana.edu.co email' });
      return;
    }

    if (!password.trim()) {
      setErrors({ password: 'Password is required' });
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.login(email.toLowerCase(), password);
      await login(response);
      router.replace('/(app)/home');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed';
      Alert.alert('Error de Login', message);
    } finally {
      setLoading(false);
    }
  }, [email, password, router, login]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary.dark} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>N</Text>
              </View>
            </View>
            <Text style={styles.title}>Nexus</Text>
            <Text style={styles.subtitle}>
              Carpooling Universitario
            </Text>
            <Text style={styles.description}>
              Conecta con otros estudiantes de la Universidad de La Sabana
              para compartir trayectos de forma segura y eficiente
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo Institucional</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="usuario@unisabana.edu.co"
                placeholderTextColor={colors.text.muted}
                value={email}
                onChangeText={(text) => {
                  setEmail(text.toLowerCase());
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!loading}
              />
              {errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, errors.password && styles.inputError, { paddingRight: 40 }]}
                  placeholder="Tu contraseña"
                  placeholderTextColor={colors.text.muted}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eyeButtonText}>
                    {showPassword ? '🙈' : '👁'}
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.password ? (
                <Text style={styles.errorText}>{errors.password}</Text>
              ) : null}
            </View>

            <LoginButton
              title="Iniciar Sesión"
              onPress={handleLogin}
              loading={loading}
              disabled={!email.trim() || !password.trim()}
              variant="primary"
              style={styles.button}
            />

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.divider} />
            </View>

            <LoginButton
              title="Continuar con Microsoft 365 (Próximamente)"
              onPress={() => Alert.alert('Próximamente', 'La autenticación con Microsoft estará disponible pronto')}
              loading={false}
              variant="microsoft"
              style={styles.microsoftButton}
            />

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>
                ¿No tienes cuenta?{' '}
              </Text>
              <Link href="/(auth)/register" asChild>
                <TouchableOpacity>
                  <Text style={styles.registerLink}>Regístrate aquí</Text>
                </TouchableOpacity>
              </Link>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Solo se permite acceso con correo institucional
              </Text>
              <View style={styles.domainBadge}>
                <Text style={styles.domainBadgeText}>
                  @unisabana.edu.co
                </Text>
              </View>
            </View>
          </View>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
    marginBottom: spacing.lg,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondary.default,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.secondary.default,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoText: {
    color: colors.primary.contrast,
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.extrabold,
    fontFamily: typography.family.bold,
  },
  title: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.extrabold,
    color: colors.primary.default,
    marginBottom: spacing.xs,
    fontFamily: typography.family.bold,
  },
  subtitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.secondary.default,
    marginBottom: spacing.md,
    fontFamily: typography.family.semibold,
  },
  description: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.sizes.md * typography.lineHeight.normal,
    paddingHorizontal: spacing.md,
    fontFamily: typography.family.regular,
  },
  form: {
    width: '100%',
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
  input: {
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    fontFamily: typography.family.regular,
  },
  inputError: {
    borderColor: colors.border.error,
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
    padding: spacing.xs,
  },
  eyeButtonText: {
    fontSize: typography.sizes.md,
  },
  errorText: {
    fontSize: typography.sizes.xs,
    color: colors.status.error,
    marginTop: spacing.xs,
    fontFamily: typography.family.medium,
  },
  button: {
    marginTop: spacing.sm,
  },
  microsoftButton: {
    marginTop: spacing.sm,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.default,
  },
  dividerText: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    marginHorizontal: spacing.md,
    fontFamily: typography.family.medium,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  registerText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontFamily: typography.family.regular,
  },
  registerLink: {
    fontSize: typography.sizes.sm,
    color: colors.secondary.default,
    fontWeight: typography.weights.semibold,
    fontFamily: typography.family.semibold,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginBottom: spacing.sm,
    fontFamily: typography.family.regular,
  },
  domainBadge: {
    backgroundColor: colors.background.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  domainBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.secondary.default,
    fontFamily: typography.family.medium,
  },
});
