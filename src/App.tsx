import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import { OKRList } from './pages/okr/OKRList'
import { OKRDetail } from './pages/okr/OKRDetail'
import { KPIList } from './pages/kpi/KPIList'
import { KPIDetail } from './pages/kpi/KPIDetail'
import { AnnualComparison } from './pages/analytics/AnnualComparison'
import { Admin } from './pages/admin/Admin'
import Documentation from './pages/documentation/Documentation'
import NotificationSettings from './pages/settings/NotificationSettings'
import { Users } from './pages/settings/Users'
import { Groups } from './pages/settings/Groups'
import LoginPage from './components/auth/LoginPage'
import { useUserStore } from './stores/useUserStore'

const ProtectedRoute = () => {
  const { isAuthenticated } = useUserStore()
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

const App = () => (
  <BrowserRouter
    future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
  >
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/okrs" element={<OKRList />} />
            <Route path="/okrs/:id" element={<OKRDetail />} />
            <Route path="/kpis" element={<KPIList />} />
            <Route path="/kpis/:id" element={<KPIDetail />} />
            <Route
              path="/analytics/comparison"
              element={<AnnualComparison />}
            />
            <Route
              path="/audit"
              element={
                <div className="p-8">
                  Página de Auditoria Completa (Em Desenvolvimento)
                </div>
              }
            />
            <Route path="/documentation" element={<Documentation />} />
            <Route
              path="/settings/notifications"
              element={<NotificationSettings />}
            />
            <Route path="/settings/users" element={<Users />} />
            <Route path="/settings/groups" element={<Groups />} />
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
