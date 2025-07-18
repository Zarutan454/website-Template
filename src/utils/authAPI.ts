import { API_BASE_URL } from '../config/env';

const API_BASE_URL_FINAL = API_BASE_URL;

// Authentication API functions
export const authAPI = {
  // Login user
  async login(credentials: { email: string; password: string }) {
    const response = await fetch(`${API_BASE_URL_FINAL}/api/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    return await response.json();
  },

  // Register user
  async register(userData: { 
    username: string; 
    email: string; 
    password: string; 
    password_confirm: string;
  }) {
    const response = await fetch(`${API_BASE_URL_FINAL}/api/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    return await response.json();
  },

  // Logout user
  async logout() {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL_FINAL}/api/auth/logout/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  },

  // Get user profile
  async getProfile() {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL_FINAL}/api/auth/user/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get profile');
    }

    return await response.json();
  },

  // Refresh token
  async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    const response = await fetch(`${API_BASE_URL_FINAL}/api/auth/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    localStorage.setItem('access_token', data.access);
    return data;
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  },

  // Get current token
  getToken(): string | null {
    return localStorage.getItem('access_token');
  },
};

export default authAPI; 
