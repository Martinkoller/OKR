import { useState, useEffect } from 'react'
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
      'Sua plataforma de Gestão Estratégica Integrada. Vamos fazer um tour rápido?',
    icon: <Target className="h-12 w-12 text-primary" />,
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>Dados centralizados e seguros com integração Supabase.</p>
      </div>
    ),
  },
  {
    title: 'Monitoramento',
    description:
      'Acompanhe seus KPIs com formatação local (BRL) e histórico confiável.',
    icon: <BarChart3 className="h-12 w-12 text-blue-600" />,
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>Visualize tendências e comparações anuais com dados reais.</p>
      </div>
    ),
  },
]

export const OnboardingModal = () => {
  const {
    hasSeenOnboarding,
    completeOnboarding,
    isAuthenticated,
    currentUser,
    checkOnboarding,
  } = useUserStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  // Check onboarding status on mount/auth change
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      checkOnboarding(currentUser.id).then(() => {
        // If hasSeenOnboarding is false (from DB), show modal
        // Note: checkOnboarding updates the store, so we check store state in next render or rely on sync
      })
    }
  }, [isAuthenticated, currentUser])

  useEffect(() => {
    if (isAuthenticated && !hasSeenOnboarding) {
      setIsOpen(true)
    }
  }, [hasSeenOnboarding, isAuthenticated])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = async () => {
    await completeOnboarding()
    setIsOpen(false)
  }

  const step = steps[currentStep]

  if (!isAuthenticated) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleComplete()}>
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
