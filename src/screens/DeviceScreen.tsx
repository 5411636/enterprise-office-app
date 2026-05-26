import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Modal, TextInput, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { deviceAPI, categoryAPI } from '../api';

interface Device {
  id: number;
  name: string;
  model: string;
  category_id: number;
  category_name: string;
}

interface Category {
  id: number;
  name: string;
}

export default function DeviceScreen() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterCategory, setFilterCategory] = useState<number | 'all'>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [formData, setFormData] = useState({ name: '', model: '', categoryId: '' });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [deviceRes, categoryRes] = await Promise.all([deviceAPI.getAll(), categoryAPI.getAll()]);
      setDevices(deviceRes.data || []);
      setCategories(categoryRes.data || []);
    } catch (err: any) { Alert.alert('错误', err.message || '加载失败'); }
  }, []);

  React.useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  const filteredDevices = filterCategory === 'all' ? devices : devices.filter(d => d.category_id === filterCategory);

  const openModal = (device?: Device) => {
    if (device) { setEditingDevice(device); setFormData({ name: device.name, model: device.model || '', categoryId: String(device.category_id) }); }
    else { setEditingDevice(null); setFormData({ name: '', model: '', categoryId: '' }); }
    setModalVisible(true);
  };

  const closeModal = () => { setModalVisible(false); setEditingDevice(null); setFormData({ name: '', model: '', categoryId: '' }); };

  const handleSubmit = async () => {
    if (!formData.name) { Alert.alert('验证失败', '设备名称必填'); return; }
    if (!formData.categoryId) { Alert.alert('验证失败', '请选择分类'); return; }
    setLoading(true);
    try {
      const data = { name: formData.name, model: formData.model, category_id: parseInt(formData.categoryId) };
      if (editingDevice) await deviceAPI.update(editingDevice.id, data);
      else await deviceAPI.create(data);
      closeModal(); loadData();
    } catch (err: any) { Alert.alert('错误', err.message || '保存失败'); }
    finally { setLoading(false); }
  };

  const handleDelete = (id: number) => {
    Alert.alert('确认删除', '确定要删除该设备吗?', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: async () => { try { await deviceAPI.delete(id); loadData(); } catch (err: any) { Alert.alert('错误', err.message || '删除失败'); }}},
    ]);
  };

  const renderItem = ({ item }: { item: Device }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}><Ionicons name="desktop" size={28} color="#1976d2" /></View>
        <View style={styles.cardHeaderInfo}><Text style={styles.cardName}>{item.name}</Text><Text style={styles.cardModel}>{item.model || '-'}</Text></View>
        <View style={styles.cardActions}>
          <TouchableOpacity onPress={() => openModal(item)} style={styles.iconButton}><Ionicons name="create-outline" size={22} color="#1976d2" /></TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconButton}><Ionicons name="trash-outline" size={22} color="#d32f2f" /></TouchableOpacity>
        </View>
      </View>
      <View style={styles.categoryBadge}><Ionicons name="layers-outline" size={14} color="#1976d2" /><Text style={styles.categoryBadgeText}>{item.category_name}</Text></View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>筛选分类:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity style={[styles.filterChip, filterCategory === 'all' && styles.filterChipActive]} onPress={() => setFilterCategory('all')}><Text style={[styles.filterChipText, filterCategory === 'all' && styles.filterChipTextActive]}>全部</Text></TouchableOpacity>
          {categories.map(cat => <TouchableOpacity key={cat.id} style={[styles.filterChip, filterCategory === cat.id && styles.filterChipActive]} onPress={() => setFilterCategory(cat.id)}><Text style={[styles.filterChipText, filterCategory === cat.id && styles.filterChipTextActive]}>{cat.name}</Text></TouchableOpacity>)}
        </ScrollView>
      </View>
      <FlatList data={filteredDevices} renderItem={renderItem} keyExtractor={(item) => item.id.toString()} contentContainerStyle={styles.list} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1976d2']} />} ListEmptyComponent={<Text style={styles.emptyText}>暂无设备数据</Text>} />
      <TouchableOpacity style={styles.fab} onPress={() => openModal()}><Ionicons name="add" size={28} color="#fff" /></TouchableOpacity>
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingDevice ? '编辑设备' : '添加设备'}</Text>
            <ScrollView style={styles.modalForm}>
              <Text style={styles.label}>设备名称 *</Text><TextInput style={styles.modalInput} placeholder="请输入设备名称" value={formData.name} onChangeText={(text) => setFormData({ ...formData, name: text })} />
              <Text style={styles.label}>型号</Text><TextInput style={styles.modalInput} placeholder="请输入型号" value={formData.model} onChangeText={(text) => setFormData({ ...formData, model: text })} />
              <Text style={styles.label}>分类 *</Text>
              <View style={styles.pickerContainer}><Picker selectedValue={formData.categoryId} onValueChange={(val) => setFormData({ ...formData, categoryId: val })} style={styles.picker}>{categories.map(cat => <Picker.Item key={cat.id} label={cat.name} value={String(cat.id)} />)}</Picker></View>
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeModal}><Text style={styles.cancelButtonText}>取消</Text></TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}><Text style={styles.submitButtonText}>{loading ? '保存中...' : (editingDevice ? '保存' : '添加')}</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  filterContainer: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  filterLabel: { fontSize: 14, color: '#666', marginRight: 12 },
  filterScroll: { flex: 1 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#f5f5f5', borderRadius: 20, marginRight: 8 },
  filterChipActive: { backgroundColor: '#1976d2' },
  filterChipText: { fontSize: 14, color: '#666' },
  filterChipTextActive: { color: '#fff' },
  list: { padding: 16, paddingBottom: 80 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconContainer: { width: 56, height: 56, borderRadius: 12, backgroundColor: '#e3f2fd', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardHeaderInfo: { flex: 1 },
  cardName: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 4 },
  cardModel: { fontSize: 12, color: '#999' },
  cardActions: { flexDirection: 'row' },
  iconButton: { padding: 4, marginLeft: 8 },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#e3f2fd', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start' },
  categoryBadgeText: { fontSize: 12, color: '#1976d2' },
  fab: { position: 'absolute', right: 16, bottom: 16, width: 56, height: 56, borderRadius: 28, backgroundColor: '#1976d2', alignItems: 'center', justifyContent: 'center', shadowColor: '#1976d2', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 40 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: '600', textAlign: 'center', marginBottom: 20, paddingHorizontal: 20 },
  modalForm: { paddingHorizontal: 20, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '500', color: '#333', marginBottom: 8, marginTop: 12 },
  modalInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#f9f9f9' },
  pickerContainer: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, backgroundColor: '#f9f9f9', overflow: 'hidden' },
  picker: { height: 50 },
  modalActions: { flexDirection: 'row', padding: 20, gap: 12, borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  cancelButton: { flex: 1, padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  cancelButtonText: { fontSize: 16, color: '#666', fontWeight: '500' },
  submitButton: { flex: 1, padding: 14, borderRadius: 8, backgroundColor: '#1976d2', alignItems: 'center' },
  submitButtonText: { fontSize: 16, color: '#fff', fontWeight: '600' },
});