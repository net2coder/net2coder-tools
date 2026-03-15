import { CheckCircle2 } from 'lucide-react'
import type { Feature } from '@/types'

export function FeatureList({ features }: { features: Feature[] }) {
  if (features.length === 0) return null

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: '0.75rem',
    }}>
      {features.map(f => (
        <div
          key={f.id}
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            background: 'var(--bg2)',
            border: '1px solid var(--border-sub)',
            borderRadius: 'var(--radius-md)',
            padding: '0.9rem 1rem',
            transition: 'border-color .2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-em)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-sub)')}
        >
          <CheckCircle2 size={16} color="var(--teal)" style={{ flexShrink: 0, marginTop: 2 }} />
          <span style={{ fontSize: 14, color: 'var(--text0)' }}>{f.text}</span>
        </div>
      ))}
    </div>
  )
}
