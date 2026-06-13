'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight,
  Plus, RefreshCw, AlertTriangle
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import { formatCurrency, formatDate, calculatePercentage } from '@/lib/utils'
import { TransactionModal } from '@/components/TransactionModal'

interface DashboardData {
  summary: {
    totalBalance: number
    income: number
    expense: number
    profit: number
    incomeChange: number
    expenseChange: number
  }
  accounts: Array<{ id: string; name: string; type: string; balance: number; color: string; icon: string }>
  monthlyData: Array<{ month: string; income: number; expense: number; profit: number }>
  categoryBreakdown: Array<{ name: string; value: number; color: string; icon: string }>
  recentTransactions: Array<{
    id: string; type: string; amount: number; description: string; date: string
    category: { name: string; color: string; icon: string }
    account: { name: string; type: string }
  }>
  budgets: Array<{
    id: string; name: string; amount: number; spent: number; alertAt: number
    category: { name: string; color: string; icon: string }
  }>
}

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
}

function StatCard({
  title, value, change, icon: Icon, color, delay
}: {
  title: string; value: string; change?: number; icon: React.ElementType; color: string; delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--surface-border))] rounded-2xl p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[rgb(var(--text-secondary))] text-sm mb-1">{title}</p>
          <p className="text-[rgb(var(--text-primary))] text-2xl font-bold tabular">{value}</p>
        </div>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
          <Icon size={22} style={{ color }} />
        </div>
      </div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 text-sm ${change >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
          {change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          <span>{Math.abs(change).toFixed(1)}% vs bulan lalu</span>
        </div>
      )}
    </motion.div>
  )
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{color: string; name: string; value: number}>; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0d111e] border border-[#1e263c] rounded-xl p-3 shadow-2xl">
      <p className="text-slate-400 text-xs mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="text-white font-semibold">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'income' | 'expense'>('income')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/dashboard')
      const json = await res.json()
      setData(json)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const openModal = (type: 'income' | 'expense') => {
    setModalType(type)
    setShowModal(true)
  }

  if (loading) return <DashboardSkeleton />

  if (!data) return <div className="text-center text-slate-400 py-20">Gagal memuat data</div>

  const { summary, accounts, monthlyData, categoryBreakdown, recentTransactions, budgets } = data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]" style={{ fontFamily: 'Clash Display, sans-serif' }}>
            Dashboard
          </h1>
          <p className="text-[rgb(var(--text-secondary))] text-sm mt-0.5">
            {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData} className="p-2 text-slate-400 hover:text-white hover:bg-[rgb(var(--surface))] rounded-xl transition-all">
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => openModal('income')}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
          >
            <Plus size={16} />
            <span className="hidden sm:block">Pemasukan</span>
          </button>
          <button
            onClick={() => openModal('expense')}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
          >
            <Plus size={16} />
            <span className="hidden sm:block">Pengeluaran</span>
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Saldo" value={formatCurrency(summary.totalBalance)} icon={Wallet} color="#6366f1" delay={0} />
        <StatCard title="Pemasukan" value={formatCurrency(summary.income)} change={summary.incomeChange} icon={TrendingUp} color="#10b981" delay={0.05} />
        <StatCard title="Pengeluaran" value={formatCurrency(summary.expense)} change={summary.expenseChange} icon={TrendingDown} color="#ef4444" delay={0.1} />
        <StatCard
          title={summary.profit >= 0 ? 'Keuntungan' : 'Kerugian'}
          value={formatCurrency(Math.abs(summary.profit))}
          icon={summary.profit >= 0 ? ArrowUpRight : ArrowDownRight}
          color={summary.profit >= 0 ? '#10b981' : '#ef4444'}
          delay={0.15}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area chart */}
        <motion.div {...fadeUp} transition={{ delay: 0.2, duration: 0.4 }}
          className="lg:col-span-2 bg-[rgb(var(--bg-card))] border border-[rgb(var(--surface-border))] rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">Tren Keuangan 6 Bulan</h3>
            <div className="flex gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5"><div className="w-3 h-1 bg-emerald-500 rounded" /> Pemasukan</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-1 bg-red-400 rounded" /> Pengeluaran</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000000).toFixed(0)}M`} width={40} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="income" name="Pemasukan" stroke="#10b981" strokeWidth={2} fill="url(#incomeGrad)" />
              <Area type="monotone" dataKey="expense" name="Pengeluaran" stroke="#ef4444" strokeWidth={2} fill="url(#expenseGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie chart */}
        <motion.div {...fadeUp} transition={{ delay: 0.25, duration: 0.4 }}
          className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--surface-border))] rounded-2xl p-6"
        >
          <h3 className="font-semibold text-[rgb(var(--text-primary))] mb-4">Pengeluaran per Kategori</h3>
          {categoryBreakdown.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={2}>
                    {categoryBreakdown.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={({ active, payload }) => {
                    if (!active || !payload?.[0]) return null
                    const d = payload[0].payload
                    return (
                      <div className="bg-[#0d111e] border border-[#1e263c] rounded-xl p-3 text-sm">
                        <p className="text-white font-medium">{d.name}</p>
                        <p className="text-slate-400">{formatCurrency(d.value)}</p>
                      </div>
                    )
                  }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {categoryBreakdown.slice(0, 4).map((c) => {
                  const total = categoryBreakdown.reduce((s, x) => s + x.value, 0)
                  const pct = calculatePercentage(c.value, total)
                  return (
                    <div key={c.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
                      <span className="text-[rgb(var(--text-secondary))] text-xs flex-1 truncate">{c.name}</span>
                      <span className="text-[rgb(var(--text-primary))] text-xs font-semibold">{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="h-40 flex items-center justify-center text-[rgb(var(--text-muted))] text-sm">
              Belum ada pengeluaran
            </div>
          )}
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent transactions */}
        <motion.div {...fadeUp} transition={{ delay: 0.3, duration: 0.4 }}
          className="lg:col-span-2 bg-[rgb(var(--bg-card))] border border-[rgb(var(--surface-border))] rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">Transaksi Terbaru</h3>
            <a href="/dashboard/transactions" className="text-indigo-400 text-sm hover:text-indigo-300 transition-colors">Lihat semua</a>
          </div>
          <div className="space-y-3">
            {recentTransactions.length === 0 ? (
              <div className="text-center text-[rgb(var(--text-muted))] py-8 text-sm">Belum ada transaksi</div>
            ) : (
              recentTransactions.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.03 }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[rgb(var(--surface))] transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                    style={{ backgroundColor: `${t.category.color}20` }}>
                    <span>{getCategoryEmoji(t.category.icon)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[rgb(var(--text-primary))] text-sm font-medium truncate">{t.description}</p>
                    <p className="text-[rgb(var(--text-muted))] text-xs">{t.category.name} · {formatDate(t.date)}</p>
                  </div>
                  <div className={`text-sm font-bold tabular ${t.type === 'income' ? 'text-emerald-500' : 'text-red-400'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Budgets */}
        <motion.div {...fadeUp} transition={{ delay: 0.35, duration: 0.4 }}
          className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--surface-border))] rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[rgb(var(--text-primary))]">Anggaran Bulan Ini</h3>
            <a href="/dashboard/budgets" className="text-indigo-400 text-sm hover:text-indigo-300 transition-colors">Kelola</a>
          </div>
          <div className="space-y-4">
            {budgets.length === 0 ? (
              <div className="text-center text-[rgb(var(--text-muted))] py-6 text-sm">
                <div className="text-3xl mb-2">🎯</div>
                Buat anggaran bulanan
              </div>
            ) : (
              budgets.slice(0, 5).map((b) => {
                const pct = calculatePercentage(b.spent, b.amount)
                const isOver = b.spent > b.amount
                const isWarning = pct >= b.alertAt && !isOver
                return (
                  <div key={b.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{getCategoryEmoji(b.category.icon)}</span>
                        <span className="text-[rgb(var(--text-primary))] text-sm font-medium">{b.category.name}</span>
                        {(isOver || isWarning) && <AlertTriangle size={12} className={isOver ? 'text-red-400' : 'text-amber-400'} />}
                      </div>
                      <span className="text-[rgb(var(--text-secondary))] text-xs">{pct}%</span>
                    </div>
                    <div className="h-2 bg-[rgb(var(--surface))] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(pct, 100)}%` }}
                        transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{
                          background: isOver ? '#ef4444' : isWarning ? '#f59e0b' : b.category.color,
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[rgb(var(--text-muted))] text-xs">{formatCurrency(b.spent)}</span>
                      <span className="text-[rgb(var(--text-muted))] text-xs">{formatCurrency(b.amount)}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </motion.div>
      </div>

      {/* Accounts row */}
      <motion.div {...fadeUp} transition={{ delay: 0.4, duration: 0.4 }}>
        <h3 className="font-semibold text-[rgb(var(--text-primary))] mb-3">Akun Keuangan</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {accounts.map((acc) => (
            <div key={acc.id} className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--surface-border))] rounded-2xl p-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${acc.color}20` }}>
                <span className="text-lg">{getAccountEmoji(acc.type)}</span>
              </div>
              <p className="text-[rgb(var(--text-muted))] text-xs mb-1">{acc.name}</p>
              <p className="text-[rgb(var(--text-primary))] font-bold text-sm tabular">{formatCurrency(acc.balance)}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {showModal && (
        <TransactionModal
          type={modalType}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchData() }}
        />
      )}
    </div>
  )
}

function getCategoryEmoji(icon: string): string {
  const map: Record<string, string> = {
    briefcase: '💼', 'code-bracket': '💻', 'chart-bar': '📊', gift: '🎁',
    cake: '🍔', truck: '🚗', 'shopping-bag': '🛍️', 'musical-note': '🎵',
    'document-text': '📄', heart: '❤️', 'academic-cap': '🎓',
    tag: '🏷️', wallet: '👛', star: '⭐',
  }
  return map[icon] || '💡'
}

function getAccountEmoji(type: string): string {
  const map: Record<string, string> = {
    kas: '💵', bank: '🏦', ewallet: '📱', custom: '💳',
  }
  return map[type] || '💰'
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-[rgb(var(--surface))] rounded-xl w-48" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-[rgb(var(--surface))] rounded-2xl skeleton" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-80 bg-[rgb(var(--surface))] rounded-2xl skeleton" />
        <div className="h-80 bg-[rgb(var(--surface))] rounded-2xl skeleton" />
      </div>
    </div>
  )
}
