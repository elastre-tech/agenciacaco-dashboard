'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { FileText, FileSpreadsheet, Download, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/format'
import ChartCard from '@/components/ui/ChartCard'
import { generatePDF } from '@/lib/utils/generatePDF'
import { generateExcel } from '@/lib/utils/generateExcel'
import type { Report, ReportFormat, ReportStatus } from '@/types/database'

const AVAILABLE_MODULES = [
  { key: 'painel-geral', label: 'Painel Geral' },
  { key: 'territorio', label: 'Território' },
  { key: 'mobilizacao', label: 'Mobilização' },
  { key: 'financas', label: 'Finanças' },
  { key: 'social-listening', label: 'Social Listening' },
  { key: 'competidores', label: 'Competidores' },
  { key: 'risco-crise', label: 'Risco e Crise' },
  { key: 'historico', label: 'Histórico' },
] as const

const STATUS_STYLES: Record<ReportStatus, string> = {
  pending: 'bg-dark-50 text-dark-300',
  generating: 'bg-warning/10 text-warning',
  completed: 'bg-success/10 text-success',
  failed: 'bg-danger/10 text-danger',
}

const STATUS_LABELS: Record<ReportStatus, string> = {
  pending: 'Pendente',
  generating: 'Gerando',
  completed: 'Concluído',
  failed: 'Falhou',
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function thirtyDaysAgoISO() {
  const d = new Date()
  d.setDate(d.getDate() - 30)
  return d.toISOString().slice(0, 10)
}

export default function ReportsPage() {
  const params = useParams()
  const workspaceId = params.workspaceId as string

  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState(thirtyDaysAgoISO)
  const [endDate, setEndDate] = useState(todayISO)
  const [selectedModules, setSelectedModules] = useState<string[]>(['painel-geral'])
  const [format, setFormat] = useState<ReportFormat>('pdf')
  const [generating, setGenerating] = useState(false)

  const [reports, setReports] = useState<Report[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  const fetchReports = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('reports')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(50)
    setReports((data as Report[]) ?? [])
    setLoadingHistory(false)
  }, [workspaceId])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  function toggleModule(key: string) {
    setSelectedModules((prev) =>
      prev.includes(key) ? prev.filter((m) => m !== key) : [...prev, key],
    )
  }

  async function handleGenerate() {
    if (!title.trim() || !selectedModules.length) return

    setGenerating(true)
    const supabase = createClient()

    try {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id ?? '00000000-0000-0000-0000-000000000000'

      const { data: inserted, error: insertError } = await supabase
        .from('reports')
        .insert({
          workspace_id: workspaceId,
          title: title.trim(),
          format,
          status: 'generating' as ReportStatus,
          file_url: null,
          filters: { modules: selectedModules, start: startDate, end: endDate },
          generated_by: userId,
        })
        .select()
        .single()

      if (insertError || !inserted) throw new Error(insertError?.message ?? 'Insert failed')

      await fetchReports()

      const dateRange = { start: startDate, end: endDate }
      const blob = format === 'pdf'
        ? await generatePDF(title.trim(), dateRange, selectedModules, workspaceId)
        : await generateExcel(title.trim(), dateRange, selectedModules, workspaceId)

      const fileUrl = URL.createObjectURL(blob)

      await supabase
        .from('reports')
        .update({
          status: 'completed' as ReportStatus,
          file_url: fileUrl,
          completed_at: new Date().toISOString(),
        })
        .eq('id', inserted.id)

      await fetchReports()
      setTitle('')
    } catch (err) {
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  function handleDownload(report: Report) {
    if (report.status !== 'completed' || !report.file_url) return
    const ext = report.format === 'pdf' ? '.pdf' : '.xlsx'
    const anchor = document.createElement('a')
    anchor.href = report.file_url
    anchor.download = `${report.title}${ext}`
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-dark-700 mb-1">
          Relatórios
        </h2>
        <p className="font-body text-sm text-dark-300">
          Gere e exporte relatórios personalizados da campanha.
        </p>
      </div>

      <ChartCard title="Gerar Novo Relatório">
        <div className="space-y-5">
          <div>
            <label className="block font-body text-xs font-medium text-dark-700 mb-1.5">
              Título do Relatório
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Relatório Semanal - Semana 12"
              className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 font-body text-sm text-dark-700 placeholder:text-dark-300 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-body text-xs font-medium text-dark-700 mb-1.5">
                Data Início
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 font-body text-sm text-dark-700 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="block font-body text-xs font-medium text-dark-700 mb-1.5">
                Data Fim
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 font-body text-sm text-dark-700 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div>
            <label className="block font-body text-xs font-medium text-dark-700 mb-2">
              Módulos Incluídos
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {AVAILABLE_MODULES.map((mod) => (
                <label
                  key={mod.key}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition-colors font-body text-sm',
                    selectedModules.includes(mod.key)
                      ? 'border-primary bg-primary/10 text-dark-700'
                      : 'border-border bg-surface text-dark-300 hover:bg-dark-50',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedModules.includes(mod.key)}
                    onChange={() => toggleModule(mod.key)}
                    className="sr-only"
                  />
                  <span className={cn(
                    'h-4 w-4 rounded border flex items-center justify-center flex-shrink-0',
                    selectedModules.includes(mod.key)
                      ? 'border-primary bg-primary'
                      : 'border-dark-300',
                  )}>
                    {selectedModules.includes(mod.key) && (
                      <svg className="h-3 w-3 text-dark-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  {mod.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-body text-xs font-medium text-dark-700 mb-2">
              Formato
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-5 py-2.5 font-body text-sm font-medium transition-colors',
                  format === 'pdf'
                    ? 'bg-primary text-dark-700'
                    : 'border border-border bg-surface text-dark-300 hover:bg-dark-50',
                )}
              >
                <FileText size={16} />
                PDF
              </button>
              <button
                type="button"
                onClick={() => setFormat('excel')}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-5 py-2.5 font-body text-sm font-medium transition-colors',
                  format === 'excel'
                    ? 'bg-primary text-dark-700'
                    : 'border border-border bg-surface text-dark-300 hover:bg-dark-50',
                )}
              >
                <FileSpreadsheet size={16} />
                Excel
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating || !title.trim() || !selectedModules.length}
            className={cn(
              'bg-primary text-dark-700 hover:bg-primary-500 rounded-lg px-5 py-2.5 font-body text-sm font-semibold transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'flex items-center gap-2',
            )}
          >
            {generating && <Loader2 size={16} className="animate-spin" />}
            {generating ? 'Gerando...' : 'Gerar Relatório'}
          </button>
        </div>
      </ChartCard>

      <ChartCard title="Histórico de Relatórios" subtitle={`${reports.length} relatórios`}>
        {loadingHistory ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={20} className="animate-spin text-dark-300" />
          </div>
        ) : !reports.length ? (
          <p className="font-body text-sm text-dark-300 text-center py-10">
            Nenhum relatório gerado ainda.
          </p>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-dark-50">
                  <th className="text-left text-xs uppercase text-dark-300 font-heading px-4 py-3">Título</th>
                  <th className="text-left text-xs uppercase text-dark-300 font-heading px-4 py-3">Formato</th>
                  <th className="text-left text-xs uppercase text-dark-300 font-heading px-4 py-3">Status</th>
                  <th className="text-left text-xs uppercase text-dark-300 font-heading px-4 py-3">Criado em</th>
                  <th className="text-right text-xs uppercase text-dark-300 font-heading px-4 py-3">Ação</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report, idx) => (
                  <tr
                    key={report.id}
                    className={cn(
                      'border-t border-border/50 transition-colors hover:bg-primary-50',
                      idx % 2 === 1 && 'bg-dark-50/30',
                    )}
                  >
                    <td className="px-4 py-3 font-body text-sm text-dark-700">{report.title}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-dark-50 px-2.5 py-0.5 font-mono text-xs text-dark-700 uppercase">
                        {report.format === 'pdf' ? <FileText size={12} /> : <FileSpreadsheet size={12} />}
                        {report.format}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'inline-block rounded-full px-2.5 py-0.5 font-body text-xs font-medium',
                        STATUS_STYLES[report.status],
                      )}>
                        {STATUS_LABELS[report.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-dark-300">
                      {new Date(report.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDownload(report)}
                        disabled={report.status !== 'completed'}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-body text-xs font-medium transition-colors',
                          report.status === 'completed'
                            ? 'bg-primary text-dark-700 hover:bg-primary-500'
                            : 'bg-dark-50 text-dark-300 cursor-not-allowed',
                        )}
                      >
                        <Download size={14} />
                        Baixar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ChartCard>
    </div>
  )
}
