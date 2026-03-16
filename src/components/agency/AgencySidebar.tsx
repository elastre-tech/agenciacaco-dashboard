'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Settings,
  UserCog,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils/format'

interface AgencySidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/agency', icon: LayoutDashboard },
  { label: 'Workspaces', href: '/agency/workspaces', icon: FolderKanban },
  { label: 'Equipe', href: '/agency/team', icon: Users },
  { label: 'Usuários', href: '/agency/users', icon: UserCog },
  { label: 'Simulador', href: '/agency/simulator', icon: Zap },
  { label: 'Configurações', href: '/agency/settings', icon: Settings },
] as const

export default function AgencySidebar({ collapsed, onToggle }: AgencySidebarProps) {
  const pathname = usePathname()

  return (
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

      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === '/agency'
            ? pathname === '/agency'
            : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
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

      <button
        onClick={onToggle}
        className="flex items-center justify-center h-12 border-t border-dark-600 text-dark-300 hover:text-white transition-colors"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  )
}
