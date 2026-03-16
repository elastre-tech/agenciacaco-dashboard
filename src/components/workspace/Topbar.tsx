'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Bell, LogOut, User, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/format'

interface Alert {
  id: string
  title: string
  severity: string
  status: string
  created_at: string
}

interface TopbarProps {
  workspaceName: string
  workspaceId: string
  sidebarCollapsed: boolean
}

export default function Topbar({ workspaceName, workspaceId, sidebarCollapsed }: TopbarProps) {
  const router = useRouter()
  const supabase = createClient()
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const menuRef = useRef<HTMLDivElement>(null)
  const bellRef = useRef<HTMLDivElement>(null)

  const fetchAlerts = useCallback(async () => {
    const { data } = await supabase
      .from('intelligence_alerts')
      .select('id, title, severity, status, created_at')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(6)
    setAlerts((data as Alert[]) ?? [])
  }, [supabase, workspaceId])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-16 bg-surface border-b border-border flex items-center justify-between px-6 z-30 transition-[left] duration-200 ease-out',
        sidebarCollapsed ? 'left-[68px]' : 'left-[240px]'
      )}
    >
      <div className="flex items-center gap-4">
        <h1 className="font-heading font-semibold text-dark-700 text-lg">
          {workspaceName}
        </h1>
      </div>

      <div className="flex items-center gap-1">
        <div className="relative">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2.5 rounded-lg text-dark-300 hover:text-dark-600 hover:bg-dark-50 transition-colors"
          >
            <Search size={18} />
          </button>
          {searchOpen && (
            <div className="absolute right-0 top-12 w-72 bg-surface border border-border rounded-lg shadow-card-hover p-1">
              <input
                autoFocus
                type="text"
                placeholder="Buscar..."
                className="w-full px-3 py-2 font-body text-sm text-dark-700 placeholder:text-dark-200 bg-transparent focus:outline-none"
                onBlur={() => setSearchOpen(false)}
              />
            </div>
          )}
        </div>

        <div className="relative" ref={bellRef}>
          <button
            onClick={() => {
              if (!bellOpen) fetchAlerts()
              setBellOpen(!bellOpen)
            }}
            className="p-2.5 rounded-lg text-dark-300 hover:text-dark-600 hover:bg-dark-50 transition-colors relative"
          >
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full" />
          </button>
          {bellOpen && (
            <div className="absolute right-0 top-12 w-80 bg-surface border border-border rounded-lg shadow-card-hover py-1 max-h-96 overflow-y-auto">
              <p className="px-4 py-2 font-heading text-xs font-semibold text-dark-400 uppercase tracking-wider border-b border-border/50">
                Alertas Recentes
              </p>
              {alerts.length === 0 ? (
                <p className="px-4 py-6 font-body text-sm text-dark-300 text-center">
                  Nenhum alerta encontrado.
                </p>
              ) : (
                alerts.map((a) => (
                  <div key={a.id} className="px-4 py-2.5 hover:bg-dark-50 transition-colors border-b border-border/30 last:border-0">
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={14} className={cn(
                        'mt-0.5 flex-shrink-0',
                        a.severity === 'critical' ? 'text-danger' :
                        a.severity === 'high' ? 'text-warning' : 'text-info'
                      )} />
                      <div className="min-w-0 flex-1">
                        <p className="font-body text-sm text-dark-700 truncate">{a.title}</p>
                        <p className="font-body text-[11px] text-dark-300">
                          {new Date(a.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="relative ml-2" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 rounded-full bg-dark-700 flex items-center justify-center text-white hover:ring-2 hover:ring-primary/50 transition-shadow"
          >
            <User size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-12 w-48 bg-surface border border-border rounded-lg shadow-card-hover py-1">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2.5 font-body text-sm text-dark-500 hover:bg-dark-50 transition-colors"
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
