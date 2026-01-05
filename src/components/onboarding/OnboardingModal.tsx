import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/stores/useUserStore'
import {
  Target,
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  ArrowRight,
  CheckCircle,
} from 'lucide-react'

const steps = [
  {
    title: 'Bem-vindo ao StratManager',
    description:
      'Sua plataforma de Gestão Estratégica Integrada da Zucchetti Brasil. Vamos fazer um tour rápido?',
    icon: <Target className="h-12 w-12 text-primary" />,
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>
          Aqui você poderá acompanhar OKRs, KPIs e Planos de Ação de forma
          consolidada e transparente.
        </p>
      </div>
    ),
  },
  {
    title: 'Dashboard Integrado',
    description:
      'Visão geral da saúde do negócio com gráficos de evolução e alertas.',
    icon: <LayoutDashboard className="h-12 w-12 text-blue-600" />,
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>
          Monitore o progresso dos objetivos estratégicos e identifique
          rapidamente indicadores que precisam de atenção.
        </p>
      </div>
    ),
  },
  {
    title: 'OKRs e KPIs',
    description: 'Conecte a estratégia à operação diária.',
    icon: <BarChart3 className="h-12 w-12 text-emerald-600" />,
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>
          <strong>OKRs:</strong> Objetivos anuais ou plurianuais ambiciosos.
        </p>
        <p>
          <strong>KPIs:</strong> Métricas mensais que alimentam o progresso dos
          OKRs.
        </p>
      </div>
    ),
  },
  {
    title: 'Planos de Ação',
    description: 'Corrija desvios e garanta a execução.',
    icon: <ClipboardList className="h-12 w-12 text-amber-600" />,
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>
          Crie tarefas e atribua responsáveis para reverter indicadores em
          alerta ou acelerar resultados.
        </p>
      </div>
    ),
  },
]

export const OnboardingModal = () => {
  const { hasSeenOnboarding, completeOnboarding, isAuthenticated } =
    useUserStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [isOpen, setIsOpen] = useState(!hasSeenOnboarding && isAuthenticated)

  // Sync open state with store/auth
  if (!isOpen && !hasSeenOnboarding && isAuthenticated) {
    setIsOpen(true)
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = () => {
    completeOnboarding()
    setIsOpen(false)
  }

  const step = steps[currentStep]

  if (!isAuthenticated || hasSeenOnboarding) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px] text-center">
        <DialogHeader className="flex flex-col items-center gap-4 pt-4">
          <div className="rounded-full bg-muted p-4">{step.icon}</div>
          <DialogTitle className="text-xl">{step.title}</DialogTitle>
          <DialogDescription className="text-base">
            {step.description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 px-2">{step.content}</div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-center w-full">
          <div className="flex gap-2 w-full justify-center">
            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNext} className="w-full sm:w-auto">
                Próximo <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleComplete} className="w-full sm:w-auto">
                Começar a Usar <CheckCircle className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogFooter>
        <div className="flex justify-center gap-1 mt-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                index === currentStep ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
