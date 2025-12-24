import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

const api = axios.create({
  baseURL: `${baseURL}/api`,
});

// Request interceptor
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    let token = localStorage.getItem('authToken');
    
    // If token is expired, attempt to refresh it
    if (token) {
      const expiry = JSON.parse(atob(token.split('.')[1])).exp;
      if (expiry * 1000 < Date.now()) {  // Check token expiration
        console.log("Token is expired, refreshing...");
        
        try {
          // Assuming your API has an endpoint to refresh the token
          const response = await axios.post('${baseURL}/api/refresh-token', {
            token: localStorage.getItem('refreshToken')
          });
          token = response.data.accessToken;  // Assuming the API returns a new token
          localStorage.setItem('authToken', token || '');

          console.log("New token received:", token);
        } catch (err) {
          console.error("Error refreshing token:", err);
          // Redirect to login if refresh fails
          localStorage.clear();
          window.location.href = '/';
        }
      }
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("401 Error - Unauthorized. Token expired or invalid.");
      localStorage.clear();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
