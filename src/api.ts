import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: 修改为你的服务器IP
const API_BASE = 'http://115.29.232.83:5000/api';

interface ApiResponse {
  code: number;
  message: string;
  data: any;
}

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('userToken');
    }
    const message = error.response?.data?.message || '网络错误';
    return Promise.reject({ message });
  }
);

export const authAPI = {
  login: (username: string, password: string): Promise<ApiResponse> =>
    api.post('/auth/login', { username, password }),
};

export const employeeAPI = {
  getAll: (): Promise<ApiResponse> => api.get('/employees'),
  create: (data: any): Promise<ApiResponse> => api.post('/employees', data),
  update: (id: number, data: any): Promise<ApiResponse> => api.put(`/employees/${id}`, data),
  delete: (id: number): Promise<ApiResponse> => api.delete(`/employees/${id}`),
};

export const categoryAPI = {
  getAll: (): Promise<ApiResponse> => api.get('/categories'),
  create: (data: any): Promise<ApiResponse> => api.post('/categories', data),
  update: (id: number, data: any): Promise<ApiResponse> => api.put(`/categories/${id}`, data),
  delete: (id: number): Promise<ApiResponse> => api.delete(`/categories/${id}`),
  getDevices: (id: number): Promise<ApiResponse> => api.get(`/categories/${id}/devices`),
};

export const deviceAPI = {
  getAll: (): Promise<ApiResponse> => api.get('/devices'),
  create: (data: any): Promise<ApiResponse> => api.post('/devices', data),
  update: (id: number, data: any): Promise<ApiResponse> => api.put(`/devices/${id}`, data),
  delete: (id: number): Promise<ApiResponse> => api.delete(`/devices/${id}`),
};

export default api;