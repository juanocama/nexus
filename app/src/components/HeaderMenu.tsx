import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { borderRadius, spacing, shadow } from '@/theme/colors';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/hooks/useTheme';

const DRAWER_WIDTH = 280;

export default function HeaderMenu() {
  const router = useRouter();
  const { t } = useSettings();
  const { colors, typography } = useTheme();
  const [visible, setVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const menuItems = [
    { icon: 'car-outline', label: t.headerMenu.myTrips, route: '/bookings' },
    { icon: 'notifications-outline', label: t.headerMenu.notifications, route: '/notifications' },
    { icon: 'card-outline', label: t.headerMenu.paymentMethods, route: '/payments' },
    { icon: 'document-text-outline', label: t.headerMenu.reports, route: '/report' },
    { icon: 'help-circle-outline', label: t.headerMenu.helpCenter, route: '/help' },
    { icon: 'settings-outline', label: t.headerMenu.settings, route: '/settings' },
  ];

  const open = () => {
    setVisible(true);
    slideAnim.setValue(DRAWER_WIDTH);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const close = () => {
    Animated.timing(slideAnim, {
      toValue: DRAWER_WIDTH,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  const navigate = (route: string) => {
    close();
    router.push(route as any);
  };

  return (
    <>
      <TouchableOpacity onPress={open} style={[styles.menuButton, { padding: spacing.xs }]}>
        <Ionicons name="menu" size={26} color={colors.primary.contrast} />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback onPress={close}>
            <View style={styles.overlay} />
          </TouchableWithoutFeedback>

          <Animated.View
            style={[
              styles.drawer,
              {
                backgroundColor: colors.background.card,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <View style={[styles.drawerHeader, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border.default }]}>
              <Text style={[styles.drawerTitle, { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.text.primary, fontFamily: typography.family.bold }]}>{t.headerMenu.title}</Text>
              <TouchableOpacity onPress={close} style={{ padding: spacing.xs }}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            {menuItems.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.drawerItem, { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: idx < menuItems.length - 1 ? 1 : 0, borderBottomColor: colors.border.default + '40' }]}
                onPress={() => navigate(item.route)}
                activeOpacity={0.7}
              >
                <Ionicons name={item.icon as any} size={22} color={colors.text.secondary} />
                <Text style={[styles.drawerItemText, { flex: 1, marginLeft: spacing.md, fontSize: typography.sizes.md, color: colors.text.primary, fontFamily: typography.family.medium }]}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
              </TouchableOpacity>
            ))}
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  menuButton: {},
  modalContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawer: {
    width: DRAWER_WIDTH,
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    borderTopLeftRadius: borderRadius.lg,
    borderBottomLeftRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadow.lg,
  },
  drawerHeader: {},
  drawerTitle: {},
  drawerItem: {},
  drawerItemText: {},
});
