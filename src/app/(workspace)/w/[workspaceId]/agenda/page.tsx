'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { CalendarDays, CalendarClock, CalendarCheck, Plus } from 'lucide-react'
import { addMonths, subMonths, format, isToday, isThisWeek, startOfMonth, endOfMonth, subDays, addDays } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import KPICard from '@/components/ui/KPICard'
import EmptyState from '@/components/ui/EmptyState'
import { ModulePageSkeleton } from '@/components/ui/Skeleton'
import MonthView from '@/components/calendar/MonthView'
import EventModal from '@/components/calendar/EventModal'
import type { EventFormData } from '@/components/calendar/EventModal'
import type { CalendarEvent } from '@/types/database'

export default function WorkspaceAgendaPage() {
  const params = useParams()
  const workspaceId = params.workspaceId as string
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [defaultDate, setDefaultDate] = useState<string | undefined>()
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = useCallback(async () => {
    const supabase = createClient()
    const rangeStart = subDays(startOfMonth(currentMonth), 7)
    const rangeEnd = addDays(endOfMonth(currentMonth), 7)

    try {
      const { data } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('workspace_id', workspaceId)
        .gte('start_at', rangeStart.toISOString())
        .lte('start_at', rangeEnd.toISOString())
        .order('start_at')

      setEvents(data ?? [])
    } catch {
      console.error('Failed to fetch calendar events')
    } finally {
      setLoading(false)
    }
  }, [workspaceId, currentMonth])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const kpis = useMemo(() => {
    const now = new Date()
    const monthEvents = events.filter((e) => {
      const start = new Date(e.start_at)
      return start.getMonth() === currentMonth.getMonth() && start.getFullYear() === currentMonth.getFullYear()
    })
    const todayEvents = events.filter((e) => isToday(new Date(e.start_at)))
    const weekEvents = events.filter((e) => isThisWeek(new Date(e.start_at), { weekStartsOn: 0 }))
    const upcoming = events
      .filter((e) => new Date(e.start_at) >= now)
      .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
    const nextEvent = upcoming[0]

    return {
      monthTotal: monthEvents.length,
      todayCount: todayEvents.length,
      weekCount: weekEvents.length,
      nextEvent: nextEvent ? format(new Date(nextEvent.start_at), 'dd/MM HH:mm') : '-',
    }
  }, [events, currentMonth])

  async function handleSave(data: EventFormData) {
    const supabase = createClient()
    const { data: user } = await supabase.auth.getUser()
    if (!user?.user) return

    setError(null)

    if (editingEvent) {
      const { error: updateError } = await supabase
        .from('calendar_events')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', editingEvent.id)

      if (updateError) {
        console.error('Failed to update event:', updateError)
        setError('Erro ao atualizar evento. Verifique suas permissões.')
        return
      }
    } else {
      const { error: insertError } = await supabase.from('calendar_events').insert({
        ...data,
        workspace_id: workspaceId,
        created_by: user.user.id,
      })

      if (insertError) {
        console.error('Failed to insert event:', insertError)
        setError('Erro ao criar evento. Verifique suas permissões.')
        return
      }
    }

    setEditingEvent(null)
    await fetchEvents()
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    setError(null)

    const { error: deleteError } = await supabase.from('calendar_events').delete().eq('id', id)

    if (deleteError) {
      console.error('Failed to delete event:', deleteError)
      setError('Erro ao excluir evento. Verifique suas permissões.')
      return
    }

    setEditingEvent(null)
    await fetchEvents()
  }

  function handleDayClick(date: Date) {
    setEditingEvent(null)
    setDefaultDate(format(date, 'yyyy-MM-dd'))
    setModalOpen(true)
  }

  function handleEventClick(event: CalendarEvent) {
    setEditingEvent(event)
    setDefaultDate(undefined)
    setModalOpen(true)
  }

  if (loading) {
    return <ModulePageSkeleton kpis={4} charts={1} />
  }

  if (!events.length && !modalOpen) {
    return (
      <div className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-heading text-xl font-bold text-dark-700 mb-1">Agenda</h2>
            <p className="font-body text-sm text-dark-300">
              Organize os compromissos e eventos da campanha.
            </p>
          </div>
          <button
            onClick={() => { setEditingEvent(null); setDefaultDate(format(new Date(), 'yyyy-MM-dd')); setModalOpen(true) }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-dark font-heading font-semibold text-sm hover:bg-primary-500 transition-colors"
          >
            <Plus size={16} />
            Novo Evento
          </button>
        </div>
        <EmptyState
          icon={CalendarDays}
          title="Nenhum evento agendado"
          description="Crie eventos para organizar a agenda da campanha."
          action={{ label: 'Criar Evento', onClick: () => { setDefaultDate(format(new Date(), 'yyyy-MM-dd')); setModalOpen(true) } }}
        />
        <EventModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          defaultDate={defaultDate}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-dark-700 mb-1">Agenda</h2>
          <p className="font-body text-sm text-dark-300">
            Organize os compromissos e eventos da campanha.
          </p>
        </div>
        <button
          onClick={() => { setEditingEvent(null); setDefaultDate(format(new Date(), 'yyyy-MM-dd')); setModalOpen(true) }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-dark font-heading font-semibold text-sm hover:bg-primary-500 transition-colors"
        >
          <Plus size={16} />
          Novo Evento
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg bg-danger/10 text-danger border border-danger/20 text-sm font-body">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Eventos no Mês" value={String(kpis.monthTotal)} icon={CalendarDays} />
        <KPICard label="Próximo Evento" value={kpis.nextEvent} icon={CalendarClock} />
        <KPICard label="Eventos Hoje" value={String(kpis.todayCount)} icon={CalendarCheck} />
        <KPICard label="Eventos na Semana" value={String(kpis.weekCount)} icon={CalendarDays} />
      </div>

      <MonthView
        currentMonth={currentMonth}
        events={events}
        onPrevMonth={() => setCurrentMonth((m) => subMonths(m, 1))}
        onNextMonth={() => setCurrentMonth((m) => addMonths(m, 1))}
        onDayClick={handleDayClick}
        onEventClick={handleEventClick}
      />

      <EventModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingEvent(null) }}
        onSave={handleSave}
        onDelete={editingEvent ? handleDelete : undefined}
        event={editingEvent}
        defaultDate={defaultDate}
      />
    </div>
  )
}
