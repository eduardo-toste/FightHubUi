import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { UserPlus, ArrowLeft, Save } from 'lucide-react'
import { alunosApi } from '../../api/alunos'
import TextField from '../../components/TextField'
import PrimaryButton from '../../components/PrimaryButton'
import Layout from '../../components/Layout'
import { useAuth } from '../../context/AuthContext'
import type { CriarAlunoRequest } from '../../types'

const schema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  cpf: z.string().min(11, 'CPF inválido').max(14, 'CPF inválido'),
  dataNascimento: z.string().min(1, 'Data de nascimento é obrigatória'),
})

type FormData = z.infer<typeof schema>

export default function AlunoCreate() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(schema)
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError(null)

    try {
      const request: CriarAlunoRequest = {
        nome: data.nome,
        email: data.email,
        cpf: data.cpf.replace(/\D/g, ''),
        dataNascimento: data.dataNascimento,
      }

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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/alunos')}
            className="p-2.5 hover:bg-[var(--fh-gray-50)] rounded-xl transition-colors border border-transparent hover:border-[var(--fh-border)]"
            aria-label="Voltar para lista de alunos"
          >
            <ArrowLeft size={24} className="text-[var(--fh-text)]" />
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
                  {...register('cpf')}
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

            {/* Form Actions */}
            <div className="flex gap-4 pt-6 border-t border-[var(--fh-border)]">
              <button
                type="button"
                onClick={() => navigate('/alunos')}
                className="flex-1 px-6 py-3 border border-[var(--fh-border)] rounded-xl font-semibold text-[var(--fh-text)] hover:bg-[var(--fh-gray-50)] transition-all"
                disabled={loading}
              >
                Cancelar
              </button>
              <PrimaryButton
                type="submit"
                loading={loading}
                className="flex-1 flex items-center justify-center gap-2 py-3"
              >
                <Save size={20} />
                {loading ? 'Salvando...' : 'Salvar Aluno'}
              </PrimaryButton>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="text-sm text-[var(--fh-muted)] text-center">
          * Todos os campos são obrigatórios para o cadastro inicial
        </div>
      </div>
    </Layout>
  )
}
