import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '2rem', textAlign: 'center', position: 'relative',
    }}>
      {/* Grid */}
      <div style={{
        position: 'fixed', inset: 0,
        backgroundImage: `linear-gradient(to right,rgba(100,255,218,0.025) 1px,transparent 1px),linear-gradient(to bottom,rgba(100,255,218,0.025) 1px,transparent 1px)`,
        backgroundSize: '60px 60px', pointerEvents: 'none',
      }} />

      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(5rem,20vw,10rem)', fontWeight: 800, color: 'var(--bg3)', lineHeight: 1, marginBottom: '1rem', position: 'relative' }}>
        404
      </p>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: '0.75rem' }}>
        Page not found
      </h1>
      <p style={{ color: 'var(--text1)', fontSize: 16, maxWidth: 380, marginBottom: '2rem' }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn-teal">← Back to Home</Link>
    </div>
  )
}
