import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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
import { Admin } from './pages/admin/Admin'
import Documentation from './pages/documentation/Documentation'
import NotificationSettings from './pages/settings/NotificationSettings'

const App = () => (
  <BrowserRouter
    future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
  >
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Index />} />
          <Route path="/okrs" element={<OKRList />} />
          <Route path="/okrs/:id" element={<OKRDetail />} />
          <Route path="/kpis" element={<KPIList />} />
          <Route path="/kpis/:id" element={<KPIDetail />} />
          <Route
            path="/audit"
            element={
              <div className="p-8">
                Página de Auditoria Completa (Em Desenvolvimento - ver detalhes
                no KPI)
              </div>
            }
          />
          <Route path="/documentation" element={<Documentation />} />
          <Route
            path="/settings/notifications"
            element={<NotificationSettings />}
          />
          <Route path="/admin" element={<Admin />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
