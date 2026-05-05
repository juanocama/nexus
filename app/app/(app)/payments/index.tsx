import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { colors, borderRadius, typography, spacing, shadow } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';

const MOCK_CARDS = [
  {
    id: '1',
    last_four: '4242',
    brand: 'Visa',
    exp_month: 12,
    exp_year: 2027,
    is_default: true,
  },
  {
    id: '2',
    last_four: '8888',
    brand: 'Mastercard',
    exp_month: 6,
    exp_year: 2026,
    is_default: false,
  },
];

const MOCK_PSE_BANKS = [
  { id: '1', name: 'Bancolombia' },
  { id: '2', name: 'Banco de Bogotá' },
  { id: '3', name: 'Davivienda' },
  { id: '4', name: 'BBVA Colombia' },
];

export default function PaymentsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'cards' | 'pse' | 'coins'>('cards');

  const sabanaCoins = 150;

  const removeCard = (cardId: string) => {
    Alert.alert('Eliminar Tarjeta', '¿Estás seguro de eliminar esta tarjeta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive' },
    ]);
  };

  const getCardIcon = (brand: string) => {
    return brand === 'Visa' ? 'card' : 'logo-google';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary.contrast} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Métodos de Pago</Text>
        <TouchableOpacity onPress={() => router.push('/(app)/payments/add-card')}>
          <Ionicons name="add" size={24} color={colors.primary.contrast} />
        </TouchableOpacity>
      </View>

      <View style={styles.coinsBanner}>
        <View style={styles.coinsIcon}>
          <Ionicons name="trophy" size={24} color="#F59E0B" />
        </View>
        <View>
          <Text style={styles.coinsBalance}>{sabanaCoins} Sabana Coins</Text>
          <Text style={styles.coinsSubtext}>Disponible para usar en reservas</Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'cards' && styles.activeTab]}
          onPress={() => setActiveTab('cards')}
        >
          <Text style={[styles.tabText, activeTab === 'cards' && styles.activeTabText]}>
            Tarjetas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pse' && styles.activeTab]}
          onPress={() => setActiveTab('pse')}
        >
          <Text style={[styles.tabText, activeTab === 'pse' && styles.activeTabText]}>
            PSE
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'coins' && styles.activeTab]}
          onPress={() => setActiveTab('coins')}
        >
          <Text style={[styles.tabText, activeTab === 'coins' && styles.activeTabText]}>
            Historial Coins
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'cards' && (
          <>
            {MOCK_CARDS.map(card => (
              <View key={card.id} style={styles.cardItem}>
                <View style={styles.cardInfo}>
                  <Ionicons
                    name={getCardIcon(card.brand) as any}
                    size={28}
                    color={colors.secondary.default}
                  />
                  <View style={styles.cardDetails}>
                    <Text style={styles.cardBrand}>
                      {card.brand} **** {card.last_four}
                    </Text>
                    <Text style={styles.cardExpiry}>
                      Vence {card.exp_month.toString().padStart(2, '0')}/{card.exp_year}
                    </Text>
                  </View>
                  {card.is_default && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Principal</Text>
                    </View>
                  )}
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.cardAction}>
                    <Text style={styles.cardActionText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cardAction}
                    onPress={() => removeCard(card.id)}
                  >
                    <Text style={[styles.cardActionText, { color: colors.status.error }]}>
                      Eliminar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <Link href="/(app)/payments/add-card" asChild>
              <TouchableOpacity style={styles.addCardButton}>
                <Ionicons name="add-circle-outline" size={24} color={colors.secondary.default} />
                <Text style={styles.addCardText}>Agregar Nueva Tarjeta</Text>
              </TouchableOpacity>
            </Link>
          </>
        )}

        {activeTab === 'pse' && (
          <View style={styles.pseContainer}>
            <Text style={styles.pseTitle}>Selecciona tu banco</Text>
            {MOCK_PSE_BANKS.map(bank => (
              <TouchableOpacity key={bank.id} style={styles.bankItem}>
                <View style={styles.bankIcon}>
                  <Ionicons name="business-outline" size={20} color={colors.text.secondary} />
                </View>
                <Text style={styles.bankName}>{bank.name}</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === 'coins' && (
          <View>
            <Text style={styles.coinsHistoryTitle}>Movimientos de Sabana Coins</Text>
            {[
              { type: 'earned', amount: '+25', desc: 'Viaje completado', date: 'Hace 2 horas' },
              { type: 'earned', amount: '+10', desc: 'Calificación dada', date: 'Ayer' },
              { type: 'spent', amount: '-50', desc: 'Descuento en reserva', date: 'Hace 3 días' },
              { type: 'bonus', amount: '+100', desc: 'Bono de bienvenida', date: 'Hace 1 semana' },
            ].map((item, idx) => (
              <View key={idx} style={styles.coinHistoryItem}>
                <View style={[
                  styles.coinHistoryIcon,
                  { backgroundColor: item.type === 'spent' ? colors.status.errorBg : '#FEF3C7' }
                ]}>
                  <Ionicons
                    name={item.type === 'spent' ? 'arrow-down' : 'arrow-up'}
                    size={16}
                    color={item.type === 'spent' ? colors.status.error : '#F59E0B'}
                  />
                </View>
                <View style={styles.coinHistoryInfo}>
                  <Text style={styles.coinHistoryDesc}>{item.desc}</Text>
                  <Text style={styles.coinHistoryDate}>{item.date}</Text>
                </View>
                <Text style={[
                  styles.coinHistoryAmount,
                  { color: item.type === 'spent' ? colors.status.error : colors.status.success }
                ]}>
                  {item.amount}
                </Text>
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
  coinsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  coinsIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  coinsBalance: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: '#92400E',
    fontFamily: typography.family.bold,
  },
  coinsSubtext: {
    fontSize: typography.sizes.sm,
    color: '#A16207',
    fontFamily: typography.family.regular,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background.card,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  tab: {
    paddingVertical: spacing.sm,
    marginRight: spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.secondary.default,
  },
  tabText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.muted,
    fontFamily: typography.family.medium,
  },
  activeTabText: {
    color: colors.secondary.default,
    fontWeight: typography.weights.semibold,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  cardItem: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardDetails: {
    flex: 1,
    marginLeft: spacing.md,
  },
  cardBrand: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    fontFamily: typography.family.semibold,
  },
  cardExpiry: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    fontFamily: typography.family.regular,
  },
  defaultBadge: {
    backgroundColor: colors.tertiary.default + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  defaultBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.tertiary.default,
    fontFamily: typography.family.semibold,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    paddingTop: spacing.sm,
  },
  cardAction: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  cardActionText: {
    fontSize: typography.sizes.sm,
    color: colors.secondary.default,
    fontWeight: typography.weights.medium,
    fontFamily: typography.family.medium,
  },
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderStyle: 'dashed',
    marginBottom: spacing.lg,
  },
  addCardText: {
    fontSize: typography.sizes.md,
    color: colors.secondary.default,
    fontWeight: typography.weights.medium,
    marginLeft: spacing.sm,
    fontFamily: typography.family.medium,
  },
  pseContainer: {
    marginBottom: spacing.lg,
  },
  pseTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
    fontFamily: typography.family.bold,
  },
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.sm,
  },
  bankIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.default,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  bankName: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    fontFamily: typography.family.medium,
  },
  coinsHistoryTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
    fontFamily: typography.family.bold,
  },
  coinHistoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.sm,
  },
  coinHistoryIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  coinHistoryInfo: {
    flex: 1,
  },
  coinHistoryDesc: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    fontFamily: typography.family.medium,
  },
  coinHistoryDate: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    fontFamily: typography.family.regular,
  },
  coinHistoryAmount: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    fontFamily: typography.family.bold,
  },
});
