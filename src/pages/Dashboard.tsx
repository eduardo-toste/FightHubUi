import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '../features/dashboard/useDashboard';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import UpdateBirthdateModal from '../components/UpdateBirthdateModal';
import { alunosApi } from '../api/alunos';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  TrendingUp, 
  Calendar,
  Activity,
  Target,
  Award
} from 'lucide-react';

export default function DashboardPage() {
  const { logout, user } = useAuth();
  const [showBirthdateModal, setShowBirthdateModal] = useState(false);
  const [alunoId, setAlunoId] = useState<string | null>(null);
  
  // Não buscar dashboard para alunos (eles não têm acesso)
  const { data, isLoading, isError, refetch } = useQuery(
    ['dashboard'],
    getDashboard,
    {
      enabled: user?.role !== 'ALUNO',
    }
  );

  // Verificar se é aluno com data de nascimento padrão (31/12/9999)
  useEffect(() => {
    const checkBirthdate = async () => {
      if (user?.role !== 'ALUNO' || !user?.alunoId) return;

      try {
        const aluno = await alunosApi.buscarPorId(user.alunoId);
        
        if (aluno.dataNascimento) {
          const [year, month, day] = aluno.dataNascimento.split('T')[0].split('-');
          
          if (year === '9999' && month === '12' && day === '31') {
            setAlunoId(user.alunoId);
            setShowBirthdateModal(true);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar data de nascimento:', error);
      }
    };

    checkBirthdate();
  }, [user]);

  const handleBirthdateSuccess = () => {
    setShowBirthdateModal(false);
    // Recarregar dados se necessário
    if (user?.role !== 'ALUNO') {
      refetch();
    }
  };

  // Se for aluno, mostrar dashboard simplificado
  if (user?.role === 'ALUNO') {
    return (
      <Layout userName={user?.name} userRole={user?.role} onLogout={logout}>
        {showBirthdateModal && alunoId && (
          <UpdateBirthdateModal
            isOpen={showBirthdateModal}
            alunoId={alunoId}
            onClose={() => {}}
            onSuccess={handleBirthdateSuccess}
          />
        )}
        
        <div className="mb-8">
          <h1 className="text-4xl font-black text-[var(--fh-text)] mb-2">
            Bem-vindo, {user?.name?.split(' ')[0] || 'Aluno'}! 👋
          </h1>
          <p className="text-[var(--fh-muted)] text-lg">
            Confira suas aulas e atividades pelo menu lateral.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-[var(--fh-card)] rounded-2xl p-6 border border-[var(--fh-border)] shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-[var(--fh-muted)] text-sm">Minhas Aulas</p>
                <p className="text-2xl font-bold text-[var(--fh-text)]">Em breve</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (isLoading)
    return (
      <Layout userName={user?.name} userRole={user?.role} onLogout={logout}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[var(--fh-card)] rounded-2xl p-6 border border-[var(--fh-border)] shadow-sm">
              <div className="h-4 w-24 bg-[var(--fh-gray-200)] rounded mb-4 animate-pulse" />
              <div className="h-8 w-16 bg-[var(--fh-gray-200)] rounded animate-pulse" />
            </div>
          ))}
        </div>
      </Layout>
    );

  if (isError)
    return (
      <Layout userName={user?.name} userRole={user?.role} onLogout={logout}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-500 mb-4">Erro ao carregar dados.</div>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-[var(--fh-primary)] text-white rounded-lg hover:bg-[var(--fh-primary-dark)] transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </Layout>
    );

  const d = data!;

  const statCards = [
    {
      title: 'Alunos Ativos',
      value: d.alunos.ativos,
      subtitle: `${d.alunos.novos30dias} novos nos últimos 30 dias`,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Turmas Ativas',
      value: d.turmas.ativas,
      subtitle: `${(d.turmas.ocupacaoMedia * 100).toFixed(0)}% de ocupação média`,
      icon: GraduationCap,
      color: 'from-[var(--fh-primary)] to-[var(--fh-primary-dark)]',
      bgColor: 'bg-red-50',
      textColor: 'text-[var(--fh-primary)]',
    },
    {
      title: 'Aulas Previstas',
      value: d.engajamento?.aulasPrevistas || 0,
      subtitle: `${d.engajamento?.realizadas || 0} realizadas`,
      icon: BookOpen,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
  ];

  return (
    <Layout userName={user?.name} userRole={user?.role} onLogout={logout}>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-[var(--fh-text)] mb-2">
          Bem-vindo de volta, {user?.name?.split(' ')[0] || 'Usuário'}! 👋
        </h1>
        <p className="text-[var(--fh-muted)] text-lg">
          Aqui está um resumo do que está acontecendo na sua academia hoje.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="group relative bg-[var(--fh-card)] rounded-2xl p-6 border border-[var(--fh-border)] shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              {/* Gradient Background Effect */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-5 rounded-full blur-2xl -translate-y-8 translate-x-8 group-hover:opacity-10 transition-opacity`} />
              
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={`w-8 h-8 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <TrendingUp className={`w-4 h-4 ${stat.textColor}`} />
                  </div>
                </div>
                
                <div className="mb-2">
                  <div className="text-sm font-medium text-[var(--fh-muted)] mb-1">
                    {stat.title}
                  </div>
                  <div className="text-4xl font-black text-[var(--fh-text)]">
                    {stat.value}
                  </div>
                </div>
                
                <div className="text-xs text-[var(--fh-muted)] font-medium">
                  {stat.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alunos Card */}
        <div className="bg-[var(--fh-card)] rounded-2xl p-6 border border-[var(--fh-border)] shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--fh-text)]">Resumo de Alunos</h3>
              <p className="text-sm text-[var(--fh-muted)]">Estatísticas gerais</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <div className="text-xs font-medium text-blue-600 mb-1">Ativos</div>
              <div className="text-3xl font-black text-blue-700">{d.alunos.ativos}</div>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="text-xs font-medium text-[var(--fh-muted)] mb-1">Inativos</div>
              <div className="text-3xl font-black text-[var(--fh-text)]">{d.alunos.inativos}</div>
            </div>
          </div>
        </div>

        {/* Turmas Card */}
        <div className="bg-[var(--fh-card)] rounded-2xl p-6 border border-[var(--fh-border)] shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--fh-primary)] to-[var(--fh-primary-dark)] flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--fh-text)]">Estatísticas de Turmas</h3>
              <p className="text-sm text-[var(--fh-muted)]">Métricas de ocupação</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--fh-gray-50)]">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-[var(--fh-primary)]" />
                <span className="text-sm font-medium text-[var(--fh-body)]">Média de alunos por aula</span>
              </div>
              <span className="text-2xl font-black text-[var(--fh-text)]">
                {d.turmas.mediaAlunosPorAula}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--fh-gray-50)]">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-[var(--fh-body)]">Ocupação média</span>
              </div>
              <span className="text-2xl font-black text-green-600">
                {(d.turmas.ocupacaoMedia * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-gradient-to-r from-[var(--fh-primary)]/10 to-[var(--fh-accent)]/10 rounded-2xl p-6 border border-[var(--fh-primary)]/20">
        <div className="flex items-center gap-3 mb-4">
          <Award className="w-6 h-6 text-[var(--fh-primary)]" />
          <h3 className="text-lg font-bold text-[var(--fh-text)]">Ações Rápidas</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-[var(--fh-card)] rounded-xl border border-[var(--fh-border)] hover:border-[var(--fh-primary)] hover:shadow-md transition-all text-left">
            <Calendar className="w-5 h-5 text-[var(--fh-primary)] mb-2" />
            <div className="font-semibold text-[var(--fh-text)]">Nova Aula</div>
            <div className="text-xs text-[var(--fh-muted)]">Agendar uma nova aula</div>
          </button>
          <button className="p-4 bg-[var(--fh-card)] rounded-xl border border-[var(--fh-border)] hover:border-[var(--fh-primary)] hover:shadow-md transition-all text-left">
            <Users className="w-5 h-5 text-[var(--fh-primary)] mb-2" />
            <div className="font-semibold text-[var(--fh-text)]">Novo Aluno</div>
            <div className="text-xs text-[var(--fh-muted)]">Cadastrar novo aluno</div>
          </button>
          <button className="p-4 bg-[var(--fh-card)] rounded-xl border border-[var(--fh-border)] hover:border-[var(--fh-primary)] hover:shadow-md transition-all text-left">
            <GraduationCap className="w-5 h-5 text-[var(--fh-primary)] mb-2" />
            <div className="font-semibold text-[var(--fh-text)]">Nova Turma</div>
            <div className="text-xs text-[var(--fh-muted)]">Criar nova turma</div>
          </button>
        </div>
      </div>

      {/* Modal de Atualização de Data de Nascimento */}
      {showBirthdateModal && alunoId && (
        <UpdateBirthdateModal
          isOpen={showBirthdateModal}
          alunoId={alunoId}
          onClose={() => {}} // Não permitir fechar sem atualizar
          onSuccess={handleBirthdateSuccess}
        />
      )}
    </Layout>
  );
}
