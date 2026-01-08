import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
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
  Shield,
  LogOut,
  FileBarChart,
  Database,
  ClipboardList,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useUserStore } from '@/stores/useUserStore'
import { useDataStore } from '@/stores/useDataStore'
import { Button } from '@/components/ui/button'
import { usePermissions } from '@/hooks/usePermissions'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { HeaderNotifications } from '@/components/layout/HeaderNotifications'
import { OnboardingModal } from '@/components/onboarding/OnboardingModal'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function Layout() {
  const { pathname } = useLocation()
  const {
    currentUser,
    logout,
    checkOnboarding,
    fetchProfiles,
    setCurrentUser,
  } = useUserStore()
  const { fetchKPIs } = useDataStore()
  const { checkPermission } = usePermissions()
  const navigate = useNavigate()

  useEffect(() => {
    // Initial Data Load
    const init = async () => {
      // Check auth session
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.user) {
        // Ensure user store is synced
        if (!currentUser || currentUser.id !== session.user.id) {
          setCurrentUser({
            id: session.user.id,
            name: session.user.user_metadata.full_name || 'Usuário',
            email: session.user.email || '',
            role: 'DIRECTOR_BU', // Default for now
            buIds: ['bu-1'],
            active: true,
          })
        }

        if (currentUser) {
          checkOnboarding(currentUser.id)
        }
      }

      // Load Data
      fetchKPIs()
      fetchProfiles()
    }

    init()
  }, []) // Run once on mount

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + '/')

  const canViewSettings = true // checkPermission('SETTINGS', 'VIEW')
  const canViewOKR = true // checkPermission('OKR', 'VIEW')
  const canViewKPI = true // checkPermission('KPI', 'VIEW')
  const canViewReport = true // checkPermission('REPORT', 'VIEW')
  const canViewActionPlans = true // checkPermission('KPI', 'VIEW')

  const handleLogout = async () => {
    await supabase.auth.signOut()
    logout()
    navigate('/login')
  }

  return (
    <SidebarProvider>
      <OnboardingModal />
      <div className="flex min-h-screen w-full bg-muted/5">
        <div className="print:hidden">
          <Sidebar collapsible="icon">
            <SidebarHeader className="border-b h-16 flex justify-center px-4">
              <Link
                to="/"
                className="flex items-center gap-3 font-bold text-lg text-primary overflow-hidden transition-all"
              >
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 shrink-0">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col truncate group-data-[collapsible=icon]:hidden">
                  <span>StratManager</span>
                  <span className="text-[10px] font-normal text-muted-foreground leading-none">
                    by MarteckConsultoria
                  </span>
                </div>
              </Link>
            </SidebarHeader>
            <SidebarContent className="px-2 py-4">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/')}
                    tooltip="Dashboard"
                  >
                    <Link to="/">
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {canViewOKR && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive('/okrs')}
                      tooltip="Meus OKRs"
                    >
                      <Link to="/okrs">
                        <Target className="h-4 w-4" />
                        <span>Meus OKRs</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}

                {canViewKPI && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive('/kpis')}
                      tooltip="KPIs"
                    >
                      <Link to="/kpis">
                        <BarChart3 className="h-4 w-4" />
                        <span>KPIs</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}

                {canViewActionPlans && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive('/action-plans')}
                      tooltip="Planos de Ação"
                    >
                      <Link to="/action-plans">
                        <ClipboardList className="h-4 w-4" />
                        <span>Planos de Ação</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}

                {canViewReport && (
                  <>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive('/analytics/comparison')}
                        tooltip="Comparativo Anual"
                      >
                        <Link to="/analytics/comparison">
                          <PieChart className="h-4 w-4" />
                          <span>Comparativo Anual</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive('/reports/builder')}
                        tooltip="Relatórios"
                      >
                        <Link to="/reports/builder">
                          <FileBarChart className="h-4 w-4" />
                          <span>Relatórios</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                )}

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/integrations')}
                    tooltip="Integração BI"
                  >
                    <Link to="/integrations">
                      <Database className="h-4 w-4" />
                      <span>Integração BI</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/audit')}
                    tooltip="Auditoria"
                  >
                    <Link to="/admin">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Auditoria</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/documentation')}
                    tooltip="Documentação"
                  >
                    <Link to="/documentation">
                      <BookOpen className="h-4 w-4" />
                      <span>Documentação</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="border-t p-2">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/settings/notifications')}
                    tooltip="Notificações"
                  >
                    <Link to="/settings/notifications">
                      <Settings className="h-4 w-4" />
                      <span>Notificações</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {canViewSettings && (
                  <>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive('/settings/groups')}
                        tooltip="Grupos & Acesso"
                      >
                        <Link to="/settings/groups">
                          <Shield className="h-4 w-4" />
                          <span>Grupos & Acesso</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive('/settings/users')}
                        tooltip="Admin & Usuários"
                      >
                        <Link to="/settings/users">
                          <Users className="h-4 w-4" />
                          <span>Admin & Usuários</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                )}
              </SidebarMenu>
              <div className="mt-4 flex items-center gap-3 px-2 group-data-[collapsible=icon]:justify-center">
                <Avatar className="h-8 w-8 border shadow-sm">
                  <AvatarImage src={currentUser?.avatarUrl} />
                  <AvatarFallback>
                    {currentUser?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
                  <span className="text-sm font-medium truncate">
                    {currentUser?.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">
                    {currentUser?.role}
                  </span>
                </div>
              </div>
            </SidebarFooter>
            <SidebarRail />
          </Sidebar>
        </div>

        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-border/40 print:hidden sticky top-0 z-20">
            <SidebarTrigger className="-ml-1" />
            <div className="ml-auto flex items-center gap-4">
              <HeaderNotifications />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full"
                  >
                    <UserCircle className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8 pt-6 overflow-x-hidden">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
