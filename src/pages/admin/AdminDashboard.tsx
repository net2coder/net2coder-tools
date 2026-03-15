import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, GitBranch, Download, Eye, Plus, ArrowRight, TrendingUp } from 'lucide-react'
import { downloadsService } from '@/services/downloads.service'
import { useAdminTools } from '@/hooks/useTools'
import type { DashboardStats } from '@/types'
import { formatDate } from '@/utils'

export default function AdminDashboard() {
  const { tools, loading: toolsLoading } = useAdminTools()
  const [stats, setStats]     = useState<DashboardStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    downloadsService.getDashboardStats().then(s => {
      setStats(s)
      setStatsLoading(false)
    })
  }, [])

  const loading = toolsLoading || statsLoading

  const statCards = stats ? [
    { label: 'Total Tools',    value: stats.totalTools,      icon: <Package size={16} />,   color: 'var(--teal)' },
    { label: 'Published',      value: stats.publishedTools,  icon: <Eye size={16} />,        color: '#5af5b0' },
    { label: 'Drafts',         value: stats.draftTools,      icon: <Package size={16} />,   color: 'var(--warning)' },
    { label: 'Versions',       value: stats.totalVersions,   icon: <GitBranch size={16} />, color: 'var(--text1)' },
    { label: 'Downloads',      value: stats.totalDownloads,  icon: <Download size={16} />,  color: 'var(--teal)' },
  ] : []

  const recentTools = tools.slice(0, 6)

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <p className="section-label" style={{ marginBottom: 4 }}>// overview</p>
          <h1 className="page-title">Dashboard</h1>
        </div>
        <Link to="/admin/tools/new" className="btn-teal" style={{ fontSize: 13 }}>
          <Plus size={14} /> New Tool
        </Link>
      </div>

      {/* Stats grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem', marginBottom: '2.5rem',
      }}>
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="stat-card">
                <div className="skeleton" style={{ height: 32, width: 64, marginBottom: 8, borderRadius: 4 }} />
                <div className="skeleton" style={{ height: 10, width: 90, borderRadius: 4 }} />
              </div>
            ))
          : statCards.map(s => (
              <div key={s.label} className="stat-card">
                <div style={{ color: s.color, marginBottom: 8 }}>{s.icon}</div>
                <div className="stat-value" style={{ color: s.color }}>{s.value.toLocaleString()}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))
        }
      </div>

      {/* Two-column layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 320px',
        gap: '2rem', alignItems: 'start',
      }} className="dash-grid">

        {/* Recent tools table */}
        <div>
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: '1rem',
          }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>
              Recent Tools
            </h2>
            <Link to="/admin/tools"
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontFamily: 'var(--font-mono)', fontSize: 12,
                color: 'var(--teal)', textDecoration: 'none',
              }}>
              View all <ArrowRight size={11} />
            </Link>
          </div>

          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border-sub)',
            borderRadius: 'var(--radius-lg)', overflow: 'hidden',
          }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tool</th>
                  <th>Status</th>
                  <th>Downloads</th>
                  <th>Updated</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={5}>
                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 6, flexShrink: 0 }} />
                            <div className="skeleton" style={{ flex: 1, height: 12, borderRadius: 4 }} />
                          </div>
                        </td>
                      </tr>
                    ))
                  : recentTools.length === 0
                    ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text2)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                            No tools yet. <Link to="/admin/tools/new" style={{ color: 'var(--teal)', textDecoration: 'none' }}>Create one →</Link>
                          </td>
                        </tr>
                      )
                    : recentTools.map(t => {
                        const totalDl = (t as any).versions?.reduce(
                          (s: number, v: any) => s + (v.download_count ?? 0), 0
                        ) ?? 0
                        return (
                          <tr key={t.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                {t.logo_url
                                  ? <img src={t.logo_url} style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover', border: '1px solid var(--border-sub)', flexShrink: 0 }} alt="" />
                                  : <div style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                      <Package size={14} color="var(--text2)" />
                                    </div>
                                }
                                <div>
                                  <p style={{ fontWeight: 500, fontSize: 13, color: 'var(--text0)', lineHeight: 1.3 }}>{t.title}</p>
                                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text2)' }}>/{t.slug}</p>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className={`badge ${t.status === 'published' ? 'badge-teal' : 'badge-warning'}`}>
                                {t.status}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                                {totalDl.toLocaleString()}
                              </span>
                            </td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)' }}>
                              {formatDate(t.updated_at)}
                            </td>
                            <td>
                              <Link to={`/admin/tools/${t.id}/edit`}
                                style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--teal)', textDecoration: 'none' }}>
                                Edit
                              </Link>
                            </td>
                          </tr>
                        )
                      })
                }
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick actions + recent activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Quick actions */}
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: '0.75rem' }}>
              Quick Actions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                { to: '/admin/tools/new', icon: <Plus size={14} />,       label: 'New Tool',       sub: 'Create an extension or utility' },
                { to: '/admin/tools',     icon: <Package size={14} />,    label: 'Manage Tools',   sub: 'Edit, publish, versions' },
                { to: '/admin/media',     icon: <TrendingUp size={14} />, label: 'Upload Media',   sub: 'Logos, banners, screenshots' },
                { to: '/admin/legal',     icon: <Eye size={14} />,        label: 'Legal Pages',    sub: 'Terms, privacy, license' },
              ].map(a => (
                <Link key={a.to} to={a.to}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: 'var(--bg2)',
                    border: '1px solid var(--border-sub)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem 1rem',
                    textDecoration: 'none',
                    transition: 'border-color .2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-em)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-sub)')}
                >
                  <span style={{ color: 'var(--teal)', flexShrink: 0 }}>{a.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text0)', marginBottom: 1 }}>{a.label}</p>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.sub}</p>
                  </div>
                  <ArrowRight size={12} color="var(--text2)" style={{ flexShrink: 0 }} />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent downloads */}
          {stats && stats.recentDownloads.length > 0 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: '0.75rem' }}>
                Recent Downloads
              </h2>
              <div style={{
                background: 'var(--bg2)',
                border: '1px solid var(--border-sub)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
              }}>
                {stats.recentDownloads.slice(0, 6).map((d, i) => (
                  <div key={d.id} style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Download size={12} color="var(--teal)" />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text1)' }}>
                        {d.tool_id.slice(0, 8)}…
                      </span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text2)' }}>
                      {formatDate(d.downloaded_at)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @media (max-width: 900px) {
          .dash-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
