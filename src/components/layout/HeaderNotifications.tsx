import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Bell, ShieldAlert, AlertTriangle } from 'lucide-react'
import { useUserStore } from '@/stores/useUserStore'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Link } from 'react-router-dom'

export const HeaderNotifications = () => {
  const { alerts, markAlertAsRead } = useUserStore()

  const unreadAlerts = alerts.filter((a) => !a.read)
  const unreadCount = unreadAlerts.length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-600 border-2 border-background animate-pulse" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          Notificações e Alertas
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs h-5 px-1.5">
              {unreadCount} novos
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Nenhuma notificação.
            </div>
          ) : (
            alerts.slice(0, 10).map((alert) => (
              <DropdownMenuItem
                key={alert.id}
                className={cn(
                  'flex flex-col items-start gap-1 p-3 cursor-pointer',
                  !alert.read && 'bg-muted/50',
                )}
                onClick={() => {
                  if (alert.link) {
                    // Normally we'd navigate, but since this is inside a component,
                    // wrapping with Link or using navigate hook is needed.
                    // The Dropdown closes on click automatically.
                  }
                  markAlertAsRead(alert.id)
                }}
              >
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-2">
                    {alert.type === 'SECURITY' ? (
                      <ShieldAlert className="h-4 w-4 text-red-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                    )}
                    <span className="font-semibold text-xs">{alert.title}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {format(new Date(alert.timestamp), 'HH:mm')}
                  </span>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {alert.message}
                </p>
                {alert.link && (
                  <Link
                    to={alert.link}
                    className="text-[10px] text-blue-600 hover:underline mt-1"
                  >
                    Ver detalhes
                  </Link>
                )}
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
