import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Send, ArrowRight, User } from 'lucide-react-native';

export default function TransferScreen() {
    const [targetAccount, setTargetAccount] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    const handleTransfer = () => {
        if (!targetAccount || !amount) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        Alert.alert(
            'Confirm Transfer',
            `Are you sure you want to transfer ₹${amount} to ${targetAccount}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: () => Alert.alert('Success', 'Transfer initiated successfully!')
                },
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <ScrollView className="flex-1 px-6">
                <View className="py-8 mt-4">
                    <Text className="text-3xl font-bold text-slate-900">Transfer Money</Text>
                    <Text className="text-slate-500 mt-2">Send funds instantly to any San Bank account.</Text>
                </View>

                <View className="space-y-6">
                    <View>
                        <Text className="text-slate-600 mb-2 font-medium">To Account Number</Text>
                        <TextInput
                            className="bg-white p-4 rounded-2xl text-slate-900 border border-slate-200 text-lg font-mono"
                            placeholder="Enter 11-digit number"
                            value={targetAccount}
                            onChangeText={setTargetAccount}
                            keyboardType="number-pad"
                        />
                    </View>

                    <View className="mt-4">
                        <Text className="text-slate-600 mb-2 font-medium">Amount (₹)</Text>
                        <TextInput
                            className="bg-white p-4 rounded-2xl text-slate-900 border border-slate-200 text-2xl font-bold"
                            placeholder="0.00"
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="decimal-pad"
                        />
                    </View>

                    <View className="mt-4">
                        <Text className="text-slate-600 mb-2 font-medium">Description (Optional)</Text>
                        <TextInput
                            className="bg-white p-4 rounded-2xl text-slate-900 border border-slate-200"
                            placeholder="What's this for?"
                            value={description}
                            onChangeText={setDescription}
                        />
                    </View>

                    <View className="bg-blue-50 p-4 rounded-2xl flex-row items-center gap-3 mt-4 border border-blue-100">
                        <User color="#2563eb" size={24} />
                        <Text className="text-blue-700 text-sm font-medium flex-1">
                            Your transfer is protected by AI Fraud Detection and end-to-end encryption.
                        </Text>
                    </View>

                    <TouchableOpacity
                        className="w-full bg-blue-600 p-5 rounded-2xl mt-8 shadow-xl shadow-blue-500/30 items-center flex-row justify-center gap-3"
                        onPress={handleTransfer}
                    >
                        <Text className="text-white font-bold text-lg">Send Money</Text>
                        <ArrowRight color="white" size={20} />
                    </TouchableOpacity>
                </View>

                <View className="mt-12 items-center pb-10">
                    <Text className="text-slate-400 text-xs">
                        Daily Transfer Limit: ₹1,00,000.00
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
