import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { responsaveisApi } from '../api/responsaveis';
import { alunosApi } from '../api/alunos';

interface ResponsavelOption {
  id: string;
  nomeCompleto: string;
  email: string;
  cpf: string;
}

interface SelectResponsableAfterCreationModalProps {
  alunoId: string;
  alunoNome: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SelectResponsableAfterCreationModal({
  alunoId,
  alunoNome,
  onClose,
  onSuccess,
}: SelectResponsableAfterCreationModalProps) {
  const [responsaveis, setResponsaveis] = useState<ResponsavelOption[]>([]);
  const [selectedResponsavelIds, setSelectedResponsavelIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    carregarResponsaveis();
  }, []);

  const carregarResponsaveis = async () => {
    try {
      setSearching(true);
      const data = await responsaveisApi.listar(0, 100);
      // Extrair o array de responsáveis da resposta paginada
      const responsaveisList = data.content || data;
      setResponsaveis(responsaveisList);
    } catch (err) {
      console.error('Erro ao carregar responsáveis:', err);
      setError('Erro ao carregar lista de responsáveis');
    } finally {
      setSearching(false);
    }
  };

  const filteredResponsaveis = responsaveis.filter((r) =>
    r.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.cpf.includes(searchTerm)
  );

  const toggleResponsavel = (responsavelId: string) => {
    setSelectedResponsavelIds((prev) =>
      prev.includes(responsavelId)
        ? prev.filter((id) => id !== responsavelId)
        : [...prev, responsavelId]
    );
  };

  const handleVincular = async () => {
    if (selectedResponsavelIds.length === 0) {
      setError('Selecione pelo menos um responsável');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Vincular todos os responsáveis selecionados
      for (const responsavelId of selectedResponsavelIds) {
        await alunosApi.vincularResponsavel(alunoId, responsavelId);
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Erro ao vincular responsável';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-[var(--fh-card)] rounded-xl p-8 w-full max-w-md mx-4 shadow-2xl border border-[var(--fh-border)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[var(--fh-text)]">Menor de Idade</h2>
              <p className="text-[var(--fh-muted)] text-sm mt-1">Vincular responsável</p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="text-[var(--fh-muted)] hover:text-[var(--fh-text)] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-[var(--fh-text)] font-medium">
              Responsável{selectedResponsavelIds.length > 1 ? 'is' : ''} vinculado{selectedResponsavelIds.length > 1 ? 's' : ''} com sucesso!
            </p>
          </div>
        ) : (
          <>
            {/* Info Message */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-600 rounded-xl p-4 mb-6">
              <p className="text-amber-800 dark:text-amber-300 text-sm">
                <strong>{alunoNome}</strong> é menor de idade. Por favor, vincule pelo menos um responsável legal.
              </p>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--fh-muted)]" />
                <input
                  type="text"
                  placeholder="Buscar por nome, email ou CPF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-[var(--fh-border)] rounded-xl focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] bg-[var(--fh-gray-50)] text-[var(--fh-text)] placeholder:text-[var(--fh-muted)] transition-all"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-600 rounded-xl p-4 mb-6">
                <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Responsáveis List */}
            <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
              {searching ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--fh-primary)]"></div>
                </div>
              ) : filteredResponsaveis.length > 0 ? (
                filteredResponsaveis.map((responsavel) => (
                  <button
                    key={responsavel.id}
                    onClick={() => toggleResponsavel(responsavel.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedResponsavelIds.includes(responsavel.id)
                        ? 'border-[var(--fh-primary)] bg-[var(--fh-primary)]/5'
                        : 'border-[var(--fh-border)] hover:border-[var(--fh-primary)]/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          selectedResponsavelIds.includes(responsavel.id)
                            ? 'border-[var(--fh-primary)] bg-[var(--fh-primary)]'
                            : 'border-[var(--fh-border)]'
                        }`}
                      >
                        {selectedResponsavelIds.includes(responsavel.id) && (
                          <span className="text-white text-sm font-bold">✓</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[var(--fh-text)] truncate">
                          {responsavel.nomeCompleto}
                        </p>
                        <p className="text-xs text-[var(--fh-muted)] truncate">
                          {responsavel.email}
                        </p>
                        <p className="text-xs text-[var(--fh-muted)] truncate">
                          {responsavel.cpf}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="py-8 text-center text-[var(--fh-muted)]">
                  Nenhum responsável encontrado
                </div>
              )}
            </div>

            {/* Selected Count */}
            {selectedResponsavelIds.length > 0 && (
              <div className="mb-6 p-3 bg-[var(--fh-primary)]/10 border border-[var(--fh-primary)]/30 rounded-lg">
                <p className="text-sm text-[var(--fh-primary)] font-medium">
                  {selectedResponsavelIds.length} responsável{selectedResponsavelIds.length > 1 ? 'is' : ''} selecionado{selectedResponsavelIds.length > 1 ? 's' : ''}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleSkip}
                className="flex-1 px-4 py-2 border border-[var(--fh-border)] rounded-xl font-medium text-[var(--fh-text)] hover:bg-[var(--fh-gray-50)] dark:hover:bg-[var(--fh-gray-900)] transition-colors"
                disabled={loading}
              >
                Fazer Depois
              </button>
              <button
                onClick={handleVincular}
                disabled={loading || selectedResponsavelIds.length === 0}
                className={`flex-1 px-4 py-2 rounded-xl font-medium text-white transition-all ${
                  loading || selectedResponsavelIds.length === 0
                    ? 'bg-[var(--fh-primary)]/50 cursor-not-allowed'
                    : 'bg-[var(--fh-primary)] hover:bg-[var(--fh-primary-dark)]'
                }`}
              >
                {loading ? 'Vinculando...' : 'Vincular'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
