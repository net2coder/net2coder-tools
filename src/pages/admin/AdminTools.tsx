import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Package, Edit, Trash2, Eye, EyeOff, GitBranch } from 'lucide-react'
import { toolsService } from '@/services/tools.service'
import { useAdminTools } from '@/hooks/useTools'
import { ConfirmDialog, EmptyState, SkeletonTable } from '@/components/ui/index'
import type { Tool } from '@/types'
import { formatDate } from '@/utils'
import { toast } from 'sonner'

export default function AdminTools() {
  const { tools, loading, refetch } = useAdminTools()
  const [delTarget, setDelTarget] = useState<Tool | null>(null)

  const handleToggle = async (tool: Tool) => {
    const next = tool.status === 'published' ? 'draft' : 'published'
    try {
      await toolsService.toggleStatus(tool.id, next)
      refetch()
      toast.success(`"${tool.title}" set to ${next}`)
    } catch { toast.error('Failed to update status') }
  }

  const handleDelete = async () => {
    if (!delTarget) return
    try {
      await toolsService.delete(delTarget.id)
      refetch()
      toast.success(`"${delTarget.title}" deleted`)
    } catch { toast.error('Delete failed') } finally {
      setDelTarget(null)
    }
  }

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>
      <div className="page-header">
        <div>
          <p className="section-label" style={{ marginBottom: 4 }}>// manage</p>
          <h1 className="page-title">Tools</h1>
        </div>
        <Link to="/admin/tools/new" className="btn-teal" style={{ fontSize: 13 }}>
          <Plus size={14} /> New Tool
        </Link>
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border-sub)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {loading ? (
          <SkeletonTable rows={6} />
        ) : tools.length === 0 ? (
          <EmptyState
            icon={<Package size={36} />}
            title="No tools yet"
            message="Create your first extension or developer tool."
            action={<Link to="/admin/tools/new" className="btn-teal"><Plus size={14} /> Create Tool</Link>}
          />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Tool</th>
                <th>Category</th>
                <th>Status</th>
                <th>Versions</th>
                <th>Updated</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tools.map(t => {
                const vCount = (t as any).versions?.length ?? 0
                return (
                  <tr key={t.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {t.logo_url ? (
                          <img src={t.logo_url} style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border-sub)' }} alt="" />
                        ) : (
                          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Package size={16} color="var(--text2)" />
                          </div>
                        )}
                        <div>
                          <p style={{ fontWeight: 500, fontSize: 14, color: 'var(--text0)' }}>{t.title}</p>
                          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text2)' }}>/{t.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-gray">{t.category}</span></td>
                    <td>
                      <span className={`badge ${t.status === 'published' ? 'badge-teal' : 'badge-warning'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <GitBranch size={12} color="var(--text2)" />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{vCount}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{formatDate(t.updated_at)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleToggle(t)}
                          title={t.status === 'published' ? 'Unpublish' : 'Publish'}
                          style={{
                            background: 'none', border: '1px solid var(--border-sub)',
                            borderRadius: 'var(--radius-sm)', padding: '5px 8px',
                            color: t.status === 'published' ? 'var(--teal)' : 'var(--text2)',
                            cursor: 'pointer', lineHeight: 1, transition: 'all .15s',
                          }}
                        >
                          {t.status === 'published' ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                        <Link
                          to={`/admin/tools/${t.id}/edit`}
                          style={{
                            background: 'none', border: '1px solid var(--border-sub)',
                            borderRadius: 'var(--radius-sm)', padding: '5px 8px',
                            color: 'var(--text1)', lineHeight: 1, textDecoration: 'none',
                            display: 'inline-flex',
                          }}
                        >
                          <Edit size={13} />
                        </Link>
                        <Link
                          to={`/admin/versions/${t.id}`}
                          style={{
                            background: 'none', border: '1px solid var(--border-sub)',
                            borderRadius: 'var(--radius-sm)', padding: '5px 8px',
                            color: 'var(--text1)', lineHeight: 1, textDecoration: 'none',
                            display: 'inline-flex', alignItems: 'center',
                          }}
                          title="Manage Versions"
                        >
                          <GitBranch size={13} />
                        </Link>
                        <button
                          onClick={() => setDelTarget(t)}
                          style={{
                            background: 'none', border: '1px solid rgba(255,85,85,0.2)',
                            borderRadius: 'var(--radius-sm)', padding: '5px 8px',
                            color: 'var(--danger)', cursor: 'pointer', lineHeight: 1,
                          }}
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
        )}
      </div>

      <ConfirmDialog
        open={!!delTarget}
        title="Delete Tool"
        message={`Are you sure you want to delete "${delTarget?.title}"? This will remove all associated features, steps, versions, and downloads. This action is irreversible.`}
        danger
        onConfirm={handleDelete}
        onCancel={() => setDelTarget(null)}
      />

      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}
