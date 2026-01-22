import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { UserPlus, ArrowLeft, Save, AlertCircle, Search } from 'lucide-react'
import { alunosApi } from '../../api/alunos'
import { responsaveisApi } from '../../api/responsaveis'
import TextField from '../../components/TextField'
import PrimaryButton from '../../components/PrimaryButton'
import Layout from '../../components/Layout'
import { useAuth } from '../../context/AuthContext'
import type { CriarAlunoRequest } from '../../types'

const calculateAge = (birthDate: string): number => {
  const birth = new Date(birthDate)
  const today = new Date()
  return today.getFullYear() - birth.getFullYear() -
    (today.getMonth() < birth.getMonth() || 
     (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate()) ? 1 : 0)
}

const maskCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .substring(0, 14)
}

const schema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  cpf: z.string().min(11, 'CPF inválido').max(14, 'CPF inválido'),
  dataNascimento: z.string().min(1, 'Data de nascimento é obrigatória'),
  idsResponsaveis: z.array(z.string()).optional(),
}).refine(
  (data) => {
    const age = calculateAge(data.dataNascimento)
    // Se for menor, responsáveis é obrigatório
    if (age < 18) {
      return data.idsResponsaveis && data.idsResponsaveis.length > 0
    }
    return true
  },
  {
    message: 'Responsável legal é obrigatório para menores de idade',
    path: ['idsResponsaveis'],
  }
)

type FormData = z.infer<typeof schema>

interface ResponsavelOption {
  id: string
  nomeCompleto: string
  email: string
  cpf: string
}

