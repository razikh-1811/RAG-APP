import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// ── Upload ────────────────────────────────────────────────────────────────────
export const uploadAPI = {
  upload: (formData) =>
    api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getDocuments: () => api.get('/upload/documents'),
  deleteDocument: (documentId) => api.delete(`/upload/documents/${documentId}`),
};

// ── Ask ───────────────────────────────────────────────────────────────────────
export const askAPI = {
  ask: (question, topK = 5, threshold = 0.3) =>
    api.post('/ask', { question, topK, threshold }),
};

// ── History ───────────────────────────────────────────────────────────────────
export const historyAPI = {
  getHistory: (page = 1) => api.get(`/history?page=${page}&limit=20`),
  getById: (id) => api.get(`/history/${id}`),
  deleteEntry: (id) => api.delete(`/history/${id}`),
  clearAll: () => api.delete('/history'),
};

export default api;
