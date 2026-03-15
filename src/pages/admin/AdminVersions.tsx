import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Trash2, Star, Download, ArrowLeft, Loader2 } from 'lucide-react'
import { versionsService } from '@/services/versions.service'
import { toolsService } from '@/services/tools.service'
import { ConfirmDialog, EmptyState, Modal, Field } from '@/components/ui/index'
import { formatDate } from '@/utils'
import { toast } from 'sonner'
import type { Version, Tool } from '@/types'

export default function AdminVersions() {
  const { toolId } = useParams<{ toolId: string }>()
  const navigate = useNavigate()

  const [tool, setTool]         = useState<Tool | null>(null)
  const [versions, setVersions] = useState<Version[]>([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(false)
  const [saving, setSaving]     = useState(false)
  const [delTarget, setDelTarget] = useState<Version | null>(null)

  // New version form state
  const [vNum, setVNum]         = useState('')
  const [changelog, setChangelog] = useState('')
  const [isLatest, setIsLatest]   = useState(true)
  const [releaseDate, setReleaseDate] = useState(new Date().toISOString().slice(0, 10))
  const [zipFile, setZipFile]     = useState<File | null>(null)

  const load = async () => {
    if (!toolId) return
    setLoading(true)
    const [t, v] = await Promise.all([
      toolsService.adminGetById(toolId),
      versionsService.getByTool(toolId),
    ])
    setTool(t)
    setVersions(v)
    setLoading(false)
  }

  useEffect(() => { load() }, [toolId])

  const handleCreate = async () => {
    if (!toolId || !vNum.trim() || !zipFile) {
      toast.error('Version number and ZIP file are required.')
      return
    }
    setSaving(true)
    try {
      // 1. Upload ZIP → get storage path
      const zip_path = await versionsService.uploadZip(zipFile, tool?.slug ?? toolId, vNum)

      // 2. Create version record with zip_path
      await versionsService.create(toolId, {
        version_number: vNum,
        changelog,
        is_latest: isLatest,
        release_date: releaseDate,
        zip_path,
      } as any)

      toast.success(`v${vNum} created!`)
      setModal(false)
      setVNum(''); setChangelog(''); setZipFile(null); setIsLatest(true)
      load()
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to create version')
    } finally { setSaving(false) }
  }

  const handleSetLatest = async (v: Version) => {
    if (!toolId) return
    try {
      await versionsService.setLatest(v.id, toolId)
      setVersions(prev => prev.map(x => ({ ...x, is_latest: x.id === v.id })))
      toast.success(`v${v.version_number} marked as latest`)
    } catch { toast.error('Failed to update latest') }
  }

  const handleDelete = async () => {
    if (!delTarget) return
    try {
      await versionsService.delete(delTarget.id)
      setVersions(prev => prev.filter(v => v.id !== delTarget.id))
      toast.success(`v${delTarget.version_number} deleted`)
    } catch { toast.error('Delete failed') } finally { setDelTarget(null) }
  }

  return (
    <div style={{ animation: 'fadeUp .3s ease', maxWidth: 860 }}>
      <div className="page-header">
        <div>
          <button
            onClick={() => navigate('/admin/tools')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 12, marginBottom: 8 }}
          >
            <ArrowLeft size={12} /> Tools
          </button>
          <h1 className="page-title">
            Versions {tool && <span style={{ color: 'var(--text2)', fontWeight: 400 }}>— {tool.title}</span>}
          </h1>
        </div>
        <button onClick={() => setModal(true)} className="btn-teal" style={{ fontSize: 13 }}>
          <Plus size={14} /> Add Version
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text2)' }}>
          <Loader2 size={22} color="var(--teal)" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : versions.length === 0 ? (
        <EmptyState
          icon={<Download size={36} />}
          title="No versions yet"
          message="Add the first version with a ZIP file."
          action={<button onClick={() => setModal(true)} className="btn-teal"><Plus size={14} /> Add Version</button>}
        />
      ) : (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border-sub)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Version</th>
                <th>Release Date</th>
                <th>Downloads</th>
                <th>Latest</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {versions.map(v => (
                <tr key={v.id}>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--text0)', fontWeight: 600 }}>
                      v{v.version_number}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{formatDate(v.release_date)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Download size={12} color="var(--text2)" />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{v.download_count.toLocaleString()}</span>
                    </div>
                  </td>
                  <td>
                    {v.is_latest ? (
                      <span className="badge badge-teal" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Star size={9} /> Latest
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSetLatest(v)}
                        style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)', background: 'none', border: '1px solid var(--border-sub)', borderRadius: 3, padding: '3px 8px', cursor: 'pointer' }}
                      >
                        Set latest
                      </button>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)' }}
                        title={(v as any).zip_path}>
                        {((v as any).zip_path ?? '').split('/').pop()}
                      </span>
                      <button
                        onClick={() => setDelTarget(v)}
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', lineHeight: 1 }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Version Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Add New Version">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Version Number *">
              <input className="input" value={vNum} onChange={e => setVNum(e.target.value)} placeholder="1.0.0" />
            </Field>
            <Field label="Release Date">
              <input className="input" type="date" value={releaseDate} onChange={e => setReleaseDate(e.target.value)} />
            </Field>
          </div>
          <Field label="Changelog" hint="What changed in this version?">
            <textarea className="input" value={changelog} onChange={e => setChangelog(e.target.value)} placeholder="- Fixed bug&#10;- Added feature X" />
          </Field>
          <Field label="ZIP File *">
            <div style={{
              background: 'var(--bg3)', border: '2px dashed var(--border-sub)',
              borderRadius: 'var(--radius-md)', padding: '1.25rem',
              textAlign: 'center', cursor: 'pointer',
            }}
              onClick={() => document.getElementById('zip-upload')?.click()}
            >
              {zipFile ? (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--teal)' }}>
                  {zipFile.name} ({(zipFile.size / 1024).toFixed(0)} KB)
                </p>
              ) : (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text2)' }}>
                  Click to select ZIP file
                </p>
              )}
            </div>
            <input
              id="zip-upload" type="file" accept=".zip" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) setZipFile(f) }}
            />
          </Field>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input type="checkbox" checked={isLatest} onChange={e => setIsLatest(e.target.checked)} style={{ accentColor: 'var(--teal)', width: 16, height: 16 }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text1)' }}>Mark as latest version</span>
          </label>
          <button
            onClick={handleCreate}
            disabled={saving}
            className="btn-teal"
            style={{ justifyContent: 'center', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Uploading...</> : 'Create Version'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!delTarget}
        title="Delete Version"
        message={`Delete v${delTarget?.version_number}? This action cannot be undone. Download count data will be lost.`}
        danger
        onConfirm={handleDelete}
        onCancel={() => setDelTarget(null)}
      />

      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
