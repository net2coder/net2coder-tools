import { Link } from 'react-router-dom'
import { Download, ArrowRight, Package, Calendar } from 'lucide-react'
import type { Tool } from '@/types'
import { formatDate } from '@/utils'

interface ToolCardProps {
  tool: Tool
}

export function ToolCard({ tool }: ToolCardProps) {
  const versions = tool.versions ?? []
  const latest   = versions.find(v => v.is_latest) ?? versions[0] ?? null
  const totalDl  = versions.reduce((s, v) => s + (v.download_count ?? 0), 0)

  return (
    <div
      className="glass-card"
      style={{
        padding: '1.5rem',
        display: 'flex', flexDirection: 'column',
        height: '100%', position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Subtle corner glow on hover */}
      <div style={{
        position: 'absolute', top: -40, right: -40,
        width: 100, height: 100,
        background: 'radial-gradient(circle, rgba(100,255,218,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', marginBottom: '0.875rem' }}>
        {/* Logo */}
        <div style={{
          width: 48, height: 48,
          borderRadius: 10, overflow: 'hidden',
          background: 'var(--bg3)',
          border: '1px solid var(--border-sub)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {tool.logo_url
            ? <img src={tool.logo_url} alt={tool.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
            : <Package size={20} color="var(--text2)" />
          }
        </div>

        {/* Title + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 15, fontWeight: 700,
              color: 'var(--text0)', margin: 0,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {tool.title}
            </h3>
            {latest && (
              <span className="badge badge-teal">v{latest.version_number}</span>
            )}
          </div>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            {tool.category}
          </span>
        </div>
      </div>

      {/* Description */}
      <p style={{
        color: 'var(--text1)', fontSize: 14, lineHeight: 1.65,
        flex: 1, marginBottom: '1.25rem',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {tool.short_desc ?? 'No description available.'}
      </p>

      {/* Meta row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        paddingTop: '1rem',
        borderTop: '1px solid var(--border-sub)',
        marginBottom: '1rem', flexWrap: 'wrap',
      }}>
        {totalDl > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Download size={11} color="var(--text2)" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)' }}>
              {totalDl.toLocaleString()}
            </span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Calendar size={11} color="var(--text2)" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)' }}>
            {formatDate(tool.updated_at)}
          </span>
        </div>
      </div>

      {/* CTA */}
      <Link
        to={`/tools/${tool.slug}`}
        className="btn-teal"
        style={{ justifyContent: 'center' }}
      >
        View Details <ArrowRight size={13} />
      </Link>
    </div>
  )
}
