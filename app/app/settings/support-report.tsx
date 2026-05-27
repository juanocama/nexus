import React, { useMemo, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import PageHeader from '@/components/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { borderRadius, shadow, spacing } from '@/theme/colors';
import { ReportType, reportsApi } from '@/api/reports';

const REPORT_TYPES: {
  id: ReportType;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}[] = [
  {
    id: 'bug',
    label: 'Bug',
    description: 'Algo no funciona como deberia',
    icon: 'bug-outline',
    color: '#DC2626',
  },
  {
    id: 'suggestion',
    label: 'Sugerencia',
    description: 'Una idea para mejorar Nexus',
    icon: 'sparkles-outline',
    color: '#0D9488',
  },
  {
    id: 'other',
    label: 'Otro',
    description: 'Soporte, dudas o comentarios',
    icon: 'chatbox-ellipses-outline',
    color: '#6366F1',
  },
];

export default function SupportReportScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const { colors, typography } = useTheme();
  const fontWeights = {
    bold: typography.weights.bold as TextStyle['fontWeight'],
    semibold: typography.weights.semibold as TextStyle['fontWeight'],
  };
  const [type, setType] = useState<ReportType>('bug');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = useMemo(() => title.trim().length >= 3 && description.trim().length >= 10, [title, description]);

  const handleSubmit = async () => {
    if (!token) {
      Alert.alert('Sesion requerida', 'Inicia sesion nuevamente para enviar el reporte.');
      return;
    }

    if (!isValid) {
      Alert.alert('Campos incompletos', 'Agrega un titulo y una descripcion de al menos 10 caracteres.');
      return;
    }

    try {
      setIsSubmitting(true);
      await reportsApi.createReport(token, {
        type,
        title: title.trim(),
        description: description.trim(),
      });
      Alert.alert('Reporte enviado', 'Gracias por ayudarnos a mejorar Nexus.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('No se pudo enviar', error instanceof Error ? error.message : 'Intentalo de nuevo mas tarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      <PageHeader title="Reportar bug o sugerencia" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.intro, { backgroundColor: colors.secondary.default + '12', borderRadius: borderRadius.lg, margin: spacing.lg, padding: spacing.lg }]}>
          <View style={[styles.introIcon, { backgroundColor: colors.background.card }]}>
            <Ionicons name="megaphone-outline" size={26} color={colors.secondary.default} />
          </View>
          <View style={styles.introText}>
            <Text style={[styles.introTitle, { color: colors.text.primary, fontSize: typography.sizes.lg, fontWeight: fontWeights.bold, fontFamily: typography.family.bold }]}>
              Cuentanos que paso
            </Text>
            <Text style={[styles.introBody, { color: colors.text.secondary, fontSize: typography.sizes.sm, fontFamily: typography.family.regular, lineHeight: typography.sizes.sm * typography.lineHeight.normal }]}>
              Enviaremos tu reporte al equipo de soporte para revisarlo lo antes posible.
            </Text>
          </View>
        </View>

        <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary, fontSize: typography.sizes.md, fontWeight: fontWeights.bold, fontFamily: typography.family.bold }]}>
            Tipo de reporte
          </Text>

          {REPORT_TYPES.map((item) => {
            const selected = type === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.75}
                style={[
                  styles.typeCard,
                  { backgroundColor: colors.background.card, borderColor: colors.border.default, borderRadius: borderRadius.lg, padding: spacing.md },
                  selected && { borderColor: item.color, backgroundColor: `${item.color}10` },
                ]}
                onPress={() => setType(item.id)}
              >
                <View style={[styles.typeIcon, { backgroundColor: selected ? item.color : colors.background.default, borderRadius: borderRadius.md }]}>
                  <Ionicons name={item.icon} size={20} color={selected ? colors.primary.contrast : item.color} />
                </View>
                <View style={styles.typeCopy}>
                  <Text style={[styles.typeLabel, { color: selected ? item.color : colors.text.primary, fontSize: typography.sizes.md, fontWeight: fontWeights.semibold, fontFamily: typography.family.semibold }]}>
                    {item.label}
                  </Text>
                  <Text style={[styles.typeDescription, { color: colors.text.muted, fontSize: typography.sizes.sm, fontFamily: typography.family.regular }]}>
                    {item.description}
                  </Text>
                </View>
                {selected && <Ionicons name="checkmark-circle" size={22} color={item.color} />}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={[styles.section, { paddingHorizontal: spacing.lg, marginTop: spacing.md }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary, fontSize: typography.sizes.md, fontWeight: fontWeights.bold, fontFamily: typography.family.bold }]}>
            Titulo
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background.card, borderColor: colors.border.default, borderRadius: borderRadius.md, color: colors.text.primary, fontFamily: typography.family.regular, fontSize: typography.sizes.md }]}
            placeholder="Ej: No puedo publicar un viaje"
            placeholderTextColor={colors.text.muted}
            value={title}
            onChangeText={setTitle}
            maxLength={120}
          />
        </View>

        <View style={[styles.section, { paddingHorizontal: spacing.lg, marginTop: spacing.md }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary, fontSize: typography.sizes.md, fontWeight: fontWeights.bold, fontFamily: typography.family.bold }]}>
            Descripcion
          </Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.background.card, borderColor: colors.border.default, borderRadius: borderRadius.md, color: colors.text.primary, fontFamily: typography.family.regular, fontSize: typography.sizes.md }]}
            placeholder="Describe que esperabas que pasara y que ocurrio realmente..."
            placeholderTextColor={colors.text.muted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={7}
            textAlignVertical="top"
            maxLength={1200}
          />
          <Text style={[styles.counter, { color: colors.text.muted, fontSize: typography.sizes.xs, fontFamily: typography.family.regular }]}>
            {description.length}/1200
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.75}
          style={[
            styles.submitButton,
            { backgroundColor: colors.secondary.default, borderRadius: borderRadius.md, margin: spacing.lg, paddingVertical: spacing.md },
            (!isValid || isSubmitting) && { backgroundColor: colors.border.dark },
          ]}
          disabled={!isValid || isSubmitting}
          onPress={handleSubmit}
        >
          <Ionicons name="send-outline" size={20} color={colors.primary.contrast} />
          <Text style={[styles.submitText, { color: colors.primary.contrast, fontSize: typography.sizes.md, fontWeight: fontWeights.semibold, fontFamily: typography.family.semibold }]}>
            {isSubmitting ? 'Enviando...' : 'Enviar reporte'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  intro: { flexDirection: 'row', alignItems: 'center' },
  introIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  introText: { flex: 1, marginLeft: spacing.md },
  introTitle: {},
  introBody: { marginTop: spacing.xs },
  section: {},
  sectionTitle: { marginBottom: spacing.sm },
  typeCard: {
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    ...shadow.sm,
  },
  typeIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  typeCopy: { flex: 1 },
  typeLabel: {},
  typeDescription: { marginTop: 2 },
  input: { borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  textArea: { borderWidth: 1, minHeight: 150, paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  counter: { marginTop: spacing.xs, textAlign: 'right' },
  submitButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', ...shadow.md },
  submitText: { marginLeft: spacing.sm },
});
