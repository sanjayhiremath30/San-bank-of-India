"use client"

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/dashboard-layout'
import { Shield, Lock, Smartphone, Fingerprint, Eye, CheckCircle, AlertCircle, Loader2, KeyRound } from 'lucide-react'

export default function SecurityPage() {
    const [hasPin, setHasPin] = useState<boolean | null>(null)
    const [loading, setLoading] = useState(true)
    const [showSetup, setShowSetup] = useState(false)
    const [form, setForm] = useState({ currentPin: '', newPin: '', confirmPin: '' })
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [msg, setMsg] = useState('')

    const checkPin = async () => {
        try {
            const res = await fetch('/api/pin')
            const data = await res.json()
            setHasPin(data.hasPIN)
            setLoading(false)
        } catch { setLoading(false) }
    }

    useEffect(() => { checkPin() }, [])

    const handlePinSetup = async (e: React.FormEvent) => {
        e.preventDefault()
        if (form.newPin.length !== 4 || !/^\d+$/.test(form.newPin)) {
            setStatus('error'); setMsg("PIN must be 4 digits."); return
        }
        if (form.newPin !== form.confirmPin) {
            setStatus('error'); setMsg("PINs do not match."); return
        }

        setStatus('loading')
        try {
            const res = await fetch('/api/pin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pin: form.newPin,
                    currentPin: hasPin ? form.currentPin : undefined
                })
            })
            const data = await res.json()
            if (res.ok) {
                setStatus('success'); setMsg(data.message); setHasPin(true); setShowSetup(false)
                setForm({ currentPin: '', newPin: '', confirmPin: '' })
            } else {
                setStatus('error'); setMsg(data.error || "Setup failed")
            }
        } catch { setStatus('error'); setMsg("Network error") }
    }

    if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div></DashboardLayout>

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Security Settings</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account security and transaction authentication.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* PIN Management Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600">
                                        <KeyRound className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">Transaction PIN</h3>
                                        <p className="text-xs text-slate-500">Secure your transfers and sensitive data access.</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${hasPin ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                    {hasPin ? 'Active' : 'Not Set'}
                                </span>
                            </div>

                            {showSetup ? (
                                <form onSubmit={handlePinSetup} className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                                    {(status === 'error' || status === 'success') && (
                                        <div className={`p-4 rounded-xl border flex items-center gap-3 ${status === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                                            {status === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                            <p className="text-sm font-semibold">{msg}</p>
                                        </div>
                                    )}

                                    {hasPin && (
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Current PIN</label>
                                            <input type="password" value={form.currentPin} onChange={e => setForm({ ...form, currentPin: e.target.value })} maxLength={4}
                                                className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono text-xl tracking-widest focus:border-blue-500 outline-none" placeholder="****" />
                                        </div>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{hasPin ? 'New PIN' : 'Set 4-Digit PIN'}</label>
                                            <input type="password" value={form.newPin} onChange={e => setForm({ ...form, newPin: e.target.value })} maxLength={4}
                                                className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono text-xl tracking-widest focus:border-blue-500 outline-none" placeholder="****" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Confirm PIN</label>
                                            <input type="password" value={form.confirmPin} onChange={e => setForm({ ...form, confirmPin: e.target.value })} maxLength={4}
                                                className="w-full px-5 py-3 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono text-xl tracking-widest focus:border-blue-500 outline-none" placeholder="****" />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button type="submit" disabled={status === 'loading'} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-500/30">
                                            {status === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : (hasPin ? 'Update PIN' : 'Activate PIN')}
                                        </button>
                                        <button type="button" onClick={() => { setShowSetup(false); setStatus('idle') }} className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-bold">Cancel</button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-6">
                                    <p className="text-sm text-slate-500 leading-relaxed">The transaction PIN is required when sending money, paying bills, and revealing your account balance.</p>
                                    <button onClick={() => setShowSetup(true)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                                        {hasPin ? 'Change Transaction PIN' : 'Setup Transaction PIN'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Other Options */}
                        <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6">Device Security</h3>
                            <div className="space-y-4">
                                {[
                                    { icon: Fingerprint, label: 'Biometric Login', sub: 'Use FaceID or Fingerprint to login', enabled: false },
                                    { icon: Smartphone, label: 'Device Binding', sub: 'Trust this phone for faster access', enabled: true },
                                    { icon: Lock, label: '2-Step Verification', sub: 'Secure login via SMS/Email code', enabled: false },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-50 dark:border-slate-800 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
                                                <item.icon className="w-5 h-5 text-slate-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{item.label}</p>
                                                <p className="text-[10px] text-slate-500">{item.sub}</p>
                                            </div>
                                        </div>
                                        <div className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer ${item.enabled ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${item.enabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[32px] p-8 text-white shadow-xl">
                            <Shield className="w-10 h-10 text-indigo-200 mb-6" />
                            <h4 className="text-lg font-bold">Why set a PIN?</h4>
                            <ul className="mt-4 space-y-3">
                                {['Extra layer of protection', 'Authorized transfers only', 'Secure sensitive data'].map(li => (
                                    <li key={li} className="flex items-center gap-2 text-sm text-indigo-100 font-medium">
                                        <CheckCircle className="w-4 h-4 text-emerald-300" /> {li}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
