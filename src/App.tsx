import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom'
import { useEffect } from 'react'
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
import CustomReportBuilder from './pages/reports/CustomReportBuilder'
import { Admin } from './pages/admin/Admin'
import Documentation from './pages/documentation/Documentation'
import NotificationSettings from './pages/settings/NotificationSettings'
import { Users } from './pages/settings/Users'
import { Groups } from './pages/settings/Groups'
import LoginPage from './components/auth/LoginPage'
import BIIntegration from './pages/integrations/BIIntegration'
import { ActionPlansDashboard } from './pages/action-plans/ActionPlansDashboard'
import { useUserStore } from '@/stores/useUserStore'
import { supabase } from '@/lib/supabase/client'

const ProtectedRoute = () => {
  const { isAuthenticated, authLoading } = useUserStore()

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Carregando...
      </div>
    )
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

const AppContent = () => {
  const { syncWithSupabase } = useUserStore()

  useEffect(() => {
    // Initial sync
    syncWithSupabase()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, _session) => {
      syncWithSupabase()
    })

    return () => subscription.unsubscribe()
  }, [syncWithSupabase])

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Index />} />
          <Route path="/okrs" element={<OKRList />} />
          <Route path="/okrs/:id" element={<OKRDetail />} />
          <Route path="/kpis" element={<KPIList />} />
          <Route path="/kpis/:id" element={<KPIDetail />} />
          <Route path="/action-plans" element={<ActionPlansDashboard />} />
          <Route path="/analytics/comparison" element={<AnnualComparison />} />
          <Route path="/reports/builder" element={<CustomReportBuilder />} />
          <Route path="/integrations" element={<BIIntegration />} />
          <Route path="/audit" element={<Admin />} />
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
  )
}

const App = () => (
  <BrowserRouter
    future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
  >
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </BrowserRouter>
)

export default App
