import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAuthStore } from '../../src/store/authStore';
import { Bell, CreditCard, ArrowUpRight, ArrowDownLeft, Send, PieChart, Landmark } from 'lucide-react-native';

const mockTransactions = [
    { id: '1', type: 'DEPOSIT', amount: 5000, description: 'Salary Credit', date: 'Just now' },
    { id: '2', type: 'WITHDRAWAL', amount: 200, description: 'Starbucks Coffee', date: '2h ago' },
    { id: '3', type: 'TRANSFER', amount: 1500, description: 'Rent Payment', date: '1d ago' },
];

export default function HomeScreen() {
    const user = useAuthStore((state) => state.user);

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <ScrollView className="flex-1 px-6">
                {/* Header */}
                <View className="flex-row justify-between items-center py-6 mt-4">
                    <View>
                        <Text className="text-slate-500 font-medium">Good Morning,</Text>
                        <Text className="text-2xl font-bold text-slate-900">{user?.name || 'Customer'}</Text>
                    </View>
                    <TouchableOpacity className="relative p-2 bg-white rounded-2xl border border-slate-200">
                        <Bell color="#64748b" size={24} />
                        <View className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                    </TouchableOpacity>
                </View>

                {/* Card */}
                <View className="bg-blue-600 rounded-[32px] p-8 shadow-2xl shadow-blue-500/40 relative overflow-hidden">
                    <View className="flex-row justify-between items-start">
                        <View>
                            <Text className="text-blue-100 font-medium tracking-wider">Total Balance</Text>
                            <Text className="text-white text-4xl font-bold mt-2">₹48,250.00</Text>
                        </View>
                        <Landmark color="rgba(255,255,255,0.2)" size={48} />
                    </View>
                    <View className="flex-row justify-between items-end mt-12 pt-6 border-t border-white/20">
                        <View>
                            <Text className="text-blue-100 text-xs uppercase tracking-widest font-bold">Account Number</Text>
                            <Text className="text-white font-mono text-lg mt-1 tracking-widest">**** **** 8291</Text>
                        </View>
                        <View className="bg-white/20 p-2 rounded-lg">
                            <Text className="text-white font-bold text-[10px]">VISA</Text>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row justify-between mt-10">
                    <ActionButton icon={Send} label="Send" color="#2563eb" />
                    <ActionButton icon={PieChart} label="Bills" color="#7c3aed" />
                    <ActionButton icon={CreditCard} label="Cards" color="#059669" />
                    <ActionButton icon={ArrowUpRight} label="Request" color="#ea580c" />
                </View>

                {/* Transactions */}
                <View className="mt-12 mb-8">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-xl font-bold text-slate-900">Recent Transactions</Text>
                        <TouchableOpacity>
                            <Text className="text-blue-600 font-bold">View All</Text>
                        </TouchableOpacity>
                    </View>

                    {mockTransactions.map((tx) => (
                        <View key={tx.id} className="flex-row items-center bg-white p-4 rounded-3xl mb-4 border border-slate-100 shadow-sm">
                            <View className={`w-12 h-12 rounded-2xl items-center justify-center ${tx.type === 'DEPOSIT' ? 'bg-emerald-50' : 'bg-slate-50'
                                }`}>
                                {tx.type === 'DEPOSIT' ? (
                                    <ArrowDownLeft color="#059669" size={24} />
                                ) : (
                                    <ArrowUpRight color="#64748b" size={24} />
                                )}
                            </View>
                            <View className="flex-1 ml-4">
                                <Text className="text-slate-900 font-bold text-base">{tx.description}</Text>
                                <Text className="text-slate-400 text-xs mt-1">{tx.date}</Text>
                            </View>
                            <Text className={`font-bold text-base ${tx.type === 'DEPOSIT' ? 'text-emerald-600' : 'text-slate-900'
                                }`}>
                                {tx.type === 'DEPOSIT' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                            </Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function ActionButton({ icon: Icon, label, color }: any) {
    return (
        <View className="items-center">
            <TouchableOpacity
                className="w-14 h-14 rounded-2xl items-center justify-center bg-white border border-slate-100 shadow-sm"
            >
                <Icon color={color} size={28} />
            </TouchableOpacity>
            <Text className="text-slate-600 mt-2 font-medium text-xs">{label}</Text>
        </View>
    );
}
