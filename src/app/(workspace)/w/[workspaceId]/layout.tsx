'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Menu } from 'lucide-react'
import Sidebar from '@/components/workspace/Sidebar'
import Topbar from '@/components/workspace/Topbar'
import MobileSidebar from '@/components/workspace/MobileSidebar'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useUserRole } from '@/hooks/useUserRole'
import { usePermissions } from '@/hooks/usePermissions'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import { cn } from '@/lib/utils/format'

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const workspaceId = params.workspaceId as string
  const { workspace, loading } = useWorkspace(workspaceId)
  const { isAgencyMember } = useUserRole(workspaceId)
  const { canView } = usePermissions(workspaceId)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const workspaceName = workspace?.name ?? 'Carregando...'

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="hidden lg:block">
        <Sidebar
          workspaceId={workspaceId}
          workspaceName={workspaceName}
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          isAgencyMember={isAgencyMember}
          canView={canView}
        />
      </div>

      <MobileSidebar
        workspaceId={workspaceId}
        workspaceName={workspaceName}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        isAgencyMember={isAgencyMember}
        canView={canView}
      />

      <Topbar
        workspaceName={workspaceName}
        workspaceId={workspaceId}
        sidebarCollapsed={collapsed}
      />

      {/* Mobile menu trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-40 p-2 rounded-lg bg-surface border border-border shadow-card lg:hidden"
      >
        <Menu size={20} className="text-dark-500" />
      </button>

      <main
        className={cn(
          'pt-16 min-h-screen transition-[margin-left] duration-200 ease-out',
          collapsed ? 'lg:ml-[68px]' : 'lg:ml-[240px]'
        )}
      >
        <div className="p-4 md:p-6 lg:p-8">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
      </main>
    </div>
  )
}
