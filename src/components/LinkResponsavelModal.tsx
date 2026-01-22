import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Search } from 'lucide-react';
import { responsaveisApi } from '../api/responsaveis';
import { alunosApi } from '../api/alunos';

interface ResponsavelOption {
  id: string;
  nome: string;
  email: string;
  cpf: string;
}

interface LinkResponsavelModalProps {
  alunoId: string;
  onClose: () => void;
}

export default function LinkResponsavelModal({ alunoId, onClose }: LinkResponsavelModalProps) {
  const [responsaveis, setResponsaveis] = useState<ResponsavelOption[]>([]);
  const [selectedResponsavelId, setSelectedResponsavelId] = useState<string | null>(null);
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
    r.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.cpf.includes(searchTerm)
  );

  const handleVincular = async () => {
    if (!selectedResponsavelId) {
      setError('Selecione um responsável');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Vincular responsável ao aluno
      await alunosApi.vincularResponsavel(alunoId, selectedResponsavelId);

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Erro ao vincular responsável';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-[var(--fh-card)] rounded-xl p-8 w-full max-w-md mx-4 shadow-2xl border border-[var(--fh-border)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--fh-text)]">Vincular Responsável</h2>
            <p className="text-[var(--fh-muted)] text-sm mt-1">Selecione um responsável legal</p>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--fh-muted)] hover:text-[var(--fh-text)] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✓</span>
            </div>
            <p className="text-[var(--fh-text)] font-medium">Responsável vinculado com sucesso!</p>
          </div>
        ) : (
          <>
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
                    onClick={() => setSelectedResponsavelId(responsavel.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedResponsavelId === responsavel.id
                        ? 'border-[var(--fh-primary)] bg-[var(--fh-primary)]/5'
                        : 'border-[var(--fh-border)] hover:border-[var(--fh-primary)]/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          selectedResponsavelId === responsavel.id
                            ? 'border-[var(--fh-primary)] bg-[var(--fh-primary)]'
                            : 'border-[var(--fh-border)]'
                        }`}
                      >
                        {selectedResponsavelId === responsavel.id && (
                          <span className="text-white text-sm font-bold">✓</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[var(--fh-text)]">{responsavel.nome}</p>
                        <p className="text-xs text-[var(--fh-muted)]">{responsavel.email}</p>
                        <p className="text-xs text-[var(--fh-muted)] mt-1">CPF: {responsavel.cpf}</p>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-[var(--fh-muted)] text-sm">Nenhum responsável encontrado</p>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-[var(--fh-border)] rounded-xl hover:bg-[var(--fh-gray-50)] text-[var(--fh-text)] transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleVincular}
                disabled={!selectedResponsavelId || loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[var(--fh-primary)] to-[var(--fh-primary-dark)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-md hover:shadow-lg font-medium"
              >
                {loading ? 'Vinculando...' : 'Vincular'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  , document.body);
}
