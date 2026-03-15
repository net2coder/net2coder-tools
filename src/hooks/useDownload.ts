import { useState } from 'react'
import { downloadsService } from '@/services/downloads.service'
import type { Version, Tool } from '@/types'
import { toast } from 'sonner'

export function useDownload() {
  const [downloading, setDownloading]   = useState(false)
  const [downloadedId, setDownloadedId] = useState<string | null>(null)

  const download = async (tool: Tool, version: Version) => {
    if (downloading) return
    setDownloading(true)
    try {
      await downloadsService.download(tool.id, version.id)
      setDownloadedId(version.id)
      toast.success(`Downloading ${tool.title} v${version.version_number}`)
    } catch (err: any) {
      toast.error(err.message ?? 'Download failed. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  return { downloading, downloadedId, download }
}
