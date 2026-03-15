import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Wrench, Image,
  FileText, Settings, LogOut, ExternalLink, Zap,
} from 'lucide-react'
import { useAuth } from '@/store/authStore'

const navItems = [
  { to: '/admin',          label: 'Dashboard',    icon: LayoutDashboard, exact: true  },
  { to: '/admin/tools',    label: 'Tools',        icon: Wrench,          exact: false },
  { to: '/admin/media',    label: 'Media',        icon: Image,           exact: false },
  { to: '/admin/legal',    label: 'Legal Pages',  icon: FileText,        exact: false },
  { to: '/admin/settings', label: 'Settings',     icon: Settings,        exact: false },
]

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { logout } = useAuth()
  const navigate   = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  return (
    <aside className="admin-sidebar">
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 200,
        background: 'radial-gradient(ellipse 120% 80% at 50% -10%, rgba(100,255,218,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Logo */}
      <div style={{
        height: 64, display: 'flex', alignItems: 'center',
        padding: '0 1.25rem',
        borderBottom: '1px solid var(--border-sub)',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30,
            background: 'var(--teal)',
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Zap size={12} color="#07090e" />
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--text0)', lineHeight: 1.2 }}>
              Net2Coder
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--teal)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Tools Admin
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: 2, position: 'relative', zIndex: 1 }}>
        {navItems.map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to} to={to}
            end={exact}
            onClick={onNavigate}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              fontFamily: 'var(--font-body)',
              fontSize: 14, fontWeight: 500,
              color: isActive ? 'var(--teal)'  : 'var(--text1)',
              background: isActive ? 'var(--teal-dim)' : 'transparent',
              borderLeft: isActive ? '2px solid var(--teal)' : '2px solid transparent',
              transition: 'all .15s',
            })}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid var(--border-sub)', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <a
          href="/" target="_blank" rel="noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px', borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text2)',
            textDecoration: 'none', transition: 'color .15s',
          }}
        >
          <ExternalLink size={13} /> View Site
        </a>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px', borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--danger)',
            background: 'none', border: 'none', cursor: 'pointer', width: '100%',
            transition: 'background .15s',
          }}
        >
          <LogOut size={13} /> Sign Out
        </button>
      </div>
    </aside>
  )
}
