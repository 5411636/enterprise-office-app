import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Modal, TextInput, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { categoryAPI } from '../api';

interface Category {
  id: number;
  name: string;
  device_count: number;
}

export default function CategoryScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '' });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await categoryAPI.getAll();
      setCategories(res.data || []);
    } catch (err: any) {
      Alert.alert('错误', err.message || '加载失败');
    }
  }, []);

  React.useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const openModal = (category?: Category) => {
    if (category) { setEditingCategory(category); setFormData({ name: category.name }); }
    else { setEditingCategory(null); setFormData({ name: '' }); }
    setModalVisible(true);
  };

  const closeModal = () => { setModalVisible(false); setEditingCategory(null); setFormData({ name: '' }); };

  const handleSubmit = async () => {
    if (!formData.name || formData.name.length < 1 || formData.name.length > 20) {
      Alert.alert('验证失败', '分类名称必填，长度1-20个字符'); return;
    }
    setLoading(true);
    try {
      if (editingCategory) await categoryAPI.update(editingCategory.id, { name: formData.name });
      else await categoryAPI.create({ name: formData.name });
      closeModal(); loadData();
    } catch (err: any) { Alert.alert('错误', err.message || '保存失败'); }
    finally { setLoading(false); }
  };

  const handleDelete = (category: Category) => {
    if (category.device_count > 0) { Alert.alert('无法删除', `分类下存在${category.device_count}个设备，无法删除`); return; }
    Alert.alert('确认删除', '确定要删除该分类吗?', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: async () => {
        try { await categoryAPI.delete(category.id); loadData(); }
        catch (err: any) { Alert.alert('错误', err.message || '删除失败'); }
      }},
    ]);
  };

  const renderItem = ({ item }: { item: Category }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}><Ionicons name="layers" size={28} color="#1976d2" /></View>
        <View style={styles.cardHeaderInfo}><Text style={styles.cardName}>{item.name}</Text><Text style={styles.cardId}>ID: {item.id}</Text></View>
        <View style={styles.cardActions}>
          <TouchableOpacity onPress={() => openModal(item)} style={styles.iconButton}><Ionicons name="create-outline" size={22} color="#1976d2" /></TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item)} style={[styles.iconButton, item.device_count > 0 && styles.iconButtonDisabled]} disabled={item.device_count > 0}><Ionicons name="trash-outline" size={22} color={item.device_count > 0 ? '#ccc' : '#d32f2f'} /></TouchableOpacity>
        </View>
      </View>
      <View style={styles.deviceInfo}><Ionicons name="desktop-outline" size={16} color="#666" /><Text style={styles.deviceText}>{item.device_count} 个设备</Text>{item.device_count > 0 && <View style={styles.hasDeviceBadge}><Text style={styles.hasDeviceBadgeText}>有设备</Text></View>}</View>
      <TouchableOpacity style={styles.viewButton}><Ionicons name="eye-outline" size={18} color="#1976d2" /><Text style={styles.viewButtonText}>查看设备</Text></TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.headerText}>共 {categories.length} 个分类</Text></View>
      <FlatList data={categories} renderItem={renderItem} keyExtractor={(item) => item.id.toString()} contentContainerStyle={styles.list} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1976d2']} />} ListEmptyComponent={<Text style={styles.emptyText}>暂无分类数据</Text>} />
      <TouchableOpacity style={styles.fab} onPress={() => openModal()}><Ionicons name="add" size={28} color="#fff" /></TouchableOpacity>
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingCategory ? '编辑分类' : '添加分类'}</Text>
            <View style={styles.modalForm}>
              <Text style={styles.label}>分类名称 *</Text><TextInput style={styles.modalInput} placeholder="请输入分类名称" value={formData.name} onChangeText={(text) => setFormData({ name: text })} autoFocus /><Text style={styles.helperText}>1-20个字符</Text>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeModal}><Text style={styles.cancelButtonText}>取消</Text></TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}><Text style={styles.submitButtonText}>{loading ? '保存中...' : (editingCategory ? '保存' : '添加')}</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  headerText: { fontSize: 14, color: '#666' },
  list: { padding: 16, paddingBottom: 80 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconContainer: { width: 56, height: 56, borderRadius: 12, backgroundColor: '#e3f2fd', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardHeaderInfo: { flex: 1 },
  cardName: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 4 },
  cardId: { fontSize: 12, color: '#999' },
  cardActions: { flexDirection: 'row' },
  iconButton: { padding: 4, marginLeft: 8 },
  iconButtonDisabled: { opacity: 0.5 },
  deviceInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  deviceText: { fontSize: 14, color: '#666' },
  hasDeviceBadge: { backgroundColor: '#1976d2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  hasDeviceBadgeText: { color: '#fff', fontSize: 10, fontWeight: '500' },
  viewButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#1976d2', borderRadius: 8, padding: 12 },
  viewButtonText: { fontSize: 16, color: '#1976d2', fontWeight: '500' },
  fab: { position: 'absolute', right: 16, bottom: 16, width: 56, height: 56, borderRadius: 28, backgroundColor: '#1976d2', alignItems: 'center', justifyContent: 'center', shadowColor: '#1976d2', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 40 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 20 },
  modalTitle: { fontSize: 20, fontWeight: '600', textAlign: 'center', marginBottom: 20, paddingHorizontal: 20 },
  modalForm: { paddingHorizontal: 20, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '500', color: '#333', marginBottom: 8 },
  modalInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#f9f9f9' },
  helperText: { fontSize: 12, color: '#999', marginTop: 4 },
  modalActions: { flexDirection: 'row', padding: 20, gap: 12, borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  cancelButton: { flex: 1, padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  cancelButtonText: { fontSize: 16, color: '#666', fontWeight: '500' },
  submitButton: { flex: 1, padding: 14, borderRadius: 8, backgroundColor: '#1976d2', alignItems: 'center' },
  submitButtonText: { fontSize: 16, color: '#fff', fontWeight: '600' },
});