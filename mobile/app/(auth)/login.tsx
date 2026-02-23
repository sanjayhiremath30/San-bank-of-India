import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { Wallet, Shield, Fingerprint } from 'lucide-react-native';
import * as LocalAuthentication from 'expo-local-authentication';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);

    const handleLogin = async () => {
        // Mock login logic - in real app, call next.js API
        const mockUser = { id: '1', name: 'John Doe', email, role: 'USER' };
        const mockToken = 'mock-jwt-token';

        await setAuth(mockUser, mockToken);
        router.replace('/(tabs)');
    };

    const handleBiometric = async () => {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        if (!hasHardware) return;

        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Login with Biometrics',
        });

        if (result.success) {
            handleLogin();
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View className="items-center mb-12 mt-20">
                    <View className="w-16 h-16 bg-blue-600 rounded-3xl items-center justify-center mb-4">
                        <Wallet color="white" size={32} />
                    </View>
                    <Text className="text-3xl font-bold text-slate-900">SAN BANK</Text>
                    <Text className="text-slate-500 mt-2 text-lg">AI Digital Banking</Text>
                </View>

                <View className="space-y-4 px-6 w-full max-w-sm self-center">
                    <View>
                        <Text className="text-slate-600 mb-2 font-medium">Email Address</Text>
                        <TextInput
                            className="bg-slate-100 p-4 rounded-2xl text-slate-900 border border-slate-200"
                            placeholder="name@example.com"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View className="mt-4">
                        <Text className="text-slate-600 mb-2 font-medium">Password</Text>
                        <TextInput
                            className="bg-slate-100 p-4 rounded-2xl text-slate-900 border border-slate-200"
                            placeholder="••••••••"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        className="w-full bg-blue-600 p-4 rounded-2xl mt-8 shadow-lg shadow-blue-500/30 items-center"
                        onPress={handleLogin}
                    >
                        <Text className="text-white font-bold text-lg">Login</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center justify-center gap-2 mt-6 py-2"
                        onPress={handleBiometric}
                    >
                        <Fingerprint color="#2563eb" size={24} />
                        <Text className="text-blue-600 font-bold">Use Biometrics</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity className="mt-12 items-center">
                    <Text className="text-slate-500">
                        Don't have an account? <Text className="text-blue-600 font-bold">Register</Text>
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
    }
});
