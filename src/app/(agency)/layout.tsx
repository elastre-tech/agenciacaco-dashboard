'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import AgencySidebar from '@/components/agency/AgencySidebar'
import AgencyTopbar from '@/components/agency/AgencyTopbar'
import AgencyMobileSidebar from '@/components/agency/AgencyMobileSidebar'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import { cn } from '@/lib/utils/format'

export default function AgencyLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <div className="hidden lg:block">
        <AgencySidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
      </div>

      <AgencyMobileSidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <AgencyTopbar sidebarCollapsed={collapsed} />

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
