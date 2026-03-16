'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import {
  QrCode,
  Plus,
  Trash2,
  ArrowUpDown,
  Loader2,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/format'
import KPICard from '@/components/ui/KPICard'
import ChartCard from '@/components/ui/ChartCard'
import type { QRCode } from '@/types/database'

type SortField = 'scans_count' | 'created_at'

export default function QrCodesPage() {
  const params = useParams()
  const workspaceId = params.workspaceId as string

  const [qrCodes, setQrCodes] = useState<QRCode[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortField>('scans_count')
  const [showForm, setShowForm] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchQrCodes = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order(sortBy, { ascending: false })

    setQrCodes(data ?? [])
    setLoading(false)
  }, [workspaceId, sortBy])

  useEffect(() => {
    fetchQrCodes()
  }, [fetchQrCodes])

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      const supabase = createClient()
      await supabase.from('qr_codes').delete().eq('id', id)
      setQrCodes((prev) => prev.filter((qr) => qr.id !== id))
    } catch {
      console.error('Failed to delete QR code')
    } finally {
      setDeleting(null)
    }
  }

  const handleCreated = (qr: QRCode) => {
    setQrCodes((prev) => [qr, ...prev])
    setShowForm(false)
  }

  const toggleSort = () => {
    setSortBy((prev) =>
      prev === 'scans_count' ? 'created_at' : 'scans_count',
    )
  }

  const totalScans = qrCodes.reduce((sum, qr) => sum + qr.scans_count, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-dark-300" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-dark-700 mb-1">
          QR Codes
        </h2>
        <p className="font-body text-sm text-dark-300">
          Gerencie QR codes para rastreamento territorial.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          label="Total de QR Codes"
          value={String(qrCodes.length)}
          icon={QrCode}
        />
        <KPICard
          label="Leituras Totais"
          value={totalScans.toLocaleString('pt-BR')}
          icon={QrCode}
        />
        <KPICard
          label="Média por QR"
          value={
            qrCodes.length
              ? (totalScans / qrCodes.length).toFixed(1)
              : '0'
          }
          icon={QrCode}
        />
      </div>

      <ChartCard
        title="Todos os QR Codes"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSort}
              className="inline-flex items-center gap-1 text-xs font-body text-dark-400 hover:text-dark-700 transition-colors"
            >
              <ArrowUpDown size={14} />
              {sortBy === 'scans_count' ? 'Leituras' : 'Data'}
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-dark-700 font-body text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              <Plus size={14} />
              Novo
            </button>
          </div>
        }
      >
        {showForm && (
          <CreateQrForm
            workspaceId={workspaceId}
            onCreated={handleCreated}
            onCancel={() => setShowForm(false)}
          />
        )}

        <QrTable
          qrCodes={qrCodes}
          deleting={deleting}
          onDelete={handleDelete}
        />
      </ChartCard>
    </div>
  )
}

function QrTable({
  qrCodes,
  deleting,
  onDelete,
}: {
  qrCodes: QRCode[]
  deleting: string | null
  onDelete: (id: string) => void
}) {
  const [confirmId, setConfirmId] = useState<string | null>(null)

  if (!qrCodes.length) {
    return (
      <p className="font-body text-sm text-dark-300 text-center py-6">
        Nenhum QR code cadastrado.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-border/50">
            <th className="font-heading text-xs font-semibold text-dark-400 pb-2">
              Label
            </th>
            <th className="font-heading text-xs font-semibold text-dark-400 pb-2">
              Código
            </th>
            <th className="font-heading text-xs font-semibold text-dark-400 pb-2">
              Local
            </th>
            <th className="font-heading text-xs font-semibold text-dark-400 pb-2 text-right">
              Leituras
            </th>
            <th className="font-heading text-xs font-semibold text-dark-400 pb-2 text-right">
              Criado em
            </th>
            <th className="pb-2 w-10" />
          </tr>
        </thead>
        <tbody>
          {qrCodes.map((qr) => (
            <tr
              key={qr.id}
              className="border-b border-border/30 last:border-0"
            >
              <td className="font-body text-sm text-dark-700 py-2.5">
                {qr.label}
              </td>
              <td className="font-mono text-xs text-dark-400 py-2.5">
                {qr.code}
              </td>
              <td className="font-body text-sm text-dark-400 py-2.5">
                {qr.location ?? '—'}
              </td>
              <td className="font-mono text-sm text-dark-700 py-2.5 text-right">
                {qr.scans_count}
              </td>
              <td className="font-mono text-xs text-dark-400 py-2.5 text-right">
                {new Date(qr.created_at).toLocaleDateString('pt-BR')}
              </td>
              <td className="py-2.5 text-right">
                {confirmId === qr.id ? (
                  <div className="inline-flex items-center gap-1">
                    <button
                      onClick={() => {
                        onDelete(qr.id)
                        setConfirmId(null)
                      }}
                      disabled={deleting === qr.id}
                      className="text-xs font-body text-danger hover:underline disabled:opacity-50"
                    >
                      {deleting === qr.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        'Sim'
                      )}
                    </button>
                    <button
                      onClick={() => setConfirmId(null)}
                      className="text-xs font-body text-dark-300 hover:underline"
                    >
                      Não
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmId(qr.id)}
                    className="p-1 rounded hover:bg-danger/10 text-dark-300 hover:text-danger transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CreateQrForm({
  workspaceId,
  onCreated,
  onCancel,
}: {
  workspaceId: string
  onCreated: (qr: QRCode) => void
  onCancel: () => void
}) {
  const [label, setLabel] = useState('')
  const [url, setUrl] = useState('')
  const [location, setLocation] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!label.trim() || !url.trim()) return

    setSubmitting(true)
    try {
      const supabase = createClient()
      const code = `qr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

      const { data, error } = await supabase
        .from('qr_codes')
        .insert({
          workspace_id: workspaceId,
          label: label.trim(),
          code,
          url: url.trim(),
          location: location.trim() || null,
          scans_count: 0,
        })
        .select()
        .single()

      if (error) throw error
      onCreated(data)
    } catch {
      console.error('Failed to create QR code')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = cn(
    'w-full border border-border rounded-md px-3 py-2 font-body text-sm',
    'bg-background text-dark-700 placeholder:text-dark-200',
    'focus:outline-none focus:ring-1 focus:ring-primary',
  )

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-5 p-4 rounded-lg bg-background border border-border/50"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-heading text-sm font-semibold text-dark-700">
          Novo QR Code
        </span>
        <button
          type="button"
          onClick={onCancel}
          className="p-1 rounded hover:bg-dark-100 text-dark-300 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label *"
          required
          className={inputClass}
        />
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="URL *"
          required
          className={inputClass}
        />
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Local (opcional)"
          className={inputClass}
        />
      </div>

      <div className="flex justify-end mt-3">
        <button
          type="submit"
          disabled={submitting || !label.trim() || !url.trim()}
          className={cn(
            'inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-body text-sm font-semibold transition-colors',
            'bg-primary text-dark-700 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed',
          )}
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          Criar QR Code
        </button>
      </div>
    </form>
  )
}
