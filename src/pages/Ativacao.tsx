import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ativacaoApi, type AtivacaoData, type EnderecoData } from '../api/ativacao'
import { Eye, EyeOff, Phone, MapPin, CheckCircle, AlertCircle, Home, User } from 'lucide-react'
import { Button } from '../components/Button'
import { ThemeToggle } from '../components/ThemeToggle'

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

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
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
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const data = await response.json()
      
      if (!data.erro) {
        setValue('logradouro', data.logradouro || '')
        setValue('bairro', data.bairro || '')
        setValue('cidade', data.localidade || '')
        setValue('estado', data.uf || '')
      }
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
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-green-200 dark:border-green-800 overflow-hidden">
            <div className="bg-gradient-to-r from-green-400 to-green-600 dark:from-green-600 dark:to-green-800 p-8 text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Conta Ativada!</h1>
              <p className="text-green-50 text-lg">Seu cadastro foi concluído com sucesso</p>
            </div>

            <div className="p-8 text-center">
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Sua conta está ativa e pronta para uso. Você será redirecionado para a página de login em instantes.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
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
      {/* Background decorativo */}
      <div className="absolute inset-0 tatame-lines pointer-events-none" />
      
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border-2 border-[var(--fh-primary)]/12 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-[var(--fh-accent)]/10 rounded-full" />
      </div>

      <div className="relative w-full max-w-2xl z-10">
        {/* Theme Toggle - canto superior direito */}
        <div className="absolute top-0 right-0 z-20">
          <ThemeToggle />
        </div>
        
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-block relative mb-5">
            <h1 className="relative text-4xl md:text-5xl font-black leading-[1.1] tracking-tight">
              <span className="bg-gradient-to-r from-[var(--fh-primary)] to-[var(--fh-primary-dark)] bg-clip-text text-transparent">
                FIGHT
              </span>
              <span className="text-[var(--fh-text)] mx-2">•</span>
              <span className="bg-gradient-to-r from-[var(--fh-accent)] to-[var(--fh-accent-light)] bg-clip-text text-transparent">
                HUB
              </span>
            </h1>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Ativação de Conta</h2>
          <p className="text-gray-600 dark:text-gray-400">Complete seu cadastro para começar</p>
        </div>

        {/* Card do formulário */}
        <div className="tatame-card p-8">
          
          {/* Erro de token */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-red-800">Erro ao ativar conta</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {!token ? (
            <div className="text-center py-8">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Link Inválido</h3>
              <p className="text-gray-600 mb-6">
                O link de ativação não foi encontrado ou está incorreto.
              </p>
              <Button onClick={() => navigate('/login')} variant="primary">
                Ir para Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Senha */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Senha *
                </label>
                <div className="relative">
                  <input
                    {...register('senha')}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--fh-primary)] transition-all"
                    placeholder="Digite sua senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmar Senha *
                </label>
                <div className="relative">
                  <input
                    {...register('confirmarSenha')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--fh-primary)] transition-all"
                    placeholder="Confirme sua senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Telefone *
                </label>
                <input
                  {...register('telefone')}
                  type="tel"
                  onChange={handleTelefoneChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--fh-primary)] transition-all"
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
                {errors.telefone && (
                  <p className="mt-1 text-sm text-red-600">{errors.telefone.message}</p>
                )}
              </div>

              {/* Endereço */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Endereço *
                </h3>
              </div>

              {/* Campos de Endereço */}
              <div className="space-y-4 bg-gray-50 p-6 rounded-xl border border-gray-200">
                <div className="space-y-4 bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* CEP */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CEP</label>
                      <input
                        {...register('cep')}
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--fh-primary)]"
                        placeholder="00000-000"
                        maxLength={9}
                      />
                      {errors.cep && <p className="mt-1 text-sm text-red-600">{errors.cep.message}</p>}
                    </div>

                    {/* Número */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Número</label>
                      <input
                        {...register('numero')}
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--fh-primary)]"
                        placeholder="123"
                      />
                      {errors.numero && <p className="mt-1 text-sm text-red-600">{errors.numero.message}</p>}
                    </div>
                  </div>

                  {/* Logradouro */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Logradouro</label>
                    <input
                      {...register('logradouro')}
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--fh-primary)]"
                      placeholder="Rua, Avenida, etc."
                    />
                    {errors.logradouro && <p className="mt-1 text-sm text-red-600">{errors.logradouro.message}</p>}
                  </div>

                  {/* Complemento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Complemento</label>
                    <input
                      {...register('complemento')}
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--fh-primary)]"
                      placeholder="Apto, Bloco, etc."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Bairro */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bairro</label>
                      <input
                        {...register('bairro')}
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--fh-primary)]"
                        placeholder="Centro, Jardim, etc."
                      />
                      {errors.bairro && <p className="mt-1 text-sm text-red-600">{errors.bairro.message}</p>}
                    </div>

                    {/* Cidade */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
                      <input
                        {...register('cidade')}
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--fh-primary)]"
                        placeholder="São Paulo, Rio de Janeiro, etc."
                      />
                      {errors.cidade && <p className="mt-1 text-sm text-red-600">{errors.cidade.message}</p>}
                    </div>
                  </div>

                  {/* Estado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estado (UF)</label>
                    <input
                      {...register('estado')}
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--fh-primary)]"
                      placeholder="SP"
                      maxLength={2}
                    />
                    {errors.estado && <p className="mt-1 text-sm text-red-600">{errors.estado.message}</p>}
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/login')}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>

              {/* Info */}
              <div className="text-center text-sm text-gray-500 pt-4">
                <p>* Campos obrigatórios</p>
                <p className="mt-1">Apenas o complemento é opcional</p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
