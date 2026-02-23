import React from 'react'
import { ArrowDownRight, ArrowUpRight, Wallet, CreditCard, Banknote } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface StatProps {
    label: string
    value: string | number
    change?: string
    trend?: 'up' | 'down'
    icon: React.ElementType
}

function StatCard({ label, value, change, trend, icon: Icon }: StatProps) {
    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                {change && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                        {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {change}
                    </div>
                )}
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</h3>
            </div>
        </div>
    )
}

export function StatsCards({ balance }: { balance: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
                label="Total Balance"
                value={formatCurrency(balance)}
                change="+2.4%"
                trend="up"
                icon={Wallet}
            />
            <StatCard
                label="Monthly Income"
                value={formatCurrency(45200)}
                change="+12%"
                trend="up"
                icon={ArrowUpRight}
            />
            <StatCard
                label="Monthly Expenses"
                value={formatCurrency(12400)}
                change="-4%"
                trend="down"
                icon={ArrowDownRight}
            />
        </div>
    )
}
