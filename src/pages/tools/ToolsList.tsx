import { useState } from 'react'
import { Search, Package } from 'lucide-react'
import { useTools } from '@/hooks/useTools'
import { ToolCard } from '@/components/tool/ToolCard'
import { SkeletonCard } from '@/components/ui/index'

export default function ToolsList() {
  const { tools, loading } = useTools()
  const [query, setQuery] = useState('')

  const filtered = tools.filter(t =>
    query === '' ||
    t.title.toLowerCase().includes(query.toLowerCase()) ||
    (t.short_desc ?? '').toLowerCase().includes(query.toLowerCase()) ||
    t.category.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '4rem clamp(1.5rem, 5vw, 4rem)' }}>
      {/* Header */}
      <div style={{ marginBottom: '3rem' }}>
        <p className="section-label" style={{ marginBottom: 8 }}>// all tools</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
          Net2Coder <span style={{ color: 'var(--teal)' }}>Tools</span>
        </h1>
        <p style={{ color: 'var(--text1)', fontSize: 16, maxWidth: 500 }}>
          Every extension and developer utility built under the Net2Coder brand. Free, open-source, production-grade.
        </p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: 400, marginBottom: '2.5rem' }}>
        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text2)', pointerEvents: 'none' }} />
        <input
          className="input"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search tools..."
          style={{ paddingLeft: 36 }}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--text2)' }}>
          <Package size={36} style={{ margin: '0 auto 1rem' }} />
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
            {query ? `No tools matching "${query}"` : 'No tools published yet.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {filtered.map(t => <ToolCard key={t.id} tool={t} />)}
        </div>
      )}

      <p style={{ marginTop: '2rem', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)' }}>
        {filtered.length} tool{filtered.length !== 1 ? 's' : ''} found
      </p>
    </div>
  )
}
