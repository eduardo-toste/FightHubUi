import { Lock, AlertTriangle, MessageCircle } from 'lucide-react';

interface BlockedMinorAccessProps {
  userName: string;
}

export default function BlockedMinorAccess({ userName }: BlockedMinorAccessProps) {
  return (
    <div className="min-h-screen tatame-bg flex items-center justify-center p-4 md:p-6 relative overflow-hidden">
      {/* Elementos decorativos - círculos do tatame */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border-2 border-[var(--fh-primary)]/12 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-[var(--fh-accent)]/10 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] border border-[var(--fh-primary)]/8 rounded-full" />
      </div>

      {/* Gradientes sutis */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-[var(--fh-primary)]/3 to-transparent" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[var(--fh-accent)]/3 to-transparent" />
      </div>

      <div className="relative w-full max-w-md z-10">
        {/* Main Card - Tatame Style */}
        <div className="tatame-card relative">
          {/* Top gradient border - like Login */}
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[var(--fh-primary)] via-[var(--fh-accent)] to-[var(--fh-primary)]" />
          
          {/* Side decorative lines */}
          <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--fh-primary)]/20 via-[var(--fh-primary)]/10 to-transparent" />
          <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--fh-accent)]/20 via-[var(--fh-accent)]/10 to-transparent" />

          <div className="relative p-8 md:p-10">
            {/* Icon */}
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--fh-primary)] to-[var(--fh-primary-dark)] flex items-center justify-center shadow-lg animate-pulse">
                <Lock className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Header */}
            <h1 className="text-3xl font-black text-[var(--fh-text)] mb-2 text-center">
              Acesso Bloqueado
            </h1>
            <p className="text-[var(--fh-muted)] text-lg mb-8 text-center">
              Olá, {userName?.split(' ')[0] || 'Aluno'}!
            </p>

            {/* Alert */}
            <div className="bg-gradient-to-br from-[var(--fh-primary)]/10 to-[var(--fh-primary-dark)]/10 border border-[var(--fh-primary)]/30 rounded-xl p-5 mb-8">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[var(--fh-primary)] flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="font-semibold text-[var(--fh-text)] mb-1">
                    Você é menor de idade
                  </p>
                  <p className="text-sm text-[var(--fh-muted)]">
                    Sua conta foi bloqueada por questões de segurança até que um responsável legal seja vinculado.
                  </p>
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-3 mb-8">
              <h2 className="font-semibold text-[var(--fh-text)] text-left mb-4">O que fazer agora:</h2>
              
              <div className="flex gap-3 text-left p-4 bg-[var(--fh-primary)]/10 border border-[var(--fh-primary)]/20 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-[var(--fh-primary)] text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">
                  1
                </div>
                <div>
                  <p className="font-medium text-[var(--fh-text)]">Avise um responsável legal</p>
                  <p className="text-sm text-[var(--fh-muted)] mt-0.5">
                    Comunique a um de seus pais/responsáveis sobre o bloqueio
                  </p>
                </div>
              </div>

              <div className="flex gap-3 text-left p-4 bg-[var(--fh-primary)]/10 border border-[var(--fh-primary)]/20 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-[var(--fh-primary)] text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">
                  2
                </div>
                <div>
                  <p className="font-medium text-[var(--fh-text)]">Entre em contato com a administração</p>
                  <p className="text-sm text-[var(--fh-muted)] mt-0.5">
                    A administração vinculará seu responsável após validação
                  </p>
                </div>
              </div>

              <div className="flex gap-3 text-left p-4 bg-[var(--fh-primary)]/10 border border-[var(--fh-primary)]/20 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-[var(--fh-primary)] text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">
                  3
                </div>
                <div>
                  <p className="font-medium text-[var(--fh-text)]">Acesso liberado!</p>
                  <p className="text-sm text-[var(--fh-muted)] mt-0.5">
                    Assim que vinculado, sua conta será desbloqueada automaticamente
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-gradient-to-br from-[var(--fh-primary)]/5 to-[var(--fh-primary-dark)]/5 border border-[var(--fh-primary)]/20 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-2">
                <MessageCircle className="w-5 h-5 text-[var(--fh-primary)] flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm text-[var(--fh-text)]">
                    <strong>Precisa de ajuda?</strong> Entre em contato com a administração da plataforma.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <p className="text-xs text-[var(--fh-muted)] text-center">
              Este bloqueio é temporário e existe para sua proteção
            </p>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-6 p-4 bg-[var(--fh-card)] rounded-xl border border-[var(--fh-border)] text-center">
          <p className="text-xs text-[var(--fh-muted)]">
            🔒 Sua conta está segura. Este bloqueio segue políticas de proteção de menores.
          </p>
        </div>
      </div>
    </div>
  );
}
