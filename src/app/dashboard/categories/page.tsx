'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, X, Tag } from 'lucide-react'

interface Category {
  id: string; name: string; type: string; icon: string; color: string; isDefault: boolean
}

const CATEGORY_COLORS = ['#ef4444','#f97316','#f59e0b','#10b981','#06b6d4','#3b82f6','#6366f1','#8b5cf6','#ec4899','#64748b','#84cc16','#14b8a6']
const CATEGORY_ICONS = [
  { key: 'tag', emoji: '🏷️' },
  { key: 'briefcase', emoji: '💼' },
  { key: 'code-bracket', emoji: '💻' },
  { key: 'chart-bar', emoji: '📊' },
  { key: 'gift', emoji: '🎁' },
  { key: 'cake', emoji: '🍔' },
  { key: 'truck', emoji: '🚗' },
  { key: 'shopping-bag', emoji: '🛍️' },
  { key: 'musical-note', emoji: '🎵' },
  { key: 'document-text', emoji: '📄' },
  { key: 'heart', emoji: '❤️' },
  { key: 'academic-cap', emoji: '🎓' },
  { key: 'home', emoji: '🏠' },
  { key: 'star', emoji: '⭐' },
  { key: 'fire', emoji: '🔥' },
  { key: 'bolt', emoji: '⚡' },
]

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'all' | 'income' | 'expense'>('all')
  const [showForm, setShowForm] = useState(false)
  const [editCat, setEditCat] = useState<Category | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'expense', icon: 'tag', color: '#6366f1' })

  const fetchCats = useCallback(async () => {
    setLoading(true)
    try { setCategories(await fetch('/api/categories').then(r => r.json())) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchCats() }, [fetchCats])

  const filtered = categories.filter(c => tab === 'all' ? true : c.type === tab || c.type === 'both')

  const openEdit = (c: Category) => {
    setEditCat(c); setForm({ name: c.name, type: c.type, icon: c.icon, color: c.color }); setShowForm(true)
  }

  const openAdd = () => {
    setEditCat(null); setForm({ name: '', type: 'expense', icon: 'tag', color: '#6366f1' }); setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true)
    try {
      const url = editCat ? `/api/categories/${editCat.id}` : '/api/categories'
      const method = editCat ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      setShowForm(false); fetchCats()
    } catch (err: unknown) { alert(err instanceof Error ? err.message : 'Gagal') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    setDeleteId(null); fetchCats()
  }

  const getEmoji = (icon: string) => CATEGORY_ICONS.find(i => i.key === icon)?.emoji || '🏷️'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]" style={{ fontFamily: 'Clash Display, sans-serif' }}>Kategori</h1>
          <p className="text-[rgb(var(--text-secondary))] text-sm mt-0.5">{categories.length} kategori total</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all">
          <Plus size={16} /> Kategori Baru
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[rgb(var(--bg-card))] border border-[rgb(var(--surface-border))] rounded-xl p-1 w-fit">
        {[{ key: 'all', label: 'Semua' }, { key: 'income', label: 'Pemasukan' }, { key: 'expense', label: 'Pengeluaran' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.key ? 'bg-indigo-600 text-white' : 'text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Category grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => <div key={i} className="h-24 rounded-2xl skeleton" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--surface-border))] rounded-2xl py-16 text-center">
          <Tag size={36} className="text-slate-600 mx-auto mb-3" />
          <p className="text-[rgb(var(--text-muted))] text-sm">Belum ada kategori</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
              className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--surface-border))] rounded-2xl p-4 group relative">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3" style={{ background: `${c.color}20` }}>
                  {getEmoji(c.icon)}
                </div>
                {!c.isDefault && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(c)} className="p-1 text-slate-500 hover:text-indigo-400 rounded-lg transition-all">
                      <Pencil size={12} />
                    </button>
                    <button onClick={() => setDeleteId(c.id)} className="p-1 text-slate-500 hover:text-red-400 rounded-lg transition-all">
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-[rgb(var(--text-primary))] text-sm font-semibold">{c.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  c.type === 'income' ? 'bg-emerald-500/15 text-emerald-500' :
                    c.type === 'expense' ? 'bg-red-500/15 text-red-400' : 'bg-indigo-500/15 text-indigo-400'
                }`}>
                  {c.type === 'income' ? 'Pemasukan' : c.type === 'expense' ? 'Pengeluaran' : 'Keduanya'}
                </span>
                {c.isDefault && <span className="text-[10px] text-slate-500">Default</span>}
              </div>
            </motion.div>
          ))}
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
                <h3 className="text-white font-bold text-lg">{editCat ? 'Edit Kategori' : 'Tambah Kategori'}</h3>
                <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-1.5">Nama Kategori</label>
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="cth: Hobi" required
                    className="w-full bg-[#111827] border border-[#1e263c] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-600" />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-1.5">Tipe</label>
                  <div className="flex gap-2">
                    {[{ v: 'income', l: 'Pemasukan' }, { v: 'expense', l: 'Pengeluaran' }, { v: 'both', l: 'Keduanya' }].map(t => (
                      <button key={t.v} type="button" onClick={() => setForm(f => ({ ...f, type: t.v }))}
                        className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all border ${
                          form.type === t.v ? 'bg-indigo-600/20 text-indigo-400 border-indigo-600/40' : 'text-slate-400 border-[#1e263c] hover:border-slate-600'
                        }`}>
                        {t.l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-1.5">Ikon</label>
                  <div className="grid grid-cols-8 gap-1.5">
                    {CATEGORY_ICONS.map(ic => (
                      <button key={ic.key} type="button" onClick={() => setForm(f => ({ ...f, icon: ic.key }))}
                        className={`h-9 rounded-xl flex items-center justify-center text-lg transition-all ${
                          form.icon === ic.key ? 'ring-2 ring-indigo-500 bg-indigo-500/20' : 'bg-[#111827] hover:bg-[#1a2234]'
                        }`}>
                        {ic.emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-1.5">Warna</label>
                  <div className="flex gap-2 flex-wrap">
                    {CATEGORY_COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                        className={`w-7 h-7 rounded-full transition-all ${form.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0d111e] scale-110' : ''}`}
                        style={{ background: c }} />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[#111827] rounded-xl">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: `${form.color}20` }}>
                    {getEmoji(form.icon)}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{form.name || 'Preview'}</p>
                    <p className="text-slate-500 text-xs">{form.type === 'income' ? 'Pemasukan' : form.type === 'expense' ? 'Pengeluaran' : 'Keduanya'}</p>
                  </div>
                </div>
                <button type="submit" disabled={submitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all">
                  {submitting ? 'Menyimpan...' : editCat ? 'Simpan Perubahan' : 'Tambah Kategori'}
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
              <h3 className="text-white font-bold mb-2">Hapus Kategori?</h3>
              <p className="text-slate-400 text-sm mb-5">Transaksi terkait tidak akan terhapus, namun kategorinya akan hilang.</p>
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
