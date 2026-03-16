'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Workspace } from '@/types/database'

export function useWorkspace(workspaceId: string) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function fetchWorkspace() {
      try {
        const { data } = await supabase
          .from('workspaces')
          .select('*')
          .eq('id', workspaceId)
          .single()

        setWorkspace(data)
      } catch {
        console.error('Failed to fetch workspace')
      } finally {
        setLoading(false)
      }
    }

    fetchWorkspace()
  }, [workspaceId])

  return { workspace, loading }
}
