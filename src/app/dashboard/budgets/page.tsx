'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, AlertTriangle, CheckCircle, Trash2, X, Target } from 'lucide-react'
import { formatCurrency, calculatePercentage } from '@/lib/utils'

interface Category { id: string; name: string; icon: string; color: string }
interface Budget {
  id: string; name: string; amount: number; spent: number; alertAt: number; month: number; year: number
  category: { id: string; name: string; icon: string; color: string }
}

const MONTH_NAMES = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
const CATEGORY_EMOJI: Record<string, string> = {
  briefcase:'💼','code-bracket':'💻','chart-bar':'📊',gift:'🎁',cake:'🍔',truck:'🚗',
  'shopping-bag':'🛍️','musical-note':'🎵','document-text':'📄',heart:'❤️','academic-cap':'🎓',tag:'🏷️',
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [form, setForm] = useState({
    name: '', amount: '', month: now.getMonth() + 1, year: now.getFullYear(),
    alertAt: 80, categoryId: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchBudgets = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/budgets?month=${selectedMonth}&year=${selectedYear}`)
      setBudgets(await res.json())
    } finally { setLoading(false) }
  }, [selectedMonth, selectedYear])

  useEffect(() => { fetchBudgets() }, [fetchBudgets])

  useEffect(() => {
    fetch('/api/categories?type=expense').then(r => r.json()).then(setCategories)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount), alertAt: Number(form.alertAt) }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      setShowForm(false)
      setForm({ name: '', amount: '', month: selectedMonth, year: selectedYear, alertAt: 80, categoryId: '' })
      fetchBudgets()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menyimpan')
    } finally { setSubmitting(false) }
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/budgets/${id}`, { method: 'DELETE' })
    setDeleteId(null)
    fetchBudgets()
  }

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0)
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0)
  const overBudget = budgets.filter(b => b.spent > b.amount)
  const warningBudget = budgets.filter(b => b.spent <= b.amount && calculatePercentage(b.spent, b.amount) >= b.alertAt)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]" style={{ fontFamily: 'Clash Display, sans-serif' }}>Anggaran</h1>
          <p className="text-[rgb(var(--text-secondary))] text-sm mt-0.5">Kelola target pengeluaran bulanan</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all">
          <Plus size={16} /> Tambah Budget
        </button>
      </div>

      {/* Month selector */}
      <div className="flex gap-2 items-center">
        <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}
          className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--surface-border))] text-[rgb(var(--text-primary))] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500">
          {MONTH_NAMES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}
          className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--surface-border))] text-[rgb(var(--text-primary))] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500">
          {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Summary */}
      {!loading && budgets.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Budget', value: formatCurrency(totalBudget), color: 'text-indigo-400' },
            { label: 'Total Terpakai', value: formatCurrency(totalSpent), color: 'text-[rgb(var(--text-primary))]' },
            { label: 'Sisa Budget', value: formatCurrency(Math.max(0, totalBudget - totalSpent)), color: 'text-emerald-500' },
            { label: 'Melebihi Budget', value: `${overBudget.length} kategori`, color: overBudget.length > 0 ? 'text-red-400' : 'text-emerald-500' },
          ].map(s => (
            <div key={s.label} className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--surface-border))] rounded-2xl p-4">
              <p className="text-[rgb(var(--text-muted))] text-xs mb-1">{s.label}</p>
              <p className={`${s.color} font-bold text-sm`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Alerts */}
      {!loading && (overBudget.length > 0 || warningBudget.length > 0) && (
        <div className="space-y-2">
          {overBudget.map(b => (
            <div key={b.id} className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm">
                <span className="font-semibold">{b.category.name}</span> melebihi anggaran sebesar {formatCurrency(b.spent - b.amount)}
              </p>
            </div>
          ))}
          {warningBudget.map(b => (
            <div key={b.id} className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
              <AlertTriangle size={16} className="text-amber-400 flex-shrink-0" />
              <p className="text-amber-300 text-sm">
                <span className="font-semibold">{b.category.name}</span> sudah mencapai {calculatePercentage(b.spent, b.amount)}% dari anggaran
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Budget cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-40 rounded-2xl skeleton" />)}
        </div>
      ) : budgets.length === 0 ? (
        <div className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--surface-border))] rounded-2xl py-16 text-center">
          <Target size={40} className="text-slate-600 mx-auto mb-3" />
          <p className="text-[rgb(var(--text-muted))] text-sm">Belum ada anggaran untuk periode ini</p>
          <button onClick={() => setShowForm(true)} className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
            + Buat anggaran pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {budgets.map((b, i) => {
            const pct = calculatePercentage(b.spent, b.amount)
            const isOver = b.spent > b.amount
            const isWarn = !isOver && pct >= b.alertAt
            const barColor = isOver ? '#ef4444' : isWarn ? '#f59e0b' : b.category.color
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--surface-border))] rounded-2xl p-5 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${b.category.color}20` }}>
                      {CATEGORY_EMOJI[b.category.icon] || '🏷️'}
                    </div>
                    <div>
                      <p className="text-[rgb(var(--text-primary))] font-semibold text-sm">{b.category.name}</p>
                      <p className="text-[rgb(var(--text-muted))] text-xs">{b.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {isOver ? <AlertTriangle size={14} className="text-red-400" /> :
                      isWarn ? <AlertTriangle size={14} className="text-amber-400" /> :
                        <CheckCircle size={14} className="text-emerald-500" />}
                    <button onClick={() => setDeleteId(b.id)}
                      className="ml-1 p-1 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-500/10">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[rgb(var(--text-secondary))] text-sm">{formatCurrency(b.spent)}</span>
                    <span className="text-[rgb(var(--text-muted))] text-sm">dari {formatCurrency(b.amount)}</span>
                  </div>
                  <div className="h-3 bg-[rgb(var(--surface))] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(pct, 100)}%` }}
                      transition={{ delay: 0.3 + i * 0.05, duration: 0.7, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: barColor }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    isOver ? 'bg-red-500/15 text-red-400' :
                      isWarn ? 'bg-amber-500/15 text-amber-400' :
                        'bg-emerald-500/15 text-emerald-500'
                  }`}>
                    {pct}% terpakai
                  </span>
                  <span className="text-[rgb(var(--text-muted))] text-xs">
                    {isOver ? `lebih ${formatCurrency(b.spent - b.amount)}` : `sisa ${formatCurrency(b.amount - b.spent)}`}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Add form modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70" onClick={() => setShowForm(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-[#0d111e] border border-[#1e263c] rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-bold text-lg">Tambah Budget</h3>
                <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-1.5">Nama Budget</label>
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="cth: Budget Makanan Maret" required
                    className="w-full bg-[#111827] border border-[#1e263c] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all placeholder-slate-600" />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-1.5">Kategori</label>
                  <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} required
                    className="w-full bg-[#111827] border border-[#1e263c] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500">
                    <option value="">Pilih kategori...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-1.5">Nominal Budget (Rp)</label>
                  <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    placeholder="0" required
                    className="w-full bg-[#111827] border border-[#1e263c] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-sm block mb-1.5">Bulan</label>
                    <select value={form.month} onChange={e => setForm(f => ({ ...f, month: Number(e.target.value) }))}
                      className="w-full bg-[#111827] border border-[#1e263c] text-white rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-indigo-500">
                      {MONTH_NAMES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 text-sm block mb-1.5">Tahun</label>
                    <select value={form.year} onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))}
                      className="w-full bg-[#111827] border border-[#1e263c] text-white rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-indigo-500">
                      {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-1.5">Peringatan di {form.alertAt}%</label>
                  <input type="range" min={50} max={100} value={form.alertAt}
                    onChange={e => setForm(f => ({ ...f, alertAt: Number(e.target.value) }))}
                    className="w-full" />
                </div>
                <button type="submit" disabled={submitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                  {submitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menyimpan...</> : '+ Tambah Budget'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70" onClick={() => setDeleteId(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-[#0d111e] border border-[#1e263c] rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
              <Trash2 size={28} className="text-red-400 mx-auto mb-3" />
              <h3 className="text-white font-bold mb-2">Hapus Budget?</h3>
              <p className="text-slate-400 text-sm mb-5">Budget yang dihapus tidak bisa dipulihkan.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-300 bg-[#111827]">Batal</button>
                <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-500 transition-all">Hapus</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
