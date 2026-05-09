import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Attach JWT to every request ──────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Global response handler ──────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('pf_token');
      localStorage.removeItem('pf_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authService = {
  signup: (data) => api.post('/auth/signup', data),
  login:  (data) => api.post('/auth/login', data),
  getMe:  ()     => api.get('/auth/me'),
  getUsers: ()   => api.get('/auth/users'),
};

// ─── Projects ─────────────────────────────────────────────────────────────────
export const projectService = {
  getAll:       ()         => api.get('/projects'),
  getById:      (id)       => api.get(`/projects/${id}`),
  create:       (data)     => api.post('/projects', data),
  update:       (id, data) => api.put(`/projects/${id}`, data),
  delete:       (id)       => api.delete(`/projects/${id}`),
  addMember:    (id, userId)          => api.post(`/projects/${id}/members`, { userId }),
  removeMember: (id, userId)          => api.delete(`/projects/${id}/members/${userId}`),
};

// ─── Tasks ────────────────────────────────────────────────────────────────────
export const taskService = {
  getAll:   (params) => api.get('/tasks', { params }),
  getById:  (id)     => api.get(`/tasks/${id}`),
  create:   (data)   => api.post('/tasks', data),
  update:   (id, data) => api.put(`/tasks/${id}`, data),
  delete:   (id)     => api.delete(`/tasks/${id}`),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardService = {
  getStats: () => api.get('/dashboard'),
};

export default api;
