'use client'

import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateAction {
  label: string
  href?: string
  onClick?: () => void
}

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: EmptyStateAction
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-14 h-14 rounded-2xl bg-dark-50 flex items-center justify-center mb-4">
        <Icon size={28} className="text-dark-200" />
      </div>
      <h3 className="font-heading font-semibold text-dark-700 text-base mb-1.5">
        {title}
      </h3>
      <p className="font-body text-sm text-dark-300 text-center max-w-sm mb-5">
        {description}
      </p>
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="inline-flex items-center gap-2 bg-primary text-dark font-heading font-semibold rounded-lg px-5 py-2.5 hover:bg-primary-500 transition-colors text-sm"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="inline-flex items-center gap-2 bg-primary text-dark font-heading font-semibold rounded-lg px-5 py-2.5 hover:bg-primary-500 transition-colors text-sm"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  )
}
