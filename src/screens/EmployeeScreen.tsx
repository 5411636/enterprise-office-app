import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Modal, TextInput, ScrollView, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { employeeAPI } from '../api';

interface Employee {
  id: number;
  name: string;
  age: number;
  email: string;
  created_at?: string;
}

export default function EmployeeScreen() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({ name: '', age: '', email: '' });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await employeeAPI.getAll();
      setEmployees(res.data || []);
    } catch (err: any) {
      Alert.alert('错误', err.message || '加载失败');
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const openModal = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({ name: employee.name, age: employee.age.toString(), email: employee.email });
    } else {
      setEditingEmployee(null);
      setFormData({ name: '', age: '', email: '' });
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingEmployee(null);
    setFormData({ name: '', age: '', email: '' });
  };

  const validateForm = () => {
    if (!formData.name || formData.name.length < 1 || formData.name.length > 20) {
      Alert.alert('验证失败', '姓名必填，长度1-20个字符');
      return false;
    }
    const age = parseInt(formData.age);
    if (isNaN(age) || age < 18 || age > 60) {
      Alert.alert('验证失败', '年龄必须在18-60之间');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('验证失败', '邮箱格式不正确');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const data = { name: formData.name, age: parseInt(formData.age), email: formData.email };
      if (editingEmployee) {
        await employeeAPI.update(editingEmployee.id, data);
      } else {
        await employeeAPI.create(data);
      }
      closeModal();
      loadData();
    } catch (err: any) {
      Alert.alert('错误', err.message || '保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('确认删除', '确定要删除该员工吗?', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: async () => {
        try {
          await employeeAPI.delete(id);
          loadData();
        } catch (err: any) {
          Alert.alert('错误', err.message || '删除失败');
        }
      }},
    ]);
  };

  const renderItem = ({ item }: { item: Employee }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.cardName}>{item.name}</Text>
          <View style={styles.ageBadge}><Text style={styles.ageBadgeText}>{item.age}岁</Text></View>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity onPress={() => openModal(item)} style={styles.iconButton}><Ionicons name="create-outline" size={22} color="#1976d2" /></TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconButton}><Ionicons name="trash-outline" size={22} color="#d32f2f" /></TouchableOpacity>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.cardInfo}>
        <View style={styles.infoRow}><Ionicons name="mail-outline" size={16} color="#666" /><Text style={styles.infoText}>{item.email}</Text></View>
        {item.created_at && <View style={styles.infoRow}><Ionicons name="calendar-outline" size={16} color="#666" /><Text style={styles.infoText}>创建于 {item.created_at}</Text></View>}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.headerText}>共 {employees.length} 名员工</Text></View>
      <FlatList data={employees} renderItem={renderItem} keyExtractor={(item) => item.id.toString()} contentContainerStyle={styles.list} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1976d2']} />} ListEmptyComponent={<Text style={styles.emptyText}>暂无员工数据</Text>} />
      <TouchableOpacity style={styles.fab} onPress={() => openModal()}><Ionicons name="add" size={28} color="#fff" /></TouchableOpacity>
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingEmployee ? '编辑员工' : '添加员工'}</Text>
            <ScrollView style={styles.modalForm}>
              <Text style={styles.label}>姓名 *</Text><TextInput style={styles.modalInput} placeholder="请输入姓名" value={formData.name} onChangeText={(text) => setFormData({ ...formData, name: text })} />
              <Text style={styles.label}>年龄 *</Text><TextInput style={styles.modalInput} placeholder="18-60岁" value={formData.age} onChangeText={(text) => setFormData({ ...formData, age: text })} keyboardType="numeric" />
              <Text style={styles.label}>邮箱 *</Text><TextInput style={styles.modalInput} placeholder="请输入邮箱地址" value={formData.email} onChangeText={(text) => setFormData({ ...formData, email: text })} keyboardType="email-address" autoCapitalize="none" />
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeModal}><Text style={styles.cancelButtonText}>取消</Text></TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}><Text style={styles.submitButtonText}>{loading ? '保存中...' : (editingEmployee ? '保存' : '添加')}</Text></TouchableOpacity>
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardHeaderLeft: { flex: 1 },
  cardName: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 8 },
  ageBadge: { backgroundColor: '#1976d2', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  ageBadgeText: { color: '#fff', fontSize: 12, fontWeight: '500' },
  cardActions: { flexDirection: 'row' },
  iconButton: { padding: 4, marginLeft: 8 },
  divider: { height: 1, backgroundColor: '#e0e0e0', marginVertical: 12 },
  cardInfo: { gap: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 14, color: '#666' },
  fab: { position: 'absolute', right: 16, bottom: 16, width: 56, height: 56, borderRadius: 28, backgroundColor: '#1976d2', alignItems: 'center', justifyContent: 'center', shadowColor: '#1976d2', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 40 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: '600', textAlign: 'center', marginBottom: 20, paddingHorizontal: 20 },
  modalForm: { paddingHorizontal: 20, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '500', color: '#333', marginBottom: 8, marginTop: 12 },
  modalInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#f9f9f9' },
  modalActions: { flexDirection: 'row', padding: 20, gap: 12, borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  cancelButton: { flex: 1, padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  cancelButtonText: { fontSize: 16, color: '#666', fontWeight: '500' },
  submitButton: { flex: 1, padding: 14, borderRadius: 8, backgroundColor: '#1976d2', alignItems: 'center' },
  submitButtonText: { fontSize: 16, color: '#fff', fontWeight: '600' },
});