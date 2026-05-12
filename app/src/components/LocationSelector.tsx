import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { borderRadius, spacing } from '@/theme/colors';
import { useTheme } from '@/hooks/useTheme';

export const LOCATIONS = [
  { name: 'Boyacá - Titan Plaza', lat: 4.7563, lng: -74.0640 },
  { name: 'Boyacá - Parque Colina', lat: 4.7560, lng: -74.0440 },
  { name: 'Héroes', lat: 4.7310, lng: -74.0620 },
  { name: 'Madrid - Mosquera', lat: 4.6920, lng: -74.2070 },
  { name: 'Autopista - Portal Norte', lat: 4.7600, lng: -74.0500 },
  { name: 'Séptima', lat: 4.6250, lng: -74.0750 },
  { name: 'Zipaquirá', lat: 5.0340, lng: -74.0050 },
  { name: 'Chía - Variante', lat: 4.8670, lng: -74.0580 },
  { name: 'Chía - Chilacos', lat: 4.8700, lng: -74.0480 },
  { name: 'Cota - Variante', lat: 4.8170, lng: -74.1050 },
  { name: 'Cota - Centro', lat: 4.8100, lng: -74.1150 },
  { name: 'Universidad de La Sabana', lat: 4.8730, lng: -74.0300 },
];

interface LocationSelectorProps {
  value: string;
  onSelect: (location: { name: string; lat: number; lng: number }) => void;
  placeholder?: string;
  mode: 'origin' | 'destination';
  iconColor?: string;
}

export default function LocationSelector({ value, onSelect, placeholder = 'Seleccionar', mode, iconColor }: LocationSelectorProps) {
  const { colors, typography } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (location: typeof LOCATIONS[0]) => {
    onSelect(location);
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.background.card, borderColor: colors.border.default, borderWidth: 1 }]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name={mode === 'origin' ? 'location' : 'flag'} size={20} color={iconColor || (mode === 'origin' ? colors.tertiary.default : colors.secondary.default)} />
        <Text
          style={[
            styles.buttonText,
            { color: value ? colors.text.primary : colors.text.muted, fontSize: typography.sizes.md, fontFamily: typography.family.regular },
          ]}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.text.muted} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background.default, paddingTop: Platform.OS === 'ios' ? 50 : 40 }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border.default }]}>
              <Text style={[styles.modalTitle, { color: colors.text.primary, fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, fontFamily: typography.family.bold }]}>
                Seleccionar ubicación
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={LOCATIONS}
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    { borderBottomColor: colors.border.default },
                    value === item.name && { backgroundColor: colors.secondary.default + '20' },
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Ionicons name="location" size={18} color={iconColor || colors.secondary.default} />
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color: colors.text.primary,
                        fontSize: typography.sizes.md,
                        fontFamily: typography.family.regular,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  {value === item.name && <Ionicons name="checkmark" size={18} color={colors.secondary.default} />}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  buttonText: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '70%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  modalTitle: {},
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  optionText: {
    flex: 1,
  },
});
