import { Outlet, Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useUserStore } from '@/stores/useUserStore'
import {
  LayoutDashboard,
  Target,
  BarChart2,
  Settings,
  ShieldCheck,
  Menu,
  Bell,
  Search,
  LogOut,
  ChevronDown,
  Building2,
  BookOpen,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Toaster } from '@/components/ui/toaster'

const SidebarContent = () => {
  const location = useLocation()
  const { selectedBUId, bus, setSelectedBU } = useUserStore()

  const selectedBU = bus.find((b) => b.id === selectedBUId)

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/okrs', label: 'OKRs', icon: Target },
    { href: '/kpis', label: 'KPIs', icon: BarChart2 },
    {
      href: '/analytics/comparison',
      label: 'Comparativo Anual',
      icon: TrendingUp,
    },
    { href: '/audit', label: 'Auditoria', icon: ShieldCheck },
    { href: '/documentation', label: 'Documentação', icon: BookOpen },
    { href: '/admin', label: 'Administração', icon: Settings },
  ]

  return (
    <div className="flex flex-col h-full bg-[#003366] text-white">
      {/* Brand */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          {/* Placeholder for Zucchetti Logo */}
          <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center text-[#003366] font-bold text-xl">
            Z
          </div>
          <span className="font-bold text-lg tracking-tight">
            Zucchetti Brasil
          </span>
        </div>
      </div>

      {/* BU Switcher */}
      <div className="px-4 py-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <Building2 className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  {selectedBUId === 'GLOBAL'
                    ? 'Visão Global'
                    : selectedBU?.name}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            <DropdownMenuLabel>Unidade de Negócio</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setSelectedBU('GLOBAL')}>
              Visão Global
            </DropdownMenuItem>
            {bus.map((bu) => (
              <DropdownMenuItem
                key={bu.id}
                onClick={() => setSelectedBU(bu.id)}
              >
                {bu.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.href ||
            (item.href !== '/' && location.pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-white text-[#003366]'
                  : 'text-white/80 hover:bg-white/10 hover:text-white',
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-white/10 text-xs text-white/50 text-center">
        Ciclo Estratégico 2024
        <br />
        v1.1.0
      </div>
    </div>
  )
}

export default function Layout() {
  const { notifications, currentUser } = useUserStore()
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 fixed inset-y-0 z-50">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0 transition-all duration-300">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4 lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="-ml-2">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 border-r-0">
                <SidebarContent />
              </SheetContent>
            </Sheet>
            <span className="font-semibold text-gray-900">Zucchetti</span>
          </div>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar OKRs, KPIs..."
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 ml-auto">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Notificações</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center">
                      Nenhuma notificação.
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-4 bg-muted/50 rounded-lg text-sm space-y-1"
                      >
                        <p className="font-medium text-foreground">{n.title}</p>
                        <p className="text-muted-foreground">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </SheetContent>
            </Sheet>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="gap-2 pl-2 pr-4 hover:bg-gray-100"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser?.avatarUrl} />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium leading-none text-gray-900">
                      {currentUser?.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 capitalize">
                      {currentUser?.role.toLowerCase().replace('_', ' ')}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400 hidden md:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Perfil</DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings/notifications">
                    Regras de Notificação
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/documentation">Ajuda & Documentação</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  )
}
