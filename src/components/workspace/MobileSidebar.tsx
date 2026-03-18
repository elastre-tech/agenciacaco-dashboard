'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { X, ArrowLeft } from 'lucide-react'
import {
  LayoutDashboard,
  Map,
  Users,
  DollarSign,
  FileBarChart,
  Ear,
  Swords,
  ShieldAlert,
  History,
  CalendarDays,
  LifeBuoy,
} from 'lucide-react'
import { cn } from '@/lib/utils/format'
import SupportModal from '@/components/ui/SupportModal'
import type { PermissionModule } from '@/types/database'

interface MobileSidebarProps {
  workspaceId: string
  workspaceName: string
  open: boolean
  onClose: () => void
  isAgencyMember?: boolean
  canView?: (module: PermissionModule) => boolean
}

const NAV_ITEMS = [
  { label: 'Painel Geral', href: '/dashboard', icon: LayoutDashboard, module: 'dashboard' as PermissionModule },
  { label: 'Território', href: '/territory', icon: Map, module: 'territory' as PermissionModule },
  { label: 'Mobilização', href: '/mobilization', icon: Users, module: 'mobilization' as PermissionModule },
  { label: 'Finanças', href: '/finance', icon: DollarSign, module: 'finance' as PermissionModule },
  { label: 'Relatórios', href: '/reports', icon: FileBarChart, module: 'reports' as PermissionModule },
  { label: 'Social Listening', href: '/listening', icon: Ear, module: 'listening' as PermissionModule },
  { label: 'Competidores', href: '/competitors', icon: Swords, module: 'competitors' as PermissionModule },
  { label: 'Risco e Crise', href: '/risk', icon: ShieldAlert, module: 'risk' as PermissionModule },
  { label: 'Histórico', href: '/history', icon: History, module: 'history' as PermissionModule },
  { label: 'Agenda', href: '/agenda', icon: CalendarDays, module: 'calendar' as PermissionModule },
] as const

export default function MobileSidebar({ workspaceId, workspaceName, open, onClose, isAgencyMember, canView }: MobileSidebarProps) {
  const pathname = usePathname()
  const basePath = `/w/${workspaceId}`
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

        <div className="px-4 py-3 border-b border-dark-600">
          <p className="font-body text-[11px] uppercase tracking-wider text-dark-400 mb-1">
            Workspace
          </p>
          <p className="font-heading text-sm font-semibold text-white truncate">
            {workspaceName}
          </p>
        </div>

        {isAgencyMember && (
          <div className="px-2 pt-3 pb-1">
            <Link
              href="/agency"
              onClick={onClose}
              className="flex items-center gap-2 px-3 py-2 rounded-lg font-body text-xs text-dark-400 hover:text-white hover:bg-dark-600/50 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Voltar à Agência</span>
            </Link>
          </div>
        )}

        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.filter((item) => !canView || canView(item.module)).map((item) => {
            const fullPath = `${basePath}${item.href}`
            const isActive = pathname === fullPath || pathname.startsWith(`${fullPath}/`)

            return (
              <Link
                key={item.href}
                href={fullPath}
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
