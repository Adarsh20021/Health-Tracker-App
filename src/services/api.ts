import axios from 'axios';

// Create AXIOS instance configured to target the full-stack server
const api = axios.create({
  baseURL: '/api',
});

// Auto inject JWT token from localStorage on every active request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Graceful errors handler interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || 'A network error occurred. Please try again.';
    
    // Auto-logout if token expires/fails on secured roots
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Avoid infinite loop if we are trying to login / register
      if (!error.config.url?.includes('/auth/')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth-expired'));
      }
    }
    
    return Promise.reject(new Error(message));
  }
);

export default api;