export default function AlunoCreate() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMinor, setIsMinor] = useState(false)
  const [responsaveis, setResponsaveis] = useState<ResponsavelOption[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loadingResponsaveis, setLoadingResponsaveis] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      idsResponsaveis: [],
    },
  })

  const dataNascimento = watch('dataNascimento')

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = maskCPF(e.target.value)
    setValue('cpf', maskedValue)
  }

  // Carregar responsáveis uma única vez ao montar
  useEffect(() => {
    carregarResponsaveis()
  }, [])

  // Detectar se é menor quando muda data de nascimento
  useEffect(() => {
    if (dataNascimento) {
      const age = calculateAge(dataNascimento)
      setIsMinor(age < 18)
    }
  }, [dataNascimento])

  const carregarResponsaveis = async () => {
    try {
      setLoadingResponsaveis(true)
      const data = await responsaveisApi.listar(0, 100)
      const responsaveisList = data.content || data
      setResponsaveis(responsaveisList)
    } catch (err) {
      console.error('Erro ao carregar responsáveis:', err)
      setError('Erro ao carregar lista de responsáveis')
    } finally {
      setLoadingResponsaveis(false)
    }
  }

  const filteredResponsaveis = responsaveis.filter((r) =>
    (r.nomeCompleto?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (r.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (r.cpf || '').includes(searchTerm)
  )

  const toggleResponsavel = (responsavelId: string) => {
    const currentValue = watch('idsResponsaveis') || []
    if (currentValue.includes(responsavelId)) {
      setValue('idsResponsaveis', currentValue.filter((id) => id !== responsavelId))
    } else {
      setValue('idsResponsaveis', [...currentValue, responsavelId])
    }
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError(null)

    try {
      // Se for menor, responsáveis são obrigatórios no payload
      const request: CriarAlunoRequest = {
        nome: data.nome,
        email: data.email,
        cpf: data.cpf.replace(/\D/g, ''),
        dataNascimento: data.dataNascimento,
        idsResponsaveis: data.idsResponsaveis && data.idsResponsaveis.length > 0 ? data.idsResponsaveis : undefined,
      }

      // Criar o aluno com responsáveis (backend vincula automaticamente)
      await alunosApi.criar(request)
      navigate('/alunos')
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erro ao criar aluno. Tente novamente.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout userName={user?.name} userRole={user?.role} onLogout={logout}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <button
            onClick={() => navigate('/alunos')}
            className="text-[var(--fh-muted)] hover:text-[var(--fh-text)] mb-4 flex items-center gap-2 transition-colors"
          >
            <ArrowLeft size={20} />
            Voltar para alunos
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--fh-primary)] to-[var(--fh-primary-dark)] flex items-center justify-center shadow-lg">
              <UserPlus className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[var(--fh-text)]">Novo Aluno</h1>
              <p className="text-[var(--fh-muted)] mt-1">
                Cadastre um novo aluno na academia
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-600 text-red-800 dark:text-red-300 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="bg-[var(--fh-card)] rounded-xl shadow-sm border border-[var(--fh-border)] p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Dados Pessoais Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-[var(--fh-border)]">
                <div className="w-1 h-6 bg-gradient-to-b from-[var(--fh-primary)] to-[var(--fh-primary-dark)] rounded-full"></div>
                <h3 className="text-lg font-semibold text-[var(--fh-text)]">
                  Dados Pessoais
                </h3>
              </div>

              <TextField
                id="nome"
                label="Nome Completo"
                placeholder="Ex: João Silva Santos"
                {...register('nome')}
                error={errors.nome?.message}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextField
                  id="email"
                  label="Email"
                  type="email"
                  placeholder="joao@exemplo.com"
                  {...register('email')}
                  error={errors.email?.message}
                />

                <TextField
                  id="cpf"
                  label="CPF"
                  placeholder="000.000.000-00"
                  maxLength={14}
                  {...register('cpf')}
                  onChange={handleCPFChange}
                  error={errors.cpf?.message}
                />
              </div>

              <TextField
                id="dataNascimento"
                label="Data de Nascimento"
                type="date"
                {...register('dataNascimento')}
                error={errors.dataNascimento?.message}
              />
            </div>

            {/* Responsáveis Section (apenas se for menor) */}
            {isMinor && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-3 border-b border-[var(--fh-border)]">
                  <div className="w-1 h-6 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-[var(--fh-text)]">
                    Responsável Legal (Obrigatório)
                  </h3>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-600 rounded-xl p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-800 dark:text-amber-300 text-sm">
                    Este aluno é menor de idade. Por favor, selecione pelo menos um responsável legal.
                  </p>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--fh-muted)]" />
                  <input
                    type="text"
                    placeholder="Buscar por nome, email ou CPF..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-[var(--fh-border)] rounded-xl focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] bg-[var(--fh-gray-50)] text-[var(--fh-text)] placeholder:text-[var(--fh-muted)] transition-all"
                  />
                </div>

                {/* Responsáveis List */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {loadingResponsaveis ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--fh-primary)]"></div>
                    </div>
                  ) : filteredResponsaveis.length > 0 ? (
                    filteredResponsaveis.map((responsavel) => {
                      const isSelected = (watch('idsResponsaveis') || []).includes(responsavel.id)
                      return (
                        <button
                          key={responsavel.id}
                          type="button"
                          onClick={() => toggleResponsavel(responsavel.id)}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                            isSelected
                              ? 'border-[var(--fh-primary)] bg-[var(--fh-primary)]/5'
                              : 'border-[var(--fh-border)] hover:border-[var(--fh-primary)]/50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                isSelected
                                  ? 'border-[var(--fh-primary)] bg-[var(--fh-primary)]'
                                  : 'border-[var(--fh-border)]'
                              }`}
                            >
                              {isSelected && (
                                <span className="text-white text-sm font-bold">✓</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-[var(--fh-text)] truncate">
                                {responsavel.nomeCompleto}
                              </p>
                              <p className="text-xs text-[var(--fh-muted)] truncate">
                                {responsavel.email}
                              </p>
                              <p className="text-xs text-[var(--fh-muted)] truncate">
                                {responsavel.cpf}
                              </p>
                            </div>
                          </div>
                        </button>
                      )
                    })
                  ) : (
                    <div className="py-8 text-center text-[var(--fh-muted)]">
                      Nenhum responsável encontrado
                    </div>
                  )}
                </div>

                {/* Selected Count */}
                {(watch('idsResponsaveis') || []).length > 0 && (
                  <div className="p-3 bg-[var(--fh-primary)]/10 border border-[var(--fh-primary)]/30 rounded-lg">
                    <p className="text-sm text-[var(--fh-primary)] font-medium">
                      {(watch('idsResponsaveis') || []).length} responsável{((watch('idsResponsaveis') || []).length > 1 ? 'is' : '')} selecionado{((watch('idsResponsaveis') || []).length > 1 ? 's' : '')}
                    </p>
                  </div>
                )}

                {/* Error message for responsáveis */}
                {errors.idsResponsaveis && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-600 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-300 font-medium">
                      {errors.idsResponsaveis.message}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex gap-3 pt-6 border-t border-[var(--fh-border)] justify-end">
              <button
                type="button"
                onClick={() => navigate('/alunos')}
                className="px-5 py-2 border border-[var(--fh-border)] rounded-lg font-semibold text-[var(--fh-text)] hover:bg-[var(--fh-gray-100)] dark:hover:bg-[var(--fh-gray-700)] transition-all text-sm shadow-sm hover:shadow-md"
                disabled={loading}
              >
                Cancelar
              </button>
              <PrimaryButton
                type="submit"
                loading={loading}
                className="px-7 py-2 text-sm font-semibold shadow-md hover:shadow-lg transition-all"
              >
                {loading ? 'Salvando...' : 'Salvar Aluno'}
              </PrimaryButton>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="text-sm text-[var(--fh-muted)] text-center">
          * Todos os campos são obrigatórios para o cadastro inicial
          {isMinor && ' (Responsável obrigatório para menores)'}
        </div>
      </div>
    </Layout>
  )
}
