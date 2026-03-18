'use client'

import { useState, useEffect } from 'react'
import { X, Trash2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/format'
import type { CalendarEvent } from '@/types/database'

const COLOR_PRESETS = [
  '#3B82F6',
  '#22C55E',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
]

interface EventModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: EventFormData) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  event?: CalendarEvent | null
  defaultDate?: string
}

export interface EventFormData {
  title: string
  description: string
  start_at: string
  end_at: string
  all_day: boolean
  color: string
}

function toLocalDatetime(iso: string): string {
  const d = new Date(iso)
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

function toLocalDate(iso: string): string {
  return toLocalDatetime(iso).slice(0, 10)
}

export default function EventModal({ open, onClose, onSave, onDelete, event, defaultDate }: EventModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const [allDay, setAllDay] = useState(false)
  const [color, setColor] = useState(COLOR_PRESETS[0])
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setDescription(event.description ?? '')
      setAllDay(event.all_day)
      setColor(event.color)
      if (event.all_day) {
        setStartAt(toLocalDate(event.start_at))
        setEndAt(toLocalDate(event.end_at))
      } else {
        setStartAt(toLocalDatetime(event.start_at))
        setEndAt(toLocalDatetime(event.end_at))
      }
    } else {
      setTitle('')
      setDescription('')
      setAllDay(false)
      setColor(COLOR_PRESETS[0])
      if (defaultDate) {
        setStartAt(`${defaultDate}T09:00`)
        setEndAt(`${defaultDate}T10:00`)
      } else {
        setStartAt('')
        setEndAt('')
      }
    }
  }, [event, defaultDate, open])

  if (!open) return null

  async function handleSave() {
    if (!title.trim() || !startAt || !endAt) return
    setSaving(true)
    try {
      const startIso = allDay ? `${startAt}T00:00:00` : startAt
      const endIso = allDay ? `${endAt}T23:59:59` : endAt
      await onSave({
        title: title.trim(),
        description: description.trim(),
        start_at: new Date(startIso).toISOString(),
        end_at: new Date(endIso).toISOString(),
        all_day: allDay,
        color,
      })
      onClose()
    } catch {
      console.error('Failed to save event')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!event || !onDelete) return
    setDeleting(true)
    try {
      await onDelete(event.id)
      onClose()
    } catch {
      console.error('Failed to delete event')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-dark-900/60 z-50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-card shadow-card border border-border/50 w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-heading font-semibold text-dark-700 text-lg">
            {event ? 'Editar Evento' : 'Novo Evento'}
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
              Título *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Reunião de estratégia"
              className="w-full px-4 py-3 rounded-lg border border-dark-100 bg-surface font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-dark-400 uppercase tracking-wider mb-2">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes do evento..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-dark-100 bg-surface font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allDay}
                onChange={(e) => {
                  setAllDay(e.target.checked)
                  if (e.target.checked && startAt) {
                    setStartAt(startAt.slice(0, 10))
                    setEndAt(endAt ? endAt.slice(0, 10) : startAt.slice(0, 10))
                  } else if (!e.target.checked && startAt) {
                    setStartAt(`${startAt.slice(0, 10)}T09:00`)
                    setEndAt(`${(endAt || startAt).slice(0, 10)}T10:00`)
                  }
                }}
                className="w-4 h-4 rounded border-dark-200 text-primary focus:ring-primary"
              />
              <span className="font-body text-sm text-dark-500">Dia inteiro</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-dark-400 uppercase tracking-wider mb-2">
                Início *
              </label>
              <input
                type={allDay ? 'date' : 'datetime-local'}
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="w-full px-3 py-3 rounded-lg border border-dark-100 bg-surface font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-400 uppercase tracking-wider mb-2">
                Fim *
              </label>
              <input
                type={allDay ? 'date' : 'datetime-local'}
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                className="w-full px-3 py-3 rounded-lg border border-dark-100 bg-surface font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-dark-400 uppercase tracking-wider mb-2">
              Cor
            </label>
            <div className="flex gap-2">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    'w-8 h-8 rounded-full transition-all',
                    color === c ? 'ring-2 ring-offset-2 ring-dark-300 scale-110' : 'hover:scale-105'
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            {event && onDelete && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-danger/30 text-danger font-body text-sm hover:bg-danger/5 transition-colors disabled:opacity-50"
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Excluir
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !title.trim() || !startAt || !endAt}
              className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-dark font-heading font-semibold text-sm hover:bg-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {event ? 'Salvar' : 'Criar Evento'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
