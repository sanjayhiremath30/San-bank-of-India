"use client"

import React, { useState, useEffect } from 'react'
import { X, Delete, Loader2, Lock, ShieldCheck } from 'lucide-react'

interface PinModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    title?: string
    description?: string
    autoSetup?: boolean // If true, sets the PIN if not found
}

export function PinModal({
    isOpen,
    onClose,
    onSuccess,
    title = "Verify PIN",
    description = "Enter your 4-digit transaction PIN to proceed.",
    autoSetup = false
}: PinModalProps) {
    const [pin, setPin] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle')
    const [errorMsg, setErrorMsg] = useState('')
    const [hasPinSet, setHasPinSet] = useState<boolean | null>(null)

    useEffect(() => {
        if (isOpen) {
            setPin('')
            setStatus('idle')
            setErrorMsg('')
            checkPinStatus()
        }
    }, [isOpen])

    const checkPinStatus = async () => {
        try {
            const res = await fetch('/api/pin')
            const data = await res.json()
            setHasPinSet(data.hasPIN)
        } catch { }
    }

    const handleKeyClick = (num: string) => {
        if (status === 'loading') return
        setErrorMsg('')
        if (pin.length < 4) {
            const newPin = pin + num
            setPin(newPin)
            if (newPin.length === 4) {
                handleSubmit(newPin)
            }
        }
    }

    const handleDelete = () => {
        if (status === 'loading') return
        setPin(pin.slice(0, -1))
        setErrorMsg('')
    }

    const handleSubmit = async (finalPin: string) => {
        setStatus('loading')
        try {
            if (hasPinSet === false && autoSetup) {
                // Setup new PIN
                const res = await fetch('/api/pin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pin: finalPin })
                })
                if (res.ok) {
                    setStatus('success')
                    setTimeout(() => onSuccess(), 500)
                } else {
                    const data = await res.json()
                    setStatus('error')
                    setErrorMsg(data.error || "Setup failed")
                    setPin('')
                }
            } else {
                // Verify PIN
                const res = await fetch('/api/pin', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pin: finalPin })
                })
                const data = await res.json()
                if (data.valid) {
                    setStatus('success')
                    setTimeout(() => onSuccess(), 500)
                } else {
                    setStatus('error')
                    setErrorMsg("Invalid PIN. Please try again.")
                    setPin('')
                }
            }
        } catch {
            setStatus('error')
            setErrorMsg("Network error")
            setPin('')
        }
    }

    if (!isOpen) return null

    const displayTitle = (hasPinSet === false && autoSetup) ? "Set Transaction PIN" : title
    const displayDesc = (hasPinSet === false && autoSetup) ? "Choose a 4-digit PIN for securing your transactions." : description

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6 text-center">
                    <div className="flex justify-end">
                        <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        {(hasPinSet === false && autoSetup) ? <ShieldCheck className="w-8 h-8 text-blue-600" /> : <Lock className="w-8 h-8 text-blue-600" />}
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{displayTitle}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 px-4">{displayDesc}</p>

                    {/* PIN Dots */}
                    <div className="flex justify-center gap-4 my-8">
                        {[0, 1, 2, 3].map(i => (
                            <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${pin.length > i ? 'bg-blue-600 border-blue-600 scale-110 shadow-lg shadow-blue-500/30' : 'border-slate-200 dark:border-slate-700'}`} />
                        ))}
                    </div>

                    {errorMsg && <p className="text-xs font-semibold text-red-500 mb-4 animate-in shake-1 leading-none">{errorMsg}</p>}

                    {/* Keypad */}
                    <div className="grid grid-cols-3 gap-3 px-4 pb-8">
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                            <button key={num} onClick={() => handleKeyClick(num)}
                                className="h-14 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-all rounded-2xl text-xl font-bold text-slate-900 dark:text-white">
                                {num}
                            </button>
                        ))}
                        <div />
                        <button onClick={() => handleKeyClick('0')}
                            className="h-14 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-all rounded-2xl text-xl font-bold text-slate-900 dark:text-white">
                            0
                        </button>
                        <button onClick={handleDelete}
                            className="h-14 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-all rounded-2xl">
                            <Delete className="w-6 h-6" />
                        </button>
                    </div>

                    {status === 'loading' && (
                        <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
