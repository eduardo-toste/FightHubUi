import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/Login';
import AtivacaoPage from '../pages/Ativacao';
import DashboardPage from '../pages/Dashboard';
import NotificacoesTest from '../pages/NotificacoesTest';
import AlunosList from '../pages/alunos/AlunosList';
import AlunoCreate from '../pages/alunos/AlunoCreate';
import AlunoDetail from '../pages/alunos/AlunoDetail';
import AulasList from '../pages/aulas/AulasList';
import AulaCreate from '../pages/aulas/AulaCreate';
import AulaDetail from '../pages/aulas/AulaDetail';
import MinhasAulas from '../pages/MinhasAulas'
import AulasDependentes from '../pages/AulasDependentes';
import AulasProfessor from '../pages/AulasProfessor';
import ProfessoresList from '../pages/professores/ProfessoresList';
import ProfessorCreate from '../pages/professores/ProfessorCreate';
import ProfessorDetail from '../pages/professores/ProfessorDetail';
import ResponsaveisList from '../pages/responsaveis/ResponsaveisList';
import ResponsavelCreate from '../pages/responsaveis/ResponsavelCreate';
import ResponsavelDetail from '../pages/responsaveis/ResponsavelDetail';
import TurmasList from '../pages/turmas/TurmasList';
import TurmaCreate from '../pages/turmas/TurmaCreate';
import TurmaDetail from '../pages/turmas/TurmaDetail';
import UsuariosList from '../pages/usuarios/UsuariosList';
import UsuarioDetail from '../pages/usuarios/UsuarioDetail';
import MeuPerfil from '../pages/usuarios/MeuPerfil';
import Estatisticas from '../pages/Estatisticas';
import EstatisticasAlunos from '../pages/EstatisticasAlunos';
import EstatisticasPorAluno from '../pages/EstatisticasPorAluno';
import { useAuth } from '../context/AuthContext';

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({
  children,
}) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--fh-primary)]"></div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default function Router() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/ativar" element={<AtivacaoPage />} />
      <Route
        path="/home"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/test/notificacoes"
        element={
          <PrivateRoute>
            <NotificacoesTest />
          </PrivateRoute>
        }
      />
      <Route
        path="/aulas"
        element={
          <PrivateRoute>
            <AulasList />
          </PrivateRoute>
        }
      />
      <Route
        path="/aulas/novo"
        element={
          <PrivateRoute>
            <AulaCreate />
          </PrivateRoute>
        }
      />
      <Route
        path="/aulas/:id"
        element={
          <PrivateRoute>
            <AulaDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/minhas-aulas"
        element={
          <PrivateRoute>
            <MinhasAulas />
          </PrivateRoute>
        }
      />
      <Route
        path="/aulas-dependentes"
        element={
          <PrivateRoute>
            <AulasDependentes />
          </PrivateRoute>
        }
      />
      <Route
        path="/aulas-professor"
        element={
          <PrivateRoute>
            <AulasProfessor />
          </PrivateRoute>
        }
      />
      <Route
        path="/alunos"
        element={
          <PrivateRoute>
            <AlunosList />
          </PrivateRoute>
        }
      />
      <Route
        path="/alunos/novo"
        element={
          <PrivateRoute>
            <AlunoCreate />
          </PrivateRoute>
        }
      />
      <Route
        path="/alunos/:id"
        element={
          <PrivateRoute>
            <AlunoDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/professores"
        element={
          <PrivateRoute>
            <ProfessoresList />
          </PrivateRoute>
        }
      />
      <Route
        path="/professores/novo"
        element={
          <PrivateRoute>
            <ProfessorCreate />
          </PrivateRoute>
        }
      />
      <Route
        path="/professores/:id"
        element={
          <PrivateRoute>
            <ProfessorDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/responsaveis"
        element={
          <PrivateRoute>
            <ResponsaveisList />
          </PrivateRoute>
        }
      />
      <Route
        path="/responsaveis/novo"
        element={
          <PrivateRoute>
            <ResponsavelCreate />
          </PrivateRoute>
        }
      />
      <Route
        path="/responsaveis/:id"
        element={
          <PrivateRoute>
            <ResponsavelDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/turmas"
        element={
          <PrivateRoute>
            <TurmasList />
          </PrivateRoute>
        }
      />
      <Route
        path="/turmas/novo"
        element={
          <PrivateRoute>
            <TurmaCreate />
          </PrivateRoute>
        }
      />
      <Route
        path="/turmas/:id"
        element={
          <PrivateRoute>
            <TurmaDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/usuarios"
        element={
          <PrivateRoute>
            <UsuariosList />
          </PrivateRoute>
        }
      />
      <Route
        path="/usuarios/:id"
        element={
          <PrivateRoute>
            <UsuarioDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/perfil"
        element={
          <PrivateRoute>
            <MeuPerfil />
          </PrivateRoute>
        }
      />
      <Route
        path="/estatisticas"
        element={
          <PrivateRoute>
            <Estatisticas />
          </PrivateRoute>
        }
      />
      <Route
        path="/estatisticas-alunos"
        element={
          <PrivateRoute>
            <EstatisticasAlunos />
          </PrivateRoute>
        }
      />
      <Route
        path="/estatisticas-alunos/:alunoId"
        element={
          <PrivateRoute>
            <EstatisticasPorAluno />
          </PrivateRoute>
        }
      />
      <Route path="/" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
