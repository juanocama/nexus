import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { borderRadius, spacing, shadow } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useSettings } from '@/context/SettingsContext';
import PageHeader from '@/components/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { vehiclesApi, Vehicle } from '@/api/vehicles';

export default function MyVehiclesScreen() {
  const router = useRouter();
  const { colors, typography } = useTheme();
  const { t } = useSettings();
  const { token } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [plate, setPlate] = useState('');
  const [saving, setSaving] = useState(false);

  const loadVehicles = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await vehiclesApi.getMyVehicles(token);
      setVehicles(data);
    } catch {
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const resetForm = () => {
    setBrand('');
    setModel('');
    setColor('');
    setPlate('');
    setEditingVehicle(null);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (v: Vehicle) => {
    setEditingVehicle(v);
    setBrand(v.brand);
    setModel(v.model);
    setColor(v.color);
    setPlate(v.plate);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!brand.trim() || !model.trim() || !color.trim() || !plate.trim()) {
      Alert.alert(t.common.error, t.publish.fillRequired);
      return;
    }
    if (!token) return;
    setSaving(true);
    try {
      if (editingVehicle) {
        await vehiclesApi.updateVehicle(token, editingVehicle.id, { brand, model, color, plate });
      } else {
        await vehiclesApi.createVehicle(token, { brand, model, color, plate });
      }
      setShowModal(false);
      resetForm();
      loadVehicles();
    } catch (error: any) {
      Alert.alert(t.common.error, error.message || t.trip.bookingError);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (v: Vehicle) => {
    if (!token) return;
    Alert.alert(
      t.common.delete,
      `¿Estás seguro de eliminar ${v.brand} ${v.model} (${v.plate})?`,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.delete,
          style: 'destructive',
          onPress: async () => {
            try {
              await vehiclesApi.deleteVehicle(token, v.id);
              loadVehicles();
            } catch (error: any) {
              Alert.alert(t.common.error, error.message || t.trip.bookingError);
            }
          },
        },
      ]
    );
  };

  const renderVehicle = ({ item }: { item: Vehicle }) => (
    <TouchableOpacity
      style={[styles.vehicleCard, { backgroundColor: colors.background.card, ...shadow.sm }]}
      onPress={() => openEdit(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.vehicleIcon, { backgroundColor: colors.secondary.default + '20' }]}>
        <Ionicons name="car-sport" size={28} color={colors.secondary.default} />
      </View>
      <View style={styles.vehicleInfo}>
        <Text style={[styles.vehicleName, { color: colors.text.primary, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold }]}>
          {item.brand} {item.model}
        </Text>
        <Text style={[styles.vehicleDetail, { color: colors.text.muted, fontSize: typography.sizes.sm, fontFamily: typography.family.regular }]}>
          {item.color} - {item.plate}
        </Text>
      </View>
      <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={20} color={colors.status.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const modalPaddingTop = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + spacing.md : spacing.md;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      <PageHeader title={t.home.myVehicles} />

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={[styles.emptyState, { alignItems: 'center' }]}>
            <ActivityIndicator size="large" color={colors.secondary.default} />
          </View>
        ) : vehicles.length === 0 ? (
          <View style={[styles.emptyState, { alignItems: 'center' }]}>
            <Ionicons name="car-sport-outline" size={64} color={colors.text.muted} />
            <Text style={[styles.emptyText, { color: colors.text.primary }]}>
              {t.home.noTripsAvailable}
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.text.muted }]}>
              {t.home.beFirstToPublish}
            </Text>
          </View>
        ) : (
          <FlatList
            data={vehicles}
            renderItem={renderVehicle}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.secondary.default }]}
          onPress={openCreate}
        >
          <Ionicons name="add" size={22} color={colors.primary.contrast} />
          <Text style={[styles.addButtonText, { color: colors.primary.contrast, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold }]}>
            Agregar Vehículo
          </Text>
        </TouchableOpacity>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.background.default, paddingTop: modalPaddingTop }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text.primary, fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, fontFamily: typography.family.bold }]}>
                {editingVehicle ? t.home.editVehicle : t.home.addVehicle}
              </Text>
              <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={[styles.inputLabel, { color: colors.text.primary, fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, fontFamily: typography.family.medium }]}>Marca</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background.card, borderColor: colors.border.default, color: colors.text.primary, fontSize: typography.sizes.md, fontFamily: typography.family.regular }]}
                placeholder="Ej: Mazda, Renault, Chevrolet"
                placeholderTextColor={colors.text.muted}
                value={brand}
                onChangeText={setBrand}
              />

              <Text style={[styles.inputLabel, { color: colors.text.primary, fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, fontFamily: typography.family.medium }]}>Modelo</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background.card, borderColor: colors.border.default, color: colors.text.primary, fontSize: typography.sizes.md, fontFamily: typography.family.regular }]}
                placeholder="Ej: 3, Captur, Spark"
                placeholderTextColor={colors.text.muted}
                value={model}
                onChangeText={setModel}
              />

              <Text style={[styles.inputLabel, { color: colors.text.primary, fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, fontFamily: typography.family.medium }]}>Color</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background.card, borderColor: colors.border.default, color: colors.text.primary, fontSize: typography.sizes.md, fontFamily: typography.family.regular }]}
                placeholder="Ej: Blanco, Rojo, Negro"
                placeholderTextColor={colors.text.muted}
                value={color}
                onChangeText={setColor}
              />

              <Text style={[styles.inputLabel, { color: colors.text.primary, fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, fontFamily: typography.family.medium }]}>Placa</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background.card, borderColor: colors.border.default, color: colors.text.primary, fontSize: typography.sizes.md, fontFamily: typography.family.regular }]}
                placeholder="Ej: ABC-123"
                placeholderTextColor={colors.text.muted}
                value={plate}
                onChangeText={setPlate}
                autoCapitalize="characters"
              />

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: saving ? colors.text.muted : colors.tertiary.default }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={colors.primary.contrast} />
                ) : (
                  <Text style={[styles.saveButtonText, { color: colors.primary.contrast, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, fontFamily: typography.family.semibold }]}>
                    {editingVehicle ? 'Guardar Cambios' : 'Agregar'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  vehicleIcon: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  vehicleInfo: { flex: 1 },
  vehicleName: {},
  vehicleDetail: { marginTop: spacing.xs },
  deleteBtn: { padding: spacing.sm },
  separator: { height: spacing.md },
  emptyState: { paddingVertical: spacing.xxxl },
  emptyText: { marginTop: spacing.md },
  emptySubtext: { marginTop: spacing.xs, textAlign: 'center' },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  addButtonText: {},
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalContent: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '85%',
    paddingHorizontal: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {},
  modalBody: {},
  inputLabel: { marginBottom: spacing.sm, marginTop: spacing.md },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  saveButton: {
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
  },
  saveButtonText: {},
});
