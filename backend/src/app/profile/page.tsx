"use client"

import React, { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/dashboard/dashboard-layout'
import { formatCurrency } from '@/lib/utils'
import { User, Mail, Calendar, Shield, CreditCard, CheckCircle, XCircle, Loader2, Edit2, X, FileText, AlertCircle } from 'lucide-react'

interface Loan {
    id: string; type: string; amount: number; interestRate: number
    tenureMonths: number; emiAmount: number; remainingAmt: number; status: string; createdAt: string
}
interface UserData {
    name: string; email: string; role: string; kycStatus: boolean; createdAt: string
    accounts: Array<{ id: string; type: string; accountNumber: string; balance: number; isFrozen: boolean }>
    loans: Loan[]
}

export default function ProfilePage() {
    const [user, setUser] = useState<UserData | null>(null)
    const [loans, setLoans] = useState<Loan[]>([])
    const [loading, setLoading] = useState(true)
    const [activeSection, setActiveSection] = useState<'info' | 'kyc' | 'loans'>('info')

    // Edit profile state
    const [editMode, setEditMode] = useState(false)
    const [editName, setEditName] = useState('')
    const [profileStatus, setProfileStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [profileMsg, setProfileMsg] = useState('')

    // KYC state
    const [kyc, setKyc] = useState({ aadhaar: '', pan: '', dob: '', address: '' })
    const [kycStatus, setKycStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [kycMsg, setKycMsg] = useState('')

    // Loan apply state
    const [loanForm, setLoanForm] = useState({ type: 'PERSONAL', amount: '', tenureMonths: '36' })
    const [loanStatus, setLoanStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [loanMsg, setLoanMsg] = useState('')

    const loadData = useCallback(() => {
        Promise.all([
            fetch('/api/user').then(r => r.json()),
            fetch('/api/loans').then(r => r.json())
        ]).then(([userData, loanData]) => {
            if (userData.user) {
                setUser(userData.user)
                setEditName(userData.user.name || '')
            }
            if (loanData.loans) setLoans(loanData.loans)
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [])

    useEffect(() => { loadData() }, [loadData])

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setProfileStatus('loading'); setProfileMsg('')
        const res = await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: editName }) })
        const data = await res.json()
        if (res.ok) {
            setProfileStatus('success'); setProfileMsg('Profile updated!'); setUser(prev => prev ? { ...prev, name: data.name } : prev); setEditMode(false)
            setTimeout(() => setProfileStatus('idle'), 3000)
        } else { setProfileStatus('error'); setProfileMsg(data.error || 'Update failed.') }
    }

    const handleKYC = async (e: React.FormEvent) => {
        e.preventDefault()
        setKycStatus('loading'); setKycMsg('')
        const res = await fetch('/api/kyc', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(kyc) })
        const data = await res.json()
        if (res.ok) {
            setKycStatus('success'); setKycMsg(data.message)
            setUser(prev => prev ? { ...prev, kycStatus: true } : prev)
        } else { setKycStatus('error'); setKycMsg(data.error || 'KYC submission failed.') }
    }

    const handleLoanApply = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoanStatus('loading'); setLoanMsg('')
        const res = await fetch('/api/loans', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: loanForm.type, amount: parseFloat(loanForm.amount), tenureMonths: parseInt(loanForm.tenureMonths) })
        })
        const data = await res.json()
        if (res.ok) {
            setLoanStatus('success'); setLoanMsg(data.message)
            setLoans(prev => [data.loan, ...prev])
            setLoanForm({ type: 'PERSONAL', amount: '', tenureMonths: '36' })
        } else { setLoanStatus('error'); setLoanMsg(data.error || 'Application failed.') }
    }

    // EMI preview
    const previewEMI = () => {
        const amount = parseFloat(loanForm.amount)
        const tenure = parseInt(loanForm.tenureMonths)
        const rates: Record<string, number> = { PERSONAL: 12.5, HOME: 8.5, CAR: 9.0, EDUCATION: 7.5, BUSINESS: 14.0 }
        const r = (rates[loanForm.type] || 12) / 100 / 12
        if (!amount || !tenure || r === 0) return 0
        return Math.round(amount * r * Math.pow(1 + r, tenure) / (Math.pow(1 + r, tenure) - 1))
    }

    const initials = (user?.name || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    const StatusAlert = ({ status, msg }: { status: string, msg: string }) => {
        if (status === 'idle' || !msg) return null
        const styles: Record<string, string> = {
            success: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400',
            error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400',
        }
        const Icon = status === 'success' ? CheckCircle : status === 'error' ? XCircle : AlertCircle
        return (
            <div className={`flex items-start gap-3 p-4 rounded-xl border mb-4 ${styles[status] || ''}`}>
                <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{msg}</p>
            </div>
        )
    }

    if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div></DashboardLayout>

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account, KYC, and loans.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Avatar Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-center shadow-sm">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                                {initials}
                            </div>
                            <h2 className="text-base font-bold text-slate-900 dark:text-white">{user?.name}</h2>
                            <p className="text-slate-500 text-xs mt-1">{user?.email}</p>
                            <div className="mt-3 flex justify-center gap-2 flex-wrap">
                                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{user?.role}</span>
                                <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${user?.kycStatus ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                    {user?.kycStatus ? '✓ KYC Verified' : '⚠ KYC Pending'}
                                </span>
                            </div>
                        </div>

                        {/* Nav */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 shadow-sm space-y-1">
                            {[
                                { key: 'info', label: 'Personal Info', icon: User },
                                { key: 'kyc', label: 'KYC Verification', icon: Shield },
                                { key: 'loans', label: 'Loans', icon: FileText },
                            ].map(({ key, label, icon: Icon }) => (
                                <button key={key} onClick={() => setActiveSection(key as any)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left ${activeSection === key ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                    <Icon className="w-4 h-4" /> {label}
                                </button>
                            ))}
                        </div>

                        {/* Accounts Summary */}
                        {(user?.accounts?.length || 0) > 0 && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Linked Accounts</p>
                                {user?.accounts?.map((acc: any) => (
                                    <div key={acc.id} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-blue-600" />
                                            <span className="font-mono text-xs text-slate-500">*{acc.accountNumber?.slice(-4)}</span>
                                        </div>
                                        <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(acc.balance)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Main Panel */}
                    <div className="lg:col-span-3">

                        {/* ── Personal Info ── */}
                        {activeSection === 'info' && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-slate-900 dark:text-white">Personal Information</h3>
                                    {!editMode ? (
                                        <button onClick={() => { setEditMode(true); setProfileStatus('idle') }}
                                            className="flex items-center gap-2 text-sm font-semibold text-blue-600 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 transition-colors">
                                            <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                                        </button>
                                    ) : (
                                        <button onClick={() => { setEditMode(false); setEditName(user?.name || '') }}
                                            className="flex items-center gap-2 text-sm font-semibold text-slate-500 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 transition-colors">
                                            <X className="w-3.5 h-3.5" /> Cancel
                                        </button>
                                    )}
                                </div>
                                <StatusAlert status={profileStatus} msg={profileMsg} />
                                {editMode ? (
                                    <form onSubmit={handleSaveProfile} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Full Name *</label>
                                            <input type="text" value={editName} onChange={e => setEditName(e.target.value)} required minLength={2}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email (read-only)</label>
                                            <input type="email" value={user?.email || ''} disabled
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-700 text-slate-500 cursor-not-allowed" />
                                        </div>
                                        <button type="submit" disabled={profileStatus === 'loading'}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-bold transition-colors">
                                            {profileStatus === 'loading' ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : '💾 Save Changes'}
                                        </button>
                                    </form>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {[
                                            { icon: User, label: 'Full Name', value: user?.name || 'Not set' },
                                            { icon: Mail, label: 'Email', value: user?.email || '' },
                                            { icon: Shield, label: 'Role', value: user?.role },
                                            { icon: Calendar, label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A' },
                                        ].map(({ icon: Icon, label, value }) => (
                                            <div key={label} className="flex items-start gap-3">
                                                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg flex-shrink-0"><Icon className="w-4 h-4 text-slate-500" /></div>
                                                <div><p className="text-xs text-slate-500 dark:text-slate-400">{label}</p><p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 break-words">{value}</p></div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── KYC Verification ── */}
                        {activeSection === 'kyc' && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl"><Shield className="w-5 h-5 text-blue-600" /></div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">KYC Verification</h3>
                                        <p className="text-xs text-slate-500">Required for higher transaction limits & loans</p>
                                    </div>
                                </div>

                                {user?.kycStatus ? (
                                    <div className="text-center py-10">
                                        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                                        <h4 className="text-xl font-bold text-slate-900 dark:text-white">KYC Verified!</h4>
                                        <p className="text-slate-500 text-sm mt-2">Your identity has been verified. You have full access to all banking features.</p>
                                    </div>
                                ) : (
                                    <>
                                        <StatusAlert status={kycStatus} msg={kycMsg} />
                                        <form onSubmit={handleKYC} className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Aadhaar Number *</label>
                                                    <input type="text" value={kyc.aadhaar} onChange={e => setKyc({ ...kyc, aadhaar: e.target.value })} placeholder="1234 5678 9012" required maxLength={14}
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">PAN Number *</label>
                                                    <input type="text" value={kyc.pan} onChange={e => setKyc({ ...kyc, pan: e.target.value.toUpperCase() })} placeholder="ABCDE1234F" required maxLength={10}
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Date of Birth *</label>
                                                    <input type="date" value={kyc.dob} onChange={e => setKyc({ ...kyc, dob: e.target.value })} required
                                                        max={new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Full Address *</label>
                                                    <input type="text" value={kyc.address} onChange={e => setKyc({ ...kyc, address: e.target.value })} placeholder="House No., Street, City, State, PIN" required
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                                </div>
                                            </div>
                                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-400">
                                                ⚠️ Enter genuine details. Your information is encrypted and secured. Fake submissions will be rejected.
                                            </div>
                                            <button type="submit" disabled={kycStatus === 'loading'}
                                                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-bold transition-colors">
                                                {kycStatus === 'loading' ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</> : <><Shield className="w-4 h-4" /> Submit for Verification</>}
                                            </button>
                                        </form>
                                    </>
                                )}
                            </div>
                        )}

                        {/* ── Loans ── */}
                        {activeSection === 'loans' && (
                            <div className="space-y-6">
                                {/* Apply for Loan */}
                                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl"><FileText className="w-5 h-5 text-purple-600" /></div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white">Apply for a Loan</h3>
                                            {!user?.kycStatus && <p className="text-xs text-amber-600 mt-0.5">⚠ KYC verification required. Go to KYC tab first.</p>}
                                        </div>
                                    </div>
                                    <StatusAlert status={loanStatus} msg={loanMsg} />
                                    <form onSubmit={handleLoanApply} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Loan Type *</label>
                                                <select value={loanForm.type} onChange={e => setLoanForm({ ...loanForm, type: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                                                    <option value="PERSONAL">Personal (12.5%)</option>
                                                    <option value="HOME">Home (8.5%)</option>
                                                    <option value="CAR">Car (9.0%)</option>
                                                    <option value="EDUCATION">Education (7.5%)</option>
                                                    <option value="BUSINESS">Business (14.0%)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Amount (₹) *</label>
                                                <input type="number" value={loanForm.amount} onChange={e => setLoanForm({ ...loanForm, amount: e.target.value })}
                                                    placeholder="Min ₹10,000" min="10000" max="10000000" required
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Tenure (months) *</label>
                                                <select value={loanForm.tenureMonths} onChange={e => setLoanForm({ ...loanForm, tenureMonths: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                                                    {[12, 24, 36, 48, 60, 84, 120].map(m => <option key={m} value={m}>{m} months ({Math.round(m / 12)} yr{m > 12 ? 's' : ''})</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        {loanForm.amount && parseFloat(loanForm.amount) >= 10000 && (
                                            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
                                                <p className="text-sm font-semibold text-purple-700 dark:text-purple-400">
                                                    Estimated EMI: <span className="text-xl">₹{previewEMI().toLocaleString('en-IN')}</span>/month
                                                </p>
                                                <p className="text-xs text-slate-500 mt-1">Total payable: ₹{(previewEMI() * parseInt(loanForm.tenureMonths)).toLocaleString('en-IN')}</p>
                                            </div>
                                        )}
                                        <button type="submit" disabled={loanStatus === 'loading' || !user?.kycStatus}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 disabled:text-slate-500 text-white rounded-xl text-sm font-bold transition-colors">
                                            {loanStatus === 'loading' ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : <><FileText className="w-4 h-4" /> Apply for Loan</>}
                                        </button>
                                        {!user?.kycStatus && <p className="text-xs text-amber-600">Complete KYC verification first to apply for loans.</p>}
                                    </form>
                                </div>

                                {/* Existing Loans */}
                                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">My Loans ({loans.length})</h3>
                                    {loans.length === 0 ? (
                                        <div className="text-center py-10">
                                            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                                            <p className="text-slate-500">No loans yet. Apply above to get started.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {loans.map(loan => (
                                                <div key={loan.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                                    <div className="flex justify-between items-start flex-wrap gap-2">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">{loan.type}</span>
                                                                <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${loan.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : loan.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                                                    {loan.status}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(loan.amount)} · {loan.tenureMonths} months @ {loan.interestRate}%</p>
                                                            <p className="text-xs text-slate-500 mt-0.5">EMI: ₹{loan.emiAmount.toLocaleString('en-IN')}/month · Remaining: {formatCurrency(loan.remainingAmt)}</p>
                                                        </div>
                                                        <p className="text-xs text-slate-400">{new Date(loan.createdAt).toLocaleDateString('en-IN')}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
