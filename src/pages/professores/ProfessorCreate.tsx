import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { UserPlus, ArrowLeft, Save, AlertCircle } from 'lucide-react'
import { professoresApi } from '../../api/professores'
import TextField from '../../components/TextField'
import PrimaryButton from '../../components/PrimaryButton'
import Layout from '../../components/Layout'
import { useAuth } from '../../context/AuthContext'
import type { CriarProfessorRequest } from '../../api/professores'

const schema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  cpf: z.string().min(11, 'CPF inválido').max(14, 'CPF inválido'),
})

type FormData = z.infer<typeof schema>

export default function ProfessorCreate() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError(null)
    setLoading(true)

    try {
      const request: CriarProfessorRequest = {
        nome: data.nome,
        email: data.email,
        cpf: data.cpf.replace(/\D/g, ''),
      }

      await professoresApi.criar(request)
      navigate('/professores')
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erro ao criar professor. Tente novamente.'
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
            onClick={() => navigate('/professores')}
            className="text-[var(--fh-muted)] hover:text-[var(--fh-text)] mb-4 flex items-center gap-2 transition-colors"
          >
            <ArrowLeft size={20} />
            Voltar para professores
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--fh-primary)] to-[var(--fh-primary-dark)] flex items-center justify-center shadow-lg">
              <UserPlus className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[var(--fh-text)]">Novo Professor</h1>
              <p className="text-[var(--fh-muted)] mt-1">
                Cadastre um novo professor na academia
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
              <div className="space-y-4">
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
                    placeholder="Ex: joao@example.com"
                    {...register('email')}
                    error={errors.email?.message}
                  />

                  <TextField
                    id="cpf"
                    label="CPF"
                    placeholder="Ex: 123.456.789-00"
                    {...register('cpf')}
                    error={errors.cpf?.message}
                  />
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-6 border-t border-[var(--fh-border)]">
              <button
                type="button"
                onClick={() => navigate('/professores')}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--fh-border)] text-[var(--fh-text)] hover:bg-[var(--fh-gray-50)] transition-colors font-medium"
              >
                Cancelar
              </button>
              <PrimaryButton
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {loading ? 'Criando...' : 'Criar Professor'}
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}
