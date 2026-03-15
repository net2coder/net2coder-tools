import { useEffect, useState, useCallback } from 'react'
import { versionsService } from '@/services/versions.service'
import type { Version } from '@/types'

export function useVersions(toolId: string | undefined) {
  const [versions, setVersions] = useState<Version[]>([])
  const [loading, setLoading]   = useState(!!toolId)

  const fetch = useCallback(async () => {
    if (!toolId) return
    setLoading(true)
    try {
      const data = await versionsService.getByTool(toolId)
      setVersions(data)
    } finally {
      setLoading(false)
    }
  }, [toolId])

  useEffect(() => { fetch() }, [fetch])

  const latestVersion = versions.find(v => v.is_latest) ?? versions[0] ?? null

  return { versions, loading, latestVersion, refetch: fetch }
}
