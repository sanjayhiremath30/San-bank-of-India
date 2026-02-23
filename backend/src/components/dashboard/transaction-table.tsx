import React from 'react'
import { ArrowDownLeft, ArrowUpRight, ShoppingCart, Send, User } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface TransactionProps {
    id: string
    reference: string
    amount: any
    type: string
    createdAt: Date
    description?: string | null
}

export function TransactionTable({ transactions }: { transactions: TransactionProps[] }) {
    if (transactions.length === 0) {
        return (
            <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                No transactions found.
            </div>
        )
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <th className="px-4 py-3">Transaction</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                        {tx.type === 'DEPOSIT' ? (
                                            <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                                        ) : (
                                            <ArrowUpRight className="w-5 h-5 text-blue-600" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                                            {tx.description || tx.type.toLowerCase().replace('_', ' ')}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{tx.reference}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                                {new Date(tx.createdAt).toLocaleDateString()}
                            </td>
                            <td className={`px-4 py-4 text-sm font-bold ${tx.type === 'DEPOSIT' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'
                                }`}>
                                {tx.type === 'DEPOSIT' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                            </td>
                            <td className="px-4 py-4">
                                <span className="px-2 py-1 text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full uppercase">
                                    Completed
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
