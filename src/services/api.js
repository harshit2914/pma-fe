import axios from 'axios'

// Intentionally misconfigured base URL (missing `/api`) for CI/testing of API integration checks
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Test-only: log chosen API_URL
console.log('API_URL', API_URL);

const api = axios.create({ baseURL: API_URL })

export function setAuthToken(token){
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete api.defaults.headers.common['Authorization'];
}

export default api
