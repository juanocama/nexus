import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { borderRadius, spacing, shadow } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/hooks/useTheme';
import PageHeader from '@/components/PageHeader';

const MOCK_CARDS = [
  { id: '1', last_four: '4242', brand: 'Visa', exp_month: 12, exp_year: 2027, is_default: true },
  { id: '2', last_four: '8888', brand: 'Mastercard', exp_month: 6, exp_year: 2026, is_default: false },
];

const MOCK_PSE_BANKS = [
  { id: '1', name: 'Bancolombia' },
  { id: '2', name: 'Banco de Bogotá' },
  { id: '3', name: 'Davivienda' },
  { id: '4', name: 'BBVA Colombia' },
];

export default function PaymentsScreen() {
  const router = useRouter();
  const { t } = useSettings();
  const { colors, typography } = useTheme();
  const [activeTab, setActiveTab] = useState<'cards' | 'pse' | 'coins'>('cards');

  const sabanaCoins = 150;
  const p = t.payments;

  const removeCard = (cardId: string) => {
    Alert.alert(t.common.delete, '¿Estás seguro de eliminar esta tarjeta?', [
      { text: t.common.cancel, style: 'cancel' },
      { text: t.common.delete, style: 'destructive' },
    ]);
  };

  const getCardIcon = (brand: string) => brand === 'Visa' ? 'card' : 'logo-google';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      <PageHeader
        title={p.title}
        rightAction={
          <TouchableOpacity onPress={() => router.push('/payments/add-card')}>
            <Ionicons name="add" size={24} color={colors.primary.contrast} />
          </TouchableOpacity>
        }
      />

      <View style={[styles.coinsBanner, { backgroundColor: '#FEF3C7', marginHorizontal: spacing.lg, marginTop: spacing.lg, borderRadius: borderRadius.lg, padding: spacing.md }]}>
        <View style={[styles.coinsIcon, { width: 48, height: 48, borderRadius: borderRadius.full, backgroundColor: colors.background.card, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md }]}>
          <Ionicons name="trophy" size={24} color="#F59E0B" />
        </View>
        <View>
          <Text style={[styles.coinsBalance, { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: '#92400E', fontFamily: typography.family.bold }]}>{sabanaCoins} Sabana Coins</Text>
          <Text style={[styles.coinsSubtext, { fontSize: typography.sizes.sm, color: '#A16207', fontFamily: typography.family.regular }]}>Disponible para usar en reservas</Text>
        </View>
      </View>

      <View style={[styles.tabContainer, { backgroundColor: colors.background.card, borderBottomColor: colors.border.default, borderBottomWidth: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.md }]}>
        <TouchableOpacity style={[styles.tab, { paddingVertical: spacing.sm, marginRight: spacing.lg, borderBottomWidth: 2, borderBottomColor: 'transparent' }, activeTab === 'cards' && { borderBottomColor: colors.secondary.default }]} onPress={() => setActiveTab('cards')}>
          <Text style={[styles.tabText, { fontSize: typography.sizes.md, fontWeight: typography.weights.medium, color: colors.text.muted, fontFamily: typography.family.medium }, activeTab === 'cards' && { color: colors.secondary.default, fontWeight: typography.weights.semibold }]}>Tarjetas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, { paddingVertical: spacing.sm, marginRight: spacing.lg, borderBottomWidth: 2, borderBottomColor: 'transparent' }, activeTab === 'pse' && { borderBottomColor: colors.secondary.default }]} onPress={() => setActiveTab('pse')}>
          <Text style={[styles.tabText, { fontSize: typography.sizes.md, fontWeight: typography.weights.medium, color: colors.text.muted, fontFamily: typography.family.medium }, activeTab === 'pse' && { color: colors.secondary.default, fontWeight: typography.weights.semibold }]}>PSE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, { paddingVertical: spacing.sm, marginRight: spacing.lg, borderBottomWidth: 2, borderBottomColor: 'transparent' }, activeTab === 'coins' && { borderBottomColor: colors.secondary.default }]} onPress={() => setActiveTab('coins')}>
          <Text style={[styles.tabText, { fontSize: typography.sizes.md, fontWeight: typography.weights.medium, color: colors.text.muted, fontFamily: typography.family.medium }, activeTab === 'coins' && { color: colors.secondary.default, fontWeight: typography.weights.semibold }]}>Historial Coins</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'cards' && (
          <>
            {MOCK_CARDS.map((card, index) => (
              <View key={card.id} style={[styles.cardItem, { backgroundColor: colors.background.card, borderRadius: borderRadius.lg, padding: spacing.md, marginHorizontal: spacing.lg, marginBottom: spacing.md, ...shadow.sm }]}>
                <View style={[styles.cardInfo, { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }]}>
                  <Ionicons name={getCardIcon(card.brand) as any} size={28} color={colors.secondary.default} />
                  <View style={[styles.cardDetails, { flex: 1, marginLeft: spacing.md }]}>
                    <Text style={[styles.cardBrand, { fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, color: colors.text.primary, fontFamily: typography.family.semibold }]}>{card.brand} •••{card.last_four}</Text>
                    <Text style={[styles.cardExpiry, { fontSize: typography.sizes.sm, color: colors.text.muted, fontFamily: typography.family.regular }]}>Vence {card.exp_month.toString().padStart(2, '0')}/{card.exp_year}</Text>
                  </View>
                  {card.is_default && (
                    <View style={[styles.defaultBadge, { backgroundColor: colors.tertiary.default + '20', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm }]}>
                      <Text style={[styles.defaultBadgeText, { fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.tertiary.default, fontFamily: typography.family.semibold }]}>Principal</Text>
                    </View>
                  )}
                </View>
                <View style={[styles.cardActions, { flexDirection: 'row', justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: colors.border.default, paddingTop: spacing.sm }]}>
                  <TouchableOpacity style={[styles.cardAction, { paddingHorizontal: spacing.md, paddingVertical: spacing.xs }]}>
                    <Text style={[styles.cardActionText, { fontSize: typography.sizes.sm, color: colors.secondary.default, fontWeight: typography.weights.medium, fontFamily: typography.family.medium }]}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.cardAction, { paddingHorizontal: spacing.md, paddingVertical: spacing.xs }]} onPress={() => removeCard(card.id)}>
                    <Text style={[styles.cardActionText, { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, fontFamily: typography.family.medium }, { color: colors.status.error }]}>{t.common.delete}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <Link href="/payments/add-card" asChild>
              <TouchableOpacity style={[styles.addCardButton, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background.card, borderRadius: borderRadius.lg, paddingVertical: spacing.lg, marginHorizontal: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border.default, borderStyle: 'dashed' }]}>
                <Ionicons name="add-circle-outline" size={24} color={colors.secondary.default} />
                <Text style={[styles.addCardText, { fontSize: typography.sizes.md, color: colors.secondary.default, fontWeight: typography.weights.medium, marginLeft: spacing.sm, fontFamily: typography.family.medium }]}>{p.addCard}</Text>
              </TouchableOpacity>
            </Link>
          </>
        )}

        {activeTab === 'pse' && (
          <View style={[styles.pseContainer, { marginBottom: spacing.lg }]}>
            <Text style={[styles.pseTitle, { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.text.primary, marginHorizontal: spacing.lg, marginBottom: spacing.md, fontFamily: typography.family.bold }]}>Selecciona tu banco</Text>
            {MOCK_PSE_BANKS.map(bank => (
              <TouchableOpacity key={bank.id} style={[styles.bankItem, { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background.card, borderRadius: borderRadius.lg, padding: spacing.md, marginHorizontal: spacing.lg, marginBottom: spacing.sm, ...shadow.sm }]}>
                <View style={[styles.bankIcon, { width: 40, height: 40, borderRadius: borderRadius.md, backgroundColor: colors.background.default, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md }]}>
                  <Ionicons name="business-outline" size={20} color={colors.text.secondary} />
                </View>
                <Text style={[styles.bankName, { flex: 1, fontSize: typography.sizes.md, color: colors.text.primary, fontFamily: typography.family.medium }]}>{bank.name}</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === 'coins' && (
          <View>
            <Text style={[styles.coinsHistoryTitle, { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.text.primary, marginHorizontal: spacing.lg, marginBottom: spacing.md, fontFamily: typography.family.bold }]}>Movimientos de Sabana Coins</Text>
            {[
              { type: 'earned', amount: '+25', desc: 'Viaje completado', date: 'Hace 2 horas' },
              { type: 'earned', amount: '+10', desc: 'Calificación dada', date: 'Ayer' },
              { type: 'spent', amount: '-50', desc: 'Descuento en reserva', date: 'Hace 3 días' },
              { type: 'bonus', amount: '+100', desc: 'Bono de bienvenida', date: 'Hace 1 semana' },
            ].map((item, idx) => (
              <View key={idx} style={[styles.coinHistoryItem, { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background.card, borderRadius: borderRadius.lg, padding: spacing.md, marginHorizontal: spacing.lg, marginBottom: spacing.sm, ...shadow.sm }]}>
                <View style={[styles.coinHistoryIcon, { width: 36, height: 36, borderRadius: borderRadius.full, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md }, { backgroundColor: item.type === 'spent' ? colors.status.errorBg : '#FEF3C7' }]}>
                  <Ionicons name={item.type === 'spent' ? 'arrow-down' : 'arrow-up'} size={16} color={item.type === 'spent' ? colors.status.error : '#F59E0B'} />
                </View>
                <View style={[styles.coinHistoryInfo, { flex: 1 }]}>
                  <Text style={[styles.coinHistoryDesc, { fontSize: typography.sizes.md, fontWeight: typography.weights.medium, color: colors.text.primary, fontFamily: typography.family.medium }]}>{item.desc}</Text>
                  <Text style={[styles.coinHistoryDate, { fontSize: typography.sizes.sm, color: colors.text.muted, fontFamily: typography.family.regular }]}>{item.date}</Text>
                </View>
                <Text style={[styles.coinHistoryAmount, { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, fontFamily: typography.family.bold }, { color: item.type === 'spent' ? colors.status.error : colors.status.success }]}>{item.amount}</Text>
              </View>
            ))}
          </View>
        )}
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  coinsBanner: {},
  coinsIcon: {},
  coinsBalance: {},
  coinsSubtext: {},
  tabContainer: {},
  tab: {},
  tabText: {},
  cardItem: {},
  cardInfo: {},
  cardDetails: {},
  cardBrand: {},
  cardExpiry: {},
  defaultBadge: {},
  defaultBadgeText: {},
  cardActions: {},
  cardAction: {},
  cardActionText: {},
  addCardButton: { gap: spacing.sm },
  addCardText: {},
  pseContainer: {},
  pseTitle: {},
  bankItem: {},
  bankIcon: {},
  bankName: {},
  coinsHistoryTitle: {},
  coinHistoryItem: {},
  coinHistoryIcon: {},
  coinHistoryInfo: {},
  coinHistoryDesc: {},
  coinHistoryDate: {},
  coinHistoryAmount: {},
});
