import React from 'react'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import DashboardLayout from '@/components/dashboard/dashboard-layout'
import { formatCurrency } from '@/lib/utils'
import { Wallet, ArrowDownLeft, ArrowUpRight, CreditCard, Shield } from 'lucide-react'

export default async function AccountsPage() {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
        redirect("/login")
    }

    const account = await prisma.account.findFirst({
        where: { userId: (session.user as any).id }
    })

    const transactions = account ? await prisma.transaction.findMany({
        where: {
            OR: [
                { sourceAccountId: account.id },
                { targetAccountId: account.id }
            ]
        },
        orderBy: { createdAt: 'desc' },
        take: 20
    }) : []

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Accounts</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your bank accounts and view transaction history.</p>
                </div>

                {/* Account Card */}
                {account ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-blue-200 text-sm font-medium">Account Type</p>
                                    <h2 className="text-xl font-bold mt-1">{account.type} Account</h2>
                                </div>
                                <div className="bg-white/20 p-2 rounded-xl">
                                    <Wallet className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div className="mt-8">
                                <p className="text-blue-200 text-xs">Account Number</p>
                                <p className="font-mono text-lg font-semibold tracking-wider mt-1">
                                    **** **** **** {account.accountNumber.slice(-4)}
                                </p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-end">
                                <div>
                                    <p className="text-blue-200 text-xs">Available Balance</p>
                                    <h3 className="text-3xl font-bold mt-1">{formatCurrency(account.balance)}</h3>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${account.isFrozen ? 'bg-red-500' : 'bg-emerald-500'}`}>
                                    {account.isFrozen ? 'FROZEN' : 'ACTIVE'}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-2 shadow-sm">
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl w-fit">
                                    <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Total Received</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">
                                    {formatCurrency(transactions.filter(t => t.type === 'DEPOSIT' || t.targetAccountId === account.id).reduce((sum, t) => sum + Number(t.amount), 0))}
                                </p>
                            </div>
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-2 shadow-sm">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl w-fit">
                                    <ArrowUpRight className="w-5 h-5 text-blue-600" />
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Total Sent</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">
                                    {formatCurrency(transactions.filter(t => t.sourceAccountId === account.id).reduce((sum, t) => sum + Number(t.amount), 0))}
                                </p>
                            </div>
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-2 shadow-sm">
                                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl w-fit">
                                    <CreditCard className="w-5 h-5 text-purple-600" />
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Transactions</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">{transactions.length}</p>
                            </div>
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-2 shadow-sm">
                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
                                    <Shield className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Account Status</p>
                                <p className="text-lg font-bold text-emerald-600">{account.isFrozen ? 'Frozen' : 'Healthy'}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center">
                        <Wallet className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No Account Found</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Please contact support to set up your account.</p>
                    </div>
                )}

                {/* Transaction History */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Transaction History</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">All your recent account activity</p>
                    </div>
                    <div className="overflow-x-auto">
                        {transactions.length === 0 ? (
                            <div className="text-center py-10 text-slate-500 dark:text-slate-400">No transactions found.</div>
                        ) : (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        <th className="px-6 py-3">Type</th>
                                        <th className="px-6 py-3">Reference</th>
                                        <th className="px-6 py-3">Description</th>
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3">Amount</th>
                                        <th className="px-6 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {transactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                    {tx.targetAccountId === account?.id ? (
                                                        <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                                                    ) : (
                                                        <ArrowUpRight className="w-4 h-4 text-blue-600" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-mono text-slate-500 dark:text-slate-400">{tx.reference}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white capitalize">
                                                {tx.description || tx.type.toLowerCase().replace('_', ' ')}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                                {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className={`px-6 py-4 text-sm font-bold ${tx.targetAccountId === account?.id ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                                                {tx.targetAccountId === account?.id ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${tx.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700'}`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
