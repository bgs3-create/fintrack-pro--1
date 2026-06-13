'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { X, Check, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Category { id: string; name: string; icon: string; color: string }
interface Account { id: string; name: string; type: string; color: string; balance: number }

interface TransactionModalProps {
  type?: 'income' | 'expense'
  transaction?: {
    id: string; type: string; amount: number; description: string; note?: string
    date: string; categoryId: string; accountId: string
  }
  onClose: () => void
  onSuccess: () => void
}

export function TransactionModal({ type = 'income', transaction, onClose, onSuccess }: TransactionModalProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isEdit = !!transaction
  const [form, setForm] = useState({
    type: transaction?.type || type,
    amount: transaction?.amount?.toString() || '',
    description: transaction?.description || '',
    note: transaction?.note || '',
    date: transaction?.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    categoryId: transaction?.categoryId || '',
    accountId: transaction?.accountId || '',
  })

  useEffect(() => {
    Promise.all([
      fetch(`/api/categories?type=${form.type}`).then(r => r.json()),
      fetch('/api/accounts').then(r => r.json()),
    ]).then(([cats, accs]) => {
      setCategories(cats)
      setAccounts(accs)
      if (!form.categoryId && cats.length > 0) setForm(f => ({ ...f, categoryId: cats[0].id }))
      if (!form.accountId && accs.length > 0) {
        const def = accs[0]
        setForm(f => ({ ...f, accountId: def.id }))
      }
    })
  }, [form.type])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.amount || !form.description || !form.categoryId || !form.accountId) {
      setError('Lengkapi semua field yang wajib diisi')
      return
    }

    setLoading(true)
    setError('')

    try {
      const url = isEdit ? `/api/transactions/${transaction.id}` : '/api/transactions'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan')
      onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full sm:max-w-md bg-[#0d111e] border border-[#1e263c] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1e263c]">
          <h2 className="font-bold text-white text-lg">
            {isEdit ? 'Edit Transaksi' : form.type === 'income' ? '+ Pemasukan' : '- Pengeluaran'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        {/* Type toggle */}
        {!isEdit && (
          <div className="flex gap-2 p-4 pb-0">
            {(['income', 'expense'] as const).map(t => (
              <button
                key={t}
                onClick={() => setForm(f => ({ ...f, type: t, categoryId: '' }))}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                  form.type === t
                    ? t === 'income'
                      ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/40'
                      : 'bg-red-600/20 text-red-400 border border-red-600/40'
                    : 'text-slate-400 bg-[#111827] hover:text-slate-200'
                }`}
              >
                {t === 'income' ? '↑ Pemasukan' : '↓ Pengeluaran'}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Amount */}
          <div>
            <label className="text-slate-400 text-sm block mb-1.5">Nominal *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">Rp</span>
              <input
                type="number"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="0"
                className="w-full bg-[#111827] border border-[#1e263c] text-white rounded-xl pl-10 pr-4 py-3 text-lg font-bold focus:outline-none focus:border-indigo-500 transition-all"
                required
              />
            </div>
            {form.amount && <p className="text-slate-500 text-xs mt-1">{formatCurrency(parseFloat(form.amount) || 0)}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="text-slate-400 text-sm block mb-1.5">Deskripsi *</label>
            <input
              type="text"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Contoh: Gaji bulan ini"
              className="w-full bg-[#111827] border border-[#1e263c] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all placeholder-slate-600"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Category */}
            <div>
              <label className="text-slate-400 text-sm block mb-1.5">Kategori *</label>
              <select
                value={form.categoryId}
                onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                className="w-full bg-[#111827] border border-[#1e263c] text-white rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                required
              >
                <option value="">Pilih...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Account */}
            <div>
              <label className="text-slate-400 text-sm block mb-1.5">Akun *</label>
              <select
                value={form.accountId}
                onChange={e => setForm(f => ({ ...f, accountId: e.target.value }))}
                className="w-full bg-[#111827] border border-[#1e263c] text-white rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                required
              >
                <option value="">Pilih...</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="text-slate-400 text-sm block mb-1.5">Tanggal</label>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="w-full bg-[#111827] border border-[#1e263c] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Note */}
          <div>
            <label className="text-slate-400 text-sm block mb-1.5">Catatan (opsional)</label>
            <textarea
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              placeholder="Catatan tambahan..."
              rows={2}
              className="w-full bg-[#111827] border border-[#1e263c] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all placeholder-slate-600 resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all ${
              form.type === 'income'
                ? 'bg-emerald-600 hover:bg-emerald-500'
                : 'bg-red-600 hover:bg-red-500'
            } disabled:opacity-50`}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {loading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan Transaksi'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
