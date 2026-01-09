import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, UserCheck, UserX, Award, Calendar, Mail, Phone, MapPin, Users as UsersIcon } from 'lucide-react'
import { alunosApi } from '../../api/alunos'
import Layout from '../../components/Layout'
import { useAuth } from '../../context/AuthContext'
import type { AlunoDetalhadoResponse } from '../../types'

export default function AlunoDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [aluno, setAluno] = useState<AlunoDetalhadoResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const loadAluno = async () => {
    if (!id) return
    
    setLoading(true)
    try {
      const data = await alunosApi.buscarPorId(id)
      setAluno(data)
    } catch (error) {
      console.error('Erro ao carregar aluno:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAluno()
  }, [id])

  const handleToggleMatricula = async () => {
    if (!aluno) return
    
    setActionLoading(true)
    try {
      await alunosApi.atualizarMatricula(aluno.id, { 
        matriculaAtiva: !aluno.matriculaAtiva 
      })
      await loadAluno()
    } catch (error) {
      console.error('Erro ao atualizar matrícula:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handlePromoverFaixa = async () => {
    if (!aluno) return
    
    setActionLoading(true)
    try {
      await alunosApi.promoverFaixa(aluno.id)
      await loadAluno()
    } catch (error) {
      console.error('Erro ao promover faixa:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  if (loading) {
    return (
      <Layout userName={user?.name} userRole={user?.role} onLogout={logout}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-[var(--fh-divider)] rounded w-1/4" />
          <div className="h-64 bg-[var(--fh-divider)] rounded" />
        </div>
      </Layout>
    )
  }

  if (!aluno) {
    return (
      <Layout userName={user?.name} userRole={user?.role} onLogout={logout}>
        <div className="text-center">
          <p className="text-[var(--fh-muted)]">Aluno não encontrado</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout userName={user?.name} userRole={user?.role} onLogout={logout}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/alunos')}
              className="p-2 hover:bg-[var(--fh-card)] rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[var(--fh-text)]">{aluno.nome}</h1>
              <p className="text-sm text-[var(--fh-muted)]">Detalhes do aluno</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleToggleMatricula}
              disabled={actionLoading}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all ${
                aluno.matriculaAtiva
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {aluno.matriculaAtiva ? <UserX size={20} /> : <UserCheck size={20} />}
              {aluno.matriculaAtiva ? 'Desativar' : 'Ativar'} Matrícula
            </button>
            <button
              onClick={handlePromoverFaixa}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[var(--fh-primary)] to-[var(--fh-primary-dark)] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              <Award size={20} />
              Promover Faixa
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Info Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dados Pessoais */}
            <div className="bg-[var(--fh-card)] rounded-lg border border-[var(--fh-border)] p-6">
              <h3 className="text-lg font-semibold text-[var(--fh-text)] mb-4 border-b border-[var(--fh-border)] pb-2">
                Informações Pessoais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Mail className="text-[var(--fh-primary)] mt-1" size={20} />
                  <div>
                    <p className="text-xs text-[var(--fh-muted)]">Email</p>
                    <p className="text-sm text-[var(--fh-body)] font-medium">{aluno.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="text-[var(--fh-primary)] mt-1" size={20} />
                  <div>
                    <p className="text-xs text-[var(--fh-muted)]">Data de Nascimento</p>
                    <p className="text-sm text-[var(--fh-body)] font-medium">{formatDate(aluno.dataNascimento)}</p>
                  </div>
                </div>
                {aluno.telefone && (
                  <div className="flex items-start gap-3">
                    <Phone className="text-[var(--fh-primary)] mt-1" size={20} />
                    <div>
                      <p className="text-xs text-[var(--fh-muted)]">Telefone</p>
                      <p className="text-sm text-[var(--fh-body)] font-medium">{aluno.telefone}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Calendar className="text-[var(--fh-primary)] mt-1" size={20} />
                  <div>
                    <p className="text-xs text-[var(--fh-muted)]">Data de Matrícula</p>
                    <p className="text-sm text-[var(--fh-body)] font-medium">{formatDate(aluno.dataMatricula)}</p>
                  </div>
                </div>
              </div>

              {aluno.endereco && (
                <div className="mt-4 pt-4 border-t border-[var(--fh-border)]">
                  <div className="flex items-start gap-3">
                    <MapPin className="text-[var(--fh-primary)] mt-1" size={20} />
                    <div>
                      <p className="text-xs text-[var(--fh-muted)]">Endereço</p>
                      <p className="text-sm text-[var(--fh-body)] font-medium">
                        {aluno.endereco.logradouro}, {aluno.endereco.numero}
                        {aluno.endereco.complemento && ` - ${aluno.endereco.complemento}`}
                      </p>
                      <p className="text-sm text-[var(--fh-muted)]">
                        {aluno.endereco.bairro} - {aluno.endereco.cidade}/{aluno.endereco.estado}
                      </p>
                      <p className="text-sm text-[var(--fh-muted)]">CEP: {aluno.endereco.cep}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Responsáveis */}
            {aluno.responsaveis && aluno.responsaveis.length > 0 && (
              <div className="bg-[var(--fh-card)] rounded-lg border border-[var(--fh-border)] p-6">
                <h3 className="text-lg font-semibold text-[var(--fh-text)] mb-4 flex items-center gap-2">
                  <UsersIcon size={20} />
                  Responsáveis
                </h3>
                <div className="space-y-3">
                  {aluno.responsaveis.map((resp) => (
                    <div key={resp.id} className="p-3 bg-[var(--fh-bg)] rounded-lg">
                      <p className="font-semibold text-[var(--fh-text)] text-sm">{resp.nome}</p>
                      <p className="text-xs text-[var(--fh-muted)]">{resp.email}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status Card */}
            <div className="bg-[var(--fh-card)] rounded-lg border border-[var(--fh-border)] p-6">
              <h3 className="text-lg font-semibold text-[var(--fh-text)] mb-4">Status da Matrícula</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-[var(--fh-muted)]">Situação</p>
                  <span className={`inline-flex items-center mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                    aluno.matriculaAtiva 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {aluno.matriculaAtiva ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
