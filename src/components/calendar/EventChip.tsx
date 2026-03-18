'use client'

import type { CalendarEvent } from '@/types/database'

interface EventChipProps {
  event: CalendarEvent
  onClick: (event: CalendarEvent) => void
}

export default function EventChip({ event, onClick }: EventChipProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onClick(event)
      }}
      className="w-full text-left px-1.5 py-0.5 rounded text-[11px] font-body font-medium truncate leading-tight transition-opacity hover:opacity-80"
      style={{
        backgroundColor: `${event.color}20`,
        color: event.color,
      }}
      title={event.title}
    >
      {event.title}
    </button>
  )
}
