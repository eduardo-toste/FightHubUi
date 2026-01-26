import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Search } from 'lucide-react';
import { alunosApi } from '../api/alunos';
import { responsaveisApi } from '../api/responsaveis';

interface AlunoOption {
  id: string;
  nome: string;
  email: string;
  cpf: string;
}

interface LinkAlunoResponsavelModalProps {
  responsavelId: string;
  onClose: () => void;
  onSuccess?: (aluno: AlunoOption) => void;
  alunosVinculados?: string[]; // IDs dos alunos já vinculados
}

export default function LinkAlunoResponsavelModal({ 
  responsavelId, 
  onClose, 
  onSuccess,
  alunosVinculados = []
}: LinkAlunoResponsavelModalProps) {
  const [alunos, setAlunos] = useState<AlunoOption[]>([]);
  const [selectedAlunoId, setSelectedAlunoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    carregarAlunos();
  }, []);

  const carregarAlunos = async () => {
    try {
      setSearching(true);
      const data = await alunosApi.listar(0, 100);
      // Extrair o array de alunos da resposta paginada
      const rawList = data.content || data;
      // Mapear para AlunoOption garantindo que cpf exista (fallback para documento ou string vazia)
      const alunosList: AlunoOption[] = (rawList || []).map((a: any) => ({
        id: String(a.id),
        nome: a.nome ?? '',
        email: a.email ?? '',
        cpf: a.cpf ?? a.documento ?? '',
      }));
      setAlunos(alunosList);
    } catch (err) {
      console.error('Erro ao carregar alunos:', err);
      setError('Erro ao carregar lista de alunos');
    } finally {
      setSearching(false);
    }
  };

  // Filtrar alunos que não estão vinculados
  const alunosDisponíveis = alunos.filter(
    (a) => !alunosVinculados.includes(a.id)
  );

  const filteredAlunos = alunosDisponíveis.filter((a) =>
    a.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.cpf.includes(searchTerm)
  );

  const handleVincular = async () => {
    if (!selectedAlunoId) {
      setError('Selecione um aluno');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Vincular aluno ao responsável
      await responsaveisApi.vincularAluno(responsavelId, selectedAlunoId);

      // Encontrar o aluno que foi vinculado
      const alunoVinculado = alunos.find(a => a.id === selectedAlunoId);

      setSuccess(true);
      setTimeout(() => {
        if (alunoVinculado) {
          onSuccess?.(alunoVinculado);
        }
        onClose();
      }, 1500);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Erro ao vincular aluno';
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
            <h2 className="text-2xl font-bold text-[var(--fh-text)]">Vincular Aluno</h2>
            <p className="text-[var(--fh-muted)] text-sm mt-1">Selecione um aluno para vincular</p>
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
            <p className="text-[var(--fh-text)] font-medium">Aluno vinculado com sucesso!</p>
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

            {/* Alunos List */}
            <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
              {searching ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--fh-primary)]"></div>
                </div>
              ) : filteredAlunos.length > 0 ? (
                filteredAlunos.map((aluno) => (
                  <button
                    key={aluno.id}
                    onClick={() => setSelectedAlunoId(aluno.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedAlunoId === aluno.id
                        ? 'border-[var(--fh-primary)] bg-[var(--fh-primary)]/5'
                        : 'border-[var(--fh-border)] hover:border-[var(--fh-primary)]/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          selectedAlunoId === aluno.id
                            ? 'border-[var(--fh-primary)] bg-[var(--fh-primary)]'
                            : 'border-[var(--fh-border)]'
                        }`}
                      >
                        {selectedAlunoId === aluno.id && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[var(--fh-text)]">{aluno.nome}</p>
                        <p className="text-xs text-[var(--fh-muted)]">{aluno.email}</p>
                        <p className="text-xs text-[var(--fh-muted)]">{aluno.cpf}</p>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-[var(--fh-muted)]">
                    {alunosDisponíveis.length === 0 && alunos.length > 0
                      ? 'Todos os alunos já estão vinculados'
                      : 'Nenhum aluno encontrado'}
                  </p>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-3 border border-[var(--fh-border)] rounded-xl text-[var(--fh-text)] font-medium hover:bg-[var(--fh-gray-50)] transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleVincular}
                disabled={loading || !selectedAlunoId}
                className="flex-1 px-4 py-3 bg-[var(--fh-primary)] text-white rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Vinculando...
                  </>
                ) : (
                  'Vincular'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
