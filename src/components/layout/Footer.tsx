import { Link } from 'react-router-dom'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={{
      position: 'relative', zIndex: 1,
      borderTop: '1px solid var(--border-sub)',
      padding: '2.5rem clamp(1.5rem, 5vw, 4rem)',
      marginTop: 'auto',
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '1rem',
      }}>
        <div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text2)' }}>
            © {year} Net2Coder. All rights reserved.
          </p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
            Built by{' '}
            <a href="https://net2coder.in" target="_blank" rel="noreferrer"
              style={{ color: 'var(--teal)', textDecoration: 'none' }}>
              net2coder.in
            </a>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { to: '/tools',          label: 'Tools' },
            { to: '/install-guide',  label: 'Install Guide' },
            { to: '/legal/terms',    label: 'Terms' },
            { to: '/legal/privacy',  label: 'Privacy' },
            { to: '/legal/license',  label: 'License' },
          ].map(l => (
            <Link
              key={l.to} to={l.to}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text2)', textDecoration: 'none' }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
