import { NotificationRuleList } from '@/components/notification/NotificationRuleList'

export default function NotificationSettings() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Preferências de Notificação
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie alertas personalizados para acompanhar os indicadores mais
          importantes para sua gestão.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
        <h3 className="font-semibold text-blue-900 text-sm mb-1">
          Como funciona?
        </h3>
        <p className="text-sm text-blue-800">
          O motor de notificações verifica cada atualização de KPI em tempo
          real. Se uma mudança corresponder aos critérios definidos abaixo, você
          receberá um alerta imediato no portal e/ou por e-mail, conforme
          configurado.
        </p>
      </div>

      <NotificationRuleList />
    </div>
  )
}
