import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, borderRadius, typography, spacing, shadow } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const router = useRouter();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [locationServices, setLocationServices] = useState(true);
  const [language, setLanguage] = useState('Español');

  const SettingRow = ({ icon, label, value, right, onPress }: any) => (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} disabled={!onPress}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon as any} size={20} color={colors.secondary.default} />
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      {right || (
        <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
      )}
    </TouchableOpacity>
  );

  const SwitchRow = ({ icon, label, value, onValueChange }: any) => (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon as any} size={20} color={colors.secondary.default} />
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border.default, true: colors.secondary.default }}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary.contrast} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuración</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificaciones</Text>
          <View style={styles.card}>
            <SwitchRow
              icon="notifications-outline"
              label="Notificaciones Push"
              value={pushNotifications}
              onValueChange={setPushNotifications}
            />
            <View style={styles.divider} />
            <SwitchRow
              icon="mail-outline"
              label="Notificaciones por Email"
              value={emailNotifications}
              onValueChange={setEmailNotifications}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Apariencia</Text>
          <View style={styles.card}>
            <SwitchRow
              icon="moon-outline"
              label="Modo Oscuro"
              value={darkMode}
              onValueChange={setDarkMode}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="language-outline"
              label="Idioma"
              value={language}
              right={<Text style={styles.valueText}>{language}</Text>}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacidad y Seguridad</Text>
          <View style={styles.card}>
            <SwitchRow
              icon="location-outline"
              label="Servicios de Ubicación"
              value={locationServices}
              onValueChange={setLocationServices}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="shield-checkmark-outline"
              label="Privacidad del Perfil"
              onPress={() => {}}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="key-outline"
              label="Cambiar Contraseña"
              onPress={() => {}}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuenta</Text>
          <View style={styles.card}>
            <SettingRow
              icon="download-outline"
              label="Exportar mis Datos"
              onPress={() => {}}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="trash-outline"
              label="Eliminar Cuenta"
              onPress={() => {
                Alert.alert(
                  'Eliminar Cuenta',
                  '¿Estás seguro? Esta acción no se puede deshacer.',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Eliminar', style: 'destructive' },
                  ]
                );
              }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acerca de</Text>
          <View style={styles.card}>
            <SettingRow
              icon="information-circle-outline"
              label="Versión de la App"
              right={<Text style={styles.valueText}>1.0.0</Text>}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="document-text-outline"
              label="Términos y Condiciones"
              onPress={() => {}}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="shield-outline"
              label="Política de Privacidad"
              onPress={() => {}}
            />
          </View>
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
    ...shadow.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    marginLeft: spacing.md,
    flex: 1,
    fontFamily: typography.family.medium,
  },
  valueText: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    marginRight: spacing.sm,
    fontFamily: typography.family.regular,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.default,
    marginHorizontal: spacing.md,
  },
});
