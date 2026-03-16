'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(
          authError.message === 'Invalid login credentials'
            ? 'Email ou senha incorretos.'
            : authError.message
        )
        return
      }

      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id

      if (userId) {
        const { data: agencyMembership } = await supabase
          .from('agency_members')
          .select('agency_id')
          .eq('profile_id', userId)
          .limit(1)
          .maybeSingle()

        if (agencyMembership) {
          router.push('/agency')
          return
        }

        const { data: wsMembership } = await supabase
          .from('workspace_members')
          .select('workspace_id')
          .eq('profile_id', userId)
          .limit(1)
          .maybeSingle()

        if (wsMembership) {
          router.push(`/w/${wsMembership.workspace_id}/dashboard`)
          return
        }
      }

      router.push('/agency')
    } catch {
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="lg:hidden flex items-center gap-2 mb-10">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="font-heading font-extrabold text-dark text-sm">C</span>
        </div>
        <span className="font-heading font-bold text-dark text-lg tracking-tight">
          CaCo
        </span>
      </div>

      <h2 className="font-heading text-2xl font-bold text-dark-700 mb-1">
        Entrar
      </h2>
      <p className="font-body text-dark-300 text-sm mb-8">
        Acesse sua conta para gerenciar campanhas.
      </p>

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="block font-body text-xs font-medium text-dark-400 uppercase tracking-wider mb-2"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            className="w-full px-4 py-3 rounded-lg border border-dark-100 bg-surface font-body text-sm text-dark-700 placeholder:text-dark-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block font-body text-xs font-medium text-dark-400 uppercase tracking-wider mb-2"
          >
            Senha
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 pr-11 rounded-lg border border-dark-100 bg-surface font-body text-sm text-dark-700 placeholder:text-dark-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-300 hover:text-dark-500 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-lg bg-danger/10 border border-danger/20">
            <p className="font-body text-sm text-danger">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-lg bg-primary text-dark font-heading font-semibold text-sm hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Entrando...
            </>
          ) : (
            'Entrar'
          )}
        </button>
      </form>

      <p className="mt-8 text-center font-body text-xs text-dark-300">
        Dashboard 360 — CaCo Casa de Comunicação
      </p>
    </>
  )
}
