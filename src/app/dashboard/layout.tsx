'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, ArrowLeftRight, Target, PiggyBank,
  BarChart3, Settings, LogOut, TrendingUp, Sun, Moon,
  Menu, X, Bell, ChevronRight, Wallet, Tag, ChevronDown
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { getInitials } from '@/lib/utils'

interface User { id: string; name: string; email: string; currency: string }

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/transactions', icon: ArrowLeftRight, label: 'Transaksi' },
  { href: '/dashboard/budgets', icon: Target, label: 'Anggaran' },
  { href: '/dashboard/savings', icon: PiggyBank, label: 'Target Tabungan' },
  { href: '/dashboard/reports', icon: BarChart3, label: 'Laporan' },
  { href: '/dashboard/accounts', icon: Wallet, label: 'Akun' },
  { href: '/dashboard/categories', icon: Tag, label: 'Kategori' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    fetch('/api/auth/me').then(res => {
      if (!res.ok) { router.push('/'); return }
      return res.json()
    }).then(data => {
      if (data) setUser(data)
    }).finally(() => setLoading(false))
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080a12] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center animate-pulse">
            <TrendingUp size={24} className="text-white" />
          </div>
          <div className="flex gap-1">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`${mobile ? 'w-full' : 'w-64'} flex flex-col h-full`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-[#1e263c]">
        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <TrendingUp size={18} className="text-white" />
        </div>
        <div>
          <span className="text-white font-bold text-lg leading-none" style={{ fontFamily: 'Clash Display, sans-serif' }}>FinTrack</span>
          <span className="text-indigo-400 font-bold text-lg leading-none"> Pro</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                active
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30'
                  : 'text-slate-400 hover:bg-[#111827] hover:text-slate-200'
              }`}
            >
              <item.icon size={18} className={active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'} />
              <span>{item.label}</span>
              {active && <ChevronRight size={14} className="ml-auto text-indigo-400" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-[#1e263c] space-y-2">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-[#111827] hover:text-slate-200 transition-all"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          {theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
        </button>

        {/* User */}
        <div className="flex items-center gap-3 px-3 py-2.5 bg-[#111827] rounded-xl">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user ? getInitials(user.name) : '??'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-slate-500 text-xs truncate">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors flex-shrink-0">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex bg-[rgb(var(--bg))]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-[#0d111e] border-r border-[#1e263c] flex-col fixed inset-y-0 left-0 z-40">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-[#0d111e] border-r border-[#1e263c] z-50 flex flex-col lg:hidden"
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
              <Sidebar mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top navbar */}
        <header className="sticky top-0 z-30 bg-[rgb(var(--bg))]/80 backdrop-blur-xl border-b border-[rgb(var(--surface-border))] px-4 lg:px-8 h-16 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-400 hover:text-white p-1"
          >
            <Menu size={22} />
          </button>

          <div className="flex-1">
            <h2 className="text-[rgb(var(--text-secondary))] text-sm hidden sm:block">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative p-2 text-slate-400 hover:text-white hover:bg-[rgb(var(--surface))] rounded-xl transition-all">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
            </button>

            <div className="hidden sm:flex items-center gap-2 bg-[rgb(var(--surface))] border border-[rgb(var(--surface-border))] rounded-xl px-3 py-1.5">
              <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-md flex items-center justify-center text-white text-xs font-bold">
                {user ? getInitials(user.name) : '?'}
              </div>
              <span className="text-sm font-medium text-[rgb(var(--text-primary))]">{user?.name?.split(' ')[0]}</span>
              <ChevronDown size={14} className="text-[rgb(var(--text-muted))]" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-4 lg:p-8 page-enter">
          {children}
        </div>
      </main>
    </div>
  )
}
