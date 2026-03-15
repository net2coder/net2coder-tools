import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, FileText, Loader2 } from 'lucide-react'
import { legalService } from '@/services/legal.service'
import { toolsService } from '@/services/tools.service'
import { Modal, Field, ConfirmDialog, EmptyState } from '@/components/ui/index'
import type { LegalPage, Tool } from '@/types'
import { formatDate } from '@/utils'
import { toast } from 'sonner'

export default function AdminLegal() {
  const [pages, setPages]     = useState<LegalPage[]>([])
  const [tools, setTools]     = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(false)
  const [editing, setEditing] = useState<LegalPage | null>(null)
  const [delTarget, setDelTarget] = useState<LegalPage | null>(null)
  const [saving, setSaving]   = useState(false)

  const [slug, setSlug]       = useState('')
  const [title, setTitle]     = useState('')
  const [content, setContent] = useState('')
  const [toolId, setToolId]   = useState<string>('')

  const load = () => {
    setLoading(true)
    Promise.all([legalService.getAll(), toolsService.adminGetAll()]).then(([p, t]) => {
      setPages(p); setTools(t); setLoading(false)
    })
  }

  useEffect(() => { load() }, [])

  const openModal = (page?: LegalPage) => {
    if (page) {
      setEditing(page)
      setSlug(page.slug)
      setTitle(page.title)
      setContent(page.content ?? '')
      setToolId(page.tool_id ?? '')
    } else {
      setEditing(null)
      setSlug(''); setTitle(''); setContent(''); setToolId('')
    }
    setModal(true)
  }

  const handleSave = async () => {
    if (!slug || !title) { toast.error('Slug and title are required'); return }
    setSaving(true)
    try {
      await legalService.upsert({ slug, title, content, tool_id: toolId || null })
      toast.success('Legal page saved!')
      setModal(false)
      load()
    } catch (err: any) { toast.error(err.message ?? 'Save failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!delTarget) return
    try {
      await legalService.delete(delTarget.id)
      setPages(prev => prev.filter(p => p.id !== delTarget.id))
      toast.success('Deleted')
    } catch { toast.error('Delete failed') }
    finally { setDelTarget(null) }
  }

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>
      <div className="page-header">
        <div>
          <p className="section-label" style={{ marginBottom: 4 }}>// compliance</p>
          <h1 className="page-title">Legal Pages</h1>
        </div>
        <button onClick={() => openModal()} className="btn-teal" style={{ fontSize: 13 }}>
          <Plus size={14} /> New Legal Page
        </button>
      </div>

      <p style={{ color: 'var(--text1)', fontSize: 14, marginBottom: '2rem', maxWidth: 560 }}>
        Manage Terms of Use, Privacy Policies, and License pages — both site-wide and per-tool. Required for Microsoft Edge Add-on Partner Hub verification.
      </p>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <Loader2 size={20} color="var(--teal)" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : pages.length === 0 ? (
        <EmptyState
          icon={<FileText size={36} />}
          title="No legal pages"
          message="Add Terms, Privacy, and License pages."
          action={<button onClick={() => openModal()} className="btn-teal"><Plus size={14} /> Create Page</button>}
        />
      ) : (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border-sub)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Slug</th>
                <th>Title</th>
                <th>Tool</th>
                <th>Updated</th>
                <th>Preview</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map(p => {
                const linkedTool = tools.find(t => t.id === p.tool_id)
                return (
                  <tr key={p.id}>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--teal)' }}>/{p.slug}</span>
                    </td>
                    <td style={{ color: 'var(--text0)', fontSize: 14 }}>{p.title}</td>
                    <td>
                      {linkedTool ? (
                        <span className="badge badge-gray">{linkedTool.title}</span>
                      ) : (
                        <span style={{ color: 'var(--text2)', fontSize: 12 }}>Site-wide</span>
                      )}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{formatDate(p.updated_at)}</td>
                    <td>
                      <a href={`/legal/${p.slug}`} target="_blank" rel="noreferrer"
                        style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--teal)', textDecoration: 'none' }}>
                        View ↗
                      </a>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => openModal(p)}
                          style={{ background: 'none', border: '1px solid var(--border-sub)', borderRadius: 4, padding: '5px 8px', color: 'var(--text1)', cursor: 'pointer', lineHeight: 1 }}
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          onClick={() => setDelTarget(p)}
                          style={{ background: 'none', border: '1px solid rgba(255,85,85,0.2)', borderRadius: 4, padding: '5px 8px', color: 'var(--danger)', cursor: 'pointer', lineHeight: 1 }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Legal Page' : 'New Legal Page'} width={720}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Slug *" hint="e.g. terms, privacy, license, neotab-privacy">
              <input className="input" value={slug} onChange={e => setSlug(e.target.value)} placeholder="terms" disabled={!!editing} />
            </Field>
            <Field label="Title *">
              <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Terms of Use" />
            </Field>
          </div>
          <Field label="Link to Tool" hint="Optional — leave blank for site-wide pages">
            <select className="input" value={toolId} onChange={e => setToolId(e.target.value)}>
              <option value="">Site-wide</option>
              {tools.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </Field>
          <Field label="Content" hint="Supports basic markdown: ## headings, **bold**, line breaks">
            <textarea
              className="input"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="## Introduction&#10;&#10;Your legal content here..."
              style={{ minHeight: 300, fontFamily: 'var(--font-mono)', fontSize: 13 }}
            />
          </Field>
          <button onClick={handleSave} disabled={saving} className="btn-teal" style={{ justifyContent: 'center', opacity: saving ? 0.7 : 1 }}>
            {saving ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : 'Save Page'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!delTarget}
        title="Delete Legal Page"
        message={`Delete "${delTarget?.title}"? This will make the /legal/${delTarget?.slug} page unavailable.`}
        danger
        onConfirm={handleDelete}
        onCancel={() => setDelTarget(null)}
      />

      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
