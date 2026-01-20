import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ativacaoApi, type AtivacaoData, type EnderecoData } from '../api/ativacao'
import { Eye, EyeOff, Phone, MapPin, CheckCircle, AlertCircle, Home, User } from 'lucide-react'
import { Button } from '../components/Button'

const enderecoSchema = z.object({
  cep: z.string().min(8, 'CEP inválido').max(9),
  logradouro: z.string().min(3, 'Logradouro é obrigatório'),
  numero: z.string().min(1, 'Número é obrigatório'),
  complemento: z.string().optional(),
  bairro: z.string().min(2, 'Bairro é obrigatório'),
  cidade: z.string().min(2, 'Cidade é obrigatória'),
  estado: z.string().length(2, 'Estado deve ter 2 caracteres')
})

const ativacaoSchema = z.object({
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmarSenha: z.string(),
  telefone: z.string().min(1, 'Telefone é obrigatório').regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, 'Telefone inválido'),
  // Endereço
  cep: z.string().min(8, 'CEP é obrigatório'),
  logradouro: z.string().min(3, 'Logradouro é obrigatório'),
  numero: z.string().min(1, 'Número é obrigatório'),
  complemento: z.string().optional().or(z.literal('')),
  bairro: z.string().min(2, 'Bairro é obrigatório'),
  cidade: z.string().min(2, 'Cidade é obrigatória'),
  estado: z.string().length(2, 'Estado deve ter 2 caracteres')
}).refine(data => data.senha === data.confirmarSenha, {
  message: 'As senhas não coincidem',
  path: ['confirmarSenha']
})

type AtivacaoForm = z.infer<typeof ativacaoSchema>

