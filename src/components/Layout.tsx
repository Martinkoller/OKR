import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarRail,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  Target,
  BarChart3,
  Settings,
  BookOpen,
  PieChart,
  ShieldCheck,
  UserCircle,
  Users,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useUserStore } from '@/stores/useUserStore'
import { Button } from '@/components/ui/button'
import { usePermissions } from '@/hooks/usePermissions'

export default function Layout() {
  const { pathname } = useLocation()
  const { currentUser } = useUserStore()
  const { checkPermission } = usePermissions()

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + '/')

  const canViewSettings = checkPermission('SETTINGS', 'VIEW')
  const canViewOKR = checkPermission('OKR', 'VIEW')
  const canViewKPI = checkPermission('KPI', 'VIEW')
  const canViewReport = checkPermission('REPORT', 'VIEW')

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <div className="print:hidden">
          <Sidebar>
            <SidebarHeader className="border-b px-6 py-4">
              <Link
                to="/"
                className="flex items-center gap-2 font-bold text-xl text-primary"
              >
                <Target className="h-6 w-6" />
                <span>StratManager</span>
              </Link>
            </SidebarHeader>
            <SidebarContent className="px-4 py-4">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/')}>
                    <Link to="/">
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {canViewOKR && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/okrs')}>
                      <Link to="/okrs">
                        <Target className="h-4 w-4" />
                        <span>Meus OKRs</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}

                {canViewKPI && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/kpis')}>
                      <Link to="/kpis">
                        <BarChart3 className="h-4 w-4" />
                        <span>KPIs</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}

                {canViewReport && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive('/analytics/comparison')}
                    >
                      <Link to="/analytics/comparison">
                        <PieChart className="h-4 w-4" />
                        <span>Comparativo Anual</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}

                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/audit')}>
                    <Link to="/audit">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Auditoria</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/documentation')}
                  >
                    <Link to="/documentation">
                      <BookOpen className="h-4 w-4" />
                      <span>Documentação</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="border-t p-4">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/settings/notifications')}
                  >
                    <Link to="/settings/notifications">
                      <Settings className="h-4 w-4" />
                      <span>Notificações</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {canViewSettings && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive('/settings/users')}
                    >
                      <Link to="/settings/users">
                        <Users className="h-4 w-4" />
                        <span>Admin</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
              <div className="mt-4 flex items-center gap-3 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser?.avatarUrl} />
                  <AvatarFallback>US</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {currentUser?.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {currentUser?.role}
                  </span>
                </div>
              </div>
            </SidebarFooter>
            <SidebarRail />
          </Sidebar>
        </div>

        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background print:hidden">
            <SidebarTrigger className="-ml-1" />
            <div className="ml-auto flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <UserCircle className="h-5 w-5" />
              </Button>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-8 pt-6">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
