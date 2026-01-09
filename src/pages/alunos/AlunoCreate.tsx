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
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/alunos')}
            className="p-2 hover:bg-[var(--fh-card)] rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--fh-primary)] to-[var(--fh-primary-dark)] flex items-center justify-center">
              <UserPlus className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--fh-text)]">Novo Aluno</h1>
              <p className="text-sm text-[var(--fh-muted)]">Cadastre um novo aluno na academia</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-[var(--fh-card)] rounded-lg border border-[var(--fh-border)] p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--fh-text)] border-b border-[var(--fh-border)] pb-2">
                Dados Pessoais
              </h3>

              <TextField
                id="nome"
                label="Nome Completo *"
                placeholder="Ex: João Silva Santos"
                {...register('nome')}
                error={errors.nome?.message}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  id="email"
                  label="Email *"
                  type="email"
                  placeholder="joao@exemplo.com"
                  {...register('email')}
                  error={errors.email?.message}
                />

                <TextField
                  id="cpf"
                  label="CPF *"
                  placeholder="000.000.000-00"
                  {...register('cpf')}
                  error={errors.cpf?.message}
                />
              </div>

              <TextField
                id="dataNascimento"
                label="Data de Nascimento *"
                type="date"
                {...register('dataNascimento')}
                error={errors.dataNascimento?.message}
              />
            </div>

            <div className="flex gap-4 pt-4 border-t border-[var(--fh-border)]">
              <button
                type="button"
                onClick={() => navigate('/alunos')}
                className="flex-1 px-4 py-2.5 border border-[var(--fh-border)] rounded-lg font-semibold hover:bg-[var(--fh-bg)] transition-colors"
              >
                Cancelar
              </button>
              <PrimaryButton
                type="submit"
                loading={loading}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Save size={20} />
                {loading ? 'Salvando...' : 'Salvar Aluno'}
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}
