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
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, borderRadius, typography, spacing, shadow } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';

const REPORT_REASONS = [
  { id: 'safety', label: 'Problema de Seguridad', icon: 'warning', desc: 'Conducción peligrosa o comportamiento agresivo' },
  { id: 'harassment', label: 'Acoso', icon: 'hand-left', desc: 'Comportamiento inapropiado o acoso' },
  { id: 'no_show', label: 'No se Presentó', icon: 'close-circle', desc: 'El conductor o pasajero no llegó al punto de encuentro' },
  { id: 'misrepresentation', label: 'Información Falsa', icon: 'information-circle', desc: 'Datos del vehículo o ruta incorrectos' },
  { id: 'payment', label: 'Problema de Pago', icon: 'card', desc: 'Cobro incorrecto o problema con el pago' },
  { id: 'other', label: 'Otro', icon: 'ellipsis-horizontal', desc: 'Otro tipo de incidente' },
];

export default function ReportScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('medium');

  const handleSubmit = () => {
    if (!selectedReason) {
      Alert.alert('Error', 'Selecciona un motivo para el reporte');
      return;
    }

    Alert.alert(
      'Reporte Enviado',
      'Tu reporte ha sido recibido. Nuestro equipo lo revisará y tomará las acciones necesarias.',
      [
        { text: 'OK', onPress: () => router.replace('/(tabs)/home') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary.contrast} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reportar Usuario</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.warningCard}>
          <Ionicons name="alert-circle" size={24} color={colors.status.warning} />
          <Text style={styles.warningText}>
            Todos los reportes son revisados por nuestro equipo de seguridad.
            La información proporcionada es confidencial.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Motivo del Reporte</Text>
          {REPORT_REASONS.map(reason => (
            <TouchableOpacity
              key={reason.id}
              style={[
                styles.reasonCard,
                selectedReason === reason.id && styles.reasonCardSelected
              ]}
              onPress={() => setSelectedReason(reason.id)}
            >
              <View style={[
                styles.reasonIcon,
                selectedReason === reason.id && styles.reasonIconSelected
              ]}>
                <Ionicons
                  name={reason.icon as any}
                  size={20}
                  color={selectedReason === reason.id ? colors.primary.contrast : colors.text.secondary}
                />
              </View>
              <View style={styles.reasonInfo}>
                <Text style={[
                  styles.reasonLabel,
                  selectedReason === reason.id && styles.reasonLabelSelected
                ]}>{reason.label}</Text>
                <Text style={styles.reasonDesc}>{reason.desc}</Text>
              </View>
              {selectedReason === reason.id && (
                <Ionicons name="checkmark-circle" size={24} color={colors.secondary.default} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nivel de Gravedad</Text>
          <View style={styles.severityContainer}>
            {(['low', 'medium', 'high'] as const).map(level => {
              const config = {
                low: { label: 'Leve', color: colors.status.info, bg: colors.status.infoBg },
                medium: { label: 'Moderado', color: colors.status.warning, bg: colors.status.warningBg },
                high: { label: 'Grave', color: colors.status.error, bg: colors.status.errorBg },
              };
              const cfg = config[level];
              return (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.severityBtn,
                    severity === level && { ...styles.severityBtnSelected, backgroundColor: cfg.bg }
                  ]}
                  onPress={() => setSeverity(level)}
                >
                  <Text style={[
                    styles.severityText,
                    severity === level && { color: cfg.color }
                  ]}>{cfg.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción del Incidente</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe lo que sucedió con el mayor detalle posible..."
            placeholderTextColor={colors.text.muted}
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
            numberOfLines={6}
          />
          <Text style={styles.charCount}>{description.length}/500 caracteres</Text>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Ionicons name="send-outline" size={20} color={colors.primary.contrast} />
          <Text style={styles.submitButtonText}>Enviar Reporte</Text>
        </TouchableOpacity>
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
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.status.warningBg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  warningText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: '#92400E',
    marginLeft: spacing.sm,
    lineHeight: typography.sizes.sm * typography.lineHeight.normal,
    fontFamily: typography.family.regular,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    fontFamily: typography.family.bold,
  },
  reasonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  reasonCardSelected: {
    borderColor: colors.secondary.default,
    backgroundColor: colors.secondary.default + '08',
  },
  reasonIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.default,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  reasonIconSelected: {
    backgroundColor: colors.secondary.default,
  },
  reasonInfo: {
    flex: 1,
  },
  reasonLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    fontFamily: typography.family.semibold,
  },
  reasonLabelSelected: {
    color: colors.secondary.default,
  },
  reasonDesc: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    fontFamily: typography.family.regular,
  },
  severityContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  severityBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
  },
  severityBtnSelected: {
    borderWidth: 2,
  },
  severityText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    fontFamily: typography.family.semibold,
  },
  textArea: {
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    minHeight: 140,
    fontFamily: typography.family.regular,
  },
  charCount: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    textAlign: 'right',
    marginTop: spacing.xs,
    fontFamily: typography.family.regular,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.status.error,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    ...shadow.md,
  },
  submitButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.primary.contrast,
    marginLeft: spacing.sm,
    fontFamily: typography.family.semibold,
  },
});
