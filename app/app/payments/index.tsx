import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import { borderRadius, spacing, shadow } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/context/AuthContext';
import { paymentsApi, SavedPaymentCard } from '@/api/payments';
import PageHeader from '@/components/PageHeader';

const MOCK_PSE_BANKS = [
  { id: '1', name: 'Bancolombia' },
  { id: '2', name: 'Banco de Bogota' },
  { id: '3', name: 'Davivienda' },
  { id: '4', name: 'BBVA Colombia' },
];

export default function PaymentsScreen() {
  const router = useRouter();
  const { t } = useSettings();
  const { colors, typography } = useTheme();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'cards' | 'pse' | 'coins'>('cards');
  const [cards, setCards] = useState<SavedPaymentCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const sabanaCoins = 150;
  const p = t.payments;

  const loadCards = useCallback(async (refresh = false) => {
    if (!token) return;

    refresh ? setIsRefreshing(true) : setIsLoading(true);
    try {
      const savedCards = await paymentsApi.listCards(token);
      setCards(savedCards);
    } catch (error: any) {
      Alert.alert('No se pudieron cargar las tarjetas', error.message || 'Intentalo de nuevo.');
    } finally {
      refresh ? setIsRefreshing(false) : setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  useFocusEffect(
    useCallback(() => {
      loadCards(true);
    }, [loadCards]),
  );

  const removeCard = (card: SavedPaymentCard) => {
    Alert.alert(t.common.delete, 'Seguro que quieres eliminar esta tarjeta?', [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.delete,
        style: 'destructive',
        onPress: async () => {
          if (!token) return;
          try {
            await paymentsApi.deleteCard(token, card.id);
            setCards((current) => current.filter((item) => item.id !== card.id));
          } catch (error: any) {
            Alert.alert('No se pudo eliminar', error.message || 'Intentalo de nuevo.');
          }
        },
      },
    ]);
  };

  const setDefaultCard = async (card: SavedPaymentCard) => {
    if (!token || card.is_default) return;

    try {
      const updatedCard = await paymentsApi.setDefaultCard(token, card.id);
      setCards((current) => current.map((item) => ({
        ...item,
        is_default: item.id === updatedCard.id,
      })));
    } catch (error: any) {
      Alert.alert('No se pudo actualizar', error.message || 'Intentalo de nuevo.');
    }
  };

  const getCardIcon = (brand: string) => {
    const normalized = brand.toLowerCase();
    return normalized.includes('master') ? 'card' : 'card-outline';
  };

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
        {[
          ['cards', 'Tarjetas'],
          ['pse', 'PSE'],
          ['coins', 'Historial Coins'],
        ].map(([key, label]) => (
          <TouchableOpacity key={key} style={[styles.tab, { paddingVertical: spacing.sm, marginRight: spacing.lg, borderBottomWidth: 2, borderBottomColor: 'transparent' }, activeTab === key && { borderBottomColor: colors.secondary.default }]} onPress={() => setActiveTab(key as typeof activeTab)}>
            <Text style={[styles.tabText, { fontSize: typography.sizes.md, fontWeight: typography.weights.medium, color: colors.text.muted, fontFamily: typography.family.medium }, activeTab === key && { color: colors.secondary.default, fontWeight: typography.weights.semibold }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => loadCards(true)} />}
      >
        {activeTab === 'cards' && (
          <>
            {isLoading && (
              <View style={styles.emptyState}>
                <ActivityIndicator color={colors.secondary.default} />
              </View>
            )}

            {!isLoading && cards.length === 0 && (
              <View style={[styles.emptyState, { backgroundColor: colors.background.card, borderColor: colors.border.default }]}>
                <Ionicons name="card-outline" size={34} color={colors.text.muted} />
                <Text style={[styles.emptyTitle, { color: colors.text.primary, fontFamily: typography.family.semibold }]}>No tienes tarjetas guardadas</Text>
                <Text style={[styles.emptyText, { color: colors.text.muted, fontFamily: typography.family.regular }]}>Agrega una tarjeta para usarla con Mercado Pago.</Text>
              </View>
            )}

            {cards.map((card) => (
              <View key={card.id} style={[styles.cardItem, { backgroundColor: colors.background.card, borderRadius: borderRadius.lg, padding: spacing.md, marginHorizontal: spacing.lg, marginBottom: spacing.md, ...shadow.sm }]}>
                <View style={[styles.cardInfo, { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }]}>
                  <Ionicons name={getCardIcon(card.brand) as any} size={28} color={colors.secondary.default} />
                  <View style={[styles.cardDetails, { flex: 1, marginLeft: spacing.md }]}>
                    <Text style={[styles.cardBrand, { fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, color: colors.text.primary, fontFamily: typography.family.semibold }]}>{card.brand} ****{card.last_four}</Text>
                    <Text style={[styles.cardExpiry, { fontSize: typography.sizes.sm, color: colors.text.muted, fontFamily: typography.family.regular }]}>Vence {String(card.exp_month).padStart(2, '0')}/{card.exp_year}</Text>
                  </View>
                  {card.is_default && (
                    <View style={[styles.defaultBadge, { backgroundColor: colors.tertiary.default + '20', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm }]}>
                      <Text style={[styles.defaultBadgeText, { fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.tertiary.default, fontFamily: typography.family.semibold }]}>Principal</Text>
                    </View>
                  )}
                </View>
                <View style={[styles.cardActions, { flexDirection: 'row', justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: colors.border.default, paddingTop: spacing.sm }]}>
                  <TouchableOpacity style={[styles.cardAction, { paddingHorizontal: spacing.md, paddingVertical: spacing.xs }]} onPress={() => setDefaultCard(card)}>
                    <Text style={[styles.cardActionText, { fontSize: typography.sizes.sm, color: colors.secondary.default, fontWeight: typography.weights.medium, fontFamily: typography.family.medium }]}>{card.is_default ? 'Principal' : 'Hacer principal'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.cardAction, { paddingHorizontal: spacing.md, paddingVertical: spacing.xs }]} onPress={() => removeCard(card)}>
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
              { type: 'earned', amount: '+10', desc: 'Calificacion dada', date: 'Ayer' },
              { type: 'spent', amount: '-50', desc: 'Descuento en reserva', date: 'Hace 3 dias' },
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
  content: { flex: 1, paddingTop: spacing.lg },
  coinsBanner: { flexDirection: 'row', alignItems: 'center' },
  coinsIcon: {},
  coinsBalance: {},
  coinsSubtext: {},
  tabContainer: { flexDirection: 'row' },
  tab: {},
  tabText: {},
  emptyState: { alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginHorizontal: spacing.lg, marginBottom: spacing.md, padding: spacing.lg, borderWidth: 1, borderRadius: borderRadius.lg },
  emptyTitle: { fontSize: 16, fontWeight: '600' },
  emptyText: { fontSize: 14, textAlign: 'center' },
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
