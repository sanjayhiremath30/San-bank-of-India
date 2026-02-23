"use client"

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/dashboard-layout'
import { Send, CheckCircle, AlertCircle, Loader2, Copy, CopyCheck, PlusCircle, ArrowDownLeft, QrCode, Lock, Eye, EyeOff } from 'lucide-react'
import { PinModal } from '@/components/ui/pin-modal'
import { QRPaymentCode } from '@/components/ui/qr-code'
import { useSearchParams } from 'next/navigation'

export default function TransfersPage() {
    const searchParams = useSearchParams()
    const initialTab = (searchParams.get('tab') as any) || 'send'

    const [tab, setTab] = useState<'send' | 'addmoney' | 'qrcode'>('send')
    const [formData, setFormData] = useState({ targetAccount: '', amount: '', description: '' })
    const [depositAmt, setDepositAmt] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')
    const [myAccount, setMyAccount] = useState<{ id: string; accountNumber: string; balance: number } | null>(null)
    const [user, setUser] = useState<{ name: string } | null>(null)
    const [copied, setCopied] = useState(false)

    // Security / PIN
    const [isPinModalOpen, setIsPinModalOpen] = useState(false)
    const [isBalanceHidden, setIsBalanceHidden] = useState(true)
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)

    const loadData = () => {
        fetch('/api/account').then(r => r.json()).then(data => {
            if (data.account) setMyAccount(data.account)
        }).catch(() => { })

        fetch('/api/user').then(r => r.json()).then(data => {
            if (data.user) setUser(data.user)
        }).catch(() => { })
    }

    useEffect(() => {
        loadData()
        if (initialTab === 'qrcode') setTab('qrcode')
    }, [initialTab])

    const revealBalance = () => {
        if (!isBalanceHidden) {
            setIsBalanceHidden(true)
            return
        }
        setPendingAction(() => () => setIsBalanceHidden(false))
        setIsPinModalOpen(true)
    }

    const handleTransferClick = (e: React.FormEvent) => {
        e.preventDefault()
        setPendingAction(() => () => performTransfer())
        setIsPinModalOpen(true)
    }

    const copyAccountNumber = () => {
        if (myAccount) {
            navigator.clipboard.writeText(myAccount.accountNumber)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const resetStatus = () => { setStatus('idle'); setMessage('') }

    // ── Add Money ──
    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault()
        const amount = parseFloat(depositAmt)
        if (!amount || amount <= 0) { setStatus('error'); setMessage('Enter a valid amount.'); return }
        setStatus('loading'); setMessage('')
        try {
            const res = await fetch('/api/deposit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount })
            })
            const data = await res.json()
            if (res.ok) {
                setStatus('success')
                setMessage(data.message)
                setDepositAmt('')
                loadData()
            } else {
                setStatus('error'); setMessage(data.error || 'Deposit failed.')
            }
        } catch { setStatus('error'); setMessage('Network error.') }
    }

    // ── Send Money ──
    const performTransfer = async () => {
        const amount = parseFloat(formData.amount)
        setStatus('loading'); setMessage('')
        try {
            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetAccountNumber: formData.targetAccount.trim(),
                    amount,
                    description: formData.description,
                    type: 'TRANSFER'
                })
            })
            const data = await res.json()
            if (res.ok) {
                setStatus('success')
                setMessage(data.message || `Transfer successful! Ref: ${data.reference}`)
                setFormData({ targetAccount: '', amount: '', description: '' })
                loadData()
            } else {
                setStatus('error'); setMessage(data.error || 'Transfer failed.')
            }
        } catch { setStatus('error'); setMessage('Network error.') }
    }

    const StatusBanner = () => {
        if (status === 'idle') return null
        if (status === 'loading') return (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center gap-3 mb-6">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Processing…</p>
            </div>
        )
        return (
            <div className={`p-4 rounded-xl border flex items-start gap-3 mb-6 ${status === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
                {status === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
                <p className={`text-sm font-medium ${status === 'success' ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>{message}</p>
            </div>
        )
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Transfers & Payments</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Send money securely with transaction PIN protection.</p>
                    </div>
                </div>

                {/* Account Details Header */}
                {myAccount && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-600 text-white rounded-[32px] p-8 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-100">Your Account</p>
                            <p className="text-2xl font-mono font-bold mt-2 tracking-widest">{myAccount.accountNumber}</p>
                            <div className="mt-8 flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-blue-100/60 mb-1">Available Balance</p>
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-3xl font-black">
                                            {isBalanceHidden ? "₹ ••••••••" : `₹${myAccount.balance.toLocaleString('en-IN')}`}
                                        </h2>
                                        <button onClick={revealBalance} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                                            {isBalanceHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <button onClick={copyAccountNumber} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                                    {copied ? 'Copied!' : 'Copy No'}
                                </button>
                            </div>
                        </div>
                        <div className="bg-emerald-600 text-white rounded-[32px] p-8 shadow-xl relative overflow-hidden flex flex-col justify-center items-center text-center">
                            <QrCode className="w-12 h-12 mb-4 text-emerald-100" />
                            <h3 className="text-lg font-bold">Fast Payments</h3>
                            <p className="text-emerald-100 text-sm mt-1">Generate your QR for instant incoming transfers.</p>
                            <button onClick={() => setTab('qrcode')} className="mt-6 px-6 py-2.5 bg-white text-emerald-700 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-50 transition-colors">
                                View My QR
                            </button>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
                    {[
                        { id: 'send', label: 'Send Money', icon: Send },
                        { id: 'addmoney', label: 'Add Money', icon: PlusCircle },
                        { id: 'qrcode', label: 'My QR Code', icon: QrCode },
                    ].map(t => (
                        <button key={t.id} onClick={() => { setTab(t.id as any); resetStatus() }}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-[14px] font-bold text-xs uppercase tracking-widest transition-all ${tab === t.id ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-white/50'}`}>
                            <t.icon className="w-4 h-4" /> {t.label}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        {tab === 'addmoney' && (
                            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Add Funds</h2>
                                <StatusBanner />
                                <form onSubmit={handleDeposit} className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Amount to top-up (₹)</label>
                                        <input type="number" value={depositAmt} onChange={e => setDepositAmt(e.target.value)} placeholder="0.00" min="100" required
                                            className="w-full px-6 py-4 rounded-[20px] border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-2xl font-black focus:border-emerald-500 outline-none transition-all" />
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {[2000, 5000, 10000, 25000].map(amt => (
                                            <button key={amt} type="button" onClick={() => setDepositAmt(String(amt))}
                                                className={`px-4 py-2 text-xs font-bold rounded-xl border-2 transition-all ${depositAmt === String(amt) ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-emerald-500'}`}>
                                                ₹{amt.toLocaleString('en-IN')}
                                            </button>
                                        ))}
                                    </div>
                                    <button type="submit" disabled={status === 'loading'} className="w-full py-4 bg-emerald-600 text-white rounded-[20px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20">
                                        Confirm Deposit
                                    </button>
                                </form>
                            </div>
                        )}

                        {tab === 'send' && (
                            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Transfer Funds</h2>
                                <StatusBanner />
                                <form onSubmit={handleTransferClick} className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Recipient Account Number</label>
                                        <input type="text" value={formData.targetAccount} onChange={e => setFormData({ ...formData, targetAccount: e.target.value })} placeholder="Enter any account number" required
                                            className="w-full px-6 py-4 rounded-[20px] border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono text-lg font-bold focus:border-blue-500 outline-none transition-all" />
                                        <p className="text-[10px] text-slate-400 mt-3 font-medium">Supports both SAN Bank and outside account numbers (Demo).</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Amount (₹)</label>
                                        <input type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} placeholder="0.00" min="1" required
                                            className="w-full px-6 py-4 rounded-[20px] border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-2xl font-black focus:border-blue-500 outline-none transition-all" />
                                    </div>
                                    <button type="submit" disabled={status === 'loading'} className="w-full py-4 bg-blue-600 text-white rounded-[20px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-3">
                                        <Lock className="w-4 h-4" /> Secure Transfer
                                    </button>
                                </form>
                            </div>
                        )}

                        {tab === 'qrcode' && myAccount && user && (
                            <div className="flex justify-center">
                                <QRPaymentCode accountNumber={myAccount.accountNumber} name={user.name} balance={myAccount.balance} />
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-900 rounded-[32px] p-8 text-white">
                        <ShieldCheck className="w-10 h-10 text-blue-400 mb-6" />
                        <h3 className="text-xl font-bold">Secure Banking</h3>
                        <div className="mt-6 space-y-6">
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/30 flex-shrink-0">
                                    <span className="text-xs font-bold text-blue-400">1</span>
                                </div>
                                <p className="text-sm text-slate-400 leading-relaxed">Your <strong>Transaction PIN</strong> is required for all transfers and to view sensitive data.</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/30 flex-shrink-0">
                                    <span className="text-xs font-bold text-blue-400">2</span>
                                </div>
                                <p className="text-sm text-slate-400 leading-relaxed">Transfers to non-SAN accounts are processed as <strong>External Payments</strong>.</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/30 flex-shrink-0">
                                    <span className="text-xs font-bold text-blue-400">3</span>
                                </div>
                                <p className="text-sm text-slate-400 leading-relaxed">Use the <strong>QR Scanner</strong> mock up to pay friends instantly via their account ID.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <PinModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                onSuccess={() => {
                    setIsPinModalOpen(false)
                    if (pendingAction) {
                        pendingAction()
                        setPendingAction(null)
                    }
                }}
                autoSetup={true}
            />
        </DashboardLayout>
    )
}

function ShieldCheck(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" /></svg>
}
