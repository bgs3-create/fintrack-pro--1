'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Wallet, Building2, Smartphone, CreditCard, Pencil, Trash2, X } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Account {
  id: string; name: string; type: string; balance: number; color: string; icon: string; isDefault: boolean
}

const ACCOUNT_COLORS = ['#f59e0b','#3b82f6','#10b981','#6366f1','#ef4444','#ec4899','#8b5cf6','#06b6d4']
const TYPE_CONFIG = {
  kas: { label: 'Kas Tunai', Icon: Wallet },
  bank: { label: 'Bank', Icon: Building2 },
  ewallet: { label: 'E-Wallet', Icon: Smartphone },
  custom: { label: 'Custom', Icon: CreditCard },
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editAccount, setEditAccount] = useState<Account | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'kas', balance: '0', color: '#f59e0b', icon: 'wallet' })

  const fetchAccounts = useCallback(async () => {
    setLoading(true)
    try { setAccounts(await fetch('/api/accounts').then(r => r.json())) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAccounts() }, [fetchAccounts])

  const openEdit = (a: Account) => {
    setEditAccount(a)
    setForm({ name: a.name, type: a.type, balance: String(a.balance), color: a.color, icon: a.icon })
    setShowForm(true)
  }

  const openAdd = () => {
    setEditAccount(null)
    setForm({ name: '', type: 'kas', balance: '0', color: '#f59e0b', icon: 'wallet' })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true)
    try {
      const url = editAccount ? `/api/accounts/${editAccount.id}` : '/api/accounts'
      const method = editAccount ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, balance: parseFloat(form.balance) }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      setShowForm(false); fetchAccounts()
    } catch (err: unknown) { alert(err instanceof Error ? err.message : 'Gagal') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/accounts/${id}`, { method: 'DELETE' })
    setDeleteId(null); fetchAccounts()
  }

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]" style={{ fontFamily: 'Clash Display, sans-serif' }}>Akun Keuangan</h1>
          <p className="text-[rgb(var(--text-secondary))] text-sm mt-0.5">Kelola rekening dan dompet Anda</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all">
          <Plus size={16} /> Tambah Akun
        </button>
      </div>

      {/* Total balance card */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <p className="text-indigo-200 text-sm mb-1">Total Saldo Semua Akun</p>
          <p className="text-white text-4xl font-bold tabular" style={{ fontFamily: 'Clash Display, sans-serif' }}>
            {formatCurrency(totalBalance)}
          </p>
          <p className="text-indigo-200 text-sm mt-2">{accounts.length} akun aktif</p>
        </div>
      </div>

      {/* Account cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-44 rounded-2xl skeleton" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((a, i) => {
            const config = TYPE_CONFIG[a.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.custom
            const pct = totalBalance > 0 ? calculatePercentage(a.balance, totalBalance) : 0
            return (
              <motion.div key={a.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--surface-border))] rounded-2xl p-5 group relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 rounded-2xl" style={{ background: `linear-gradient(135deg, ${a.color}, transparent)` }} />
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${a.color}20` }}>
                      <config.Icon size={22} style={{ color: a.color }} />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(a)} className="p-1.5 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all">
                        <Pencil size={13} />
                      </button>
                      {!a.isDefault && (
                        <button onClick={() => setDeleteId(a.id)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-[rgb(var(--text-muted))] text-xs mb-0.5">{config.label}</p>
                  <p className="text-[rgb(var(--text-primary))] font-semibold mb-3">{a.name}</p>
                  <p className="text-[rgb(var(--text-primary))] text-xl font-bold tabular mb-3">{formatCurrency(a.balance)}</p>
                  <div className="h-1.5 bg-[rgb(var(--surface))] rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.4 + i * 0.06, duration: 0.6 }}
                      className="h-full rounded-full" style={{ background: a.color }} />
                  </div>
                  <p className="text-[rgb(var(--text-muted))] text-xs mt-1">{pct}% dari total</p>
                  {a.isDefault && (
                    <span className="absolute top-3 right-3 text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-medium">Default</span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70" onClick={() => setShowForm(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-[#0d111e] border border-[#1e263c] rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-bold text-lg">{editAccount ? 'Edit Akun' : 'Tambah Akun'}</h3>
                <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-1.5">Nama Akun</label>
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="cth: BRI Tabungan" required
                    className="w-full bg-[#111827] border border-[#1e263c] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-600" />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-1.5">Tipe Akun</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(TYPE_CONFIG).map(([key, val]) => (
                      <button key={key} type="button" onClick={() => setForm(f => ({ ...f, type: key }))}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                          form.type === key ? 'bg-indigo-600/20 text-indigo-400 border-indigo-600/40' : 'text-slate-400 border-[#1e263c] hover:border-slate-600'
                        }`}>
                        <val.Icon size={15} /> {val.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-1.5">Saldo Awal (Rp)</label>
                  <input type="number" value={form.balance} onChange={e => setForm(f => ({ ...f, balance: e.target.value }))}
                    placeholder="0" required
                    className="w-full bg-[#111827] border border-[#1e263c] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-1.5">Warna</label>
                  <div className="flex gap-2 flex-wrap">
                    {ACCOUNT_COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                        className={`w-7 h-7 rounded-full transition-all ${form.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0d111e] scale-110' : ''}`}
                        style={{ background: c }} />
                    ))}
                  </div>
                </div>
                <button type="submit" disabled={submitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all">
                  {submitting ? 'Menyimpan...' : editAccount ? 'Simpan Perubahan' : 'Tambah Akun'}
                </button>
              </form>
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
              <h3 className="text-white font-bold mb-2">Hapus Akun?</h3>
              <p className="text-slate-400 text-sm mb-5">Semua riwayat transaksi akun ini akan terpengaruh.</p>
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

function calculatePercentage(value: number, total: number) {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}
