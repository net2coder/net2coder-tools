import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { legalService } from '@/services/legal.service'
import type { LegalPage } from '@/types'
import { Loader2 } from 'lucide-react'
import { formatDate } from '@/utils'

// Fallback static content if no DB record
const STATIC: Record<string, { title: string; content: string }> = {
  terms: {
    title: 'Terms of Use',
    content: `Last updated: January 2026

By downloading or using any Net2Coder Tools extension or utility, you agree to the following terms.

## 1. Acceptance
By accessing or using our tools, you agree to be bound by these Terms of Use. If you do not agree, please do not use our tools.

## 2. License
All Net2Coder Tools are distributed under the MIT License unless otherwise stated. You are free to use, copy, modify, and distribute the software, subject to the conditions of the license.

## 3. No Warranty
The tools are provided "as is", without warranty of any kind, express or implied. Net2Coder does not guarantee that the tools will be error-free, uninterrupted, or meet your specific requirements.

## 4. Limitation of Liability
Net2Coder shall not be liable for any damages arising from the use or inability to use the tools, including but not limited to loss of data, loss of profits, or any other commercial damages.

## 5. Privacy
We do not collect, store, or transmit any personal data through our extensions. See our Privacy Policy for more details.

## 6. Changes
We reserve the right to modify these terms at any time. Continued use of the tools after changes constitutes acceptance of the updated terms.

## 7. Contact
For questions about these terms, please reach out via net2coder.in.`,
  },
  privacy: {
    title: 'Privacy Policy',
    content: `Last updated: January 2026

Net2Coder Tools is committed to protecting your privacy. This policy explains our data practices.

## 1. No Data Collection
Net2Coder Tools extensions do **not** collect, store, or transmit any personal information, browsing history, or usage data to any remote server.

## 2. Local Storage Only
Any preferences or settings saved by our extensions are stored locally in your browser using the standard browser storage APIs. This data never leaves your device.

## 3. No Third-Party Analytics
We do not integrate any third-party analytics, tracking scripts, or telemetry services into our extensions.

## 4. Download Tracking
When you download a tool from tools.net2coder.in, we may log anonymized download counts and basic request metadata (no personal identifiers). This is used solely for public download statistics.

## 5. No Ads
Net2Coder Tools do not display advertisements and will never do so.

## 6. Open Source
All our extension source code is available on GitHub for independent review and verification of these claims.

## 7. Changes
If our privacy practices change, we will update this policy and note the date of revision.

## 8. Contact
For privacy concerns, please contact us through net2coder.in.`,
  },
  license: {
    title: 'MIT License',
    content: `Copyright (c) 2024-2026 Net2Coder (Alok Kumar)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`,
  },
}

function renderContent(content: string) {
  return content.split('\n').map((line, i) => {
    if (line.startsWith('## '))    return <h2 key={i} style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, marginTop: '2rem', marginBottom: '0.5rem', color: 'var(--text0)' }}>{line.slice(3)}</h2>
    if (line.startsWith('# '))     return <h1 key={i} style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text0)' }}>{line.slice(2)}</h1>
    if (line.trim() === '')        return <br key={i} />
    // bold
    const parts = line.split(/\*\*(.*?)\*\*/g)
    return (
      <p key={i} style={{ color: 'var(--text1)', lineHeight: 1.8, marginBottom: '0.5rem', fontSize: 15 }}>
        {parts.map((p, j) => j % 2 === 1 ? <strong key={j} style={{ color: 'var(--text0)' }}>{p}</strong> : p)}
      </p>
    )
  })
}

export default function LegalPage() {
  const { slug } = useParams<{ slug: string }>()
  const [page, setPage]     = useState<LegalPage | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    legalService.getBySlug(slug).then(data => {
      setPage(data)
      setLoading(false)
    })
  }, [slug])

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={24} color="var(--teal)" style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  // Use DB content or fallback to static
  const staticData = slug ? STATIC[slug] : null
  const title   = page?.title   ?? staticData?.title   ?? 'Legal'
  const content = page?.content ?? staticData?.content ?? 'Content not available.'
  const updatedAt = page?.updated_at

  const legalLinks = [
    { to: '/legal/terms', label: 'Terms of Use' },
    { to: '/legal/privacy', label: 'Privacy Policy' },
    { to: '/legal/license', label: 'License' },
  ]

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '4rem clamp(1.5rem, 5vw, 4rem)', display: 'grid', gridTemplateColumns: '1fr 220px', gap: '4rem', alignItems: 'start' }}>
      {/* Main content */}
      <div>
        <p className="section-label" style={{ marginBottom: 8 }}>// legal</p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
          fontWeight: 800, letterSpacing: '-0.02em',
          marginBottom: '0.5rem',
        }}>
          {title}
        </h1>
        {updatedAt && (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)', marginBottom: '2.5rem' }}>
            Last updated {formatDate(updatedAt)}
          </p>
        )}
        <div className="divider" style={{ marginTop: 0 }} />
        <div style={{ marginTop: '2rem' }}>
          {renderContent(content)}
        </div>
      </div>

      {/* Sidebar */}
      <aside style={{ position: 'sticky', top: 100 }}>
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border-sub)',
          borderRadius: 'var(--radius-lg)', padding: '1.25rem',
        }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
            Legal Pages
          </p>
          {legalLinks.map(l => (
            <Link
              key={l.to} to={l.to}
              style={{
                display: 'block', padding: '8px 10px',
                fontFamily: 'var(--font-body)', fontSize: 14,
                color: slug && l.to.endsWith(slug) ? 'var(--teal)' : 'var(--text1)',
                background: slug && l.to.endsWith(slug) ? 'var(--teal-dim)' : 'transparent',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none', marginBottom: 2,
                transition: 'color .15s',
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div style={{ marginTop: '1rem' }}>
          <Link to="/tools" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text2)', textDecoration: 'none' }}>
            ← Back to Tools
          </Link>
        </div>
      </aside>

      <style>{`@media(max-width:768px){div[style*="grid-template-columns: 1fr 220px"]{grid-template-columns:1fr!important}}`}</style>
    </div>
  )
}
