import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

interface AuthState {
    user: any | null;
    token: string | null;
    isAuthenticated: boolean;
    setAuth: (user: any, token: string) => Promise<void>;
    logout: () => Promise<void>;
    loadAuth: () => Promise<void>;
}

const API_URL = 'http://localhost:3000/api'; // Update for production

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,

    setAuth: async (user, token) => {
        await SecureStore.setItemAsync('token', token);
        await SecureStore.setItemAsync('user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
    },

    logout: async () => {
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('user');
        set({ user: null, token: null, isAuthenticated: false });
    },

    loadAuth: async () => {
        const token = await SecureStore.getItemAsync('token');
        const userStr = await SecureStore.getItemAsync('user');
        if (token && userStr) {
            set({ user: JSON.parse(userStr), token, isAuthenticated: true });
        }
    },
}));
