'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
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
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  LifeBuoy,
} from 'lucide-react'
import { cn } from '@/lib/utils/format'
import SupportModal from '@/components/ui/SupportModal'
import type { PermissionModule } from '@/types/database'

interface SidebarProps {
  workspaceId: string
  workspaceName: string
  collapsed: boolean
  onToggle: () => void
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

export default function Sidebar({ workspaceId, workspaceName, collapsed, onToggle, isAgencyMember, canView }: SidebarProps) {
  const pathname = usePathname()
  const basePath = `/w/${workspaceId}`
  const [supportOpen, setSupportOpen] = useState(false)

  return (
    <>
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-dark-700 flex flex-col z-40 transition-[width] duration-200 ease-out',
        collapsed ? 'w-[68px]' : 'w-[240px]'
      )}
    >
      <div className={cn(
        'flex items-center h-16 border-b border-dark-600 px-4',
        collapsed ? 'justify-center' : 'gap-3'
      )}>
        <div className="w-8 h-8 rounded-lg bg-primary flex-shrink-0 flex items-center justify-center">
          <span className="font-heading font-extrabold text-dark text-sm">C</span>
        </div>
        {!collapsed && (
          <span className="font-heading font-bold text-white text-sm truncate">
            CaCo
          </span>
        )}
      </div>

      {!collapsed && (
        <div className="px-4 py-3 border-b border-dark-600">
          <p className="font-body text-[11px] uppercase tracking-wider text-dark-400 mb-1">
            Workspace
          </p>
          <p className="font-heading text-sm font-semibold text-white truncate">
            {workspaceName}
          </p>
        </div>
      )}

      {isAgencyMember && (
        <div className="px-2 pt-3 pb-1">
          <Link
            href="/agency"
            title={collapsed ? 'Voltar à Agência' : undefined}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg font-body text-xs text-dark-400 hover:text-white hover:bg-dark-600/50 transition-colors',
              collapsed && 'justify-center px-0'
            )}
          >
            <ArrowLeft size={14} className="flex-shrink-0" />
            {!collapsed && <span>Voltar à Agência</span>}
          </Link>
        </div>
      )}

      <nav className="flex-1 py-1 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.filter((item) => !canView || canView(item.module)).map((item) => {
          const fullPath = `${basePath}${item.href}`
          const isActive = pathname === fullPath || pathname.startsWith(`${fullPath}/`)

          return (
            <Link
              key={item.href}
              href={fullPath}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm transition-colors relative group',
                isActive
                  ? 'bg-dark-600 text-white'
                  : 'text-dark-200 hover:bg-dark-600/50 hover:text-white',
                collapsed && 'justify-center px-0'
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r" />
              )}
              <item.icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="px-2 pb-2">
        <button
          onClick={() => setSupportOpen(true)}
          title={collapsed ? 'Reportar Problema' : undefined}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm transition-colors w-full text-dark-400 hover:bg-dark-600/50 hover:text-white',
            collapsed && 'justify-center px-0'
          )}
        >
          <LifeBuoy size={18} className="flex-shrink-0" />
          {!collapsed && <span>Reportar Problema</span>}
        </button>
      </div>

      <button
        onClick={onToggle}
        className="flex items-center justify-center h-12 border-t border-dark-600 text-dark-300 hover:text-white transition-colors"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
    <SupportModal open={supportOpen} onClose={() => setSupportOpen(false)} />
    </>
  )
}
