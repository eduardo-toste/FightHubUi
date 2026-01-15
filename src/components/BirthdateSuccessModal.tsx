import { CheckCircle, LogOut } from 'lucide-react';

interface BirthdateSuccessModalProps {
  userName: string;
  onClose: () => void;
  onLogout?: () => void;
}

export default function BirthdateSuccessModal({ userName, onClose, onLogout }: BirthdateSuccessModalProps) {
  const handleDisconnect = () => {
    if (onLogout) {
      onLogout();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-[var(--fh-card)] rounded-xl p-8 w-full max-w-md mx-4 shadow-2xl border border-[var(--fh-border)]">
        {/* Header */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg animate-bounce">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Success Message */}
        <h2 className="text-2xl font-bold text-[var(--fh-text)] text-center mb-2">
          Dados Atualizados!
        </h2>
        <p className="text-[var(--fh-muted)] text-center text-sm mb-6">
          Olá, {userName?.split(' ')[0] || 'Aluno'}!
        </p>

        {/* Info Box */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-600 rounded-xl p-4 mb-6">
          <p className="text-green-800 dark:text-green-300 text-sm leading-relaxed">
            <strong>✓ Sua data de nascimento foi registrada com sucesso!</strong>
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3 p-3 bg-[var(--fh-gray-50)] rounded-lg">
            <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
              ✓
            </div>
            <div>
              <p className="font-medium text-[var(--fh-text)] text-sm">Identificado como menor de idade</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-[var(--fh-gray-50)] rounded-lg border-l-2 border-amber-500">
            <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold flex-shrink-0">
              ⏳
            </div>
            <div>
              <p className="font-medium text-[var(--fh-text)] text-sm">Aguardando vinculação de responsável</p>
              <p className="text-xs text-[var(--fh-muted)] mt-0.5">A administração foi notificada</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-[var(--fh-gray-50)] rounded-lg">
            <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold flex-shrink-0">
              3
            </div>
            <div>
              <p className="font-medium text-[var(--fh-text)] text-sm">Após vinculação, acesso liberado</p>
              <p className="text-xs text-[var(--fh-muted)] mt-0.5">Você receberá notificação</p>
            </div>
          </div>
        </div>

        {/* Message to Parent */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-600 rounded-xl p-4 mb-6">
          <p className="text-blue-800 dark:text-blue-300 text-xs">
            <strong>💡 Dica:</strong> Comunique a um responsável legal sobre a solicitação pendente para agilizar o processo.
          </p>
        </div>

        {/* Button */}
        <button
          onClick={handleDisconnect}
          className="w-full px-6 py-3 bg-gradient-to-r from-[var(--fh-primary)] to-[var(--fh-primary-dark)] hover:opacity-90 text-white rounded-xl transition-all shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Entendi, Desconectar
        </button>

        {/* Footer */}
        <p className="text-xs text-[var(--fh-muted)] text-center mt-4">
          Você será notificado assim que a vinculação for concluída
        </p>
      </div>
    </div>
  );
}
