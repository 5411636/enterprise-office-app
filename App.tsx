import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import LoginScreen from './src/screens/LoginScreen';
import EmployeeScreen from './src/screens/EmployeeScreen';
import CategoryScreen from './src/screens/CategoryScreen';
import DeviceScreen from './src/screens/DeviceScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      setIsAuthenticated(!!token);
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (token: string) => {
    await AsyncStorage.setItem('userToken', token);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: any;

            if (route.name === '员工管理') {
              iconName = focused ? 'people' : 'people-outline';
            } else if (route.name === '设备分类') {
              iconName = focused ? 'list' : 'list-outline';
            } else if (route.name === '设备管理') {
              iconName = focused ? 'desktop' : 'desktop-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#1976d2',
          tabBarInactiveTintColor: 'gray',
          headerRight: () => (
            <Ionicons
              name="log-out-outline"
              size={24}
              color="#1976d2"
              style={{ marginRight: 15 }}
              onPress={handleLogout}
            />
          ),
        })}
      >
        <Tab.Screen name="员工管理" component={EmployeeScreen} />
        <Tab.Screen name="设备分类" component={CategoryScreen} />
        <Tab.Screen name="设备管理" component={DeviceScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
