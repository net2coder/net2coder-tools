import { useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { AdminSidebar } from './AdminSidebar'
import { useAuth } from '@/store/authStore'
import { Loader2, Menu, X } from 'lucide-react'

export function PrivateRoute() {
  const { session, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={24} color="var(--teal)" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!session || !isAdmin) return <Navigate to="/admin/login" replace />
  return <Outlet />
}

export function AdminLayout() {
  const { pathname } = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Build breadcrumb label from path
  const crumb = pathname
    .replace('/admin', '')
    .split('/').filter(Boolean)
    .map(s => s.replace(/-/g, ' '))
    .join(' / ') || 'dashboard'

  return (
    <div className="admin-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 49,
            background: 'rgba(0,0,0,0.6)',
            display: 'none',
          }}
          className="mobile-overlay"
        />
      )}

      <div className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      <div className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="show-mobile"
            style={{
              background: 'none', border: 'none', color: 'var(--text0)',
              cursor: 'pointer', marginRight: 12, lineHeight: 1,
            }}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)', textTransform: 'capitalize' }}>
            {crumb}
          </span>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: 'var(--teal)',
              boxShadow: '0 0 6px var(--teal)',
            }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)' }}>admin</span>
          </div>
        </header>

        {/* Page content */}
        <div className="admin-content" key={pathname}>
          <Outlet />
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-overlay { display: block !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
