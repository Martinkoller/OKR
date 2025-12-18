import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/stores/useUserStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Target, Lock, UserCircle2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useUserStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleLogin = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (login(email)) {
      navigate('/')
    } else {
      toast({
        title: 'Falha na autenticação',
        description: 'Usuário não encontrado ou credenciais inválidas.',
        variant: 'destructive',
      })
    }
  }

  const handleQuickLogin = (email: string) => {
    setEmail(email)
    setPassword('123')
    if (login(email)) {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
            <Target className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-[#003366]">
            StratManager
          </CardTitle>
          <CardDescription>
            Portal de Gestão Estratégica Zucchetti
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail Corporativo</Label>
              <div className="relative">
                <UserCircle2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.nome@zucchetti.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-[#003366]">
              Entrar
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Acesso Rápido (Validação)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="text-xs"
              onClick={() => handleQuickLogin('carlos@zucchetti.com')}
            >
              CEO (Admin)
            </Button>
            <Button
              variant="outline"
              className="text-xs"
              onClick={() => handleQuickLogin('ana@zucchetti.com')}
            >
              Diretor Varejo
            </Button>
            <Button
              variant="outline"
              className="text-xs"
              onClick={() => handleQuickLogin('silva@zucchetti.com')}
            >
              GPM (Gestor)
            </Button>
            <Button
              variant="outline"
              className="text-xs"
              onClick={() => handleQuickLogin('vicente@zucchetti.com')}
            >
              Viewer
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center text-xs text-muted-foreground">
          &copy; 2024 Zucchetti Brasil. Todos os direitos reservados.
        </CardFooter>
      </Card>
    </div>
  )
}
