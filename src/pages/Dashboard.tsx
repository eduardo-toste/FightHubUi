import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import UpdateBirthdateModal from '../components/UpdateBirthdateModal';
import BirthdateSuccessModal from '../components/BirthdateSuccessModal';
import BlockedMinorAccess from '../components/BlockedMinorAccess';
import PendingMinorsNotification from '../components/PendingMinorsNotification';
import { alunosApi } from '../api/alunos';
import { usuariosApi } from '../api/usuarios';

export default function DashboardPage() {
  const { logout, user } = useAuth();
  const [showBirthdateModal, setShowBirthdateModal] = useState(false);
  const [showBirthdateSuccessModal, setShowBirthdateSuccessModal] = useState(false);
  const [alunoId, setAlunoId] = useState<string | null>(null);
  const [alunoNome, setAlunoNome] = useState<string>('');
  const [isMinorWithoutResponsible, setIsMinorWithoutResponsible] = useState(false);
  const [isMinorLoading, setIsMinorLoading] = useState(true);
  const [userPhoto, setUserPhoto] = useState<string | undefined>(undefined);

  // Verificar se é aluno com data de nascimento padrão (31/12/9999)
  // E verificar se é menor sem responsável vinculado
  useEffect(() => {
    const checkBirthdateAndResponsible = async () => {
      if (user?.role !== 'ALUNO' || !user?.alunoId) {
        setIsMinorLoading(false);
        return;
      }

      try {
        // Buscar perfil do usuário para pegar foto
        const perfil = await usuariosApi.obterPerfil();
        const fotoUrl = usuariosApi.getPhotoUrl(perfil.foto);
        setUserPhoto(fotoUrl);

        const aluno = await alunosApi.buscarPorId(user.alunoId);
        
        if (aluno.dataNascimento) {
          const [year, month, day] = aluno.dataNascimento.split('T')[0].split('-');
          
          if (year === '9999' && month === '12' && day === '31') {
            setAlunoId(user.alunoId);
            setAlunoNome(user?.name || '');
            setShowBirthdateModal(true);
          } else {
            // Calcular idade
            const birthDate = new Date(aluno.dataNascimento);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear() -
              (today.getMonth() < birthDate.getMonth() || 
               (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()) ? 1 : 0);

            // Se for menor, verificar se tem responsável vinculado
            if (age < 18) {
              // Verificar se tem responsáveis vinculados
              // Se aluno.responsaveis está vazio, está bloqueado
              if (!aluno.responsaveis || aluno.responsaveis.length === 0) {
                setIsMinorWithoutResponsible(true);
              }
            }
          }
        }
      } catch (error) {
        console.error('Erro ao verificar dados do aluno:', error);
      } finally {
        setIsMinorLoading(false);
      }
    };

    checkBirthdateAndResponsible();
  }, [user]);

  const handleBirthdateSuccess = (userName: string, isMinor: boolean) => {
    setAlunoNome(userName);
    if (isMinor) {
      setShowBirthdateSuccessModal(true);
    } else {
      setShowBirthdateModal(false);
    }
  };

  // Se for aluno menor sem responsável, bloquear acesso
  if (user?.role === 'ALUNO' && isMinorWithoutResponsible && !isMinorLoading) {
    return (
      <>
        <BlockedMinorAccess userName={user?.name} />
      </>
    );
  }

  // Página inicial simples
  return (
    <Layout 
      userName={user?.name} 
      userRole={user?.role} 
      userPhoto={userPhoto}
      onLogout={logout}
      onPhotoChange={(newUrl) => setUserPhoto(newUrl)}
    >
      {user?.role === 'ALUNO' && showBirthdateModal && alunoId && (
        <UpdateBirthdateModal
          isOpen={showBirthdateModal}
          alunoId={alunoId}
          onClose={() => setShowBirthdateModal(false)}
          onSuccess={handleBirthdateSuccess}
        />
      )}

      {user?.role === 'ALUNO' && showBirthdateSuccessModal && (
        <BirthdateSuccessModal
          userName={alunoNome}
          onClose={() => {
            setShowBirthdateSuccessModal(false);
            setShowBirthdateModal(false);
          }}
          onLogout={logout}
        />
      )}

      {/* Notificações para Admin/Coordenador */}
      {(user?.role === 'ADMIN' || user?.role === 'COORDENADOR') && (
        <PendingMinorsNotification />
      )}
      
      <div className="mb-8">
        <h1 className="text-4xl font-black text-[var(--fh-text)] mb-2">
          Bem-vindo, {user?.name?.split(' ')[0] || 'Usuário'}! 👋
        </h1>
        <p className="text-[var(--fh-muted)] text-lg">
          Use o menu lateral para navegar pela plataforma.
        </p>
      </div>
    </Layout>
  );
}
