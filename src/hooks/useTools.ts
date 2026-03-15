import { useEffect, useState, useCallback } from 'react'
import { toolsService } from '@/services/tools.service'
import type { Tool } from '@/types'

// ── PUBLIC: all published tools ──────────────────────────────
export function useTools() {
  const [tools, setTools]     = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await toolsService.getAll()
      setTools(data)
    } catch (e: any) {
      setError(e.message ?? 'Failed to load tools')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { tools, loading, error, refetch: fetch }
}

// ── PUBLIC: single tool by slug ──────────────────────────────
export function useTool(slug: string | undefined) {
  const [tool, setTool]       = useState<Tool | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const fetch = useCallback(async () => {
    if (!slug) return
    setLoading(true)
    setNotFound(false)
    try {
      const data = await toolsService.getBySlug(slug)
      if (!data) setNotFound(true)
      else setTool(data)
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => { fetch() }, [fetch])

  return { tool, loading, notFound, refetch: fetch }
}

// ── ADMIN: all tools (any status) ───────────────────────────
export function useAdminTools() {
  const [tools, setTools]     = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await toolsService.adminGetAll()
      setTools(data)
    } catch (e: any) {
      setError(e.message ?? 'Failed')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { tools, loading, error, refetch: fetch }
}

// ── ADMIN: single tool by id ─────────────────────────────────
export function useAdminTool(id: string | undefined) {
  const [tool, setTool]       = useState<Tool | null>(null)
  const [loading, setLoading] = useState(!!id)

  const fetch = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const data = await toolsService.adminGetById(id)
      setTool(data)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetch() }, [fetch])

  return { tool, loading, refetch: fetch }
}
