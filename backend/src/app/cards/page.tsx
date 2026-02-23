"use client"

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/dashboard-layout'
import { formatCurrency } from '@/lib/utils'
import { CreditCard, Lock, Unlock, Eye, EyeOff, Settings, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

export default function CardsPage() {
    const [account, setAccount] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [showCVV, setShowCVV] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [msg, setMsg] = useState({ type: '', text: '' })

    // Limits state
    const [editLimits, setEditLimits] = useState(false)
    const [limits, setLimits] = useState({ dailyLimit: 100000, monthlyLimit: 1000000 })

    const fetchAccount = async () => {
        try {
            const res = await fetch('/api/account')
            const data = await res.json()
            if (data.account) {
                setAccount(data.account)
                setLimits({
                    dailyLimit: data.account.dailyLimit || 100000,
                    monthlyLimit: data.account.monthlyLimit || 1000000
                })
            }
            setLoading(false)
        } catch { setLoading(false) }
    }

    useEffect(() => { fetchAccount() }, [])

    const toggleFreeze = async () => {
        setIsUpdating(true)
        try {
            const res = await fetch('/api/account', { method: 'PATCH' })
            if (res.ok) {
                setAccount({ ...account, isFrozen: !account.isFrozen })
                setMsg({ type: 'success', text: `Card ${!account.isFrozen ? 'frozen' : 'unfrozen'} successfully.` })
            }
        } catch { setMsg({ type: 'error', text: 'Failed to update card status.' }) }
        finally { setIsUpdating(false); setTimeout(() => setMsg({ type: '', text: '' }), 3000) }
    }

    const saveLimits = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsUpdating(true)
        try {
            const res = await fetch('/api/card-limit', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(limits)
            })
            if (res.ok) {
                setEditLimits(false)
                setMsg({ type: 'success', text: 'Spending limits updated.' })
                fetchAccount()
            } else {
                const data = await res.json()
                setMsg({ type: 'error', text: data.error || 'Failed to update limits.' })
            }
        } catch { setMsg({ type: 'error', text: 'Network error.' }) }
        finally { setIsUpdating(false); setTimeout(() => setMsg({ type: '', text: '' }), 5000) }
    }

    if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div></DashboardLayout>

    const fakeCVV = "123"
    const expiry = "12/28"

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Virtual Cards</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your card status and spending limits.</p>
                </div>

                {msg.text && (
                    <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in slide-in-from-top-2 ${msg.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 text-emerald-700' : 'bg-red-50 dark:bg-red-900/20 border-red-200 text-red-700'}`}>
                        {msg.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <p className="text-sm font-medium">{msg.text}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Card Display */}
                    <div className="space-y-6">
                        <div className={`relative aspect-[1.586/1] w-full rounded-[32px] p-8 text-white shadow-2xl overflow-hidden transition-all duration-500 ${account?.isFrozen ? 'grayscale bg-slate-800' : 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900'}`}>
                            {/* Chip */}
                            <div className="w-12 h-10 bg-gradient-to-br from-yellow-200 to-yellow-500 rounded-lg mb-8 shadow-inner"></div>

                            <div className="space-y-8">
                                <div className="flex justify-between items-center text-xl font-mono tracking-[0.2em] font-bold">
                                    <span>****</span><span>****</span><span>****</span>
                                    <span>{account?.accountNumber?.slice(-4) || '0000'}</span>
                                </div>

                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] text-white/50 uppercase font-black tracking-widest leading-none">Card Holder</p>
                                        <p className="text-sm font-bold mt-1 uppercase">VALUED CUSTOMER</p>
                                    </div>
                                    <div className="flex gap-6">
                                        <div>
                                            <p className="text-[10px] text-white/50 uppercase font-black tracking-widest leading-none">Expires</p>
                                            <p className="text-sm font-bold mt-1">{expiry}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-white/50 uppercase font-black tracking-widest leading-none">CVV</p>
                                            <p className="text-sm font-bold mt-1">{showCVV ? fakeCVV : '***'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {account?.isFrozen && (
                                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center">
                                    <div className="px-6 py-2 bg-white/10 border border-white/20 rounded-full flex items-center gap-2">
                                        <Lock className="w-4 h-4" />
                                        <span className="text-xs font-black uppercase tracking-widest">Frozen</span>
                                    </div>
                                </div>
                            )}

                            <div className="absolute top-8 right-8">
                                <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center text-[8px] font-bold italic border border-white/20">VISA</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={toggleFreeze}
                                disabled={isUpdating}
                                className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all border-2 ${account?.isFrozen ? 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700' : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30 text-red-600 hover:bg-red-100'}`}
                            >
                                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : (account?.isFrozen ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />)}
                                {account?.isFrozen ? 'Unfreeze Card' : 'Freeze Card'}
                            </button>
                            <button
                                onClick={() => setShowCVV(!showCVV)}
                                className="flex items-center justify-center gap-2 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-all font-bold"
                            >
                                {showCVV ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                {showCVV ? 'Hide Info' : 'View CVV'}
                            </button>
                        </div>
                    </div>

                    {/* Limits & Settings */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl"><Settings className="w-5 h-5 text-blue-600" /></div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">Spending Limits</h3>
                                </div>
                                {!editLimits && (
                                    <button onClick={() => setEditLimits(true)} className="text-xs font-black uppercase text-blue-600 tracking-widest hover:underline">Edit</button>
                                )}
                            </div>

                            {editLimits ? (
                                <form onSubmit={saveLimits} className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Daily Limit (₹)</label>
                                        <input type="number" value={limits.dailyLimit} onChange={e => setLimits({ ...limits, dailyLimit: parseInt(e.target.value) })}
                                            min="1000" max="200000" required
                                            className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-lg font-bold focus:border-blue-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Monthly Limit (₹)</label>
                                        <input type="number" value={limits.monthlyLimit} onChange={e => setLimits({ ...limits, monthlyLimit: parseInt(e.target.value) })}
                                            min="1000" max="1000000" required
                                            className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-lg font-bold focus:border-blue-500 outline-none" />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button type="submit" disabled={isUpdating} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700">
                                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Limits'}
                                        </button>
                                        <button type="button" onClick={() => setEditLimits(false)} className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold">Cancel</button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-8">
                                    <div>
                                        <div className="flex justify-between items-end mb-2">
                                            <p className="text-xs font-bold text-slate-500">Daily Limit</p>
                                            <p className="font-bold text-slate-900 dark:text-white">₹{limits.dailyLimit.toLocaleString('en-IN')}</p>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-600 w-[60%] rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"></div>
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-2 font-medium">Used: ₹64,000 / ₹{limits.dailyLimit.toLocaleString('en-IN')}</p>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-end mb-2">
                                            <p className="text-xs font-bold text-slate-500">Monthly Limit</p>
                                            <p className="font-bold text-slate-900 dark:text-white">₹{limits.monthlyLimit.toLocaleString('en-IN')}</p>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-600 w-[45%] rounded-full shadow-[0_0_10px_rgba(79,70,229,0.4)]"></div>
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-2 font-medium">Used: ₹4,50,000 / ₹{limits.monthlyLimit.toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-[32px] p-8 text-white shadow-lg">
                            <h4 className="font-black text-xs uppercase tracking-widest mb-4">Security Tip</h4>
                            <p className="text-sm font-medium leading-relaxed opacity-90">Keep your card frozen whenever you are not making purchases to prevent unauthorized transactions.</p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
