import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuth } from '@/store/authStore'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  const links = [
    { to: '/tools', label: 'Tools' },
    { to: '/install-guide', label: 'Install Guide' },
    { to: '/legal/terms', label: 'Legal' },
  ]

  return (
    <nav
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(1.5rem, 5vw, 4rem)',
        height: '64px',
        background: scrolled ? 'rgba(7,9,14,0.92)' : 'rgba(7,9,14,0.6)',
        backdropFilter: 'blur(24px)',
        borderBottom: scrolled ? '1px solid var(--border-sub)' : '1px solid transparent',
        transition: 'background .3s, border-color .3s',
      }}
    >
      {/* Brand */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <div style={{
          width: 28, height: 28,
          background: 'var(--teal)',
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600, color: '#07090e' }}>N2C</span>
        </div>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text0)' }}>
          Net2Coder <span style={{ color: 'var(--teal)' }}>Tools</span>
        </span>
      </Link>

      {/* Desktop links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="hidden-mobile">
        {links.map(l => (
          <NavLink
            key={l.to} to={l.to}
            style={({ isActive }) => ({
              fontFamily: 'var(--font-mono)', fontSize: 13,
              color: isActive ? 'var(--teal)' : 'var(--text1)',
              textDecoration: 'none',
              transition: 'color .2s',
            })}
          >
            {l.label}
          </NavLink>
        ))}
        {isAdmin && (
          <button
            onClick={() => navigate('/admin')}
            className="btn-teal"
            style={{ padding: '6px 14px', fontSize: 12 }}
          >
            Admin
          </button>
        )}
        <a href="https://net2coder.in" target="_blank" rel="noreferrer" className="btn-outline" style={{ padding: '6px 14px', fontSize: 12 }}>
          net2coder.in ↗
        </a>
      </div>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="show-mobile"
        style={{ background: 'none', border: 'none', color: 'var(--text0)', cursor: 'pointer' }}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          position: 'absolute', top: '64px', left: 0, right: 0,
          background: 'var(--bg1)',
          borderBottom: '1px solid var(--border-sub)',
          padding: '1.5rem clamp(1.5rem, 5vw, 4rem)',
          display: 'flex', flexDirection: 'column', gap: '1.25rem',
        }}>
          {links.map(l => (
            <NavLink
              key={l.to} to={l.to}
              onClick={() => setMobileOpen(false)}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--text1)', textDecoration: 'none' }}
            >
              {l.label}
            </NavLink>
          ))}
          {isAdmin && (
            <Link to="/admin" onClick={() => setMobileOpen(false)}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--teal)', textDecoration: 'none' }}>
              Admin Dashboard
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
