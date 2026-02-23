"use client"

import React, { useState } from 'react'
import { Send, Smartphone, Landmark, LayoutGrid, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function QuickPayPanel() {
    const router = useRouter()
    const [loading, setLoading] = useState<string | null>(null)

    const handleAction = (path: string, key: string) => {
        setLoading(key)
        router.push(path)
    }

    const actions = [
        { label: 'Send Money', icon: Send, path: '/transfers', color: 'bg-blue-600', hover: 'hover:bg-blue-700', key: 'send' },
        { label: 'Pay Bills', icon: Landmark, path: '/transfers?tab=bills', color: 'bg-slate-800', hover: 'hover:bg-slate-700', key: 'bills' },
        { label: 'Mobile Recharge', icon: Smartphone, path: '/transfers?tab=recharge', color: 'bg-slate-800', hover: 'hover:bg-slate-700', key: 'recharge' },
    ]

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Pay</h2>
            <div className="space-y-3">
                {actions.map((action) => (
                    <button
                        key={action.key}
                        onClick={() => handleAction(action.path, action.key)}
                        disabled={loading !== null}
                        className={`w-full py-3.5 ${action.color} ${action.hover} text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100`}
                    >
                        {loading === action.key ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <action.icon className="w-5 h-5" />
                        )}
                        {action.label}
                    </button>
                ))}

                <button className="w-full py-3.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                    <LayoutGrid className="w-5 h-5" />
                    More Actions
                </button>
            </div>
        </div>
    )
}
