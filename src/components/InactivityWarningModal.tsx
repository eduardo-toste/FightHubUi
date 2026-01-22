import ReactDOM from 'react-dom';
import { Clock, AlertTriangle } from 'lucide-react';

interface InactivityWarningModalProps {
  isVisible: boolean;
  onDismiss: () => void;
  minutesRemaining?: number;
}

export default function InactivityWarningModal({
  isVisible,
  onDismiss,
  minutesRemaining = 3,
}: InactivityWarningModalProps) {
  if (!isVisible) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[var(--fh-card)] rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 border border-amber-200 dark:border-amber-600">
        <div className="flex gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <h2 className="text-lg font-bold text-amber-900 dark:text-amber-100">
            Sessão Expirando
          </h2>
        </div>

        <p className="text-sm text-[var(--fh-text)] mb-4">
          Você ficou inativo por muito tempo. Sua sessão será encerrada em{' '}
          <span className="font-bold text-amber-600 dark:text-amber-400">
            {minutesRemaining} minuto{minutesRemaining !== 1 ? 's' : ''}
          </span>
          .
        </p>

        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 mb-4 flex items-start gap-2">
          <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900 dark:text-amber-200">
            Clique em "Continuar ativo" para estender sua sessão ou você será desconectado automaticamente.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onDismiss}
            className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
          >
            Continuar Ativo
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
