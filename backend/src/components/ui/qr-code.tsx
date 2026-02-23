"use client"

import React, { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Download, Share2, Copy, CopyCheck } from 'lucide-react'

interface QRPaymentCodeProps {
    accountNumber: string
    name: string
    balance: number
}

export function QRPaymentCode({ accountNumber, name, balance }: QRPaymentCodeProps) {
    const [copied, setCopied] = useState(false)
    const paymentURL = `sanpay://transfer?acno=${accountNumber}&name=${encodeURIComponent(name)}`

    const copyToClipboard = () => {
        navigator.clipboard.writeText(accountNumber)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const downloadQR = () => {
        const svg = document.getElementById('payment-qr') as HTMLElement
        if (!svg) return
        const svgData = new XMLSerializer().serializeToString(svg)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()
        img.onload = () => {
            canvas.width = img.width
            canvas.height = img.height
            ctx?.drawImage(img, 0, 0)
            const pngFile = canvas.toDataURL('image/png')
            const downloadLink = document.createElement('a')
            downloadLink.download = `SANBANK_QR_${accountNumber}.png`
            downloadLink.href = pngFile
            downloadLink.click()
        }
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 p-8 shadow-sm text-center max-w-sm mx-auto">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Your QR Code</h3>
            <p className="text-xs text-slate-500 mb-8 uppercase tracking-widest font-semibold">Scan to pay instantly</p>

            <div className="p-4 bg-white rounded-3xl inline-block border-8 border-slate-50 shadow-inner mb-8">
                <QRCodeSVG
                    id="payment-qr"
                    value={paymentURL}
                    size={200}
                    level="H"
                    includeMargin={false}
                    imageSettings={{
                        src: "/logo.png", // Fallback if logo exists
                        x: undefined,
                        y: undefined,
                        height: 40,
                        width: 40,
                        excavate: true,
                    }}
                />
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Account Holder</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">{name}</p>
                <div className="flex items-center justify-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-400">{accountNumber}</span>
                    <button onClick={copyToClipboard} className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                        {copied ? <CopyCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={downloadQR}
                    className="flex flex-col items-center justify-center gap-2 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 transition-colors group"
                >
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl group-hover:scale-110 transition-transform">
                        <Download className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 dark:text-white uppercase">Download</span>
                </button>
                <button
                    onClick={() => alert("Sharing feature coming soon!")}
                    className="flex flex-col items-center justify-center gap-2 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 transition-colors group"
                >
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl group-hover:scale-110 transition-transform">
                        <Share2 className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 dark:text-white uppercase">Share</span>
                </button>
            </div>

            <p className="mt-8 text-[10px] text-slate-400 font-medium">
                Payments via QR are secured by your transaction PIN.
            </p>
        </div>
    )
}
