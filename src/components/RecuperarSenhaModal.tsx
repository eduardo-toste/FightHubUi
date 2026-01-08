import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Mail, Key, Lock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import Modal from './Modal'
import TextField from './TextField'
import PrimaryButton from './PrimaryButton'
import api from '../lib/apiClient'

interface RecuperarSenhaModalProps {
  isOpen: boolean
  onClose: () => void
}

type Step = 'email' | 'codigo' | 'senha' | 'sucesso'

const emailSchema = z.object({
  email: z.string().email('E-mail inválido'),
})

const codigoSchema = z.object({
  codigoRecuperacao: z.string().min(1, 'Código é obrigatório'),
})

const senhaSchema = z.object({
  novaSenha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmarSenha: z.string().min(6, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.novaSenha === data.confirmarSenha, {
  message: 'As senhas não coincidem',
  path: ['confirmarSenha'],
})

type EmailForm = z.infer<typeof emailSchema>
type CodigoForm = z.infer<typeof codigoSchema>
type SenhaForm = z.infer<typeof senhaSchema>

export default function RecuperarSenhaModal({ isOpen, onClose }: RecuperarSenhaModalProps) {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
  })

  const codigoForm = useForm<CodigoForm>({
    resolver: zodResolver(codigoSchema),
  })

  const senhaForm = useForm<SenhaForm>({
    resolver: zodResolver(senhaSchema),
  })

  // Timer para reenvio de código
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [resendTimer])

  const handleClose = () => {
    setStep('email')
    setEmail('')
    setCodigo('')
    setError(null)
    setSuccessMessage(null)
    setResendTimer(0)
    emailForm.reset()
    codigoForm.reset()
    senhaForm.reset()
    onClose()
  }

  const handleSolicitarCodigo = async (data: EmailForm) => {
    setLoading(true)
    setError(null)
    setSuccessMessage(null)
    try {
      await api.post('/auth/recuperar-senha', { email: data.email })
      setEmail(data.email)
      setStep('codigo')
      setResendTimer(60) // 60 segundos até poder reenviar
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erro ao solicitar recuperação. Verifique o e-mail e tente novamente.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleReenviarCodigo = async () => {
    setResendLoading(true)
    setError(null)
    setSuccessMessage(null)
    try {
      await api.post('/auth/recuperar-senha', { email })
      setSuccessMessage('Código reenviado com sucesso! Verifique seu e-mail.')
      setResendTimer(60) // Reinicia o timer
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erro ao reenviar código. Tente novamente.'
      setError(msg)
    } finally {
      setResendLoading(false)
    }
  }

  const handleValidarCodigo = async (data: CodigoForm) => {
    setLoading(true)
    setError(null)
    try {
      await api.post('/auth/recuperar-senha/validar-codigo', {
        email,
        codigoRecuperacao: data.codigoRecuperacao,
      })
      setCodigo(data.codigoRecuperacao)
      setStep('senha')
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Código inválido ou expirado. Tente novamente.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleRedefinirSenha = async (data: SenhaForm) => {
    setLoading(true)
    setError(null)
    try {
      await api.post('/auth/recuperar-senha/nova-senha', {
        email,
        codigoRecuperacao: codigo,
        novaSenha: data.novaSenha,
      })
      setStep('sucesso')
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erro ao redefinir senha. Tente novamente.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 'email':
        return (
          <form onSubmit={emailForm.handleSubmit(handleSolicitarCodigo)} className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-md bg-blue-50 border border-blue-100">
              <Mail className="text-blue-600 mt-0.5" size={20} />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Recuperação de senha</p>
                <p className="text-blue-700">
                  Informe seu e-mail cadastrado e enviaremos um código de verificação.
                </p>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-md bg-red-50 text-red-700 border border-red-100">
                <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <TextField
              id="email-recuperacao"
              label="E-mail"
              type="email"
              placeholder="seu@exemplo.com"
              {...emailForm.register('email')}
              error={emailForm.formState.errors.email?.message}
            />

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-[var(--fh-body)] border border-[var(--fh-border)] hover:bg-black/5 transition-colors"
              >
                Cancelar
              </button>
              <PrimaryButton type="submit" loading={loading} className="flex-1">
                {loading ? 'Enviando...' : 'Enviar código'}
              </PrimaryButton>
            </div>
          </form>
        )

      case 'codigo':
        return (
          <form onSubmit={codigoForm.handleSubmit(handleValidarCodigo)} className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-md bg-green-50 border border-green-100">
              <Key className="text-green-600 mt-0.5" size={20} />
              <div className="text-sm text-green-900">
                <p className="font-medium mb-1">Código enviado!</p>
                <p className="text-green-700">
                  Verifique sua caixa de entrada em <strong>{email}</strong> e insira o código recebido.
                </p>
              </div>
            </div>

            {successMessage && (
              <div className="flex items-start gap-2 p-3 rounded-md bg-green-50 text-green-700 border border-green-100 animate-fade-in">
                <CheckCircle size={18} className="mt-0.5 flex-shrink-0" />
                <span className="text-sm">{successMessage}</span>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-md bg-red-50 text-red-700 border border-red-100">
                <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <TextField
              id="codigo-recuperacao"
              label="Código de verificação"
              placeholder="Digite o código recebido"
              {...codigoForm.register('codigoRecuperacao')}
              error={codigoForm.formState.errors.codigoRecuperacao?.message}
            />

            {/* Botão de reenviar código */}
            <div className="flex items-center justify-center pt-2">
              <button
                type="button"
                onClick={handleReenviarCodigo}
                disabled={resendTimer > 0 || resendLoading}
                className="text-sm font-medium text-[var(--fh-primary)] hover:text-[var(--fh-primary-dark)] disabled:text-[var(--fh-muted)] disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <RefreshCw size={14} className={resendLoading ? 'animate-spin' : ''} />
                {resendTimer > 0 
                  ? `Reenviar código em ${resendTimer}s` 
                  : resendLoading 
                  ? 'Reenviando...' 
                  : 'Não recebeu? Reenviar código'}
              </button>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setStep('email')
                  setError(null)
                  setSuccessMessage(null)
                  setResendTimer(0)
                  codigoForm.reset()
                }}
                className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-[var(--fh-body)] border border-[var(--fh-border)] hover:bg-black/5 transition-colors"
              >
                Voltar
              </button>
              <PrimaryButton type="submit" loading={loading} className="flex-1">
                {loading ? 'Validando...' : 'Validar código'}
              </PrimaryButton>
            </div>
          </form>
        )

      case 'senha':
        return (
          <form onSubmit={senhaForm.handleSubmit(handleRedefinirSenha)} className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-md bg-purple-50 border border-purple-100">
              <Lock className="text-purple-600 mt-0.5" size={20} />
              <div className="text-sm text-purple-900">
                <p className="font-medium mb-1">Defina sua nova senha</p>
                <p className="text-purple-700">
                  Escolha uma senha forte com no mínimo 6 caracteres.
                </p>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-md bg-red-50 text-red-700 border border-red-100">
                <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <TextField
              id="nova-senha"
              label="Nova senha"
              type="password"
              placeholder="Mínimo 6 caracteres"
              {...senhaForm.register('novaSenha')}
              error={senhaForm.formState.errors.novaSenha?.message}
            />

            <TextField
              id="confirmar-senha"
              label="Confirmar senha"
              type="password"
              placeholder="Digite a senha novamente"
              {...senhaForm.register('confirmarSenha')}
              error={senhaForm.formState.errors.confirmarSenha?.message}
            />

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setStep('codigo')
                  setError(null)
                  senhaForm.reset()
                }}
                className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-[var(--fh-body)] border border-[var(--fh-border)] hover:bg-black/5 transition-colors"
              >
                Voltar
              </button>
              <PrimaryButton type="submit" loading={loading} className="flex-1">
                {loading ? 'Redefinindo...' : 'Redefinir senha'}
              </PrimaryButton>
            </div>
          </form>
        )

      case 'sucesso':
        return (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-[var(--fh-text)] mb-2">
                Senha redefinida com sucesso!
              </h3>
              <p className="text-[var(--fh-muted)] mb-6">
                Você já pode fazer login com sua nova senha.
              </p>
              <PrimaryButton onClick={handleClose} className="min-w-[200px]">
                Fazer login
              </PrimaryButton>
            </div>
          </div>
        )
    }
  }

  const getTitleByStep = () => {
    switch (step) {
      case 'email':
        return 'Recuperar senha'
      case 'codigo':
        return 'Validar código'
      case 'senha':
        return 'Nova senha'
      case 'sucesso':
        return 'Sucesso!'
    }
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title={getTitleByStep()} size="md">
        {renderStepContent()}
      </Modal>
      
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </>
  )
}
