import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Github, ExternalLink, Package, Loader2, FileText } from 'lucide-react'
import { useTool } from '@/hooks/useTools'
import { FeatureList } from '@/components/tool/FeatureList'
import { StepTimeline } from '@/components/tool/StepTimeline'
import { VersionSelector } from '@/components/tool/VersionSelector'
import { setSEO } from '@/utils/seo'

export default function ToolDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { tool, loading, notFound } = useTool(slug)

  useEffect(() => {
    if (tool) {
      setSEO({
        title:       tool.meta_title ?? tool.title,
        description: tool.meta_desc  ?? tool.short_desc ?? undefined,
        image:       tool.banner_url ?? tool.logo_url   ?? undefined,
        url:         `/tools/${tool.slug}`,
        type:        'article',
      })
    }
    return () => { document.title = 'Net2Coder Tools' }
  }, [tool])

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={24} color="var(--teal)" style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (notFound || !tool) return (
    <div style={{
      minHeight: '60vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '2rem',
    }}>
      <Package size={48} color="var(--text2)" style={{ marginBottom: '1rem' }} />
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: 8 }}>Tool not found</h2>
      <p style={{ color: 'var(--text1)', marginBottom: '1.5rem' }}>
        This tool doesn't exist or isn't published yet.
      </p>
      <Link to="/tools" className="btn-teal">← Back to Tools</Link>
    </div>
  )

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem clamp(1.5rem, 5vw, 4rem)' }}>

      {/* Back link */}
      <Link
        to="/tools"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontFamily: 'var(--font-mono)', fontSize: 12,
          color: 'var(--text2)', textDecoration: 'none',
          marginBottom: '2rem', transition: 'color .2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--teal)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text2)')}
      >
        <ArrowLeft size={13} /> All Tools
      </Link>

      {/* Banner */}
      {tool.banner_url && (
        <div style={{
          height: 260, borderRadius: 'var(--radius-xl)', overflow: 'hidden',
          border: '1px solid var(--border-sub)', marginBottom: '2.5rem',
        }}>
          <img src={tool.banner_url} alt={tool.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      {/* Hero: info + version selector */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 300px',
        gap: '2.5rem', marginBottom: '1rem', alignItems: 'flex-start',
      }} className="tool-hero-grid">

        <div>
          {/* Logo + title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {tool.logo_url ? (
              <img src={tool.logo_url} alt={tool.title}
                style={{ width: 56, height: 56, borderRadius: 12, border: '1px solid var(--border-sub)', objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: 56, height: 56, borderRadius: 12,
                background: 'var(--bg3)', border: '1px solid var(--border-sub)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Package size={24} color="var(--text2)" />
              </div>
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                <span className="badge badge-gray">{tool.category}</span>
                {tool.versions?.find(v => v.is_latest) && (
                  <span className="badge badge-teal">v{tool.versions.find(v => v.is_latest)!.version_number}</span>
                )}
              </div>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.75rem, 5vw, 2.75rem)',
                fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1,
              }}>
                {tool.title}
              </h1>
            </div>
          </div>

          {tool.short_desc && (
            <p style={{ fontSize: 17, color: 'var(--text1)', lineHeight: 1.75, maxWidth: 600, marginBottom: '1.5rem' }}>
              {tool.short_desc}
            </p>
          )}

          {/* External links */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {tool.github_url && (
              <a href={tool.github_url} target="_blank" rel="noreferrer"
                className="btn-outline" style={{ fontSize: 12, padding: '7px 14px' }}>
                <Github size={13} /> GitHub
              </a>
            )}
            {tool.store_url && (
              <a href={tool.store_url} target="_blank" rel="noreferrer"
                className="btn-outline" style={{ fontSize: 12, padding: '7px 14px' }}>
                <ExternalLink size={13} /> Chrome Store
              </a>
            )}
            <Link to="/legal/terms" className="btn-outline" style={{ fontSize: 12, padding: '7px 14px' }}>
              <FileText size={13} /> Terms & Privacy
            </Link>
          </div>
        </div>

        {/* Version selector */}
        <div>
          {tool.versions && tool.versions.length > 0 && (
            <VersionSelector tool={tool} versions={tool.versions} />
          )}
        </div>
      </div>

      {/* Why I Built This */}
      {tool.why_built && (
        <section style={{ padding: '4rem 0', borderTop: '1px solid var(--border-sub)' }}>
          <p className="section-label" style={{ marginBottom: 8 }}>// motivation</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, marginBottom: '1.5rem' }}>
            Why I Built This
          </h2>
          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--border-sub)',
            borderLeft: '3px solid var(--teal)', borderRadius: 'var(--radius-lg)',
            padding: '1.5rem 2rem', maxWidth: 720,
          }}>
            <p style={{ fontSize: 15, color: 'var(--text1)', lineHeight: 1.85, whiteSpace: 'pre-line' }}>
              {tool.why_built}
            </p>
          </div>
        </section>
      )}

      {/* Features */}
      {tool.features && tool.features.length > 0 && (
        <section style={{ padding: '4rem 0', borderTop: '1px solid var(--border-sub)' }}>
          <p className="section-label" style={{ marginBottom: 8 }}>// capabilities</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, marginBottom: '2rem' }}>
            Features
          </h2>
          <FeatureList features={tool.features} />
        </section>
      )}

      {/* Step-by-Step */}
      {tool.steps && tool.steps.length > 0 && (
        <section style={{ padding: '4rem 0', borderTop: '1px solid var(--border-sub)' }}>
          <p className="section-label" style={{ marginBottom: 8 }}>// how it works</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, marginBottom: '3rem' }}>
            Step-by-Step
          </h2>
          <StepTimeline steps={tool.steps} />
        </section>
      )}

      {/* Full description */}
      {tool.description && (
        <section style={{ padding: '4rem 0', borderTop: '1px solid var(--border-sub)' }}>
          <p className="section-label" style={{ marginBottom: 8 }}>// details</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, marginBottom: '1.5rem' }}>
            About This Tool
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text1)', lineHeight: 1.85, whiteSpace: 'pre-line', maxWidth: 720 }}>
            {tool.description}
          </p>
        </section>
      )}

      {/* Install CTA */}
      <section style={{ padding: '4rem 0', borderTop: '1px solid var(--border-sub)' }}>
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border-em)',
          borderRadius: 'var(--radius-xl)', padding: '2.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '2rem', flexWrap: 'wrap',
        }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>
              First time installing a Chrome extension manually?
            </h3>
            <p style={{ color: 'var(--text1)', fontSize: 14, lineHeight: 1.65 }}>
              Follow the step-by-step guide — takes under two minutes.
            </p>
          </div>
          <Link to="/install-guide" className="btn-teal" style={{ flexShrink: 0 }}>
            Installation Guide →
          </Link>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .tool-hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
