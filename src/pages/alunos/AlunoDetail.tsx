import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Edit3, 
  Shield, 
  ShieldCheck,
  ShieldOff,
  TrendingUp, 
  TrendingDown,
  Calendar,
  Mail,
  Phone,
  MapPin,
  User,
  Award,
  BookOpen,
  Clock
} from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import useAuth from '../../hooks/useAuth'
import { alunosApi } from '../../api/alunos'
import { Button } from '../../components/Button'
import { ConfirmModal } from '../../components/ConfirmModal'
import type { AlunoDetalhadoResponse } from '../../types'

// Interface para o formulário de edição
interface EditFormData {
  dataNascimento: string
  dataMatricula: string
}

interface EditAlunoModalProps {
  aluno: AlunoDetalhadoResponse
  isOpen: boolean
  onClose: () => void
  onSave: (dadosAtualizados: EditFormData) => Promise<void>
}

const EditAlunoModal: React.FC<EditAlunoModalProps> = ({ aluno, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<EditFormData>({
    dataNascimento: aluno.dataNascimento ? aluno.dataNascimento.toString().split('T')[0] : '',
    dataMatricula: aluno.dataMatricula ? aluno.dataMatricula.toString().split('T')[0] : ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (aluno) {
      setFormData({
        dataNascimento: aluno.dataNascimento ? aluno.dataNascimento.toString().split('T')[0] : '',
        dataMatricula: aluno.dataMatricula ? aluno.dataMatricula.toString().split('T')[0] : ''
      })
    }
  }, [aluno])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      // Error is handled by onSave
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 w-full max-w-lg mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Editar Datas</h2>
            <p className="text-gray-600 mt-1">Atualize as datas do aluno</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit3 className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-2" />
                Data de Nascimento
              </label>
              <input
                type="date"
                value={formData.dataNascimento}
                onChange={(e) => setFormData(prev => ({ ...prev, dataNascimento: e.target.value }))}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <BookOpen className="inline w-4 h-4 mr-2" />
                Data de Matrícula
              </label>
              <input
                type="date"
                value={formData.dataMatricula}
                onChange={(e) => setFormData(prev => ({ ...prev, dataMatricula: e.target.value }))}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

const AlunoDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()
  const { user } = useAuth()
  
  const [aluno, setAluno] = useState<AlunoDetalhadoResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    variant: 'danger' | 'warning' | 'info'
    onConfirm: () => Promise<void>
  } | null>(null)

  useEffect(() => {
    if (id) {
      loadAluno()
    }
  }, [id])

  const loadAluno = async () => {
    try {
      setLoading(true)
      const alunoData = await alunosApi.buscarPorId(id!)
      setAluno(alunoData)
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Erro ao carregar dados do aluno'
      showError(errorMessage)
      navigate('/alunos')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleMatricula = () => {
    if (!aluno) return
    
    const action = aluno.matriculaAtiva ? 'inativar' : 'ativar'
    const variant = aluno.matriculaAtiva ? 'danger' : 'info'
    
    setConfirmModal({
      isOpen: true,
      title: `${action === 'ativar' ? 'Ativar' : 'Inativar'} Matrícula`,
      message: `Tem certeza que deseja ${action} a matrícula de ${aluno.nome}?`,
      variant,
      onConfirm: async () => {
        try {
          await alunosApi.atualizarMatricula(aluno.id, { matriculaAtiva: !aluno.matriculaAtiva })
          await loadAluno()
          showSuccess(`Matrícula ${aluno.matriculaAtiva ? 'inativada' : 'ativada'} com sucesso!`)
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Erro ao atualizar matrícula'
          showError(errorMessage)
          throw error
        }
      }
    })
  }

  const handlePromoverFaixa = () => {
    if (!aluno) return
    
    setConfirmModal({
      isOpen: true,
      title: 'Promover Faixa',
      message: `Tem certeza que deseja promover a faixa de ${aluno.nome}?`,
      variant: 'info',
      onConfirm: async () => {
        try {
          await alunosApi.promoverFaixa(aluno.id)
          await loadAluno()
          showSuccess('Faixa promovida com sucesso!')
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Erro ao promover faixa'
          showError(errorMessage)
          throw error
        }
      }
    })
  }

  const handleRebaixarFaixa = () => {
    if (!aluno) return
    
    setConfirmModal({
      isOpen: true,
      title: 'Rebaixar Faixa',
      message: `Tem certeza que deseja rebaixar a faixa de ${aluno.nome}?`,
      variant: 'warning',
      onConfirm: async () => {
        try {
          await alunosApi.rebaixarFaixa(aluno.id)
          await loadAluno()
          showSuccess('Faixa rebaixada com sucesso!')
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Erro ao rebaixar faixa'
          showError(errorMessage)
          throw error
        }
      }
    })
  }

  const handlePromoverGrau = () => {
    if (!aluno) return
    
    setConfirmModal({
      isOpen: true,
      title: 'Promover Grau',
      message: `Tem certeza que deseja promover o grau de ${aluno.nome}?`,
      variant: 'info',
      onConfirm: async () => {
        try {
          await alunosApi.promoverGrau(aluno.id)
          await loadAluno()
          showSuccess('Grau promovido com sucesso!')
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Erro ao promover grau'
          showError(errorMessage)
          throw error
        }
      }
    })
  }

  const handleRebaixarGrau = () => {
    if (!aluno) return
    
    setConfirmModal({
      isOpen: true,
      title: 'Rebaixar Grau',
      message: `Tem certeza que deseja rebaixar o grau de ${aluno.nome}?`,
      variant: 'warning',
      onConfirm: async () => {
        try {
          await alunosApi.rebaixarGrau(aluno.id)
          await loadAluno()
          showSuccess('Grau rebaixado com sucesso!')
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Erro ao rebaixar grau'
          showError(errorMessage)
          throw error
        }
      }
    })
  }

  const handleSaveEdit = async (dadosAtualizados: EditFormData) => {
    if (!aluno) return

    try {
      // Atualizar data de nascimento se foi alterada
      if (dadosAtualizados.dataNascimento && dadosAtualizados.dataNascimento !== aluno.dataNascimento?.toString().split('T')[0]) {
        await alunosApi.atualizarDataNascimento(aluno.id, {
          dataNascimento: dadosAtualizados.dataNascimento
        })
      }

      // Atualizar data de matrícula se foi alterada
      if (dadosAtualizados.dataMatricula && dadosAtualizados.dataMatricula !== aluno.dataMatricula?.toString().split('T')[0]) {
        await alunosApi.atualizarDataMatricula(aluno.id, {
          dataMatricula: dadosAtualizados.dataMatricula
        })
      }

      // Recarregar dados atualizados do aluno
      await loadAluno()
      showSuccess('Dados atualizados com sucesso!')
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Erro ao salvar alterações'
      showError(errorMessage)
      throw error
    }
  }

  const closeConfirmModal = () => {
    setConfirmModal(null)
  }

  const getGraduacaoDisplay = (graduacao: any) => {
    if (!graduacao) return 'Não informado'
    return `${graduacao.belt} - ${graduacao.level}º Grau`
  }

  const getGraduacaoColor = (belt: string) => {
    const colors = {
      'BRANCA': 'bg-white border-gray-300 text-gray-800',
      'AZUL': 'bg-blue-600 text-white',
      'ROXA': 'bg-purple-600 text-white',
      'MARROM': 'bg-amber-700 text-white',
      'PRETA': 'bg-gray-900 text-white'
    }
    return colors[belt as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (date: string | Date) => {
    if (!date) return 'Não informado'
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const canEditStudent = user?.role && ['ADMIN', 'COORDENADOR'].includes(user.role)
  const canPromoteStudent = user?.role && ['ADMIN', 'PROFESSOR'].includes(user.role)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
        <div className="container mx-auto px-6 py-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-8 bg-gray-200 rounded-lg w-32 animate-pulse" />
            </div>
            <div className="h-10 bg-gray-200 rounded-lg w-64 animate-pulse mb-2" />
            <div className="h-6 bg-gray-200 rounded-lg w-48 animate-pulse" />
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {[1, 2].map(i => (
                <div key={i} className="bg-white rounded-2xl p-8 shadow-lg">
                  <div className="h-6 bg-gray-200 rounded-lg w-32 animate-pulse mb-6" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(j => (
                      <div key={j} className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                        <div className="h-6 bg-gray-200 rounded w-full animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="h-6 bg-gray-200 rounded-lg w-24 animate-pulse mb-6" />
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-12 bg-gray-200 rounded-xl animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!aluno) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-8 bg-gray-100 rounded-2xl flex items-center justify-center">
            <User className="w-12 h-12 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Aluno não encontrado</h1>
          <p className="text-gray-600 mb-8">Não foi possível encontrar os dados deste aluno.</p>
          <Button onClick={() => navigate('/alunos')} variant="primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Lista
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/alunos')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors p-2 hover:bg-white/50 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar para lista
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{aluno.nome}</h1>
              <div className="flex items-center gap-4">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getGraduacaoColor(aluno.graduacaoAluno?.belt || '')}`}>
                  <Award className="inline w-4 h-4 mr-2" />
                  {getGraduacaoDisplay(aluno.graduacaoAluno)}
                </span>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  aluno.matriculaAtiva 
                    ? 'bg-green-100 text-green-800 border-2 border-green-200' 
                    : 'bg-red-100 text-red-800 border-2 border-red-200'
                }`}>
                  {aluno.matriculaAtiva ? (
                    <>
                      <ShieldCheck className="inline w-4 h-4 mr-2" />
                      Matrícula Ativa
                    </>
                  ) : (
                    <>
                      <ShieldOff className="inline w-4 h-4 mr-2" />
                      Matrícula Inativa
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Informações Pessoais */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-orange-600" />
                Informações Pessoais
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <p className="text-lg font-medium text-gray-900">{aluno.email || 'Não informado'}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Telefone
                  </label>
                  <p className="text-lg font-medium text-gray-900">{aluno.telefone || 'Não informado'}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Data de Nascimento
                  </label>
                  <p className="text-lg font-medium text-gray-900">{formatDate(aluno.dataNascimento)}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Data de Matrícula
                  </label>
                  <p className="text-lg font-medium text-gray-900">{formatDate(aluno.dataMatricula)}</p>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Endereço
                  </label>
                  <p className="text-lg font-medium text-gray-900">
                    {aluno.endereco?.logradouro || 'Não informado'}
                  </p>
                </div>
              </div>
            </div>

            {/* Responsáveis */}
            {aluno.responsaveis && aluno.responsaveis.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Responsáveis
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {aluno.responsaveis.map((responsavel, index) => (
                    <div key={responsavel.id} className="p-6 bg-blue-50 rounded-xl border border-blue-100">
                      <h3 className="font-semibold text-blue-900 mb-2">Responsável {index + 1}</h3>
                      <div className="space-y-2">
                        <p className="text-blue-800">
                          <strong>Nome:</strong> {responsavel.nome}
                        </p>
                        <p className="text-blue-800">
                          <strong>Email:</strong> {responsavel.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Ações</h2>
              
              <div className="space-y-4">
                {canEditStudent && (
                  <>
                    <Button
                      onClick={() => setIsEditModalOpen(true)}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Edit3 className="w-4 h-4 mr-3" />
                      Editar Datas
                    </Button>

                    <Button
                      onClick={handleToggleMatricula}
                      variant={aluno.matriculaAtiva ? 'ghost' : 'outline'}
                      className="w-full justify-start"
                    >
                      {aluno.matriculaAtiva ? (
                        <>
                          <ShieldOff className="w-4 h-4 mr-3" />
                          Inativar Matrícula
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4 mr-3" />
                          Ativar Matrícula
                        </>
                      )}
                    </Button>
                  </>
                )}

                {canPromoteStudent && (
                  <>
                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Graduação</h3>
                      
                      <div className="space-y-2">
                        <Button
                          onClick={handlePromoverFaixa}
                          variant="outline"
                          className="w-full justify-start text-green-700 hover:bg-green-50 border-green-300"
                        >
                          <TrendingUp className="w-4 h-4 mr-3" />
                          Promover Faixa
                        </Button>
                        
                        <Button
                          onClick={handleRebaixarFaixa}
                          variant="ghost"
                          className="w-full justify-start text-orange-700 hover:bg-orange-50"
                        >
                          <TrendingDown className="w-4 h-4 mr-3" />
                          Rebaixar Faixa
                        </Button>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Grau</h3>
                      
                      <div className="space-y-2">
                        <Button
                          onClick={handlePromoverGrau}
                          variant="outline"
                          className="w-full justify-start text-blue-700 hover:bg-blue-50 border-blue-300"
                        >
                          <TrendingUp className="w-4 h-4 mr-3" />
                          Promover Grau
                        </Button>
                        
                        <Button
                          onClick={handleRebaixarGrau}
                          variant="ghost"
                          className="w-full justify-start text-purple-700 hover:bg-purple-50"
                        >
                          <TrendingDown className="w-4 h-4 mr-3" />
                          Rebaixar Grau
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Informações Rápidas</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <Clock className="w-4 h-4" />
                    Tempo na Academia
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {aluno.dataMatricula 
                      ? Math.ceil((Date.now() - new Date(aluno.dataMatricula).getTime()) / (1000 * 60 * 60 * 24 * 30)) + ' meses'
                      : 'N/A'
                    }
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <Award className="w-4 h-4" />
                    Graduação Atual
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {aluno.graduacaoAluno?.belt || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        {isEditModalOpen && (
          <EditAlunoModal
            aluno={aluno}
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleSaveEdit}
          />
        )}

        {confirmModal && (
          <ConfirmModal
            isOpen={confirmModal.isOpen}
            onClose={closeConfirmModal}
            onConfirm={confirmModal.onConfirm}
            title={confirmModal.title}
            message={confirmModal.message}
            variant={confirmModal.variant}
          />
        )}
      </div>
    </div>
  )
}

export { AlunoDetail }
export default AlunoDetail
