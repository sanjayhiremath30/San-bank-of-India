import React from "react"

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        SAN BANK
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
                        AI-Powered Digital Banking
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
                    {children}
                </div>
                <p className="text-center text-slate-400 dark:text-slate-600 text-xs mt-8">
                    &copy; {new Date().getFullYear()} San Bank of India. All rights reserved.
                </p>
            </div>
        </div>
    )
}
