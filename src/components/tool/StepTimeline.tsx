import type { Step } from '@/types'

interface StepTimelineProps {
  steps: Step[]
}

export function StepTimeline({ steps }: StepTimelineProps) {
  if (steps.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      {steps.map((step, i) => (
        <div
          key={step.id}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2.5rem',
            alignItems: 'center',
          }}
          className="step-item"
        >
          {/* Text side */}
          <div style={{ order: i % 2 === 0 ? 0 : 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '0.75rem' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--bg0)', border: '2px solid var(--teal)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--teal)',
                flexShrink: 0,
              }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>
                {step.title}
              </h4>
            </div>
            <p style={{ color: 'var(--text1)', fontSize: 15, lineHeight: 1.7, paddingLeft: 44 }}>
              {step.description}
            </p>
          </div>

          {/* Image side */}
          <div style={{ order: i % 2 === 0 ? 1 : 0 }}>
            {step.image_url ? (
              <div style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                border: '1px solid var(--border-sub)',
              }}>
                <img
                  src={step.image_url}
                  alt={step.title ?? ''}
                  style={{ width: '100%', display: 'block' }}
                  loading="lazy"
                />
              </div>
            ) : (
              <div style={{
                aspectRatio: '16/9',
                background: 'var(--bg3)',
                border: '1px dashed var(--border-sub)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)' }}>
                  No image
                </span>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Mobile responsive style */}
      <style>{`
        @media (max-width: 768px) {
          .step-item { grid-template-columns: 1fr !important; }
          .step-item > div { order: unset !important; }
        }
      `}</style>
    </div>
  )
}
