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
import { Target, BarChart3, ArrowRight, CheckCircle, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

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
    isOnboardingChecked,
    checkOnboarding,
  } = useUserStore()
  const { toast } = useToast()

  const [currentStep, setCurrentStep] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Ensure onboarding status is checked when user is authenticated
  useEffect(() => {
    if (isAuthenticated && currentUser && !isOnboardingChecked) {
      checkOnboarding(currentUser.id)
    }
  }, [isAuthenticated, currentUser, isOnboardingChecked, checkOnboarding])

  // Control visibility based on store state
  useEffect(() => {
    if (isAuthenticated && isOnboardingChecked && !hasSeenOnboarding) {
      setIsOpen(true)
    }
  }, [hasSeenOnboarding, isAuthenticated, isOnboardingChecked])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = async () => {
    setIsLoading(true)
    try {
      await completeOnboarding()
      setIsOpen(false)
      toast({
        title: 'Tudo pronto!',
        description: 'Você completou o tour inicial. Bom trabalho!',
      })
    } catch (error) {
      console.error('Onboarding error:', error)
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: 'Não foi possível concluir o onboarding. Tente novamente.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = async () => {
    // Treat closing via X or Skip as completion
    await handleComplete()
  }

  // Prevent rendering if not ready
  if (!isAuthenticated || !isOnboardingChecked || hasSeenOnboarding) return null

  const step = steps[currentStep]

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) {
          handleClose()
        }
      }}
    >
      <DialogContent
        className="sm:max-w-[500px] text-center"
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Explicit Close Button for clarity, though DialogContent has one usually */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Fechar</span>
        </button>

        <DialogHeader className="flex flex-col items-center gap-4 pt-4">
          <div className="rounded-full bg-muted p-4">{step.icon}</div>
          <DialogTitle className="text-xl">{step.title}</DialogTitle>
          <DialogDescription className="text-base">
            {step.description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 px-2">{step.content}</div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-center w-full">
          <div className="flex flex-col gap-2 w-full items-center">
            <div className="flex gap-2 w-full justify-center">
              {currentStep < steps.length - 1 ? (
                <Button onClick={handleNext} className="w-full sm:w-auto">
                  Próximo <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  className="w-full sm:w-auto"
                  disabled={isLoading}
                >
                  {isLoading ? 'Salvando...' : 'Começar a Usar'}
                  {!isLoading && <CheckCircle className="ml-2 h-4 w-4" />}
                </Button>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isLoading}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Pular tour
            </Button>
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
