import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Mail, Lock, Target } from 'lucide-react'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

type Form = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch
  } = useForm<Form>({
    resolver: zodResolver(schema)
  })

  const [authError, setAuthError] = React.useState<string | null>(null)
  const [showPassword, setShowPassword] = React.useState(false)
  const [isFocused, setIsFocused] = useState<string | null>(null)
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])

  const emailValue = watch('email')
  const passwordValue = watch('password')

  // Criar partículas animadas (sem efeito de mouse para evitar tremores)
  useEffect(() => {
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5
    }))
    setParticles(newParticles)
  }, [])

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

  return (
    <div className="min-h-screen login-bg-new flex items-center justify-center p-4 md:p-6 relative overflow-hidden">
      {/* Partículas de fundo animadas (sem efeito de mouse para evitar tremores) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle-float absolute w-1.5 h-1.5 bg-[var(--fh-primary)] rounded-full opacity-15"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animation: `float ${3 + particle.delay}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`
            }}
          />
        ))}
      </div>

      {/* Faixas decorativas de jiu-jitsu (sem movimento de mouse) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Faixa decorativa horizontal (remetendo ao kimono) */}
        <div className="absolute w-full h-1.5 bg-gradient-to-r from-transparent via-[var(--fh-primary)]/15 to-transparent top-[20%]" />
        <div className="absolute w-full h-1.5 bg-gradient-to-r from-transparent via-[var(--fh-accent)]/12 to-transparent bottom-[25%]" />
        
        {/* Formas geométricas decorativas (fixas, sem movimento) */}
        <div className="absolute w-96 h-96 rounded-full bg-gradient-to-br from-[var(--fh-primary)]/6 to-transparent blur-3xl top-[10%] left-[10%]" />
        <div className="absolute w-80 h-80 rounded-full bg-gradient-to-tr from-[var(--fh-accent)]/5 to-transparent blur-3xl bottom-[15%] right-[15%]" />
      </div>

      <div className="relative w-full max-w-md z-10">
        {/* Logo e Header com animação */}
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-5xl font-black bg-gradient-to-r from-[var(--fh-primary)] via-[var(--fh-primary-dark)] to-[var(--fh-primary)] bg-clip-text text-transparent mb-2 animate-gradient leading-tight">
            FightHub
          </h1>
          <p className="text-sm text-[var(--fh-muted)] font-medium tracking-wide leading-relaxed">
            Jiu-Jitsu • Disciplina • Evolução
          </p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <Target className="w-4 h-4 text-[var(--fh-primary)] animate-sparkle flex-shrink-0" />
            <span className="text-xs text-[var(--fh-muted)] font-medium leading-relaxed">Sua jornada no tatame começa aqui</span>
            <Target className="w-4 h-4 text-[var(--fh-primary)] animate-sparkle flex-shrink-0" />
          </div>
        </div>

        {/* Card de Login */}
        <div className="login-card-new relative backdrop-blur-sm">
          {/* Faixa decorativa no topo do card (remetendo ao kimono) */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--fh-primary)] via-[var(--fh-accent)] to-[var(--fh-primary)] opacity-60" />
          
          {/* Brilho animado no card */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[var(--fh-primary)]/5 via-transparent to-[var(--fh-accent)]/5 opacity-0 hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative p-8 md:p-10">
            <header className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-[var(--fh-text)] mb-2 leading-tight">
                Bem-vindo ao tatame
              </h2>
              <p className="text-sm text-[var(--fh-muted)] leading-relaxed">
                Entre para continuar seu treino e evolução
              </p>
            </header>

            {authError && (
              <div 
                role="alert" 
                className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 animate-shake flex items-center gap-2 leading-relaxed"
              >
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold leading-none">!</span>
                </div>
                <span className="text-sm font-medium">{authError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Campo Email */}
              <div className="space-y-2">
                <label 
                  htmlFor="email" 
                  className="block text-sm font-semibold text-[var(--fh-body)] mb-2 flex items-center gap-2 leading-normal"
                >
                  <Mail className="w-4 h-4 text-[var(--fh-primary)] flex-shrink-0" />
                  <span>Email</span>
                </label>
                <div className="relative group">
                  <div 
                    className={`absolute inset-0 rounded-xl bg-gradient-to-r from-[var(--fh-primary)]/20 to-[var(--fh-accent)]/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 ${isFocused === 'email' ? 'opacity-100' : ''}`}
                  />
                  <input
                    id="email"
                    type="email"
                    placeholder="seu@exemplo.com"
                    className={`relative w-full px-4 py-3.5 rounded-xl border-2 bg-[var(--fh-card)] text-[var(--fh-body)] transition-all duration-300 leading-normal ${
                      errors.email 
                        ? 'border-red-400 focus:border-red-500' 
                        : isFocused === 'email'
                        ? 'border-[var(--fh-primary)] shadow-lg shadow-[var(--fh-primary)]/20'
                        : 'border-[var(--fh-border)] hover:border-[var(--fh-primary)]/50'
                    } focus:outline-none focus:ring-0`}
                    onFocus={() => setIsFocused('email')}
                    onBlur={() => setIsFocused(null)}
                    {...register('email')}
                  />
                  {emailValue && !errors.email && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    </div>
                  )}
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500 flex items-center gap-1 animate-fade-in leading-relaxed">
                    <span>•</span> <span>{errors.email.message}</span>
                  </p>
                )}
              </div>

              {/* Campo Senha */}
              <div className="space-y-2">
                <label 
                  htmlFor="password" 
                  className="block text-sm font-semibold text-[var(--fh-body)] mb-2 flex items-center gap-2 leading-normal"
                >
                  <Lock className="w-4 h-4 text-[var(--fh-primary)] flex-shrink-0" />
                  <span>Senha</span>
                </label>
                <div className="relative group">
                  <div 
                    className={`absolute inset-0 rounded-xl bg-gradient-to-r from-[var(--fh-primary)]/20 to-[var(--fh-accent)]/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 ${isFocused === 'password' ? 'opacity-100' : ''}`}
                  />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`relative w-full px-4 py-3.5 pr-12 rounded-xl border-2 bg-[var(--fh-card)] text-[var(--fh-body)] transition-all duration-300 leading-normal ${
                      errors.password 
                        ? 'border-red-400 focus:border-red-500' 
                        : isFocused === 'password'
                        ? 'border-[var(--fh-primary)] shadow-lg shadow-[var(--fh-primary)]/20'
                        : 'border-[var(--fh-border)] hover:border-[var(--fh-primary)]/50'
                    } focus:outline-none focus:ring-0`}
                    onFocus={() => setIsFocused('password')}
                    onBlur={() => setIsFocused(null)}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg text-[var(--fh-muted)] hover:text-[var(--fh-primary)] hover:bg-[var(--fh-primary)]/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--fh-primary)]/50"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {passwordValue && !errors.password && (
                    <div className="absolute right-12 top-1/2 -translate-y-1/2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    </div>
                  )}
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500 flex items-center gap-1 animate-fade-in leading-relaxed">
                    <span>•</span> <span>{errors.password.message}</span>
                  </p>
                )}
              </div>

              {/* Opções */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-sm text-[var(--fh-muted)] cursor-pointer group leading-normal">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-[var(--fh-border)] text-[var(--fh-primary)] focus:ring-2 focus:ring-[var(--fh-primary)]/50 cursor-pointer transition-all flex-shrink-0" 
                  />
                  <span className="group-hover:text-[var(--fh-body)] transition-colors">Manter conectado</span>
                </label>
                <a 
                  href="#" 
                  className="text-sm font-medium text-[var(--fh-primary)] hover:text-[var(--fh-primary-dark)] transition-colors relative group leading-normal"
                >
                  Esqueci minha senha
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--fh-primary)] group-hover:w-full transition-all duration-300" />
                </a>
              </div>

              {/* Botão de Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full relative group mt-8"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--fh-primary)] to-[var(--fh-primary-dark)] rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
                <div className="relative bg-gradient-to-r from-[var(--fh-primary)] to-[var(--fh-primary-dark)] text-white font-bold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl hover:shadow-[var(--fh-primary)]/30 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 leading-normal">
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                      <span>Entrando no tatame...</span>
                    </>
                  ) : (
                    <>
                      <Target className="w-5 h-5 flex-shrink-0" />
                      <span>Entrar no tatame</span>
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-[var(--fh-border)] text-center">
              <p className="text-sm text-[var(--fh-muted)] leading-relaxed">
                Ainda não tem conta?{' '}
                <a 
                  href="#" 
                  className="font-semibold text-[var(--fh-primary)] hover:text-[var(--fh-primary-dark)] transition-colors relative group inline-block"
                >
                  Criar conta
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--fh-primary)] group-hover:w-full transition-all duration-300" />
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0) translateX(0); 
            opacity: 0.15; 
          }
          50% { 
            transform: translateY(-15px) translateX(8px); 
            opacity: 0.25; 
          }
        }
        
        .particle-float {
          will-change: transform, opacity;
          transform: translateZ(0);
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        
        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }
        
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s linear infinite;
        }
      `}</style>
    </div>
  )
}
