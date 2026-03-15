import { Link } from 'react-router-dom'
import { ArrowRight, Package, Download, Zap, Shield } from 'lucide-react'
import { useTools } from '@/hooks/useTools'
import { ToolCard } from '@/components/tool/ToolCard'
import { SkeletonCard } from '@/components/ui/index'

export default function Home() {
  const { tools, loading } = useTools()

  const totalDownloads = tools.reduce((s, t) =>
    s + (t.versions?.reduce((vs, v) => vs + (v.download_count ?? 0), 0) ?? 0), 0
  )

  return (
    <>
      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 clamp(1.5rem, 5vw, 4rem)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Grid lines */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(100,255,218,0.025) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(100,255,218,0.025) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
        }} />
        {/* Radial glow */}
        <div style={{
          position: 'absolute', top: '-30%', left: '-10%',
          width: '60%', aspectRatio: '1',
          background: 'radial-gradient(ellipse, rgba(100,255,218,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', maxWidth: 1100, width: '100%' }}>
          <p className="section-label animate-fade-up" style={{ marginBottom: '1.25rem' }}>
            // tools.net2coder.in
          </p>

          <h1
            className="animate-fade-up-d1"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(3rem, 9vw, 7rem)',
              fontWeight: 800,
              lineHeight: 1.0,
              letterSpacing: '-0.03em',
              marginBottom: '1.5rem',
            }}
          >
            Browser tools<br />
            <span style={{ color: 'var(--teal)' }}>built different.</span>
          </h1>

          <p className="animate-fade-up-d2" style={{
            fontSize: 18, color: 'var(--text1)',
            maxWidth: 540, lineHeight: 1.75, marginBottom: '2.5rem',
          }}>
            Open-source browser extensions and developer utilities crafted under the Net2Coder brand. Privacy-first. Performance-obsessed.
          </p>

          <div className="animate-fade-up-d3" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/tools" className="btn-teal">
              Browse Tools <ArrowRight size={15} />
            </Link>
            <Link to="/install-guide" className="btn-outline">
              Install Guide
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          borderTop: '1px solid var(--border-sub)',
          padding: '1.5rem clamp(1.5rem, 5vw, 4rem)',
          display: 'flex', gap: '2rem', flexWrap: 'wrap',
        }}>
          {[
            { value: tools.length || '—', label: 'Tools Published' },
            { value: totalDownloads > 0 ? totalDownloads.toLocaleString() : '—', label: 'Total Downloads' },
            { value: 'MIT', label: 'Open Source License' },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--teal)', lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TOOLS GRID ── */}
      <section style={{ padding: '6rem clamp(1.5rem, 5vw, 4rem)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p className="section-label" style={{ marginBottom: 8 }}>// latest releases</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
                All Tools
              </h2>
            </div>
            <Link to="/tools" className="btn-outline" style={{ fontSize: 13 }}>
              View all <ArrowRight size={13} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {[1,2,3].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : tools.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text2)' }}>
              <Package size={40} style={{ margin: '0 auto 1rem' }} />
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>No tools published yet.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {tools.map(t => <ToolCard key={t.id} tool={t} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── WHY SECTION ── */}
      <section style={{ padding: '5rem clamp(1.5rem, 5vw, 4rem)', borderTop: '1px solid var(--border-sub)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p className="section-label" style={{ marginBottom: 8 }}>// philosophy</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '3rem' }}>
            Built with intent.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {[
              { icon: <Shield size={20} />, title: 'Privacy First', desc: 'No telemetry, no tracking. Your browser, your data.' },
              { icon: <Zap size={20} />, title: 'Performance Obsessed', desc: 'Lightweight by design. Every kilobyte justified.' },
              { icon: <Download size={20} />, title: 'Truly Free', desc: 'MIT licensed. Use, fork, modify — no strings attached.' },
              { icon: <Package size={20} />, title: 'Engineered', desc: 'Production-grade code. Not weekend prototypes.' },
            ].map(f => (
              <div key={f.title} style={{
                background: 'var(--bg2)', border: '1px solid var(--border-sub)',
                borderRadius: 'var(--radius-lg)', padding: '1.5rem',
              }}>
                <div style={{ color: 'var(--teal)', marginBottom: '0.75rem' }}>{f.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text1)', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
