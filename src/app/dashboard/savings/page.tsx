'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, X, PiggyBank, Target } from 'lucide-react'
import { formatCurrency, formatDate, calculatePercentage } from '@/lib/utils'

interface SavingGoal {
  id: string; name: string; targetAmount: number; currentAmount: number
  deadline?: string; icon: string; color: string; createdAt: string
}

const GOAL_ICONS = ['🎯','💻','🏠','🚗','✈️','📱','🎓','💍','🏖️','🛡️','🎮','📷']
const GOAL_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#ec4899','#3b82f6','#8b5cf6','#06b6d4']

export default function SavingsPage() {
  const [goals, setGoals] = useState<SavingGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [addMoneyGoal, setAddMoneyGoal] = useState<SavingGoal | null>(null)
  const [addAmount, setAddAmount] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '', targetAmount: '', currentAmount: '0',
    deadline: '', icon: '🎯', color: '#6366f1',
  })

  const fetchGoals = useCallback(async () => {
    setLoading(true)
    try { setGoals(await fetch('/api/saving-goals').then(r => r.json())) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchGoals() }, [fetchGoals])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true)
    try {
      const res = await fetch('/api/saving-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          targetAmount: parseFloat(form.targetAmount),
          currentAmount: parseFloat(form.currentAmount || '0'),
          icon: form.icon,
        }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      setShowForm(false)
      setForm({ name: '', targetAmount: '', currentAmount: '0', deadline: '', icon: '🎯', color: '#6366f1' })
      fetchGoals()
    } catch (err: unknown) { alert(err instanceof Error ? err.message : 'Gagal') }
    finally { setSubmitting(false) }
  }

  const handleAddMoney = async () => {
    if (!addMoneyGoal || !addAmount) return
    const newAmount = addMoneyGoal.currentAmount + parseFloat(addAmount)
    await fetch('/api/saving-goals', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: addMoneyGoal.id, currentAmount: newAmount }),
    })
    setAddMoneyGoal(null); setAddAmount(''); fetchGoals()
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/saving-goals/${id}`, { method: 'DELETE' })
    setDeleteId(null); fetchGoals()
  }

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0)
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0)
  const completed = goals.filter(g => g.currentAmount >= g.targetAmount).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]" style={{ fontFamily: 'Clash Display, sans-serif' }}>Target Tabungan</h1>
          <p className="text-[rgb(var(--text-secondary))] text-sm mt-0.5">Raih tujuan keuangan Anda</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all">
          <Plus size={16} /> Tambah Target
        </button>
      </div>

      {/* Summary */}
      {goals.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Target', value: formatCurrency(totalTarget), color: 'text-indigo-400' },
            { label: 'Total Tersimpan', value: formatCurrency(totalSaved), color: 'text-emerald-500' },
            { label: 'Tercapai', value: `${completed}/${goals.length}`, color: 'text-amber-400' },
          ].map(s => (
            <div key={s.label} className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--surface-border))] rounded-2xl p-4 text-center">
              <p className="text-[rgb(var(--text-muted))] text-xs mb-1">{s.label}</p>
              <p className={`${s.color} font-bold text-sm`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Goals grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-56 rounded-2xl skeleton" />)}
        </div>
      ) : goals.length === 0 ? (
        <div className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--surface-border))] rounded-2xl py-16 text-center">
          <PiggyBank size={40} className="text-slate-600 mx-auto mb-3" />
          <p className="text-[rgb(var(--text-muted))] text-sm mb-4">Belum ada target tabungan</p>
          <button onClick={() => setShowForm(true)} className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
            + Mulai menabung sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((g, i) => {
            const pct = calculatePercentage(g.currentAmount, g.targetAmount)
            const isComplete = g.currentAmount >= g.targetAmount
            const remaining = Math.max(0, g.targetAmount - g.currentAmount)
            const daysLeft = g.deadline ? Math.ceil((new Date(g.deadline).getTime() - Date.now()) / 86400000) : null
            return (
              <motion.div key={g.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--surface-border))] rounded-2xl p-5 group relative overflow-hidden">
                {/* Background accent */}
                <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10" style={{ background: g.color }} />

                <div className="flex items-start justify-between mb-4 relative">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${g.color}20` }}>
                      {g.icon}
                    </div>
                    <div>
                      <p className="text-[rgb(var(--text-primary))] font-semibold">{g.name}</p>
                      {g.deadline && (
                        <p className={`text-xs mt-0.5 ${daysLeft !== null && daysLeft < 30 ? 'text-amber-400' : 'text-[rgb(var(--text-muted))]'}`}>
                          {daysLeft !== null && daysLeft > 0 ? `${daysLeft} hari lagi` : 'Sudah jatuh tempo'}
                        </p>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setDeleteId(g.id)}
                    className="p-1.5 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-500/10">
                    <Trash2 size={13} />
                  </button>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[rgb(var(--text-primary))] font-bold text-sm">{formatCurrency(g.currentAmount)}</span>
                    <span className="text-[rgb(var(--text-muted))] text-sm">{formatCurrency(g.targetAmount)}</span>
                  </div>
                  <div className="h-2.5 bg-[rgb(var(--surface))] rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(pct, 100)}%` }}
                      transition={{ delay: 0.3 + i * 0.07, duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full" style={{ background: g.color }} />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full`}
                    style={{ background: `${g.color}20`, color: g.color }}>
                    {isComplete ? '🎉 Tercapai!' : `${pct}%`}
                  </span>
                  {!isComplete && (
                    <button onClick={() => setAddMoneyGoal(g)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all text-white"
                      style={{ background: g.color }}>
                      + Tambah
                    </button>
                  )}
                </div>

                {!isComplete && (
                  <p className="text-[rgb(var(--text-muted))] text-xs mt-3">
                    Kurang {formatCurrency(remaining)} lagi
                  </p>
                )}
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Add form modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70" onClick={() => setShowForm(false)} />
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              className="relative w-full sm:max-w-md bg-[#0d111e] border border-[#1e263c] rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-bold text-lg">Tambah Target Tabungan</h3>
                <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-1.5">Nama Target</label>
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="cth: Beli Laptop" required
                    className="w-full bg-[#111827] border border-[#1e263c] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-600" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-sm block mb-1.5">Target (Rp)</label>
                    <input type="number" value={form.targetAmount} onChange={e => setForm(f => ({ ...f, targetAmount: e.target.value }))}
                      placeholder="0" required
                      className="w-full bg-[#111827] border border-[#1e263c] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="text-slate-400 text-sm block mb-1.5">Dana awal (Rp)</label>
                    <input type="number" value={form.currentAmount} onChange={e => setForm(f => ({ ...f, currentAmount: e.target.value }))}
                      placeholder="0"
                      className="w-full bg-[#111827] border border-[#1e263c] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-1.5">Deadline (opsional)</label>
                  <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                    className="w-full bg-[#111827] border border-[#1e263c] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-1.5">Ikon</label>
                  <div className="flex flex-wrap gap-2">
                    {GOAL_ICONS.map(ic => (
                      <button key={ic} type="button" onClick={() => setForm(f => ({ ...f, icon: ic }))}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all ${form.icon === ic ? 'ring-2 ring-indigo-500 bg-indigo-500/20' : 'bg-[#111827] hover:bg-[#1a2234]'}`}>
                        {ic}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-1.5">Warna</label>
                  <div className="flex gap-2">
                    {GOAL_COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                        className={`w-7 h-7 rounded-full transition-all ${form.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0d111e]' : ''}`}
                        style={{ background: c }} />
                    ))}
                  </div>
                </div>
                <button type="submit" disabled={submitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all">
                  {submitting ? 'Menyimpan...' : 'Buat Target Tabungan'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add money modal */}
      <AnimatePresence>
        {addMoneyGoal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70" onClick={() => setAddMoneyGoal(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-[#0d111e] border border-[#1e263c] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <h3 className="text-white font-bold text-lg mb-1">Tambah Dana</h3>
              <p className="text-slate-400 text-sm mb-4">Target: {addMoneyGoal.name}</p>
              <input type="number" value={addAmount} onChange={e => setAddAmount(e.target.value)}
                placeholder="Nominal yang ditabung" autoFocus
                className="w-full bg-[#111827] border border-[#1e263c] text-white rounded-xl px-4 py-3 text-lg font-bold focus:outline-none focus:border-indigo-500 mb-4" />
              <div className="flex gap-3">
                <button onClick={() => setAddMoneyGoal(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-300 bg-[#111827]">Batal</button>
                <button onClick={handleAddMoney} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-all">Simpan</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70" onClick={() => setDeleteId(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-[#0d111e] border border-[#1e263c] rounded-2xl p-6 w-full max-w-sm text-center">
              <Trash2 size={28} className="text-red-400 mx-auto mb-3" />
              <h3 className="text-white font-bold mb-2">Hapus Target?</h3>
              <p className="text-slate-400 text-sm mb-5">Semua progress akan hilang.</p>
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
