import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, borderRadius, typography, spacing, shadow } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';

const FAQ_DATA = [
  {
    id: '1',
    question: '¿Cómo publico un viaje?',
    answer: 'Ve a la pestaña "Publicar" en la barra de navegación inferior. Completa el formulario con tu punto de origen, destino, fecha, hora, número de asientos y precio. Luego presiona "Publicar Viaje".',
  },
  {
    id: '2',
    question: '¿Cómo reservo un asiento?',
    answer: 'Busca un viaje disponible en la pestaña "Buscar" o desde la pantalla de inicio. Selecciona el viaje que te interese y presiona "Reservar Ahora". Confirma tu reserva y selecciona tu método de pago.',
  },
  {
    id: '3',
    question: '¿Qué son los Sabana Coins?',
    answer: 'Los Sabana Coins son una moneda virtual de incentivo. Ganas coins por completar viajes, dar calificaciones y participar en la comunidad. Puedes usarlos para obtener descuentos en tus reservas.',
  },
  {
    id: '4',
    question: '¿Cómo funciona el pago?',
    answer: 'Ofrecemos múltiples métodos de pago: PSE (débito bancario), tarjeta de crédito/débito, y Sabana Coins. El pago se procesa al momento de confirmar tu reserva.',
  },
  {
    id: '5',
    question: '¿Puedo cancelar mi reserva?',
    answer: 'Sí, puedes cancelar tu reserva desde la sección "Mis Viajes". Ten en cuenta que dependiendo del tiempo antes del viaje, puede haber políticas de reembolso.',
  },
  {
    id: '6',
    question: '¿Quién puede usar Nexus?',
    answer: 'Solo miembros de la Universidad de La Sabana con correo institucional (@unisabana.edu.co) pueden registrarse y usar la aplicación.',
  },
  {
    id: '7',
    question: '¿Cómo funciona el sistema de calificaciones?',
    answer: 'Después de cada viaje completado, tanto el conductor como los pasajeros pueden calificarse mutuamente de 1 a 5 estrellas y dejar comentarios. Las calificaciones ayudan a mantener la confianza en la comunidad.',
  },
];

export default function HelpScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('general');

  const filteredFaqs = FAQ_DATA.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [
    { id: 'general', label: 'General', icon: 'help-circle-outline' },
    { id: 'payments', label: 'Pagos', icon: 'card-outline' },
    { id: 'trips', label: 'Viajes', icon: 'car-outline' },
    { id: 'account', label: 'Cuenta', icon: 'person-outline' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary.contrast} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Centro de Ayuda</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.contactCard}>
          <Ionicons name="headset-outline" size={32} color={colors.secondary.default} />
          <Text style={styles.contactTitle}>¿Necesitas más ayuda?</Text>
          <Text style={styles.contactText}>
            Contáctanos y te responderemos lo antes posible
          </Text>
          <TouchableOpacity style={styles.contactButton}>
            <Ionicons name="chatbubble-outline" size={18} color={colors.primary.contrast} />
            <Text style={styles.contactButtonText}>Chatea con Nosotros</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.text.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar ayuda..."
            placeholderTextColor={colors.text.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryChip, activeCategory === cat.id && styles.activeCategory]}
              onPress={() => setActiveCategory(cat.id)}
            >
              <Ionicons
                name={cat.icon as any}
                size={16}
                color={activeCategory === cat.id ? colors.primary.contrast : colors.text.secondary}
              />
              <Text style={[
                styles.categoryText,
                activeCategory === cat.id && styles.activeCategoryText
              ]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Preguntas Frecuentes</Text>
          {filteredFaqs.map(faq => (
            <TouchableOpacity
              key={faq.id}
              style={styles.faqCard}
              onPress={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Ionicons
                  name={expandedFaq === faq.id ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.text.muted}
                />
              </View>
              {expandedFaq === faq.id && (
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.contactOptions}>
          <Text style={styles.sectionTitle}>Opciones de Contacto</Text>
          <View style={styles.contactGrid}>
            <TouchableOpacity style={styles.contactOption}>
              <View style={styles.contactOptionIcon}>
                <Ionicons name="mail-outline" size={24} color={colors.secondary.default} />
              </View>
              <Text style={styles.contactOptionText}>Email</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactOption}>
              <View style={styles.contactOptionIcon}>
                <Ionicons name="call-outline" size={24} color={colors.tertiary.default} />
              </View>
              <Text style={styles.contactOptionText}>Teléfono</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactOption}>
              <View style={styles.contactOptionIcon}>
                <Ionicons name="chatbubble-ellipses-outline" size={24} color="#25D366" />
              </View>
              <Text style={styles.contactOptionText}>WhatsApp</Text>
            </TouchableOpacity>
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
  contactCard: {
    backgroundColor: colors.secondary.default + '10',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: spacing.md,
    fontFamily: typography.family.bold,
  },
  contactText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    fontFamily: typography.family.regular,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary.default,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  contactButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.primary.contrast,
    marginLeft: spacing.sm,
    fontFamily: typography.family.semibold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    fontFamily: typography.family.regular,
  },
  categoriesContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  activeCategory: {
    backgroundColor: colors.secondary.default,
    borderColor: colors.secondary.default,
  },
  categoryText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
    fontFamily: typography.family.medium,
  },
  activeCategoryText: {
    color: colors.primary.contrast,
  },
  faqSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
    fontFamily: typography.family.bold,
  },
  faqCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.sm,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginRight: spacing.sm,
    fontFamily: typography.family.semibold,
  },
  faqAnswer: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.md,
    lineHeight: typography.sizes.sm * typography.lineHeight.normal,
    fontFamily: typography.family.regular,
  },
  contactOptions: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  contactGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadow.sm,
  },
  contactOption: {
    alignItems: 'center',
  },
  contactOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.default,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  contactOptionText: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    fontFamily: typography.family.medium,
  },
});
