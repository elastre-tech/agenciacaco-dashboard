'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { X, LayoutDashboard, FolderKanban, Users, UserCog, CalendarDays, Zap, Settings, LifeBuoy } from 'lucide-react'
import { cn } from '@/lib/utils/format'
import SupportModal from '@/components/ui/SupportModal'

interface AgencyMobileSidebarProps {
  open: boolean
  onClose: () => void
}

const showSimulator = process.env.NEXT_PUBLIC_SHOW_SIMULATOR === 'true'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/agency', icon: LayoutDashboard },
  { label: 'Workspaces', href: '/agency/workspaces', icon: FolderKanban },
  { label: 'Equipe', href: '/agency/team', icon: Users },
  { label: 'Usuários', href: '/agency/users', icon: UserCog },
  { label: 'Agenda', href: '/agency/agenda', icon: CalendarDays },
  ...(showSimulator ? [{ label: 'Simulador' as const, href: '/agency/simulator' as const, icon: Zap }] : []),
  { label: 'Chamados', href: '/agency/support', icon: LifeBuoy },
  { label: 'Configurações', href: '/agency/settings', icon: Settings },
]

export default function AgencyMobileSidebar({ open, onClose }: AgencyMobileSidebarProps) {
  const pathname = usePathname()
  const [supportOpen, setSupportOpen] = useState(false)

  if (!open && !supportOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-dark-900/60 z-50 lg:hidden"
        onClick={onClose}
      />

      <aside className="fixed left-0 top-0 h-screen w-[280px] bg-dark-700 z-50 lg:hidden flex flex-col">
        <div className="flex items-center justify-between h-16 border-b border-dark-600 px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="font-heading font-extrabold text-dark text-sm">C</span>
            </div>
            <span className="font-heading font-bold text-white text-sm">CaCo</span>
          </div>
          <button onClick={onClose} className="text-dark-300 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === '/agency'
              ? pathname === '/agency'
              : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm transition-colors relative',
                  isActive
                    ? 'bg-dark-600 text-white'
                    : 'text-dark-200 hover:bg-dark-600/50 hover:text-white'
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r" />
                )}
                <item.icon size={18} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="px-2 pb-3">
          <button
            onClick={() => { onClose(); setSupportOpen(true) }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm transition-colors w-full text-dark-400 hover:bg-dark-600/50 hover:text-white"
          >
            <LifeBuoy size={18} />
            <span>Reportar Problema</span>
          </button>
        </div>
      </aside>
      <SupportModal open={supportOpen} onClose={() => setSupportOpen(false)} />
    </>
  )
}
