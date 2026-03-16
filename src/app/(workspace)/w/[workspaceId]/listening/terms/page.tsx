'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import {
  Plus,
  Trash2,
  Upload,
  Loader2,
  ArrowLeft,
  Search,
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/format'

interface ListeningTerm {
  id: string
  workspace_id: string
  term: string
  is_active: boolean
  created_at: string
}

export default function ListeningTermsPage() {
  const params = useParams()
  const workspaceId = params.workspaceId as string
  const [terms, setTerms] = useState<ListeningTerm[]>([])
  const [loading, setLoading] = useState(true)
  const [newTerm, setNewTerm] = useState('')
  const [bulkText, setBulkText] = useState('')
  const [showBulk, setShowBulk] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const supabase = createClient()

  const fetchTerms = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('listening_terms')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })

      setTerms(data ?? [])
    } catch {
      console.error('Failed to fetch listening terms')
    } finally {
      setLoading(false)
    }
  }, [supabase, workspaceId])

  useEffect(() => {
    fetchTerms()
  }, [fetchTerms])

  async function handleAddTerm(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = newTerm.trim()
    if (!trimmed || submitting) return

    setSubmitting(true)
    try {
      const { data, error } = await supabase
        .from('listening_terms')
        .insert({ workspace_id: workspaceId, term: trimmed, is_active: true })
        .select()
        .single()

      if (error) throw error
      if (data) setTerms((prev) => [data, ...prev])
      setNewTerm('')
    } catch {
      console.error('Failed to add term')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleBulkImport() {
    const lines = bulkText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)

    if (lines.length === 0 || submitting) return

    const uniqueLines = Array.from(new Set(lines))
    setSubmitting(true)
    try {
      const rows = uniqueLines.map((term) => ({
        workspace_id: workspaceId,
        term,
        is_active: true,
      }))

      const { data, error } = await supabase
        .from('listening_terms')
        .insert(rows)
        .select()

      if (error) throw error
      if (data) setTerms((prev) => [...data.reverse(), ...prev])
      setBulkText('')
      setShowBulk(false)
    } catch {
      console.error('Failed to bulk import terms')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggleActive(id: string, currentValue: boolean) {
    try {
      const { error } = await supabase
        .from('listening_terms')
        .update({ is_active: !currentValue })
        .eq('id', id)
        .eq('workspace_id', workspaceId)

      if (error) throw error
      setTerms((prev) =>
        prev.map((t) => (t.id === id ? { ...t, is_active: !currentValue } : t))
      )
    } catch {
      console.error('Failed to toggle term status')
    }
  }

  async function handleDelete(id: string) {
    if (deletingId === id) {
      try {
        const { error } = await supabase
          .from('listening_terms')
          .delete()
          .eq('id', id)
          .eq('workspace_id', workspaceId)

        if (error) throw error
        setTerms((prev) => prev.filter((t) => t.id !== id))
      } catch {
        console.error('Failed to delete term')
      } finally {
        setDeletingId(null)
      }
      return
    }
    setDeletingId(id)
    setTimeout(() => setDeletingId(null), 3000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-dark-300" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <Link
            href={`/w/${workspaceId}/listening`}
            className="inline-flex items-center gap-1.5 font-body text-sm text-dark-300 hover:text-dark-700 transition-colors duration-200 mb-2"
          >
            <ArrowLeft size={14} />
            Voltar ao Social Listening
          </Link>
          <h2 className="font-heading text-xl font-bold text-dark-700 mb-1">
            Termos Monitorados
          </h2>
          <p className="font-body text-sm text-dark-300">
            Gerencie os termos de busca para captura de menções.
          </p>
        </div>
        <button
          onClick={() => setShowBulk(!showBulk)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-50 text-dark-700 font-heading font-semibold text-sm hover:bg-dark-100 transition-colors duration-200"
        >
          <Upload size={16} />
          Importar em Lote
        </button>
      </div>

      {showBulk && (
        <div className="bg-surface rounded-card shadow-card border border-border/50 p-5">
          <h3 className="font-heading font-semibold text-dark-700 text-sm mb-3">
            Importação em Lote
          </h3>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder="Cole os termos aqui, um por linha..."
            rows={5}
            className="w-full rounded-lg border border-border bg-dark-50/50 px-4 py-3 font-body text-sm text-dark-700 placeholder:text-dark-300 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
          <div className="flex items-center justify-between mt-3">
            <p className="font-body text-xs text-dark-300">
              {bulkText.split('\n').filter((l) => l.trim()).length} termo(s) detectado(s)
            </p>
            <button
              onClick={handleBulkImport}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-dark-700 font-heading font-semibold text-sm hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              Importar
            </button>
          </div>
        </div>
      )}

      <div className="bg-surface rounded-card shadow-card border border-border/50">
        <form onSubmit={handleAddTerm} className="flex items-center gap-3 p-4 border-b border-border/50">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
            <input
              type="text"
              value={newTerm}
              onChange={(e) => setNewTerm(e.target.value)}
              placeholder="Novo termo para monitorar..."
              className="w-full rounded-lg border border-border bg-dark-50/50 pl-10 pr-4 py-2.5 font-body text-sm text-dark-700 placeholder:text-dark-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !newTerm.trim()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-dark-700 font-heading font-semibold text-sm hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 shrink-0"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Adicionar
          </button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-50">
                <th className="text-left text-xs uppercase text-dark-300 font-heading font-medium px-4 py-3">
                  Termo
                </th>
                <th className="text-center text-xs uppercase text-dark-300 font-heading font-medium px-4 py-3">
                  Ativo
                </th>
                <th className="text-left text-xs uppercase text-dark-300 font-heading font-medium px-4 py-3">
                  Criado em
                </th>
                <th className="text-right text-xs uppercase text-dark-300 font-heading font-medium px-4 py-3">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {terms.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12">
                    <p className="font-body text-sm text-dark-300">
                      Nenhum termo cadastrado. Adicione termos para começar o monitoramento.
                    </p>
                  </td>
                </tr>
              ) : (
                terms.map((term, idx) => (
                  <tr
                    key={term.id}
                    className={cn(
                      'hover:bg-primary-50 transition-colors duration-150',
                      idx % 2 === 0 ? 'bg-white' : 'bg-dark-50'
                    )}
                  >
                    <td className="px-4 py-3 font-body text-sm text-dark-700 font-medium">
                      {term.term}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggleActive(term.id, term.is_active)}
                        className={cn(
                          'relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200',
                          term.is_active ? 'bg-success' : 'bg-dark-200'
                        )}
                        aria-label={term.is_active ? 'Desativar' : 'Ativar'}
                      >
                        <span
                          className={cn(
                            'inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200',
                            term.is_active ? 'translate-x-4.5' : 'translate-x-0.5'
                          )}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-dark-300">
                      {formatDistanceToNow(new Date(term.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(term.id)}
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium font-body transition-colors duration-200',
                          deletingId === term.id
                            ? 'bg-danger text-white'
                            : 'bg-danger/10 text-danger hover:bg-danger/20'
                        )}
                      >
                        <Trash2 size={12} />
                        {deletingId === term.id ? 'Confirmar' : 'Excluir'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
