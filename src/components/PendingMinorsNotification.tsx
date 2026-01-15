import { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { alunosApi } from '../api/alunos';
import { AlunoMenorPendenteResponse } from '../types';
import LinkResponsavelModal from './LinkResponsavelModal';

export default function PendingMinorsNotification() {
  const [alunosPendentes, setAlunosPendentes] = useState<AlunoMenorPendenteResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAlunoId, setSelectedAlunoId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    carregarAlunosMenoresPendentes();
  }, []);

  const carregarAlunosMenoresPendentes = async () => {
    try {
      setIsLoading(true);
      // Busca alunos menores de idade sem responsável do backend
      const alunos = await alunosApi.obterMenoresSemResponsavel();
      setAlunosPendentes(alunos);
    } catch (error) {
      console.error('Erro ao carregar alunos pendentes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVincular = (alunoId: string) => {
    setSelectedAlunoId(alunoId);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedAlunoId(null);
    carregarAlunosMenoresPendentes(); // Recarregar lista
  };

  if (isLoading || alunosPendentes.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-600 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
              {alunosPendentes.length} Aluno{alunosPendentes.length !== 1 ? 's' : ''} Menores Pendentes
            </h3>
            <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
              {alunosPendentes.length} aluno{alunosPendentes.length !== 1 ? 's' : ''} menor{alunosPendentes.length !== 1 ? 'es' : ''} sem responsável vinculado aguardando seu atendimento:
            </p>
            <div className="space-y-2">
              {alunosPendentes.map((aluno) => (
                <div
                  key={aluno.id}
                  className="flex items-center justify-between p-2 bg-white dark:bg-amber-900/30 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--fh-text)]">{aluno.nome}</p>
                    <p className="text-xs text-[var(--fh-muted)]">{aluno.email}</p>
                  </div>
                  <button
                    onClick={() => handleVincular(aluno.id)}
                    className="px-3 py-1 text-xs font-medium bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                  >
                    Vincular
                  </button>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => setAlunosPendentes([])}
            className="text-amber-600 dark:text-amber-400 hover:opacity-70 transition-opacity flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showModal && selectedAlunoId && (
        <LinkResponsavelModal
          alunoId={selectedAlunoId}
          onClose={handleModalClose}
        />
      )}
    </>
  );
}
