import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Mail, Lock, Target, X, Info } from 'lucide-react'

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
  const [showInfoModal, setShowInfoModal] = useState(false)

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
      // Redirecionar para home após login bem-sucedido
      window.location.href = '/home'
    } catch (err: any) {
      const msg = err?.message || 'Erro ao autenticar — verifique suas credenciais e tente novamente'
      setAuthError(msg)
    }
  }

  return (
    <div className="min-h-screen tatame-bg flex items-center justify-center p-4 md:p-6 relative overflow-hidden">
      {/* Linhas do tatame (área de combate) */}
      <div className="absolute inset-0 tatame-lines pointer-events-none" />
      
      {/* Elementos decorativos - círculos do tatame */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Círculo central do tatame */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border-2 border-[var(--fh-primary)]/12 rounded-full" />
        {/* Círculos menores */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-[var(--fh-accent)]/10 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] border border-[var(--fh-primary)]/8 rounded-full" />
      </div>

      {/* Gradientes sutis */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-[var(--fh-primary)]/3 to-transparent" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[var(--fh-accent)]/3 to-transparent" />
      </div>

      <div className="relative w-full max-w-lg z-10">
        {/* Logo e Header com animação */}
        <div className="mb-10 text-center animate-fade-in">
          <div className="inline-block relative mb-5">
            {/* Efeito de brilho atrás do logo */}
            <div className="absolute inset-0 bg-[var(--fh-primary)]/15 blur-2xl rounded-full animate-pulse-slow" />
            <h1 className="relative text-5xl md:text-6xl font-black leading-[1.1] tracking-tight">
              <span className="bg-gradient-to-r from-[var(--fh-primary)] via-[var(--fh-primary-dark)] to-[var(--fh-primary)] bg-clip-text text-transparent animate-gradient inline-block">
                FIGHT
              </span>
              <span className="text-[var(--fh-text)] mx-2 inline-block">•</span>
              <span className="bg-gradient-to-r from-[var(--fh-accent)] via-[var(--fh-accent-light)] to-[var(--fh-accent)] bg-clip-text text-transparent inline-block">
                HUB
              </span>
            </h1>
          </div>
          <div className="relative">
            <p className="text-base font-bold text-[var(--fh-body)] tracking-wide uppercase mb-2 leading-normal">
              Jiu-Jitsu Academy
            </p>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-[var(--fh-primary)]" />
              <Target className="w-4 h-4 text-[var(--fh-primary)] animate-sparkle flex-shrink-0" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-[var(--fh-primary)]" />
            </div>
            <p className="text-sm text-[var(--fh-muted)] font-medium leading-relaxed px-2">
              Centro de treinamento e evolução
            </p>
          </div>
        </div>

        {/* Card de Login - Estilo Tatame */}
        <div className="tatame-card relative">
          {/* Borda superior destacada (remetendo à linha do tatame) */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--fh-primary)] via-[var(--fh-accent)] to-[var(--fh-primary)]" />
          
          {/* Linhas decorativas laterais */}
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--fh-primary)]/20 via-transparent to-[var(--fh-primary)]/20" />
          <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--fh-accent)]/20 via-transparent to-[var(--fh-accent)]/20" />
          
          <div className="relative p-8 md:p-10 bg-[var(--fh-card)]/95 backdrop-blur-md">
            <header className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-[var(--fh-text)] mb-3 leading-[1.3] uppercase tracking-wide">
                Acesse o Tatame
              </h2>
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="h-px w-12 bg-[var(--fh-primary)] flex-shrink-0" />
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--fh-primary)] flex-shrink-0" />
                <div className="h-px w-12 bg-[var(--fh-accent)] flex-shrink-0" />
              </div>
              <p className="text-sm text-[var(--fh-muted)] leading-relaxed font-medium px-2">
                Entre com suas credenciais para continuar
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

              {/* Botão de Submit - Estilo Impactante */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full relative group mt-8"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--fh-primary)] to-[var(--fh-primary-dark)] rounded-lg blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
                <div className="relative bg-gradient-to-r from-[var(--fh-primary)] to-[var(--fh-primary-dark)] text-white font-bold py-3.5 px-6 rounded-lg shadow-xl hover:shadow-[var(--fh-primary)]/40 transform hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 leading-normal uppercase tracking-wide text-sm min-h-[48px]">
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                      <span>Entrando...</span>
                    </>
                  ) : (
                    <>
                      <Target className="w-5 h-5 flex-shrink-0" />
                      <span>Entrar no Tatame</span>
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-[var(--fh-border)] text-center">
              <p className="text-sm text-[var(--fh-muted)] leading-relaxed">
                Ainda não tem conta?{' '}
                <button
                  type="button"
                  onClick={() => setShowInfoModal(true)}
                  className="font-semibold text-[var(--fh-primary)] hover:text-[var(--fh-primary-dark)] transition-colors relative group inline-block"
                >
                  Saiba Mais
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--fh-primary)] group-hover:w-full transition-all duration-300" />
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Informações */}
      {showInfoModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowInfoModal(false)}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          
          {/* Modal Content */}
          <div 
            className="relative w-full max-w-lg tatame-modal animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Borda superior do modal */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--fh-primary)] via-[var(--fh-accent)] to-[var(--fh-primary)]" />
            
            <div className="relative bg-[var(--fh-card)] rounded-lg shadow-2xl overflow-hidden">
              {/* Header do Modal */}
              <div className="px-6 py-4 border-b border-[var(--fh-border)] bg-gradient-to-r from-[var(--fh-primary)]/5 to-[var(--fh-accent)]/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--fh-primary)] to-[var(--fh-primary-dark)] flex items-center justify-center">
                      <Info className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--fh-text)] leading-tight">
                      Como Criar uma Conta
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowInfoModal(false)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--fh-muted)] hover:text-[var(--fh-text)] hover:bg-[var(--fh-border)] transition-colors"
                    aria-label="Fechar modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Body do Modal */}
              <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
                <div className="space-y-4 text-[var(--fh-body)] leading-relaxed">
                  <p className="text-sm font-medium text-[var(--fh-text)]">
                    A criação de contas no FightHub é feita somente pela administração da academia.
                    Isso significa que não é possível criar uma conta manualmente por aqui.
                  </p>

                  <div>
                    <h4 className="text-base font-bold text-[var(--fh-text)] mb-3 flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-[var(--fh-primary)]" />
                      Como funciona:
                    </h4>
                    <ol className="space-y-3 ml-4">
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-[var(--fh-primary)] to-[var(--fh-primary-dark)] text-white text-xs font-bold flex items-center justify-center">
                          1
                        </span>
                        <span className="text-sm">
                          Um administrador da academia realiza o seu cadastro no sistema usando o e-mail que você informou à academia.
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-[var(--fh-primary)] to-[var(--fh-primary-dark)] text-white text-xs font-bold flex items-center justify-center">
                          2
                        </span>
                        <span className="text-sm">
                          Em seguida, você receberá um convite no seu e-mail para finalizar o cadastro.
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-[var(--fh-primary)] to-[var(--fh-primary-dark)] text-white text-xs font-bold flex items-center justify-center">
                          3
                        </span>
                        <span className="text-sm">
                          No convite, você poderá confirmar seus dados e definir sua senha para acessar a plataforma.
                        </span>
                      </li>
                    </ol>
                  </div>

                  <div className="pt-4 border-t border-[var(--fh-border)]">
                    <p className="text-sm text-[var(--fh-muted)]">
                      Se você ainda não recebeu o convite, verifique também <strong className="text-[var(--fh-body)]">Spam/Lixo Eletrônico</strong> ou entre em contato com a academia para confirmar se o e-mail cadastrado está correto.
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer do Modal */}
              <div className="px-6 py-4 border-t border-[var(--fh-border)] tatame-modal-footer">
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="w-full bg-gradient-to-r from-[var(--fh-primary)] to-[var(--fh-primary-dark)] text-white font-bold py-2.5 px-6 rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] uppercase tracking-wide text-sm leading-normal"
                >
                  Entendi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
          animation: fade-in 0.3s ease-out;
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
