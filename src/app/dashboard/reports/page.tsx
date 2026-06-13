'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Area, AreaChart
} from 'recharts'
import { FileDown, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { formatCurrency, calculatePercentage } from '@/lib/utils'

interface ReportData {
  summary: { totalIncome: number; totalExpense: number; profit: number }
  dailyCashflow: Array<{ date: string; income: number; expense: number }>
  expensesByCategory: Array<{ name: string; amount: number; percentage: number; color: string; icon: string }>
  incomesByCategory: Array<{ name: string; amount: number; percentage: number; color: string }>
  transactions: Array<{
    id: string; type: string; amount: number; description: string; date: string
    category: { name: string; color: string }; account: { name: string }
  }>
}

const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{color: string; name: string; value: number}>; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0d111e] border border-[#1e263c] rounded-xl p-3 shadow-xl text-sm">
      <p className="text-slate-400 text-xs mb-2">Hari ke-{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="text-white font-semibold">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function ReportsPage() {
  const now = new Date()
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/reports?month=${month}&year=${year}`)
      setData(await res.json())
    } finally { setLoading(false) }
  }, [month, year])

  useEffect(() => { fetchData() }, [fetchData])

  const exportCSV = () => {
    if (!data) return
    const rows = [
      ['Tanggal', 'Tipe', 'Deskripsi', 'Kategori', 'Akun', 'Nominal'],
      ...data.transactions.map(t => [
        new Date(t.date).toLocaleDateString('id-ID'),
        t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
        t.description, t.category.name, t.account.name,
        t.type === 'income' ? t.amount : -t.amount,
      ])
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = `laporan-${MONTHS[month - 1]}-${year}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]" style={{ fontFamily: 'Clash Display, sans-serif' }}>Laporan Keuangan</h1>
          <p className="text-[rgb(var(--text-secondary))] text-sm mt-0.5">Analitik mendalam keuangan Anda</p>
        </div>
        <button onClick={exportCSV}
          className="flex items-center gap-2 bg-[rgb(var(--bg-card))] border border-[rgb(var(--surface-border))] hover:border-indigo-500 text-[rgb(var(--text-primary))] px-4 py-2.5 rounded-xl text-sm font-semibold transition-all">
          <FileDown size={16} /> Export CSV
        </button>
      </div>

      {/* Period selector */}
      <div className="flex gap-2">
        <select value={month} onChange={e => setMonth(Number(e.target.value))}
          className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--surface-border))] text-[rgb(var(--text-primary))] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500">
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select value={year} onChange={e => setYear(Number(e.target.value))}
          className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--surface-border))] text-[rgb(var(--text-primary))] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500">
          {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-48 rounded-2xl skeleton" />)}
        </div>
      ) : !data ? <div className="text-center text-slate-400 py-20">Gagal memuat data</div> : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Pemasukan', value: data.summary.totalIncome, icon: TrendingUp, color: '#10b981', bg: 'bg-emerald-500/10' },
              { label: 'Total Pengeluaran', value: data.summary.totalExpense, icon: TrendingDown, color: '#ef4444', bg: 'bg-red-500/10' },
              {
                label: data.summary.profit >= 0 ? 'Keuntungan Bersih' : 'Defisit',
                value: data.summary.profit,
                icon: data.summary.profit >= 0 ? TrendingUp : Minus,
                color: data.summary.profit >= 0 ? '#10b981' : '#ef4444',
                bg: data.summary.profit >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'
              },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--surface-border))] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[rgb(var(--text-secondary))] text-sm">{s.label}</p>
                  <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center`}>
                    <s.icon size={18} style={{ color: s.color }} />
                  </div>
                </div>
                <p className="text-[rgb(var(--text-primary))] text-2xl font-bold tabular" style={{ color: s.color }}>
                  {formatCurrency(Math.abs(s.value))}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Daily cashflow chart */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--surface-border))] rounded-2xl p-6">
            <h3 className="font-semibold text-[rgb(var(--text-primary))] mb-5">Cashflow Harian — {MONTHS[month - 1]} {year}</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={data.dailyCashflow} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="rIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="rExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} width={40} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="income" name="Pemasukan" stroke="#10b981" strokeWidth={2} fill="url(#rIncome)" />
                <Area type="monotone" dataKey="expense" name="Pengeluaran" stroke="#ef4444" strokeWidth={2} fill="url(#rExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Category breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Expense by category */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--surface-border))] rounded-2xl p-6">
              <h3 className="font-semibold text-[rgb(var(--text-primary))] mb-5">Pengeluaran per Kategori</h3>
              {data.expensesByCategory.length === 0 ? (
                <div className="text-center text-[rgb(var(--text-muted))] py-8 text-sm">Belum ada data</div>
              ) : (
                <div className="flex gap-6">
                  <ResponsiveContainer width={140} height={140}>
                    <PieChart>
                      <Pie data={data.expensesByCategory} cx="50%" cy="50%" innerRadius={38} outerRadius={60} dataKey="amount" paddingAngle={2}>
                        {data.expensesByCategory.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2.5 min-w-0">
                    {data.expensesByCategory.slice(0, 6).map(c => (
                      <div key={c.name}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
                            <span className="text-[rgb(var(--text-secondary))] text-xs truncate">{c.name}</span>
                          </div>
                          <span className="text-[rgb(var(--text-primary))] text-xs font-bold ml-2">{c.percentage}%</span>
                        </div>
                        <div className="h-1.5 bg-[rgb(var(--surface))] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${c.percentage}%`, background: c.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Income by category */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--surface-border))] rounded-2xl p-6">
              <h3 className="font-semibold text-[rgb(var(--text-primary))] mb-5">Pemasukan per Kategori</h3>
              {data.incomesByCategory.length === 0 ? (
                <div className="text-center text-[rgb(var(--text-muted))] py-8 text-sm">Belum ada data</div>
              ) : (
                <div className="space-y-3">
                  {data.incomesByCategory.map(c => (
                    <div key={c.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[rgb(var(--text-secondary))] text-sm">{c.name}</span>
                        <div className="text-right">
                          <span className="text-[rgb(var(--text-primary))] text-sm font-semibold">{formatCurrency(c.amount)}</span>
                          <span className="text-[rgb(var(--text-muted))] text-xs ml-2">{c.percentage}%</span>
                        </div>
                      </div>
                      <div className="h-2 bg-[rgb(var(--surface))] rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${c.percentage}%` }}
                          transition={{ delay: 0.5, duration: 0.6 }}
                          className="h-full rounded-full" style={{ background: c.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Transactions table */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--surface-border))] rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-[rgb(var(--surface-border))]">
              <h3 className="font-semibold text-[rgb(var(--text-primary))]">
                Semua Transaksi — {data.transactions.length} transaksi
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgb(var(--surface-border))]">
                    {['Tanggal','Deskripsi','Kategori','Akun','Tipe','Nominal'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[rgb(var(--text-muted))] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgb(var(--surface-border))]">
                  {data.transactions.slice(0, 50).map(t => (
                    <tr key={t.id} className="hover:bg-[rgb(var(--surface))] transition-colors">
                      <td className="px-4 py-3 text-[rgb(var(--text-muted))] text-sm whitespace-nowrap">
                        {new Date(t.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                      </td>
                      <td className="px-4 py-3 text-[rgb(var(--text-primary))] text-sm max-w-[180px] truncate">{t.description}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${t.category.color}20`, color: t.category.color }}>
                          {t.category.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[rgb(var(--text-secondary))] text-sm">{t.account.name}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold ${t.type === 'income' ? 'text-emerald-500' : 'text-red-400'}`}>
                          {t.type === 'income' ? 'Masuk' : 'Keluar'}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-sm font-bold tabular ${t.type === 'income' ? 'text-emerald-500' : 'text-red-400'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}
