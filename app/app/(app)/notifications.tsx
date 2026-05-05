import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, borderRadius, typography, spacing, shadow } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'booking_confirmed',
    title: 'Reserva Confirmada',
    message: 'Tu reserva para el viaje de Carlos Martínez ha sido confirmada.',
    is_read: false,
    created_at: 'Hace 5 min',
  },
  {
    id: '2',
    type: 'sabana_coins_earned',
    title: 'Sabana Coins Ganados',
    message: '¡Ganaste 25 Sabana Coins por tu último viaje completado!',
    is_read: false,
    created_at: 'Hace 1 hora',
  },
  {
    id: '3',
    type: 'rating_received',
    title: 'Nueva Calificación',
    message: 'Carlos te calificó con 5 estrellas. ¡Excelente!',
    is_read: false,
    created_at: 'Hace 2 horas',
  },
  {
    id: '4',
    type: 'payment_received',
    title: 'Pago Recibido',
    message: 'Se ha procesado tu pago de $8.000 para el viaje del 3 de mayo.',
    is_read: true,
    created_at: 'Ayer',
  },
  {
    id: '5',
    type: 'trip_modified',
    title: 'Viaje Modificado',
    message: 'El conductor María López modificó el punto de encuentro de tu viaje.',
    is_read: true,
    created_at: 'Hace 2 días',
  },
  {
    id: '6',
    type: 'booking_cancelled',
    title: 'Reserva Cancelada',
    message: 'Tu reserva para el viaje del 28 de abril ha sido cancelada.',
    is_read: true,
    created_at: 'Hace 3 días',
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
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

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  };

  const renderNotification = ({ item }: { item: typeof MOCK_NOTIFICATIONS[0] }) => {
    const icon = getNotificationIcon(item.type);

    return (
      <TouchableOpacity
        style={[styles.notificationCard, !item.is_read && styles.unreadCard]}
        onPress={() => {}}
      >
        <View style={[styles.iconContainer, { backgroundColor: icon.bg }]}>
          <Ionicons name={icon.name as any} size={20} color={icon.color} />
        </View>
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={[styles.notificationTitle, !item.is_read && styles.unreadTitle]}>
              {item.title}
            </Text>
            {!item.is_read && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.notificationMessage} numberOfLines={2}>{item.message}</Text>
          <Text style={styles.notificationTime}>{item.created_at}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary.contrast} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificaciones</Text>
        <TouchableOpacity onPress={markAllAsRead}>
          <Text style={styles.markReadText}>Marcar todo leído</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {unread > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>
              {unread} {unread === 1 ? 'notificación sin leer' : 'notificaciones sin leer'}
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
  markReadText: {
    fontSize: typography.sizes.sm,
    color: colors.secondary.light,
    fontFamily: typography.family.medium,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  unreadBadge: {
    backgroundColor: colors.secondary.default + '15',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  unreadBadgeText: {
    fontSize: typography.sizes.sm,
    color: colors.secondary.default,
    fontWeight: typography.weights.semibold,
    fontFamily: typography.family.semibold,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadow.sm,
  },
  unreadCard: {
    borderWidth: 1,
    borderColor: colors.secondary.default + '30',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  notificationTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    fontFamily: typography.family.semibold,
  },
  unreadTitle: {
    color: colors.secondary.default,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondary.default,
  },
  notificationMessage: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: typography.sizes.sm * typography.lineHeight.normal,
    fontFamily: typography.family.regular,
  },
  notificationTime: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: spacing.xs,
    fontFamily: typography.family.regular,
  },
  separator: {
    height: spacing.sm,
  },
});
