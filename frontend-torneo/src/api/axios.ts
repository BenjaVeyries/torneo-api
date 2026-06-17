// src/api/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept responses to handle auth errors globally (optional)
api.interceptors.response.use(
  response => response,
  error => {
    // You can add token refresh logic here if needed
    return Promise.reject(error);
  }
);

export default api;
