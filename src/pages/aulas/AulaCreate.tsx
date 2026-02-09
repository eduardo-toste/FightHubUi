import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { BookOpen, ArrowLeft, AlertCircle } from 'lucide-react'
import { aulasApi, AulaRequest } from '../../api/aulas'
import { turmasApi, TurmaResponse } from '../../api/turmas'
import { useAppNotifications } from '../../hooks/useAppNotifications'
import TextField from '../../components/TextField'
import PrimaryButton from '../../components/PrimaryButton'
import Layout from '../../components/Layout'
import { useAuth } from '../../context/AuthContext'

const schema = z.object({
  titulo: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
  descricao: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres'),
  data: z.string().min(1, 'Data e hora são obrigatórias'),
  turmaId: z.string().optional(),
  limiteAlunos: z.coerce.number().min(1, 'Limite deve ser no mínimo 1 aluno'),
})

type FormData = z.infer<typeof schema>

export default function AulaCreate() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  
  // ===== NOTIFICAÇÕES INTEGRADAS =====
  const { notificarAulaCriada, notificarAulaErro } = useAppNotifications()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [turmas, setTurmas] = useState<TurmaResponse[]>([])
  const [loadingTurmas, setLoadingTurmas] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      turmaId: '',
      limiteAlunos: 20,
    },
  })

  // Carregar turmas uma única vez ao montar
  useEffect(() => {
    carregarTurmas()
  }, [])

  const carregarTurmas = async () => {
    try {
      setLoadingTurmas(true)
      const data = await turmasApi.listar(0, 100)
      const turmasList = data.content || data
      // Filtrar apenas turmas ativas
      setTurmas(turmasList.filter((t: TurmaResponse) => t.ativo))
    } catch (err) {
      console.error('Erro ao carregar turmas:', err)
      setError('Erro ao carregar lista de turmas')
    } finally {
      setLoadingTurmas(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError(null)

    try {
      const request: AulaRequest = {
        titulo: data.titulo,
        descricao: data.descricao,
        data: data.data,
        turmaId: data.turmaId && data.turmaId !== '' ? data.turmaId : undefined,
        limiteAlunos: data.limiteAlunos,
      }

      const aula = await aulasApi.criar(request)
      notificarAulaCriada(data.titulo)
      navigate('/aulas')
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erro ao criar aula. Tente novamente.'
      notificarAulaErro(msg)
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
            onClick={() => navigate('/aulas')}
            className="text-[var(--fh-muted)] hover:text-[var(--fh-text)] mb-4 flex items-center gap-2 transition-colors"
          >
            <ArrowLeft size={20} />
            Voltar para aulas
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--fh-primary)] to-[var(--fh-primary-dark)] flex items-center justify-center shadow-lg">
              <BookOpen className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[var(--fh-text)]">Nova Aula</h1>
              <p className="text-[var(--fh-muted)] mt-1">
                Cadastre uma nova aula na academia
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
            {/* Dados da Aula Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-[var(--fh-border)]">
                <div className="w-1 h-6 bg-gradient-to-b from-[var(--fh-primary)] to-[var(--fh-primary-dark)] rounded-full"></div>
                <h3 className="text-lg font-semibold text-[var(--fh-text)]">
                  Dados da Aula
                </h3>
              </div>

              <TextField
                id="titulo"
                label="Título da Aula"
                placeholder="Ex: Treino de Passagem de Guarda"
                {...register('titulo')}
                error={errors.titulo?.message}
              />

              <div>
                <label htmlFor="descricao" className="block text-sm font-medium text-[var(--fh-text)] mb-2">
                  Descrição
                </label>
                <textarea
                  id="descricao"
                  rows={4}
                  placeholder="Descreva o conteúdo e objetivos da aula..."
                  {...register('descricao')}
                  className="w-full px-4 py-2 border border-[var(--fh-border)] rounded-xl focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] bg-[var(--fh-gray-50)] text-[var(--fh-text)] placeholder:text-[var(--fh-muted)] transition-all resize-none"
                />
                {errors.descricao && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.descricao.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="data" className="block text-sm font-medium text-[var(--fh-text)] mb-2">
                    Data e Hora
                  </label>
                  <input
                    id="data"
                    type="datetime-local"
                    {...register('data')}
                    className="w-full px-4 py-2 border border-[var(--fh-border)] rounded-xl focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] bg-[var(--fh-gray-50)] text-[var(--fh-text)] transition-all"
                  />
                  {errors.data && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.data.message}
                    </p>
                  )}
                </div>

                <TextField
                  id="limiteAlunos"
                  label="Limite de Alunos"
                  type="number"
                  min="1"
                  placeholder="Ex: 20"
                  {...register('limiteAlunos')}
                  error={errors.limiteAlunos?.message}
                />
              </div>

              {/* Turma (Opcional) */}
              <div>
                <label htmlFor="turmaId" className="block text-sm font-medium text-[var(--fh-text)] mb-2">
                  Turma (Opcional)
                </label>
                {loadingTurmas ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--fh-primary)]"></div>
                  </div>
                ) : (
                  <select
                    id="turmaId"
                    {...register('turmaId')}
                    className="w-full px-4 py-2 border border-[var(--fh-border)] rounded-xl focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] bg-[var(--fh-gray-50)] text-[var(--fh-text)] transition-all"
                  >
                    <option value="">Sem turma vinculada</option>
                    {turmas.map((turma) => (
                      <option key={turma.id} value={turma.id}>
                        {turma.nome} - {turma.horario}
                      </option>
                    ))}
                  </select>
                )}
                {errors.turmaId && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.turmaId.message}
                  </p>
                )}
                <div className="mt-2 flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-600 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800 dark:text-blue-300">
                    A turma pode ser vinculada posteriormente na página de detalhes da aula.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-6 border-t border-[var(--fh-border)] justify-end">
              <button
                type="button"
                onClick={() => navigate('/aulas')}
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
                {loading ? 'Salvando...' : 'Salvar Aula'}
              </PrimaryButton>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="text-sm text-[var(--fh-muted)] text-center">
          * Título, descrição, data/hora e limite de alunos são obrigatórios
        </div>
      </div>
    </Layout>
  )
}
