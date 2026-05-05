import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LoginButton } from '@/components/LoginButton';
import { colors, borderRadius, typography, spacing } from '@/theme/colors';
import { validateInstitutionalEmail } from '@/utils/config';
import { apiClient } from '@/api/auth';
import { useAuth } from '@/context/AuthContext';
import { showAlert } from '@/utils/alert';

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [faculty, setFaculty] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Nombre completo requerido';
    }

    if (!email.trim()) {
      newErrors.email = 'Email requerido';
    } else if (!validateInstitutionalEmail(email)) {
      newErrors.email = 'Usa tu correo @unisabana.edu.co';
    }

    if (!password) {
      newErrors.password = 'Contraseña requerida';
    } else if (password.length < 8) {
      newErrors.password = 'Mínimo 8 caracteres';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = useCallback(async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      const response = await apiClient.register({
        email: email.toLowerCase(),
        password,
        full_name: fullName,
        faculty: faculty || undefined,
        phone: phone || undefined,
      });

      await login(response);
      showAlert(
        'Registro exitoso',
        'Tu cuenta ha sido creada correctamente',
        [{ text: 'OK', onPress: () => router.replace('/(app)/home') }]
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error en el registro';
      showAlert('Error', message.includes('already exists') ? 'Este correo ya está registrado' : message);
    } finally {
      setLoading(false);
    }
  }, [fullName, email, phone, faculty, password, confirmPassword, router, login]);

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    error?: string,
    options: {
      placeholder: string;
      keyboardType?: 'email-address' | 'phone-pad' | 'default';
      secureTextEntry?: boolean;
      showPasswordToggle?: boolean;
      showPassword?: boolean;
      onTogglePassword?: () => void;
      icon: string;
    }
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Text style={styles.inputIcon}>{options.icon}</Text>
        <View style={styles.textInputContainer}>
          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder={options.placeholder}
            placeholderTextColor={colors.text.muted}
            value={value}
            onChangeText={onChangeText}
            keyboardType={options.keyboardType || 'default'}
            secureTextEntry={options.secureTextEntry}
            autoCapitalize={options.keyboardType === 'email-address' ? 'none' : 'words'}
            editable={!loading}
          />
          {options.showPasswordToggle && options.onTogglePassword && (
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={options.onTogglePassword}
            >
              <Text style={styles.eyeButtonText}>
                {options.showPassword ? '🙈' : '👁'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary.dark} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear Cuenta</Text>
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
          <View style={styles.form}>
            {renderInput('Nombre Completo', fullName, setFullName, errors.fullName, {
              placeholder: 'Tu nombre completo',
              icon: '👤',
            })}

            {renderInput('Correo Institucional', email, setEmail, errors.email, {
              placeholder: 'usuario@unisabana.edu.co',
              keyboardType: 'email-address',
              icon: '📧',
            })}

            {renderInput('Teléfono', phone, setPhone, errors.phone, {
              placeholder: '+57 300 123 4567',
              keyboardType: 'phone-pad',
              icon: '📱',
            })}

            {renderInput('Facultad', faculty, setFaculty, errors.faculty, {
              placeholder: 'Ej: Ingeniería',
              icon: '🏛',
            })}

            {renderInput('Contraseña', password, setPassword, errors.password, {
              placeholder: 'Mínimo 8 caracteres',
              secureTextEntry: !showPassword,
              showPasswordToggle: true,
              showPassword,
              onTogglePassword: () => setShowPassword(!showPassword),
              icon: '🔒',
            })}

            {renderInput(
              'Confirmar Contraseña',
              confirmPassword,
              setConfirmPassword,
              errors.confirmPassword,
              {
                placeholder: 'Repite tu contraseña',
                secureTextEntry: !showConfirmPassword,
                showPasswordToggle: true,
                showPassword: showConfirmPassword,
                onTogglePassword: () => setShowConfirmPassword(!showConfirmPassword),
                icon: '🔒',
              }
            )}

            <View style={styles.termsContainer}>
              <Text style={styles.termsIcon}>ℹ️</Text>
              <Text style={styles.termsText}>
                Al registrarte aceptas los términos y condiciones de uso de Nexus.
              </Text>
            </View>

            <LoginButton
              title="Crear Cuenta"
              onPress={handleRegister}
              loading={loading}
              variant="primary"
              style={styles.button}
            />
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
  backButtonText: {
    fontSize: typography.sizes.xl,
    color: colors.primary.contrast,
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
  },
  inputIcon: {
    fontSize: typography.sizes.md,
  },
  textInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingRight: spacing.xl,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    fontFamily: typography.family.regular,
  },
  inputError: {
    borderColor: colors.border.error,
  },
  eyeButton: {
    position: 'absolute',
    right: spacing.sm,
    padding: spacing.xs,
  },
  eyeButtonText: {
    fontSize: typography.sizes.md,
  },
  errorText: {
    fontSize: typography.sizes.xs,
    color: colors.status.error,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
    fontFamily: typography.family.medium,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  termsIcon: {
    fontSize: typography.sizes.md,
    marginRight: spacing.sm,
  },
  termsText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    flex: 1,
    fontFamily: typography.family.regular,
  },
  button: {
    marginTop: spacing.sm,
  },
});
