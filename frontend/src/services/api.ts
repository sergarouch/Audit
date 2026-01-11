import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (email: string, password: string, role: 'manager' | 'auditor') =>
    api.post('/auth/register', { email, password, role }),
  login: (email: string, password: string) =>
    api.post('/auth/login', new URLSearchParams({ username: email, password }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }),
};

// Attributes API
export const attributesAPI = {
  getAll: () => api.get('/attributes'),
  get: (id: number) => api.get(`/attributes/${id}`),
  create: (data: any) => api.post('/attributes', data),
  update: (id: number, data: any) => api.put(`/attributes/${id}`, data),
  delete: (id: number) => api.delete(`/attributes/${id}`),
};

// Work Papers API
export const workPapersAPI = {
  getAll: () => api.get('/work-papers'),
  get: (id: number) => api.get(`/work-papers/${id}`),
  create: (formData: FormData) => api.post('/work-papers', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  audit: (id: number) => api.post(`/work-papers/${id}/audit`),
};

// Conclusions API
export const conclusionsAPI = {
  get: (id: number) => api.get(`/conclusions/${id}`),
  getByWorkPaper: (workPaperId: number) => api.get(`/conclusions/work-papers/${workPaperId}/conclusion`),
};

export default api;
