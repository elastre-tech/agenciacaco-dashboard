'use client'

import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  parseISO,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils/format'
import EventChip from './EventChip'
import type { CalendarEvent } from '@/types/database'

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

interface MonthViewProps {
  currentMonth: Date
  events: CalendarEvent[]
  onPrevMonth: () => void
  onNextMonth: () => void
  onDayClick: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
}

export default function MonthView({
  currentMonth,
  events,
  onPrevMonth,
  onNextMonth,
  onDayClick,
  onEventClick,
}: MonthViewProps) {
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
    return eachDayOfInterval({ start: calStart, end: calEnd })
  }, [currentMonth])

  const eventsByDay = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {}
    events.forEach((evt) => {
      const start = parseISO(evt.start_at)
      const end = parseISO(evt.end_at)
      days.forEach((day) => {
        if (day >= new Date(start.toDateString()) && day <= new Date(end.toDateString())) {
          const key = format(day, 'yyyy-MM-dd')
          if (!map[key]) map[key] = []
          map[key].push(evt)
        }
      })
    })
    return map
  }, [events, days])

  return (
    <div className="bg-surface rounded-card shadow-card border border-border/50">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
        <button
          onClick={onPrevMonth}
          className="p-2 rounded-lg hover:bg-dark-50 transition-colors"
        >
          <ChevronLeft size={18} className="text-dark-400" />
        </button>
        <h3 className="font-heading font-semibold text-dark-700 text-base capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h3>
        <button
          onClick={onNextMonth}
          className="p-2 rounded-lg hover:bg-dark-50 transition-colors"
        >
          <ChevronRight size={18} className="text-dark-400" />
        </button>
      </div>

      <div className="grid grid-cols-7">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="px-2 py-2.5 text-center text-xs font-medium text-dark-300 uppercase tracking-wider font-heading border-b border-border/30"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd')
          const dayEvents = eventsByDay[key] ?? []
          const inMonth = isSameMonth(day, currentMonth)
          const today = isToday(day)

          return (
            <button
              key={key}
              onClick={() => onDayClick(day)}
              className={cn(
                'min-h-[80px] sm:min-h-[100px] p-1.5 border-b border-r border-border/20 text-left transition-colors hover:bg-dark-50/50 relative flex flex-col',
                !inMonth && 'bg-dark-50/30'
              )}
            >
              <span
                className={cn(
                  'inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-body mb-1',
                  today && 'bg-primary text-dark font-semibold',
                  !today && inMonth && 'text-dark-700',
                  !today && !inMonth && 'text-dark-200'
                )}
              >
                {format(day, 'd')}
              </span>
              <div className="flex flex-col gap-0.5 flex-1 overflow-hidden">
                {dayEvents.slice(0, 3).map((evt) => (
                  <EventChip key={evt.id} event={evt} onClick={onEventClick} />
                ))}
                {dayEvents.length > 3 && (
                  <span className="text-[10px] font-body text-dark-300 px-1">
                    +{dayEvents.length - 3} mais
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
