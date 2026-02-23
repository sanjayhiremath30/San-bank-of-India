"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Bell, Search, User, CheckCircle, Info, AlertTriangle, XCircle, Trash2, Menu, X } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Notification {
    id: string
    title: string
    message: string
    type: string
    read: boolean
    createdAt: string
    link?: string
}

export function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
    const { data: session } = useSession()
    const router = useRouter()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [showDropdown, setShowDropdown] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications')
            const data = await res.json()
            if (data.notifications) {
                setNotifications(data.notifications)
                setUnreadCount(data.unreadCount)
            }
        } catch { }
    }

    useEffect(() => {
        fetchNotifications()
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowDropdown(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const markAsRead = async (id?: string) => {
        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(id ? { id } : { markAll: true })
            })
            fetchNotifications()
        } catch { }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'SUCCESS': return <CheckCircle className="w-4 h-4 text-emerald-500" />
            case 'WARNING': return <AlertTriangle className="w-4 h-4 text-amber-500" />
            case 'ERROR': return <XCircle className="w-4 h-4 text-red-500" />
            default: return <Info className="w-4 h-4 text-blue-500" />
        }
    }

    return (
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 relative z-50">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <div className="flex-1 max-w-xl hidden md:block">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search transactions, accounts..."
                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Notifications Bell */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className={`relative p-2 rounded-xl transition-colors ${showDropdown ? 'bg-slate-100 dark:bg-slate-800 text-blue-600' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center px-0.5">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {showDropdown && (
                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button onClick={() => markAsRead()} className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider">
                                        Mark all read
                                    </button>
                                )}
                            </div>
                            <div className="max-h-[350px] overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-10 text-center">
                                        <Bell className="w-8 h-8 text-slate-200 dark:text-slate-700 mx-auto mb-2" />
                                        <p className="text-xs text-slate-500 dark:text-slate-400">No notifications yet</p>
                                    </div>
                                ) : (
                                    notifications.map(n => (
                                        <div
                                            key={n.id}
                                            onClick={() => { if (!n.read) markAsRead(n.id); if (n.link) router.push(n.link); setShowDropdown(false); }}
                                            className={`p-4 border-b border-slate-50 dark:border-slate-800 last:border-0 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${!n.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                                        >
                                            <div className="flex gap-3">
                                                <div className="mt-0.5">{getIcon(n.type)}</div>
                                                <div className="flex-1">
                                                    <p className={`text-sm ${!n.read ? 'font-bold' : 'font-medium'} text-slate-900 dark:text-white`}>{n.title}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                                                    <p className="text-[10px] text-slate-400 mt-2">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(n.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-center">
                                <button className="text-[10px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white uppercase tracking-wider">
                                    View all activity
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2"></div>

                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">
                            {session?.user?.name || 'User'}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase mt-1">
                            {(session?.user as any)?.role || 'USER'} Account
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm overflow-hidden">
                        <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                </div>
            </div>
        </header>
    )
}
