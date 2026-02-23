"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, Mail, Lock, Loader2, ArrowRight } from "lucide-react"
import axios from "axios"

export default function RegisterPage() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [accountType, setAccountType] = useState("SAVINGS")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const response = await axios.post("/api/auth/register", {
                name,
                email,
                password,
                accountType,
            })

            if (response.status === 201) {
                router.push("/login?registered=true")
            }
        } catch (err: any) {
            setError(err.response?.data?.error || "Registration failed. Try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create an account</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Join San Bank for a smarter way to manage money.</p>
            </div>

            {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                            placeholder="John Doe"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                            placeholder="name@example.com"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Account Type</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setAccountType("SAVINGS")}
                            className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${accountType === "SAVINGS"
                                    ? "bg-indigo-50 border-indigo-200 text-indigo-700 ring-2 ring-indigo-500/20 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-300"
                                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
                                }`}
                        >
                            Savings Account
                        </button>
                        <button
                            type="button"
                            onClick={() => setAccountType("CURRENT")}
                            className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${accountType === "CURRENT"
                                    ? "bg-indigo-50 border-indigo-200 text-indigo-700 ring-2 ring-indigo-500/20 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-300"
                                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
                                }`}
                        >
                            Current Account
                        </button>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 ml-1 px-1">
                        {accountType === "SAVINGS"
                            ? "Min. balance: ₹1000 | Interest: 4% yearly"
                            : "No min. balance | Higher transfer limits"}
                    </p>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 px-1 italic">
                    By signing up, you agree to our Terms of Service and Privacy Policy.
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold font-bold shadow-lg shadow-indigo-500/30 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 group"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>
                            Create Account
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </>
                    )}
                </button>
            </form>

            <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-4">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-bold">Sign In</Link>
            </p>
        </div>
    )
}
