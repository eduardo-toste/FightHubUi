import { useState } from 'react';
import { Calendar, AlertTriangle, X } from 'lucide-react';
import { alunosApi } from '../api/alunos';

interface UpdateBirthdateModalProps {
  isOpen: boolean;
  alunoId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UpdateBirthdateModal({ isOpen, alunoId, onClose, onSuccess }: UpdateBirthdateModalProps) {
  const [dataNascimento, setDataNascimento] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dataNascimento) {
      setError('Por favor, informe sua data de nascimento');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await alunosApi.atualizarDataNascimento(alunoId, { dataNascimento });
      onSuccess();
      onClose();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Erro ao atualizar data de nascimento';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-[var(--fh-card)] rounded-xl p-8 w-full max-w-md mx-4 shadow-2xl border border-[var(--fh-border)]">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[var(--fh-text)]">Atenção Necessária</h2>
              <p className="text-[var(--fh-muted)] text-sm mt-1">Atualize seus dados</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mb-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-600 rounded-xl p-4 mb-6">
            <p className="text-yellow-800 dark:text-yellow-300 text-sm">
              <strong>Seu cadastro está incompleto!</strong> Para continuar utilizando a plataforma, 
              você precisa informar sua data de nascimento real.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-600 text-red-800 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-[var(--fh-text)] mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data de Nascimento *
              </label>
              <input
                type="date"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                required
                className="w-full px-4 py-3 border border-[var(--fh-border)] rounded-xl focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] bg-[var(--fh-gray-50)] text-[var(--fh-text)] transition-all"
              />
              <p className="text-xs text-[var(--fh-muted)] mt-2">
                Informe sua data de nascimento verdadeira
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[var(--fh-primary)] to-[var(--fh-primary-dark)] hover:opacity-90 text-white rounded-xl transition-all shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Salvando...' : 'Confirmar e Continuar'}
              </button>
            </div>
          </form>
        </div>

        {/* Info */}
        <div className="text-xs text-[var(--fh-muted)] text-center mt-4 p-3 bg-[var(--fh-gray-50)] rounded-lg">
          💡 Esta informação é necessária para o correto funcionamento da plataforma
        </div>
      </div>
    </div>
  );
}
