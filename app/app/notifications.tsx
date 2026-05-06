import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { borderRadius, spacing, shadow, typography } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useSettings } from '@/context/SettingsContext';
import PageHeader from '@/components/PageHeader';

const MOCK_NOTIFICATIONS = [
  { id: '1', type: 'booking_confirmed', is_read: false, created_at: 'Hace 5 min' },
  { id: '2', type: 'sabana_coins_earned', is_read: false, created_at: 'Hace 1 hora' },
  { id: '3', type: 'rating_received', is_read: false, created_at: 'Hace 2 horas' },
  { id: '4', type: 'payment_received', is_read: true, created_at: 'Ayer' },
  { id: '5', type: 'trip_modified', is_read: true, created_at: 'Hace 2 días' },
  { id: '6', type: 'booking_cancelled', is_read: true, created_at: 'Hace 3 días' },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const { t } = useSettings();
  const { colors, typography } = useTheme();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const unread = notifications.filter(n => !n.is_read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_confirmed': return { name: 'checkmark-circle', color: colors.status.success, bg: colors.status.successBg };
      case 'booking_cancelled': return { name: 'close-circle', color: colors.status.error, bg: colors.status.errorBg };
      case 'trip_cancelled': return { name: 'warning', color: colors.status.error, bg: colors.status.errorBg };
      case 'trip_modified': return { name: 'pencil', color: colors.status.info, bg: colors.status.infoBg };
      case 'payment_received': return { name: 'card', color: colors.tertiary.default, bg: '#ECFDF5' };
      case 'rating_received': return { name: 'star', color: '#F59E0B', bg: '#FEF3C7' };
      case 'sabana_coins_earned': return { name: 'trophy', color: '#F59E0B', bg: '#FEF3C7' };
      default: return { name: 'notifications', color: colors.text.secondary, bg: colors.background.default };
    }
  };

  const getNotificationText = (type: string) => {
    switch (type) {
      case 'booking_confirmed':
        return { title: t.notifications.bookingConfirmed, message: t.notifications.bookingConfirmedMsg };
      case 'sabana_coins_earned':
        return { title: t.notifications.sabanaCoins, message: t.notifications.sabanaCoinsMsg };
      case 'rating_received':
        return { title: t.notifications.ratingReceived, message: t.notifications.ratingReceivedMsg };
      case 'payment_received':
        return { title: t.notifications.paymentReceived, message: t.notifications.paymentReceivedMsg };
      case 'trip_modified':
        return { title: t.notifications.tripModified, message: t.notifications.tripModifiedMsg };
      case 'booking_cancelled':
        return { title: t.notifications.bookingCancelled, message: t.notifications.bookingCancelledMsg };
      default:
        return { title: '', message: '' };
    }
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  };

  const renderNotification = ({ item }: { item: typeof MOCK_NOTIFICATIONS[0] }) => {
    const icon = getNotificationIcon(item.type);
    const { title, message } = getNotificationText(item.type);

    return (
      <TouchableOpacity
        style={[styles.notificationCard, { backgroundColor: colors.background.card, ...shadow.sm }, !item.is_read && { borderColor: colors.secondary.default + '30', borderWidth: 1 }]}
        onPress={() => {}}
      >
        <View style={[styles.iconContainer, { backgroundColor: icon.bg }]}>
          <Ionicons name={icon.name as any} size={20} color={icon.color} />
        </View>
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={[styles.notificationTitle, { color: colors.text.primary, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold }, !item.is_read && { color: colors.secondary.default }]}>
              {title}
            </Text>
            {!item.is_read && <View style={[styles.unreadDot, { backgroundColor: colors.secondary.default }]} />}
          </View>
          <Text style={[styles.notificationMessage, { color: colors.text.secondary, fontSize: typography.sizes.sm, fontFamily: typography.family.regular, lineHeight: typography.sizes.sm * typography.lineHeight.normal }]} numberOfLines={2}>{message}</Text>
          <Text style={[styles.notificationTime, { color: colors.text.muted, fontSize: typography.sizes.xs, fontFamily: typography.family.regular }]}>{item.created_at}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      <PageHeader
        title={t.notifications.title}
        rightAction={
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={[styles.markReadText, { color: colors.secondary.light, fontSize: typography.sizes.sm, fontFamily: typography.family.medium }]}>{t.notifications.markRead}</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content}>
        {unread > 0 && (
          <View style={[styles.unreadBadge, { backgroundColor: colors.secondary.default + '15' }]}>
            <Text style={[styles.unreadBadgeText, { color: colors.secondary.default, fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold }]}>
              {unread} {unread === 1 ? t.notifications.unread : t.notifications.unreadPlural}
            </Text>
          </View>
        )}

        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  markReadText: {},
  content: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  unreadBadge: { padding: spacing.sm, borderRadius: borderRadius.md, marginBottom: spacing.md, alignItems: 'center' },
  unreadBadgeText: {},
  notificationCard: { flexDirection: 'row', borderRadius: borderRadius.lg, padding: spacing.md },
  iconContainer: { width: 40, height: 40, borderRadius: borderRadius.md, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  notificationContent: { flex: 1 },
  notificationHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs },
  notificationTitle: {},
  unreadDot: { width: 8, height: 8, borderRadius: borderRadius.full },
  notificationMessage: {},
  notificationTime: { marginTop: spacing.xs },
  separator: { height: spacing.sm },
});