export default function AtivacaoPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFocused, setIsFocused] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger
  } = useForm<AtivacaoForm>({
    resolver: zodResolver(ativacaoSchema)
  })

  const cepValue = watch('cep')

  // Validar token ao carregar
  useEffect(() => {
    if (!token) {
      setError('Token de ativação não encontrado. Verifique o link recebido por email.')
    }
  }, [token])

  // Buscar endereço por CEP
  const buscarEndereco = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '')
    if (cepLimpo.length !== 8) return

    try {
      const data = await ativacaoApi.buscarEnderecoPorCep(cepLimpo)
      
      setValue('logradouro', data.logradouro || '')
      setValue('bairro', data.bairro || '')
      setValue('cidade', data.localidade || '')
      setValue('estado', data.uf || '')
    } catch (err) {
      console.error('Erro ao buscar CEP:', err)
    }
  }

  // Formatar telefone com máscara
  const formatarTelefone = (valor: string) => {
    const numeros = valor.replace(/\D/g, '')
    
    if (numeros.length <= 10) {
      // (XX) XXXX-XXXX
      return numeros
        .replace(/^(\d{2})(\d)/g, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
    } else {
      // (XX) XXXXX-XXXX
      return numeros
        .replace(/^(\d{2})(\d)/g, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .slice(0, 15)
    }
  }

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarTelefone(e.target.value)
    setValue('telefone', valorFormatado)
  }

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cepLimpo = e.target.value.replace(/\D/g, '')
    const cepFormatado = cepLimpo.slice(0, 5) + (cepLimpo.length > 5 ? '-' + cepLimpo.slice(5, 8) : '')
    setValue('cep', cepFormatado)
  }

  const nextStep = async () => {
    // Validar campos da etapa 1
    const senhaValida = await trigger(['senha', 'confirmarSenha', 'telefone'])
    if (senhaValida) {
      setCurrentStep(2)
    }
  }

  const prevStep = () => {
    setCurrentStep(1)
  }

  useEffect(() => {
    if (cepValue && cepValue.length >= 8) {
      buscarEndereco(cepValue)
    }
  }, [cepValue])

  const onSubmit = async (data: AtivacaoForm) => {
    if (!token) return

    setIsSubmitting(true)
    setError(null)

    try {
      const ativacaoData: AtivacaoData = {
        token,
        senha: data.senha,
        telefone: data.telefone,
        endereco: {
          cep: data.cep,
          logradouro: data.logradouro,
          numero: data.numero,
          complemento: data.complemento,
          bairro: data.bairro,
          cidade: data.cidade,
          estado: data.estado
        }
      }

      await ativacaoApi.ativarConta(ativacaoData)
      setSuccess(true)
      
      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Erro ao ativar conta. Verifique os dados e tente novamente.'
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Tela de sucesso
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-[var(--fh-card)] rounded-3xl shadow-2xl border border-green-200 dark:border-green-800 overflow-hidden">
            <div className="bg-gradient-to-r from-green-400 to-green-600 dark:from-green-600 dark:to-green-800 p-8 text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-[var(--fh-gray-50)] dark:bg-[var(--fh-gray-800)] rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Conta Ativada!</h1>
              <p className="text-green-50 text-lg">Seu cadastro foi concluído com sucesso</p>
            </div>

            <div className="p-8 text-center">
              <p className="text-[var(--fh-text)] mb-6">
                Sua conta está ativa e pronta para uso. Você será redirecionado para a página de login em instantes.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-[var(--fh-muted)]">
                <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></div>
                <span>Redirecionando...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Tela principal de ativação
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

      <div className="relative w-full max-w-4xl z-10">
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
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--fh-primary)]" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-[var(--fh-primary)]" />
            </div>
            <p className="text-sm text-[var(--fh-muted)] font-medium leading-relaxed px-2">
              Complete seu cadastro para começar
            </p>
          </div>
        </div>

        {/* Card de Ativação - Estilo Tatame */}
        <div className="tatame-card relative">
          {/* Borda superior destacada (remetendo à linha do tatame) */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--fh-primary)] via-[var(--fh-accent)] to-[var(--fh-primary)]" />
          
          {/* Linhas decorativas laterais */}
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--fh-primary)]/20 via-transparent to-[var(--fh-primary)]/20" />
          <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--fh-accent)]/20 via-transparent to-[var(--fh-accent)]/20" />
          
          <div className="relative p-8 md:p-10 bg-[var(--fh-card)]/95 backdrop-blur-md">
            <header className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-[var(--fh-text)] mb-3 leading-[1.3] uppercase tracking-wide">
                Ativar Conta
              </h2>
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="h-px w-12 bg-[var(--fh-primary)] flex-shrink-0" />
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--fh-primary)] flex-shrink-0" />
                <div className="h-px w-12 bg-[var(--fh-accent)] flex-shrink-0" />
              </div>
              <p className="text-sm text-[var(--fh-muted)] leading-relaxed font-medium px-2">
                Complete seu cadastro para começar
              </p>

              {/* Indicador de Progresso */}
              <div className="mt-6 flex items-center justify-center gap-3">
                <div className={`h-2 w-16 rounded-full transition-colors duration-300 ${currentStep >= 1 ? 'bg-[var(--fh-primary)]' : 'bg-[var(--fh-border)]'}`} />
                <span className={`text-sm font-semibold transition-colors duration-300 ${currentStep >= 1 ? 'text-[var(--fh-primary)]' : 'text-[var(--fh-muted)]'}`}>1</span>
                <div className={`h-1 w-12 rounded-full transition-colors duration-300 ${currentStep >= 2 ? 'bg-[var(--fh-primary)]' : 'bg-[var(--fh-border)]'}`} />
                <span className={`text-sm font-semibold transition-colors duration-300 ${currentStep >= 2 ? 'text-[var(--fh-primary)]' : 'text-[var(--fh-muted)]'}`}>2</span>
                <div className={`h-2 w-16 rounded-full transition-colors duration-300 ${currentStep >= 2 ? 'bg-[var(--fh-primary)]' : 'bg-[var(--fh-border)]'}`} />
              </div>
            </header>
          
          {/* Erro de token */}
          {error && (
            <div 
              role="alert" 
              className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 flex items-center gap-2 leading-relaxed"
            >
              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold leading-none">!</span>
              </div>
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {!token ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[var(--fh-text)] mb-2">Link Inválido</h3>
              <p className="text-[var(--fh-muted)] mb-6">
                O link de ativação não foi encontrado ou está incorreto.
              </p>
              <Button onClick={() => navigate('/login')} variant="primary">
                Ir para Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* ETAPA 1: Credenciais */}
              {currentStep === 1 && (
                <div className="animate-fade-in space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[var(--fh-text)] mb-2">
                  Senha *
                </label>
                <div className="relative group">
                  <div 
                    className={`absolute inset-0 rounded-xl bg-gradient-to-r from-[var(--fh-primary)]/20 to-[var(--fh-accent)]/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 ${isFocused === 'senha' ? 'opacity-100' : ''}`}
                  />
                  <input
                    {...register('senha')}
                    type={showPassword ? 'text' : 'password'}
                    className={`relative w-full px-4 py-3.5 rounded-xl border-2 bg-[var(--fh-card)] text-[var(--fh-body)] transition-all duration-300 ${
                      errors.senha 
                        ? 'border-red-400 focus:border-red-500' 
                        : isFocused === 'senha'
                        ? 'border-[var(--fh-primary)] shadow-lg shadow-[var(--fh-primary)]/20'
                        : 'border-[var(--fh-border)] hover:border-[var(--fh-primary)]/50'
                    } focus:outline-none focus:ring-0`}
                    placeholder="Digite sua senha"
                    onFocus={() => setIsFocused('senha')}
                    onBlur={() => setIsFocused(null)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--fh-muted)] hover:text-[var(--fh-primary)]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.senha && (
                  <p className="mt-1 text-sm text-red-600">{errors.senha.message}</p>
                )}
              </div>

              {/* Confirmar Senha */}
              <div>
                <label className="block text-sm font-semibold text-[var(--fh-text)] mb-2">
                  Confirmar Senha *
                </label>
                <div className="relative group">
                  <div 
                    className={`absolute inset-0 rounded-xl bg-gradient-to-r from-[var(--fh-primary)]/20 to-[var(--fh-accent)]/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 ${isFocused === 'confirmarSenha' ? 'opacity-100' : ''}`}
                  />
                  <input
                    {...register('confirmarSenha')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`relative w-full px-4 py-3.5 rounded-xl border-2 bg-[var(--fh-card)] text-[var(--fh-body)] transition-all duration-300 ${
                      errors.confirmarSenha 
                        ? 'border-red-400 focus:border-red-500' 
                        : isFocused === 'confirmarSenha'
                        ? 'border-[var(--fh-primary)] shadow-lg shadow-[var(--fh-primary)]/20'
                        : 'border-[var(--fh-border)] hover:border-[var(--fh-primary)]/50'
                    } focus:outline-none focus:ring-0`}
                    placeholder="Confirme sua senha"
                    onFocus={() => setIsFocused('confirmarSenha')}
                    onBlur={() => setIsFocused(null)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--fh-muted)] hover:text-[var(--fh-primary)]"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmarSenha && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmarSenha.message}</p>
                )}
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-sm font-semibold text-[var(--fh-text)] mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Telefone *
                </label>
                <div className="relative group">
                  <div 
                    className={`absolute inset-0 rounded-xl bg-gradient-to-r from-[var(--fh-primary)]/20 to-[var(--fh-accent)]/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 ${isFocused === 'telefone' ? 'opacity-100' : ''}`}
                  />
                  <input
                    {...register('telefone')}
                    type="tel"
                    onChange={handleTelefoneChange}
                    className={`relative w-full px-4 py-3.5 rounded-xl border-2 bg-[var(--fh-card)] text-[var(--fh-body)] transition-all duration-300 ${
                      errors.telefone 
                        ? 'border-red-400 focus:border-red-500' 
                        : isFocused === 'telefone'
                        ? 'border-[var(--fh-primary)] shadow-lg shadow-[var(--fh-primary)]/20'
                        : 'border-[var(--fh-border)] hover:border-[var(--fh-primary)]/50'
                    } focus:outline-none focus:ring-0`}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    onFocus={() => setIsFocused('telefone')}
                    onBlur={() => setIsFocused(null)}
                  />
                </div>
                {errors.telefone && (
                  <p className="mt-1 text-sm text-red-600">{errors.telefone.message}</p>
                )}
              </div>

              {/* Endereço */}
              {/* Botão Próximo - Etapa 1 */}
              <button
                type="button"
                onClick={nextStep}
                className="w-full relative group mt-8"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--fh-primary)] to-[var(--fh-primary-dark)] rounded-lg blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
                <div className="relative bg-gradient-to-r from-[var(--fh-primary)] to-[var(--fh-primary-dark)] text-white font-bold py-3.5 px-6 rounded-lg shadow-xl hover:shadow-[var(--fh-primary)]/40 transform hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 leading-normal uppercase tracking-wide text-sm">
                  <CheckCircle className="w-5 h-5" />
                  <span>Próximo</span>
                </div>
              </button>
              </div>
              )}

              {/* ETAPA 2: Endereço */}
              {currentStep === 2 && (
                <div className="animate-fade-in space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* CEP */}
                  <div>
                    <label className="block text-sm font-semibold text-[var(--fh-text)] mb-2">CEP *</label>
                    <div className="relative group">
                      <div 
                        className={`absolute inset-0 rounded-xl bg-gradient-to-r from-[var(--fh-primary)]/20 to-[var(--fh-accent)]/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 ${isFocused === 'cep' ? 'opacity-100' : ''}`}
                      />
                      <input
                        {...register('cep')}
                        type="text"
                        onChange={handleCepChange}
                        className={`relative w-full px-4 py-3.5 rounded-xl border-2 bg-[var(--fh-card)] text-[var(--fh-body)] transition-all duration-300 ${
                          errors.cep 
                            ? 'border-red-400 focus:border-red-500' 
                            : isFocused === 'cep'
                            ? 'border-[var(--fh-primary)] shadow-lg shadow-[var(--fh-primary)]/20'
                            : 'border-[var(--fh-border)] hover:border-[var(--fh-primary)]/50'
                        } focus:outline-none focus:ring-0`}
                        placeholder="00000-000"
                        maxLength={9}
                        onFocus={() => setIsFocused('cep')}
                        onBlur={() => setIsFocused(null)}
                      />
                    </div>
                    {errors.cep && <p className="mt-1 text-sm text-red-600">{errors.cep.message}</p>}
                  </div>

                  {/* Número */}
                  <div>
                    <label className="block text-sm font-semibold text-[var(--fh-text)] mb-2">Número *</label>
                    <div className="relative group">
                      <div 
                        className={`absolute inset-0 rounded-xl bg-gradient-to-r from-[var(--fh-primary)]/20 to-[var(--fh-accent)]/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 ${isFocused === 'numero' ? 'opacity-100' : ''}`}
                      />
                      <input
                        {...register('numero')}
                        type="text"
                        className={`relative w-full px-4 py-3.5 rounded-xl border-2 bg-[var(--fh-card)] text-[var(--fh-body)] transition-all duration-300 ${
                          errors.numero 
                            ? 'border-red-400 focus:border-red-500' 
                            : isFocused === 'numero'
                            ? 'border-[var(--fh-primary)] shadow-lg shadow-[var(--fh-primary)]/20'
                            : 'border-[var(--fh-border)] hover:border-[var(--fh-primary)]/50'
                        } focus:outline-none focus:ring-0`}
                        placeholder="123"
                        onFocus={() => setIsFocused('numero')}
                        onBlur={() => setIsFocused(null)}
                      />
                    </div>
                    {errors.numero && <p className="mt-1 text-sm text-red-600">{errors.numero.message}</p>}
                  </div>
                </div>

                {/* Logradouro */}
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-[var(--fh-text)] mb-2">Logradouro *</label>
                  <div className="relative group">
                    <div 
                      className={`absolute inset-0 rounded-xl bg-gradient-to-r from-[var(--fh-primary)]/20 to-[var(--fh-accent)]/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 ${isFocused === 'logradouro' ? 'opacity-100' : ''}`}
                    />
                    <input
                      {...register('logradouro')}
                      type="text"
                      className={`relative w-full px-4 py-3.5 rounded-xl border-2 bg-[var(--fh-card)] text-[var(--fh-body)] transition-all duration-300 ${
                        errors.logradouro 
                          ? 'border-red-400 focus:border-red-500' 
                          : isFocused === 'logradouro'
                          ? 'border-[var(--fh-primary)] shadow-lg shadow-[var(--fh-primary)]/20'
                          : 'border-[var(--fh-border)] hover:border-[var(--fh-primary)]/50'
                      } focus:outline-none focus:ring-0`}
                      placeholder="Rua, Avenida, etc."
                      onFocus={() => setIsFocused('logradouro')}
                      onBlur={() => setIsFocused(null)}
                    />
                  </div>
                  {errors.logradouro && <p className="mt-1 text-sm text-red-600">{errors.logradouro.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Bairro */}
                  <div>
                    <label className="block text-sm font-semibold text-[var(--fh-text)] mb-2">Bairro *</label>
                    <div className="relative group">
                      <div 
                        className={`absolute inset-0 rounded-xl bg-gradient-to-r from-[var(--fh-primary)]/20 to-[var(--fh-accent)]/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 ${isFocused === 'bairro' ? 'opacity-100' : ''}`}
                      />
                      <input
                        {...register('bairro')}
                        type="text"
                        className={`relative w-full px-4 py-3.5 rounded-xl border-2 bg-[var(--fh-card)] text-[var(--fh-body)] transition-all duration-300 ${
                          errors.bairro 
                            ? 'border-red-400 focus:border-red-500' 
                            : isFocused === 'bairro'
                            ? 'border-[var(--fh-primary)] shadow-lg shadow-[var(--fh-primary)]/20'
                            : 'border-[var(--fh-border)] hover:border-[var(--fh-primary)]/50'
                        } focus:outline-none focus:ring-0`}
                        placeholder="Bairro"
                        onFocus={() => setIsFocused('bairro')}
                        onBlur={() => setIsFocused(null)}
                      />
                    </div>
                    {errors.bairro && <p className="mt-1 text-sm text-red-600">{errors.bairro.message}</p>}
                  </div>

                  {/* Complemento */}
                  <div>
                    <label className="block text-sm font-semibold text-[var(--fh-text)] mb-2">Complemento</label>
                    <div className="relative group">
                      <div 
                        className={`absolute inset-0 rounded-xl bg-gradient-to-r from-[var(--fh-primary)]/20 to-[var(--fh-accent)]/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 ${isFocused === 'complemento' ? 'opacity-100' : ''}`}
                      />
                      <input
                        {...register('complemento')}
                        type="text"
                        className={`relative w-full px-4 py-3.5 rounded-xl border-2 bg-[var(--fh-card)] text-[var(--fh-body)] transition-all duration-300 ${
                          errors.complemento 
                            ? 'border-red-400 focus:border-red-500' 
                            : isFocused === 'complemento'
                            ? 'border-[var(--fh-primary)] shadow-lg shadow-[var(--fh-primary)]/20'
                            : 'border-[var(--fh-border)] hover:border-[var(--fh-primary)]/50'
                        } focus:outline-none focus:ring-0`}
                        placeholder="Apto, Sala, etc. (opcional)"
                        onFocus={() => setIsFocused('complemento')}
                        onBlur={() => setIsFocused(null)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Cidade */}
                  <div>
                    <label className="block text-sm font-semibold text-[var(--fh-text)] mb-2">Cidade *</label>
                    <div className="relative group">
                      <div 
                        className={`absolute inset-0 rounded-xl bg-gradient-to-r from-[var(--fh-primary)]/20 to-[var(--fh-accent)]/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 ${isFocused === 'cidade' ? 'opacity-100' : ''}`}
                      />
                      <input
                        {...register('cidade')}
                        type="text"
                        className={`relative w-full px-4 py-3.5 rounded-xl border-2 bg-[var(--fh-card)] text-[var(--fh-body)] transition-all duration-300 ${
                          errors.cidade 
                            ? 'border-red-400 focus:border-red-500' 
                            : isFocused === 'cidade'
                            ? 'border-[var(--fh-primary)] shadow-lg shadow-[var(--fh-primary)]/20'
                            : 'border-[var(--fh-border)] hover:border-[var(--fh-primary)]/50'
                        } focus:outline-none focus:ring-0`}
                        placeholder="Cidade"
                        onFocus={() => setIsFocused('cidade')}
                        onBlur={() => setIsFocused(null)}
                      />
                    </div>
                    {errors.cidade && <p className="mt-1 text-sm text-red-600">{errors.cidade.message}</p>}
                  </div>

                  {/* Estado */}
                  <div>
                    <label className="block text-sm font-semibold text-[var(--fh-text)] mb-2">Estado *</label>
                    <div className="relative group">
                      <div 
                        className={`absolute inset-0 rounded-xl bg-gradient-to-r from-[var(--fh-primary)]/20 to-[var(--fh-accent)]/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 ${isFocused === 'estado' ? 'opacity-100' : ''}`}
                      />
                      <input
                        {...register('estado')}
                        type="text"
                        maxLength={2}
                        className={`relative w-full px-4 py-3.5 rounded-xl border-2 bg-[var(--fh-card)] text-[var(--fh-body)] transition-all duration-300 uppercase ${
                          errors.estado 
                            ? 'border-red-400 focus:border-red-500' 
                            : isFocused === 'estado'
                            ? 'border-[var(--fh-primary)] shadow-lg shadow-[var(--fh-primary)]/20'
                            : 'border-[var(--fh-border)] hover:border-[var(--fh-primary)]/50'
                        } focus:outline-none focus:ring-0`}
                        placeholder="SP"
                        onFocus={() => setIsFocused('estado')}
                        onBlur={() => setIsFocused(null)}
                      />
                    </div>
                    {errors.estado && <p className="mt-1 text-sm text-red-600">{errors.estado.message}</p>}
                  </div>
                </div>

              {/* Botões Etapa 2 */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Ativando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Ativar Conta
                    </>
                  )}
                </Button>
              </div>
              </div>
              )}

              {/* Info */}
              <div className="text-center text-sm text-[var(--fh-muted)] pt-4">
                <p>* Campos obrigatórios</p>
                <p className="mt-1">Apenas o complemento é opcional</p>
              </div>
            </form>
          )}
          </div>
        </div>
      </div>
    </div>
  )
}
