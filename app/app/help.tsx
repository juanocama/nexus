import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { borderRadius, spacing, shadow, typography } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/hooks/useTheme';
import PageHeader from '@/components/PageHeader';

export default function HelpScreen() {
  const router = useRouter();
  const { t } = useSettings();
  const { colors, typography } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('general');

  const faqData = [
    { id: '1', question: t.help.faqData.publishTrip.q, answer: t.help.faqData.publishTrip.a },
    { id: '2', question: t.help.faqData.bookSeat.q, answer: t.help.faqData.bookSeat.a },
    { id: '3', question: t.help.faqData.sabanaCoins.q, answer: t.help.faqData.sabanaCoins.a },
    { id: '4', question: t.help.faqData.payment.q, answer: t.help.faqData.payment.a },
    { id: '5', question: t.help.faqData.cancelBooking.q, answer: t.help.faqData.cancelBooking.a },
    { id: '6', question: t.help.faqData.whoCanUse.q, answer: t.help.faqData.whoCanUse.a },
    { id: '7', question: t.help.faqData.ratingSystem.q, answer: t.help.faqData.ratingSystem.a },
  ];

  const filteredFaqs = faqData.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [
    { id: 'general', label: t.help.categories.general, icon: 'help-circle-outline' },
    { id: 'payments', label: t.help.categories.payments, icon: 'card-outline' },
    { id: 'trips', label: t.help.categories.trips, icon: 'car-outline' },
    { id: 'account', label: t.help.categories.account, icon: 'person-outline' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      <PageHeader title={t.help.title} />

      <ScrollView style={styles.content}>
        <View style={[styles.contactCard, { backgroundColor: colors.secondary.default + '10', borderRadius: borderRadius.lg, padding: spacing.lg, marginHorizontal: spacing.lg, marginTop: spacing.lg, marginBottom: spacing.lg, alignItems: 'center' }]}>
          <Ionicons name="headset-outline" size={32} color={colors.secondary.default} />
          <Text style={[styles.contactTitle, { color: colors.text.primary, fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, fontFamily: typography.family.bold }]}>{t.help.needMoreHelp}</Text>
          <Text style={[styles.contactText, { color: colors.text.secondary, fontSize: typography.sizes.sm, fontFamily: typography.family.regular, textAlign: 'center' }]}>{t.help.contactDesc}</Text>
          <TouchableOpacity style={[styles.contactButton, { backgroundColor: colors.secondary.default, borderRadius: borderRadius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, marginTop: spacing.md, flexDirection: 'row', alignItems: 'center' }]}>
            <Ionicons name="chatbubble-outline" size={18} color={colors.primary.contrast} />
                <Text style={[styles.contactButtonText, { color: colors.primary.contrast, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold }]}>{t.help.chatWithUs}</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.searchContainer, { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background.card, borderRadius: borderRadius.md, marginHorizontal: spacing.lg, marginBottom: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderWidth: 1, borderColor: colors.border.default }]}>
          <Ionicons name="search" size={20} color={colors.text.muted} />
          <TextInput style={[styles.searchInput, { flex: 1, marginLeft: spacing.sm, fontSize: typography.sizes.md, color: colors.text.primary, fontFamily: typography.family.regular }]} placeholder={t.help.searchPlaceholder} placeholderTextColor={colors.text.muted} value={searchQuery} onChangeText={setSearchQuery} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.categoriesContainer, { paddingHorizontal: spacing.lg, marginBottom: spacing.md }]}>
          {categories.map(cat => (
            <TouchableOpacity key={cat.id} style={[styles.categoryChip, { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background.card, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, marginRight: spacing.sm, borderWidth: 1, borderColor: colors.border.default },
              activeCategory === cat.id && { backgroundColor: colors.secondary.default, borderColor: colors.secondary.default }]} onPress={() => setActiveCategory(cat.id)}>
              <Ionicons name={cat.icon as any} size={16} color={activeCategory === cat.id ? colors.primary.contrast : colors.text.secondary} />
              <Text style={[styles.categoryText, { fontSize: typography.sizes.sm, color: colors.text.secondary, marginLeft: spacing.xs, fontFamily: typography.family.medium },
                activeCategory === cat.id && { color: colors.primary.contrast }]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={[styles.faqSection, { paddingHorizontal: spacing.lg, marginBottom: spacing.lg }]}>
          <Text style={[styles.sectionTitle, { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.text.primary, marginBottom: spacing.md, fontFamily: typography.family.bold }]}>{t.help.faq}</Text>
          {filteredFaqs.map(faq => (
            <TouchableOpacity key={faq.id} style={[styles.faqCard, { backgroundColor: colors.background.card, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.sm, ...shadow.sm }]} onPress={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}>
              <View style={[styles.faqHeader, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                <Text style={[styles.faqQuestion, { flex: 1, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, color: colors.text.primary, marginRight: spacing.sm, fontFamily: typography.family.semibold }]}>{faq.question}</Text>
                <Ionicons name={expandedFaq === faq.id ? 'chevron-up' : 'chevron-down'} size={20} color={colors.text.muted} />
              </View>
              {expandedFaq === faq.id && <Text style={[styles.faqAnswer, { fontSize: typography.sizes.sm, color: colors.text.secondary, marginTop: spacing.md, lineHeight: typography.sizes.sm * typography.lineHeight.normal, fontFamily: typography.family.regular }]}>{faq.answer}</Text>}
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.contactOptions, { paddingHorizontal: spacing.lg, marginBottom: spacing.lg }]}>
          <Text style={[styles.sectionTitle, { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.text.primary, marginBottom: spacing.md, fontFamily: typography.family.bold }]}>{t.help.contactOptions}</Text>
          <View style={[styles.contactGrid, { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: colors.background.card, borderRadius: borderRadius.lg, padding: spacing.lg, ...shadow.sm }]}>
            <TouchableOpacity style={styles.contactOption}>
              <View style={[styles.contactOptionIcon, { width: 48, height: 48, borderRadius: borderRadius.full, backgroundColor: colors.background.default, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm }]}>
                <Ionicons name="mail-outline" size={24} color={colors.secondary.default} />
              </View>
              <Text style={[styles.contactOptionText, { fontSize: typography.sizes.sm, color: colors.text.primary, fontFamily: typography.family.medium }]}>{t.help.email}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactOption}>
              <View style={[styles.contactOptionIcon, { width: 48, height: 48, borderRadius: borderRadius.full, backgroundColor: colors.background.default, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm }]}>
                <Ionicons name="call-outline" size={24} color={colors.tertiary.default} />
              </View>
              <Text style={[styles.contactOptionText, { fontSize: typography.sizes.sm, color: colors.text.primary, fontFamily: typography.family.medium }]}>{t.help.phone}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactOption}>
              <View style={[styles.contactOptionIcon, { width: 48, height: 48, borderRadius: borderRadius.full, backgroundColor: colors.background.default, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm }]}>
                <Ionicons name="chatbubble-ellipses-outline" size={24} color="#25D366" />
              </View>
              <Text style={[styles.contactOptionText, { fontSize: typography.sizes.sm, color: colors.text.primary, fontFamily: typography.family.medium }]}>{t.help.whatsapp}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  contactCard: {},
  contactTitle: {},
  contactText: {},
  contactButton: {},
  contactButtonText: {},
  searchContainer: {},
  searchInput: {},
  categoriesContainer: {},
  categoryChip: {},
  categoryText: {},
  faqSection: {},
  sectionTitle: {},
  faqCard: {},
  faqHeader: {},
  faqQuestion: {},
  faqAnswer: {},
  contactOptions: {},
  contactGrid: {},
  contactOption: {},
  contactOptionIcon: {},
  contactOptionText: {},
});
