'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, TrendingUp, Shield, Zap, BarChart3 } from 'lucide-react'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const [form, setForm] = useState({
    name: '', email: 'demo@fintrack.id', password: 'password123', confirmPassword: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'register' && form.password !== form.confirmPassword) {
        setError('Password tidak cocok')
        return
      }

      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan')

      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const features = [
    { icon: BarChart3, label: 'Analitik Cerdas', desc: 'Grafik real-time keuangan Anda' },
    { icon: Shield, label: 'Aman & Privat', desc: 'Data terenkripsi penuh' },
    { icon: Zap, label: 'Cepat & Mudah', desc: 'Input transaksi dalam detik' },
    { icon: TrendingUp, label: 'Prediksi AI', desc: 'Insight finansial berbasis data' },
  ]

  return (
    <div className="min-h-screen flex bg-[#080a12]">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between p-12">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-violet-600/15 rounded-full blur-[100px] translate-x-1/4 translate-y-1/4" />
          <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-pink-600/10 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
              <TrendingUp size={22} className="text-white" />
            </div>
            <span className="text-white font-bold text-2xl" style={{ fontFamily: 'Clash Display, sans-serif' }}>
              FinTrack Pro
            </span>
          </div>

          <div className="mb-12">
            <h1 className="text-5xl font-bold text-white leading-tight mb-6" style={{ fontFamily: 'Clash Display, sans-serif' }}>
              Kendalikan<br />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
                Keuangan Anda
              </span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-md">
              Pembukuan modern dengan analitik AI, visualisasi real-time, dan manajemen anggaran yang intuitif.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm"
              >
                <div className="w-9 h-9 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-3">
                  <f.icon size={18} className="text-indigo-400" />
                </div>
                <div className="text-white font-semibold text-sm mb-1">{f.label}</div>
                <div className="text-slate-500 text-xs">{f.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 flex gap-8">
          {[
            { label: 'Pengguna Aktif', value: '50K+' },
            { label: 'Transaksi', value: '2M+' },
            { label: 'Uptime', value: '99.9%' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-2xl font-bold text-white" style={{ fontFamily: 'Clash Display, sans-serif' }}>{s.value}</div>
              <div className="text-slate-500 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-8 relative">
        <div className="absolute inset-0 lg:hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-900/20 via-transparent to-violet-900/20" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="bg-[#0d111e] border border-[#1e263c] rounded-2xl p-8 shadow-2xl">
            {/* Logo mobile */}
            <div className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                <TrendingUp size={16} className="text-white" />
              </div>
              <span className="text-white font-bold text-lg">FinTrack Pro</span>
            </div>

            {/* Tab toggle */}
            <div className="flex bg-[#111827] rounded-xl p-1 mb-8 gap-1">
              {(['login', 'register'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => { setMode(tab); setError('') }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    mode === tab
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab === 'login' ? 'Masuk' : 'Daftar'}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.form
                key={mode}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {mode === 'register' && (
                  <div>
                    <label className="block text-slate-400 text-sm mb-1.5">Nama Lengkap</label>
                    <input
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Nama kamu"
                      required
                      className="w-full bg-[#111827] border border-[#1e263c] text-white rounded-xl px-4 py-3 text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-slate-400 text-sm mb-1.5">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    required
                    className="w-full bg-[#111827] border border-[#1e263c] text-white rounded-xl px-4 py-3 text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-sm mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPass ? 'text' : 'password'}
                      value={form.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className="w-full bg-[#111827] border border-[#1e263c] text-white rounded-xl px-4 py-3 pr-12 text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {mode === 'register' && (
                  <div>
                    <label className="block text-slate-400 text-sm mb-1.5">Konfirmasi Password</label>
                    <input
                      name="confirmPassword"
                      type="password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className="w-full bg-[#111827] border border-[#1e263c] text-white rounded-xl px-4 py-3 text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                )}

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm mt-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    mode === 'login' ? 'Masuk ke Akun' : 'Buat Akun Gratis'
                  )}
                </button>

                {mode === 'login' && (
                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-3">
                    <p className="text-indigo-300 text-xs font-medium mb-1">Demo Account</p>
                    <p className="text-slate-400 text-xs">📧 demo@fintrack.id</p>
                    <p className="text-slate-400 text-xs">🔑 password123</p>
                  </div>
                )}
              </motion.form>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
