import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { authAPI } from '../api';

interface LoginScreenProps {
  onLogin: (token: string) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('错误', '请填写用户名和密码');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.login(username, password);
      if (res.code === 200) {
        onLogin(res.data.token);
      } else {
        Alert.alert('错误', res.message || '登录失败');
      }
    } catch (err: any) {
      Alert.alert('错误', err.message || '用户名或密码错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="lock-closed" size={48} color="#667eea" />
            </View>
          </View>

          <Text style={styles.title}>企业办公管理系统</Text>
          <Text style={styles.subtitle}>请登录以继续</Text>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="用户名"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="密码"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>登录</Text>
              )}
            </TouchableOpacity>

            <View style={styles.hintBox}>
              <Text style={styles.hintTitle}>💡 测试账号</Text>
              <Text style={styles.hintText}>用户名: admin</Text>
              <Text style={styles.hintText}>密码: admin123</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  iconContainer: { alignItems: 'center', marginBottom: 24 },
  iconCircle: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginBottom: 32 },
  formContainer: {
    backgroundColor: '#fff', borderRadius: 16, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5,
  },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd',
    borderRadius: 12, marginBottom: 16, paddingHorizontal: 12, backgroundColor: '#f9f9f9',
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, height: 50, fontSize: 16 },
  loginButton: {
    backgroundColor: '#1976d2', borderRadius: 12, height: 50,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
    shadowColor: '#1976d2', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  loginButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  hintBox: { marginTop: 24, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 12 },
  hintTitle: { fontSize: 12, color: '#666', marginBottom: 8 },
  hintText: { fontSize: 14, color: '#333', marginBottom: 4 },
});