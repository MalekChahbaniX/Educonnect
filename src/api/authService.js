import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  login: async (email, password) => {
    try {
      // Simulation pour l'instant - remplacer par API réelle plus tard
      const mockUser = {
        id: '1',
        email,
        firstName: 'Jean',
        lastName: 'Dupont',
        role: 'parent',
        phone: '+33612345678'
      };
      
      const mockTokens = {
        accessToken: 'mock-access-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now()
      };
      
      await AsyncStorage.setItem('accessToken', mockTokens.accessToken);
      await AsyncStorage.setItem('refreshToken', mockTokens.refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      
      return { success: true, user: mockUser };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Login failed' 
      };
    }
  },

  register: async (userData) => {
    try {
      // Simulation pour l'instant
      const mockUser = {
        id: Date.now().toString(),
        ...userData
      };
      
      const mockTokens = {
        accessToken: 'mock-access-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now()
      };
      
      await AsyncStorage.setItem('accessToken', mockTokens.accessToken);
      await AsyncStorage.setItem('refreshToken', mockTokens.refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      
      return { success: true, user: mockUser };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Registration failed' 
      };
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  },

  getProfile: async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      return { success: true, data: JSON.parse(user) };
    } catch (error) {
      return { success: false, message: 'Failed to get profile' };
    }
  },

  updateProfile: async (profileData) => {
    try {
      const currentUser = await AsyncStorage.getItem('user');
      const user = JSON.parse(currentUser);
      const updatedUser = { ...user, ...profileData };
      
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      return { success: true, data: updatedUser };
    } catch (error) {
      return { success: false, message: 'Failed to update profile' };
    }
  },

  getCurrentUser: async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      return null;
    }
  },

  isAuthenticated: async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      return !!token;
    } catch (error) {
      return false;
    }
  },

  getStoredToken: async () => {
    try {
      return await AsyncStorage.getItem('accessToken');
    } catch (error) {
      return null;
    }
  }
};
