import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from './Modal'
import TextField from './TextField'
import PrimaryButton from './PrimaryButton'

interface EditAlunoModalProps {
  isOpen: boolean
  onClose: () => void
  aluno: {
    dataNascimento: string
    dataMatricula: string
  }
  onSave: (data: { dataNascimento?: string; dataMatricula?: string }) => Promise<void>
}

const schema = z.object({
  dataNascimento: z.string().min(1, 'Data de nascimento é obrigatória'),
  dataMatricula: z.string().min(1, 'Data de matrícula é obrigatória'),
})

type FormData = z.infer<typeof schema>

export default function EditAlunoModal({ isOpen, onClose, aluno, onSave }: EditAlunoModalProps) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      dataNascimento: aluno.dataNascimento,
      dataMatricula: aluno.dataMatricula,
    }
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await onSave(data)
      reset()
      onClose()
    } catch (error) {
      // Error is handled by parent component
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Datas do Aluno">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <TextField
          id="dataNascimento"
          label="Data de Nascimento"
          type="date"
          {...register('dataNascimento')}
          error={errors.dataNascimento?.message}
        />

        <TextField
          id="dataMatricula"
          label="Data de Matrícula"
          type="date"
          {...register('dataMatricula')}
          error={errors.dataMatricula?.message}
        />

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-[var(--fh-border)] rounded-lg font-semibold hover:bg-[var(--fh-bg)] transition-colors"
          >
            Cancelar
          </button>
          <PrimaryButton
            type="submit"
            loading={loading}
            className="flex-1"
          >
            Salvar
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  )
}
