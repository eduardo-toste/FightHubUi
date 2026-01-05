import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '../context/AuthContext'
import AuthCard from '../components/AuthCard'
import TextField from '../components/TextField'
import PrimaryButton from '../components/PrimaryButton'
import { Eye, EyeOff } from 'lucide-react'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type Form = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<Form>({
    resolver: zodResolver(schema)
  })
  

  async function onSubmit(values: Form) {
    try {
      setAuthError(null)
      await login(values.email, values.password)
      window.location.href = '/dashboard'
    } catch (err: any) {
      const msg = err?.message || 'Erro ao autenticar — verifique suas credenciais e tente novamente'
      setAuthError(msg)
    }
  }

  const [authError, setAuthError] = React.useState<string | null>(null)

  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <div className="min-h-screen login-bg flex items-center justify-center p-6">
      <div className="relative w-full max-w-md">

        {/* Brand header above the card */}
        <div className="mb-6 text-center">
          <div className="text-4xl font-extrabold" style={{ color: 'var(--fh-primary)', fontFamily: 'Segoe UI, system-ui, Arial, sans-serif' }}>
            FightHub
          </div>
          <div className="mt-2 text-sm text-[var(--fh-muted)]">Disciplina. Evolução. Conquista.</div>
          <div className="mt-3 h-px w-20 bg-[var(--fh-divider)] mx-auto" />
        </div>

        {/* decorative belt-stripe placed below brand header, behind the card */}
        <div aria-hidden="true" className="belt-stripe mx-auto" />

        <AuthCard className="mx-auto auth-card relative z-10">
          <header className="mb-4 text-center">
            <h1 id="auth-title" className="text-2xl font-extrabold text-[var(--fh-text)]">Bem-vindo de volta</h1>
            <p className="mt-2 text-sm text-[var(--fh-muted)]">Entre com suas credenciais para continuar</p>
          </header>

          {authError && (
            <div role="alert" className="mb-4 p-3 rounded-md bg-red-50 text-red-700 border border-red-100">
              {authError}
            </div>
          )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <TextField
              id="email"
              label="Email"
              placeholder="seu@exemplo.com"
              aria-invalid={!!errors.email}
              {...register('email')}
              error={errors.email?.message as string | undefined}
            />

            <TextField
              id="password"
              type={showPassword ? 'text' : 'password'}
              label="Senha"
              placeholder="Mínimo 6 caracteres"
              aria-invalid={!!errors.password}
              {...register('password')}
              error={errors.password?.message as string | undefined}
              trailing={(
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-md text-[var(--fh-muted)] hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fh-primary)]"
                >
                  {showPassword ? (
                    <Eye size={16} />
                  ) : (
                    <EyeOff size={16} />
                  )}
                </button>
              )}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-[var(--fh-muted)]">
                <input type="checkbox" className="h-4 w-4" /> <span>Manter conectado</span>
              </label>
              <a className="text-sm text-[var(--fh-body)] hover:text-[var(--fh-primary)]" href="#">
                Esqueci minha senha
              </a>
            </div>

            <div>
              <PrimaryButton
                type="submit"
                loading={isSubmitting}
                aria-disabled={isSubmitting}
              >
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </PrimaryButton>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-[var(--fh-muted)]">
            Ainda não tem conta? <a className="text-[var(--fh-primary)] hover:underline" href="#">Criar conta</a>
          </div>

          
        </AuthCard>
      </div>
    </div>
  )
}
