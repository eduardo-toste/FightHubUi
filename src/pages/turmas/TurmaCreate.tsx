import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Users, ArrowLeft, AlertCircle } from 'lucide-react'
import { turmasApi, TurmaRequest } from '../../api/turmas'
import { professoresApi, ProfessorResponse } from '../../api/professores'
import TextField from '../../components/TextField'
import PrimaryButton from '../../components/PrimaryButton'
import Layout from '../../components/Layout'
import { useAuth } from '../../context/AuthContext'

const schema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  horario: z.string().min(1, 'Horário é obrigatório'),
  professorId: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function TurmaCreate() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [professores, setProfessores] = useState<ProfessorResponse[]>([])
  const [loadingProfessores, setLoadingProfessores] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      professorId: '',
    },
  })

  // Carregar professores uma única vez ao montar
  useEffect(() => {
    carregarProfessores()
  }, [])

  const carregarProfessores = async () => {
    try {
      setLoadingProfessores(true)
      const data = await professoresApi.listar(0, 100)
      const professoresList = data.content || data
      setProfessores(professoresList)
    } catch (err) {
      console.error('Erro ao carregar professores:', err)
      setError('Erro ao carregar lista de professores')
    } finally {
      setLoadingProfessores(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError(null)

    try {
      const request: TurmaRequest = {
        nome: data.nome,
        horario: data.horario,
        professorId: data.professorId && data.professorId !== '' ? data.professorId : undefined,
      }

      await turmasApi.criar(request)
      navigate('/turmas')
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erro ao criar turma. Tente novamente.'
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
            onClick={() => navigate('/turmas')}
            className="text-[var(--fh-muted)] hover:text-[var(--fh-text)] mb-4 flex items-center gap-2 transition-colors"
          >
            <ArrowLeft size={20} />
            Voltar para turmas
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--fh-primary)] to-[var(--fh-primary-dark)] flex items-center justify-center shadow-lg">
              <Users className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[var(--fh-text)]">Nova Turma</h1>
              <p className="text-[var(--fh-muted)] mt-1">
                Cadastre uma nova turma na academia
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
            {/* Dados da Turma Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-[var(--fh-border)]">
                <div className="w-1 h-6 bg-gradient-to-b from-[var(--fh-primary)] to-[var(--fh-primary-dark)] rounded-full"></div>
                <h3 className="text-lg font-semibold text-[var(--fh-text)]">
                  Dados da Turma
                </h3>
              </div>

              <TextField
                id="nome"
                label="Nome da Turma"
                placeholder="Ex: Iniciante Manhã, Avançado Noite"
                {...register('nome')}
                error={errors.nome?.message}
              />

              <TextField
                id="horario"
                label="Horário"
                placeholder="Ex: Segunda e Quarta - 08:00 às 09:00"
                {...register('horario')}
                error={errors.horario?.message}
              />

              {/* Professor (Opcional) */}
              <div>
                <label htmlFor="professorId" className="block text-sm font-medium text-[var(--fh-text)] mb-2">
                  Professor (Opcional)
                </label>
                {loadingProfessores ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--fh-primary)]"></div>
                  </div>
                ) : (
                  <select
                    id="professorId"
                    {...register('professorId')}
                    className="w-full px-4 py-2 border border-[var(--fh-border)] rounded-xl focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] bg-[var(--fh-gray-50)] text-[var(--fh-text)] transition-all"
                  >
                    <option value="">Sem professor atribuído</option>
                    {professores.map((professor) => (
                      <option key={professor.id} value={professor.id}>
                        {professor.nome}
                      </option>
                    ))}
                  </select>
                )}
                {errors.professorId && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.professorId.message}
                  </p>
                )}
                <div className="mt-2 flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-600 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800 dark:text-blue-300">
                    O professor pode ser atribuído posteriormente na página de detalhes da turma.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-6 border-t border-[var(--fh-border)] justify-end">
              <button
                type="button"
                onClick={() => navigate('/turmas')}
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
                {loading ? 'Salvando...' : 'Salvar Turma'}
              </PrimaryButton>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="text-sm text-[var(--fh-muted)] text-center">
          * Nome e horário são obrigatórios para o cadastro inicial
        </div>
      </div>
    </Layout>
  )
}
