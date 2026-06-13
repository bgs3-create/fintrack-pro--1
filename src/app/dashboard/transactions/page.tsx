'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, Filter, ChevronDown, Pencil, Trash2,
  ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight, X
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { TransactionModal } from '@/components/TransactionModal'

interface Transaction {
  id: string; type: string; amount: number; description: string; note?: string
  date: string; categoryId: string; accountId: string
  category: { name: string; color: string; icon: string }
  account: { name: string; type: string }
}

interface Pagination { page: number; limit: number; total: number; pages: number }

const CATEGORY_EMOJI: Record<string, string> = {
  briefcase: '💼', 'code-bracket': '💻', 'chart-bar': '📊', gift: '🎁',
  cake: '🍔', truck: '🚗', 'shopping-bag': '🛍️', 'musical-note': '🎵',
  'document-text': '📄', heart: '❤️', 'academic-cap': '🎓', tag: '🏷️',
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null)
  const [modalType, setModalType] = useState<'income' | 'expense'>('income')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [filters, setFilters] = useState({
    search: '', type: '', page: 1, sortBy: 'date', sortOrder: 'desc',
    startDate: '', endDate: '',
  })
  const [showFilters, setShowFilters] = useState(false)

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, String(v)) })
      const res = await fetch(`/api/transactions?${params}`)
      const data = await res.json()
      setTransactions(data.transactions || [])
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, pages: 0 })
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchTransactions() }, [fetchTransactions])

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
      setDeleteId(null)
      fetchTransactions()
    } catch {
      alert('Gagal menghapus transaksi')
    }
  }

  const openAdd = (type: 'income' | 'expense') => {
    setEditTransaction(null)
    setModalType(type)
    setShowModal(true)
  }

  const openEdit = (t: Transaction) => {
    setEditTransaction(t)
    setShowModal(true)
  }

  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]" style={{ fontFamily: 'Clash Display, sans-serif' }}>
            Transaksi
          </h1>
          <p className="text-[rgb(var(--text-secondary))] text-sm mt-0.5">{pagination.total} transaksi total</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => openAdd('income')}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-xl text-sm font-semibold transition-all">
            <Plus size={15} /> <span className="hidden sm:block">Pemasukan</span>
          </button>
          <button onClick={() => openAdd('expense')}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-xl text-sm font-semibold transition-all">
            <Plus size={15} /> <span className="hidden sm:block">Pengeluaran</span>
          </button>
        </div>
      </div>

      {/* Summary mini */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Pemasukan', value: income, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Total Pengeluaran', value: expense, color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'Selisih', value: income - expense, color: income >= expense ? 'text-emerald-500' : 'text-red-400', bg: income >= expense ? 'bg-emerald-500/10' : 'bg-red-500/10' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-3`}>
            <p className="text-[rgb(var(--text-muted))] text-xs mb-1">{s.label}</p>
            <p className={`${s.color} font-bold text-sm tabular`}>{formatCurrency(s.value)}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--surface-border))] rounded-2xl p-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
              placeholder="Cari transaksi..."
              className="w-full bg-[rgb(var(--surface))] border border-[rgb(var(--surface-border))] text-[rgb(var(--text-primary))] rounded-xl pl-9 pr-4 py-2.5 text-sm placeholder-[rgb(var(--text-muted))] focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
          <select
            value={filters.type}
            onChange={e => setFilters(f => ({ ...f, type: e.target.value, page: 1 }))}
            className="bg-[rgb(var(--surface))] border border-[rgb(var(--surface-border))] text-[rgb(var(--text-primary))] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-all"
          >
            <option value="">Semua</option>
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
              showFilters
                ? 'bg-indigo-600/20 text-indigo-400 border-indigo-600/40'
                : 'bg-[rgb(var(--surface))] text-slate-400 border-[rgb(var(--surface-border))] hover:text-white'
            }`}
          >
            <Filter size={15} />
            <span className="hidden sm:block">Filter</span>
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-3 mt-3 border-t border-[rgb(var(--surface-border))] grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-slate-500 text-xs block mb-1">Dari tanggal</label>
                  <input type="date" value={filters.startDate}
                    onChange={e => setFilters(f => ({ ...f, startDate: e.target.value, page: 1 }))}
                    className="w-full bg-[rgb(var(--surface))] border border-[rgb(var(--surface-border))] text-[rgb(var(--text-primary))] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-slate-500 text-xs block mb-1">Sampai tanggal</label>
                  <input type="date" value={filters.endDate}
                    onChange={e => setFilters(f => ({ ...f, endDate: e.target.value, page: 1 }))}
                    className="w-full bg-[rgb(var(--surface))] border border-[rgb(var(--surface-border))] text-[rgb(var(--text-primary))] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-slate-500 text-xs block mb-1">Urutkan</label>
                  <select value={filters.sortBy}
                    onChange={e => setFilters(f => ({ ...f, sortBy: e.target.value }))}
                    className="w-full bg-[rgb(var(--surface))] border border-[rgb(var(--surface-border))] text-[rgb(var(--text-primary))] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="date">Tanggal</option>
                    <option value="amount">Nominal</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-500 text-xs block mb-1">Arah</label>
                  <select value={filters.sortOrder}
                    onChange={e => setFilters(f => ({ ...f, sortOrder: e.target.value }))}
                    className="w-full bg-[rgb(var(--surface))] border border-[rgb(var(--surface-border))] text-[rgb(var(--text-primary))] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="desc">Terbaru</option>
                    <option value="asc">Terlama</option>
                  </select>
                </div>
              </div>
              <button
                onClick={() => setFilters({ search: '', type: '', page: 1, sortBy: 'date', sortOrder: 'desc', startDate: '', endDate: '' })}
                className="mt-3 text-slate-500 hover:text-slate-300 text-xs flex items-center gap-1 transition-colors"
              >
                <X size={12} /> Reset filter
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Transaction list */}
      <div className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--surface-border))] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="divide-y divide-[rgb(var(--surface-border))]">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-xl skeleton" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-48 skeleton rounded" />
                  <div className="h-3 w-32 skeleton rounded" />
                </div>
                <div className="h-5 w-24 skeleton rounded" />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-[rgb(var(--text-muted))] text-sm">Tidak ada transaksi ditemukan</p>
          </div>
        ) : (
          <div className="divide-y divide-[rgb(var(--surface-border))]">
            {transactions.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-center gap-3 sm:gap-4 px-4 py-3.5 hover:bg-[rgb(var(--surface))] transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                  style={{ backgroundColor: `${t.category.color}20` }}>
                  {CATEGORY_EMOJI[t.category.icon] || '💡'}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[rgb(var(--text-primary))] text-sm font-medium truncate">{t.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[rgb(var(--text-muted))] text-xs">{t.category.name}</span>
                    <span className="text-[rgb(var(--text-muted))] text-xs">·</span>
                    <span className="text-[rgb(var(--text-muted))] text-xs">{t.account.name}</span>
                    <span className="text-[rgb(var(--text-muted))] text-xs hidden sm:block">·</span>
                    <span className="text-[rgb(var(--text-muted))] text-xs hidden sm:block">{formatDate(t.date)}</span>
                  </div>
                </div>

                <div className={`text-sm font-bold tabular flex-shrink-0 ${t.type === 'income' ? 'text-emerald-500' : 'text-red-400'}`}>
                  <span className="hidden sm:inline">{t.type === 'income' ? <ArrowUpRight size={12} className="inline" /> : <ArrowDownRight size={12} className="inline" />}</span>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={() => openEdit(t)}
                    className="p-1.5 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setDeleteId(t.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-[rgb(var(--surface-border))]">
            <p className="text-[rgb(var(--text-muted))] text-sm">
              {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                disabled={pagination.page <= 1}
                className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[rgb(var(--surface))] rounded-lg transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-[rgb(var(--text-secondary))]">{pagination.page} / {pagination.pages}</span>
              <button
                onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                disabled={pagination.page >= pagination.pages}
                className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[rgb(var(--surface))] rounded-lg transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70" onClick={() => setDeleteId(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-[#0d111e] border border-[#1e263c] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={22} className="text-red-400" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Hapus Transaksi?</h3>
                <p className="text-slate-400 text-sm mb-6">Transaksi yang dihapus tidak bisa dipulihkan.</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteId(null)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-300 bg-[#111827] hover:bg-[#1a2234] transition-all">
                    Batal
                  </button>
                  <button onClick={() => handleDelete(deleteId)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-500 transition-all">
                    Hapus
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {showModal && (
        <TransactionModal
          type={modalType}
          transaction={editTransaction || undefined}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchTransactions() }}
        />
      )}
    </div>
  )
}
