'use client'

import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils/format'
import type { Lead, LeadTemperature } from '@/types/database'

interface LeadsTableProps {
  leads: Lead[]
  selectedIds: Set<string>
  onToggle: (id: string) => void
  onToggleAll: () => void
  sortField: SortField
  sortDir: 'asc' | 'desc'
  onSort: (field: SortField) => void
}

export type SortField = 'full_name' | 'created_at' | 'temperature'

const TEMP_STYLES: Record<LeadTemperature, { bg: string; text: string; label: string }> = {
  hot: { bg: 'bg-danger/10', text: 'text-danger', label: 'Quente' },
  warm: { bg: 'bg-warning/10', text: 'text-warning', label: 'Morno' },
  cold: { bg: 'bg-info/10', text: 'text-info', label: 'Frio' },
}

function SortHeader({
  label,
  field,
  activeField,
  dir,
  onSort,
}: {
  label: string
  field: SortField
  activeField: SortField
  dir: 'asc' | 'desc'
  onSort: (f: SortField) => void
}) {
  const isActive = field === activeField

  return (
    <button
      onClick={() => onSort(field)}
      className="inline-flex items-center gap-1 text-xs uppercase text-dark-300 font-body font-medium"
    >
      {label}
      <span className="flex flex-col -space-y-1">
        <ChevronUp size={10} className={cn(isActive && dir === 'asc' ? 'text-dark-700' : 'text-dark-200')} />
        <ChevronDown size={10} className={cn(isActive && dir === 'desc' ? 'text-dark-700' : 'text-dark-200')} />
      </span>
    </button>
  )
}

export default function LeadsTable({
  leads,
  selectedIds,
  onToggle,
  onToggleAll,
  sortField,
  sortDir,
  onSort,
}: LeadsTableProps) {
  const allSelected = leads.length > 0 && leads.every((l) => selectedIds.has(l.id))

  return (
    <div className="overflow-x-auto -mx-5">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="bg-dark-50">
            <th className="px-4 py-3 w-10">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleAll}
                className="rounded border-dark-200 text-primary focus:ring-primary/30"
              />
            </th>
            <th className="text-left px-4 py-3">
              <SortHeader label="Nome" field="full_name" activeField={sortField} dir={sortDir} onSort={onSort} />
            </th>
            <th className="text-left text-xs uppercase text-dark-300 font-body font-medium px-4 py-3">Telefone</th>
            <th className="text-left text-xs uppercase text-dark-300 font-body font-medium px-4 py-3">Bairro</th>
            <th className="text-left text-xs uppercase text-dark-300 font-body font-medium px-4 py-3">Origem</th>
            <th className="text-left px-4 py-3">
              <SortHeader label="Temperatura" field="temperature" activeField={sortField} dir={sortDir} onSort={onSort} />
            </th>
            <th className="text-left px-4 py-3">
              <SortHeader label="Criado" field="created_at" activeField={sortField} dir={sortDir} onSort={onSort} />
            </th>
            <th className="text-left text-xs uppercase text-dark-300 font-body font-medium px-4 py-3">Notas</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead, idx) => {
            const style = TEMP_STYLES[lead.temperature]
            return (
              <tr
                key={lead.id}
                className={cn(
                  'hover:bg-primary-50 transition-colors',
                  idx % 2 === 0 ? 'bg-white' : 'bg-dark-50',
                  selectedIds.has(lead.id) && 'bg-primary-50/50'
                )}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(lead.id)}
                    onChange={() => onToggle(lead.id)}
                    className="rounded border-dark-200 text-primary focus:ring-primary/30"
                  />
                </td>
                <td className="px-4 py-3 font-body text-sm text-dark-700 font-medium">{lead.full_name}</td>
                <td className="px-4 py-3 font-mono text-sm text-dark-400">{lead.phone ?? '—'}</td>
                <td className="px-4 py-3 font-body text-sm text-dark-400">{lead.neighborhood ?? '—'}</td>
                <td className="px-4 py-3 font-body text-xs text-dark-400 capitalize">{lead.source}</td>
                <td className="px-4 py-3">
                  <span className={cn('inline-block px-2 py-0.5 rounded-full text-xs font-medium font-body', style.bg, style.text)}>
                    {style.label}
                  </span>
                </td>
                <td className="px-4 py-3 font-body text-xs text-dark-300">
                  {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-4 py-3 font-body text-xs text-dark-400 max-w-[150px] truncate">
                  {lead.notes ?? '—'}
                </td>
              </tr>
            )
          })}
          {leads.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-12 text-center font-body text-sm text-dark-300">
                Nenhum lead encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
