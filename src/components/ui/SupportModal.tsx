'use client'

import { useState } from 'react'
import { X, Loader2, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface SupportModalProps {
  open: boolean
  onClose: () => void
}

export default function SupportModal({ open, onClose }: SupportModalProps) {
  const [description, setDescription] = useState('')
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!open) return null

  async function handleSubmit() {
    if (!description.trim()) return
    setSubmitting(true)

    try {
      const supabase = createClient()
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) return

      let screenshotUrl: string | null = null
      if (screenshot) {
        const ext = screenshot.name.split('.').pop() ?? 'png'
        const path = `support/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(path, screenshot)

        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(path)
          screenshotUrl = urlData.publicUrl
        }
      }

      const { error } = await supabase.from('support_tickets').insert({
        description: description.trim(),
        screenshot_url: screenshotUrl,
        page_url: window.location.href,
        user_email: userData.user.email ?? null,
        browser_info: navigator.userAgent,
        created_by: userData.user.id,
      })

      if (error) {
        console.error('Failed to submit ticket:', error)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        setDescription('')
        setScreenshot(null)
        setSuccess(false)
        onClose()
      }, 2000)
    } catch (err) {
      console.error('Support ticket error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-dark-900/60 z-[60] flex items-center justify-center p-4">
        <div className="bg-surface rounded-card shadow-card border border-border/50 w-full max-w-md p-8 text-center">
          <CheckCircle size={48} className="text-success mx-auto mb-4" />
          <h3 className="font-heading font-semibold text-dark-700 text-lg mb-1">
            Chamado enviado com sucesso
          </h3>
          <p className="font-body text-sm text-dark-300">
            Nossa equipe irá analisar seu problema em breve.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-dark-900/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-surface rounded-card shadow-card border border-border/50 w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-heading font-semibold text-dark-700 text-lg">
            Reportar Problema
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-dark-50 transition-colors"
          >
            <X size={18} className="text-dark-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-dark-400 uppercase tracking-wider mb-2">
              Descreva o problema *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="O que aconteceu? O que você esperava que acontecesse?"
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-dark-100 bg-surface font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-dark-400 uppercase tracking-wider mb-2">
              Captura de tela (opcional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setScreenshot(e.target.files?.[0] ?? null)}
              className="w-full font-body text-sm text-dark-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-dark-50 file:text-dark-700 hover:file:bg-dark-100 file:cursor-pointer file:transition-colors"
            />
          </div>

          <div className="rounded-lg bg-dark-50/50 px-3 py-2.5 space-y-1">
            <p className="font-body text-[11px] text-dark-300">
              Informações capturadas automaticamente:
            </p>
            <p className="font-mono text-[11px] text-dark-400 truncate">
              Página: {typeof window !== 'undefined' ? window.location.pathname : ''}
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting || !description.trim()}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-dark font-heading font-semibold text-sm hover:bg-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {submitting ? 'Enviando...' : 'Enviar Chamado'}
          </button>
        </div>
      </div>
    </div>
  )
}
