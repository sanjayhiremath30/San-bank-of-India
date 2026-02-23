import React from 'react'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { TransactionTable } from "@/components/dashboard/transaction-table"
import { redirect } from "next/navigation"
import DashboardLayout from '@/components/dashboard/dashboard-layout'
import { QuickPayPanel } from '@/components/dashboard/quick-pay-panel'

export default async function DashboardPage() {
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
        take: 5
    }) : []

    const notifications = await prisma.notification.findMany({
        where: { userId: (session.user as any).id, read: false },
        take: 5,
        orderBy: { createdAt: 'desc' }
    })

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Welcome back, {session.user.name || 'User'}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            Here is what's happening with your accounts today.
                        </p>
                    </div>
                </div>

                <StatsCards balance={Number(account?.balance || 0)} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Transactions</h2>
                                <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</button>
                            </div>
                            <TransactionTable transactions={transactions as any} />
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative group">
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
                            <p className="text-blue-100 text-xs font-bold uppercase tracking-widest">Available Balance</p>
                            <h3 className="text-3xl font-bold mt-2">
                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(account?.balance || 0))}
                            </h3>
                            <div className="mt-12 pt-6 border-t border-white/10 flex justify-between items-end">
                                <div>
                                    <p className="text-blue-100/60 text-[10px] uppercase font-bold tracking-tighter">Account Number</p>
                                    <p className="font-mono text-lg font-semibold tracking-[0.2em] mt-1">
                                        **** **** {account?.accountNumber ? account.accountNumber.slice(-4) : "0000"}
                                    </p>
                                </div>
                                <div className="bg-white/10 p-2 rounded-lg backdrop-blur-md">
                                    <div className="w-10 h-6 border border-white/30 rounded flex items-center justify-center text-[8px] font-bold italic">VISA</div>
                                </div>
                            </div>
                        </div>

                        <QuickPayPanel />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
