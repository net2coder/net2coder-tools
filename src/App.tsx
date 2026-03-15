import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/store/authStore'
import { Toaster } from 'sonner'

// Layouts
import { PublicLayout } from '@/components/layout/PublicLayout'
import { PrivateRoute, AdminLayout } from '@/components/admin/AdminLayout'

// Public pages
import Home         from '@/pages/home/Home'
import ToolsList    from '@/pages/tools/ToolsList'
import ToolDetail   from '@/pages/tools/ToolDetail'
import InstallGuide from '@/pages/install/InstallGuide'
import LegalPage    from '@/pages/legal/LegalPage'
import NotFound     from '@/pages/NotFound'

// Admin pages
import AdminLogin     from '@/pages/admin/AdminLogin'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminTools     from '@/pages/admin/AdminTools'
import ToolForm       from '@/pages/admin/ToolForm'
import AdminVersions  from '@/pages/admin/AdminVersions'
import AdminMedia     from '@/pages/admin/AdminMedia'
import AdminLegal     from '@/pages/admin/AdminLegal'
import AdminSettings  from '@/pages/admin/AdminSettings'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* ── PUBLIC ── */}
            <Route element={<PublicLayout />}>
              <Route path="/"                    element={<Home />} />
              <Route path="/tools"               element={<ToolsList />} />
              <Route path="/tools/:slug"         element={<ToolDetail />} />
              <Route path="/install-guide"       element={<InstallGuide />} />
              <Route path="/legal/:slug"         element={<LegalPage />} />
            </Route>

            {/* ── ADMIN LOGIN (no layout) ── */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* ── ADMIN (protected) ── */}
            <Route element={<PrivateRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index                       element={<AdminDashboard />} />
                <Route path="tools"                element={<AdminTools />} />
                <Route path="tools/new"            element={<ToolForm />} />
                <Route path="tools/:id/edit"       element={<ToolForm />} />
                <Route path="versions/:toolId"     element={<AdminVersions />} />
                <Route path="media"                element={<AdminMedia />} />
                <Route path="legal"                element={<AdminLegal />} />
                <Route path="settings"             element={<AdminSettings />} />
              </Route>
            </Route>

            {/* ── 404 ── */}
            <Route path="*" element={<NotFound />} />
          </Routes>

          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--bg2)',
                border: '1px solid var(--border-sub)',
                color: 'var(--text0)',
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
