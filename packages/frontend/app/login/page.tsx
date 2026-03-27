'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { setToken } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Credenciais inválidas.')
      setToken(data.token)
      router.push('/admin/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-azul flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-brand-azul px-8 py-10 text-center border-b border-white/10">
          <div className="font-serif text-3xl font-bold text-white mb-1">
            Queiroz<span className="text-brand-dourado">Almeida</span>
          </div>
          <p className="font-sans text-sm text-white/50">Área administrativa</p>
        </div>

        {/* Form */}
        <div className="px-8 py-8">
          <h1 className="font-serif font-bold text-2xl text-brand-azul mb-6">Entrar</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block font-sans text-sm font-medium text-brand-texto mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="seu@email.com"
                required
                className="w-full border border-brand-borda rounded-lg px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-brand-azul/30 focus:border-brand-azul transition-colors"
              />
            </div>

            <div>
              <label className="block font-sans text-sm font-medium text-brand-texto mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                  className="w-full border border-brand-borda rounded-lg px-4 py-3 pr-11 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-brand-azul/30 focus:border-brand-azul transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-texto/40 hover:text-brand-texto transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="font-sans text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-azul text-white font-sans font-semibold py-4 rounded-lg hover:bg-brand-azul-sec active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              Entrar
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
