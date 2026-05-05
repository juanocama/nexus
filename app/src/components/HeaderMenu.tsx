import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, typography, spacing, shadow } from '@/theme/colors';

const MENU_ITEMS = [
  { icon: 'car-outline', label: 'Mis Viajes', route: '/(app)/bookings' },
  { icon: 'notifications-outline', label: 'Notificaciones', route: '/(app)/notifications' },
  { icon: 'card-outline', label: 'Métodos de Pago', route: '/(app)/payments' },
  { icon: 'document-text-outline', label: 'Reportes', route: '/(app)/report' },
  { icon: 'help-circle-outline', label: 'Centro de Ayuda', route: '/(app)/help' },
  { icon: 'settings-outline', label: 'Configuración', route: '/(app)/settings' },
];

export default function HeaderMenu() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const open = () => {
    setVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const close = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  const navigate = (route: string) => {
    close();
    router.push(route as any);
  };

  return (
    <>
      <TouchableOpacity onPress={open} style={styles.menuButton}>
        <Ionicons name="menu" size={26} color={colors.primary.contrast} />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={close}>
          <View style={styles.overlay}>
            <Animated.View style={[styles.menuContainer, { opacity: fadeAnim }]}>
              <TouchableWithoutFeedback>
                <View style={styles.menuContent}>
                  <View style={styles.menuHeader}>
                    <Text style={styles.menuTitle}>Menú</Text>
                    <TouchableOpacity onPress={close}>
                      <Ionicons name="close" size={24} color={colors.text.primary} />
                    </TouchableOpacity>
                  </View>

                  {MENU_ITEMS.map((item, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.menuItem}
                      onPress={() => navigate(item.route)}
                    >
                      <Ionicons name={item.icon as any} size={22} color={colors.text.secondary} />
                      <Text style={styles.menuItemText}>{item.label}</Text>
                      <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
                    </TouchableOpacity>
                  ))}
                </View>
              </TouchableWithoutFeedback>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  menuButton: {
    padding: spacing.xs,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  menuContainer: {
    alignSelf: 'flex-end',
    marginTop: 60,
    marginRight: spacing.md,
    minWidth: 240,
    ...shadow.lg,
  },
  menuContent: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  menuTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    fontFamily: typography.family.bold,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default + '40',
  },
  menuItemText: {
    flex: 1,
    marginLeft: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    fontFamily: typography.family.medium,
  },
});
