import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token'); // Vereinheitlicht auf 'access_token'
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    is_verified: boolean;
    profile_complete: boolean;
  };
}

interface RegisterResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    is_verified: boolean;
    profile_complete: boolean;
  };
}

interface User {
  id: number;
  username: string;
  email: string;
  is_verified: boolean;
  profile_complete: boolean;
}

export const authAPI = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/login/', { username, password });
    return response.data;
  },

  register: async (username: string, email: string, password: string, password_confirm: string): Promise<RegisterResponse> => {
    const response = await api.post('/auth/register/', { 
      username, 
      email, 
      password, 
      password_confirm: password_confirm 
    });
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/user/');
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout/');
  },

  refreshToken: async (): Promise<{ token: string }> => {
    const response = await api.post('/auth/token/refresh/');
    return response.data;
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/password/reset/', { email });
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await api.post('/auth/password/reset/confirm/', { token, password });
  },

  verifyEmail: async (token: string): Promise<void> => {
    await api.post('/auth/email/verify/', { token });
  },

  resendVerificationEmail: async (email: string): Promise<void> => {
    await api.post('/auth/email/resend/', { email });
  },
};

export const handleApiError = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const apiError = error as { response?: { data?: Record<string, unknown> } };
    
    if (apiError.response?.data?.detail) {
      return apiError.response.data.detail as string;
    }
    
    if (apiError.response?.data) {
      const errors = apiError.response.data;
      if (typeof errors === 'object') {
        const firstError = Object.values(errors)[0];
        if (Array.isArray(firstError)) {
          return firstError[0] as string;
        }
        return firstError as string;
      }
    }
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as { message: string }).message;
  }
  
  return 'An unexpected error occurred';
}; 
