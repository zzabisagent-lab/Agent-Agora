import axios from 'axios';
import { getCsrfToken, shouldAttachCsrf } from '../utils/csrf';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const client = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// Request interceptor: attach CSRF token for human session write requests
client.interceptors.request.use((config) => {
  if (shouldAttachCsrf(config.method || '')) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
  }
  return config;
});

// Response interceptor: normalize errors
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const errorCode = err.response?.data?.error_code;

    if (status === 401) {
      // Emit a custom event so AuthContext can react
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }

    const normalizedError = {
      status,
      error_code: errorCode || 'INTERNAL_ERROR',
      error_message: err.response?.data?.error_message || 'An unexpected error occurred',
      details: err.response?.data?.details || null,
    };

    return Promise.reject(normalizedError);
  }
);

export default client;
