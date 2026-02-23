import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import UpdateBirthdateModal from '../components/UpdateBirthdateModal';
import BirthdateSuccessModal from '../components/BirthdateSuccessModal';
import BlockedMinorAccess from '../components/BlockedMinorAccess';
import PendingMinorsNotification from '../components/PendingMinorsNotification';
import { StatCard } from '../components/StatCard';
import { ProgressBar } from '../components/Charts';
import { alunosApi } from '../api/alunos';
import { usuariosApi } from '../api/usuarios';
import dashboardApi, { DashboardResponse } from '../api/dashboard';
import inscricoesApi from '../api/inscricoes';
import presencasApi from '../api/presencas';
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  TrendingUp,
  UserCheck,
  School,
  UserCog,
  Users2,
  BarChart3,
  Dumbbell,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Target,
  Flame,
  Trophy,
  Clock,
  Star,
  Activity,
} from 'lucide-react';

// ─── types ────────────────────────────────────────────────────────────────────

interface QuickCard {
  to: string;
  label: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  textColor: string;
}

// ─── belt helpers ─────────────────────────────────────────────────────────────

const BELT_META: Record<string, { label: string; bg: string; text: string; border: string }> = {
  BRANCA:   { label: 'Branca',   bg: 'bg-white',         text: 'text-gray-800',   border: 'border-gray-300' },
  CINZA:    { label: 'Cinza',    bg: 'bg-gray-400',      text: 'text-white',      border: 'border-gray-500' },
  AMARELA:  { label: 'Amarela',  bg: 'bg-yellow-400',    text: 'text-yellow-900', border: 'border-yellow-500' },
  LARANJA:  { label: 'Laranja',  bg: 'bg-orange-500',    text: 'text-white',      border: 'border-orange-600' },
  VERDE:    { label: 'Verde',    bg: 'bg-green-600',     text: 'text-white',      border: 'border-green-700' },
  AZUL:     { label: 'Azul',     bg: 'bg-blue-700',      text: 'text-white',      border: 'border-blue-800' },
  ROXA:     { label: 'Roxa',     bg: 'bg-purple-700',    text: 'text-white',      border: 'border-purple-800' },
  MARROM:   { label: 'Marrom',   bg: 'bg-amber-900',     text: 'text-white',      border: 'border-amber-950' },
  PRETA:    { label: 'Preta',    bg: 'bg-gray-900',      text: 'text-white',      border: 'border-gray-700' },
};

const BeltBadge: React.FC<{ belt?: string }> = ({ belt }) => {
  if (!belt) return null;
  const meta = BELT_META[belt.toUpperCase()] ?? { label: belt, bg: 'bg-gray-300', text: 'text-gray-800', border: 'border-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${meta.bg} ${meta.text} ${meta.border}`}>
      <Dumbbell size={12} />
      Faixa {meta.label}
    </span>
  );
};

// ─── skeleton ─────────────────────────────────────────────────────────────────

const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-[var(--fh-border)] rounded-lg ${className}`} />
);

// ─── greeting ────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function formatDate() {
  return new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

// ─── QuickAccessCard ─────────────────────────────────────────────────────────

const QuickAccessCard: React.FC<QuickCard> = ({ to, label, description, icon: Icon, gradient, textColor }) => (
  <Link
    to={to}
    className="group relative overflow-hidden rounded-2xl border border-[var(--fh-border)] bg-[var(--fh-card)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 p-5 flex flex-col gap-3"
  >
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${gradient}`}>
      <Icon size={22} className={textColor} />
    </div>
    <div className="flex-1">
      <p className="font-semibold text-[var(--fh-text)] text-sm">{label}</p>
      <p className="text-[var(--fh-muted)] text-xs mt-0.5 leading-relaxed">{description}</p>
    </div>
    <div className="flex items-center gap-1 text-xs font-medium text-[var(--fh-primary)] opacity-0 group-hover:opacity-100 transition-opacity">
      Acessar <ArrowRight size={12} />
    </div>
  </Link>
);

// ─── AdminDashboard ───────────────────────────────────────────────────────────

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.buscarDashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const quickCards: QuickCard[] = [
    { to: '/alunos',         label: 'Alunos',           description: 'Gerencie matrículas, faixas e perfis',  icon: GraduationCap, gradient: 'bg-blue-500/10',   textColor: 'text-blue-600 dark:text-blue-400' },
    { to: '/turmas',         label: 'Turmas',           description: 'Organize turmas e professores',          icon: Users2,        gradient: 'bg-purple-500/10', textColor: 'text-purple-600 dark:text-purple-400' },
    { to: '/aulas',          label: 'Aulas',            description: 'Crie e agende aulas e treinos',          icon: BookOpen,      gradient: 'bg-orange-500/10', textColor: 'text-orange-600 dark:text-orange-400' },
    { to: '/professores',    label: 'Professores',      description: 'Cadastro e gestão de instrutores',       icon: School,        gradient: 'bg-green-500/10',  textColor: 'text-green-600 dark:text-green-400' },
    { to: '/responsaveis',   label: 'Responsáveis',     description: 'Vínculos com alunos menores de idade',   icon: UserCheck,     gradient: 'bg-teal-500/10',   textColor: 'text-teal-600 dark:text-teal-400' },
    { to: '/usuarios',       label: 'Usuários',         description: 'Controle de acessos e permissões',       icon: UserCog,       gradient: 'bg-indigo-500/10', textColor: 'text-indigo-600 dark:text-indigo-400' },
    { to: '/estatisticas',   label: 'Estatísticas',     description: 'Visão geral do engajamento da academia', icon: BarChart3,     gradient: 'bg-red-500/10',    textColor: 'text-red-600 dark:text-red-400' },
    { to: '/estatisticas-alunos', label: 'Desempenho dos Alunos', description: 'Análise individual por aluno', icon: TrendingUp,    gradient: 'bg-amber-500/10',  textColor: 'text-amber-600 dark:text-amber-400' },
  ];

  const eng = data?.dadosEngajamento;
  const alunos = data?.dadosAlunos;
  const turmas = data?.dadosTurmas;
  const presencaPct = eng ? Math.round(eng.presencaMediaGeralNoMes) : 0;
  const aulasRealizadasPct = eng && eng.aulasPrevistasNoMes > 0
    ? Math.round((eng.aulasRealizadasNoMes / eng.aulasPrevistasNoMes) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <section>
        <h2 className="text-sm font-semibold text-[var(--fh-muted)] uppercase tracking-wider mb-4">Resumo Geral</h2>
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <StatCard icon={GraduationCap} label="Alunos Ativos"      value={alunos?.totalAlunosAtivos ?? '–'}   subtitle="matrículas ativas"                              color="blue"   />
            <StatCard icon={Users}         label="Novos (30 dias)"    value={alunos?.novosAlunosUltimos30Dias ?? '–'} subtitle="novos alunos recentes"                    color="green"  />
            <StatCard icon={Users2}        label="Turmas Ativas"      value={turmas?.totalTurmasAtivas ?? '–'}   subtitle={`ocup. média ${Math.round(turmas?.ocupacaoMediaTurmas ?? 0)}%`} color="purple" />
            <StatCard icon={BookOpen}      label="Aulas no Mês"       value={eng?.aulasPrevistasNoMes ?? '–'}    subtitle={`${eng?.aulasRealizadasNoMes ?? 0} realizadas`} color="orange" />
            <StatCard icon={Activity}      label="Presença Média"     value={`${presencaPct}%`}                  subtitle="média geral do mês"                             color="indigo" />
            <StatCard icon={AlertTriangle} label="Alunos Inativos"    value={alunos?.totalAlunosInativos ?? '–'} subtitle="sem matrícula ativa"                            color="red"    />
          </div>
        )}
      </section>

      {/* Engagement */}
      {!loading && eng && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Aulas do mês */}
          <div className="bg-[var(--fh-card)] border border-[var(--fh-border)] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Flame size={16} className="text-orange-500" />
              </div>
              <h3 className="font-semibold text-[var(--fh-text)] text-sm">Engajamento do Mês</h3>
            </div>
            <ProgressBar label="Aulas Realizadas" value={eng.aulasRealizadasNoMes}  max={Math.max(eng.aulasPrevistasNoMes, 1)} color="orange" />
            <ProgressBar label="Taxa de Presença"  value={presencaPct}               max={100}                                    color="blue"   />
            <ProgressBar label="Ocupação das Turmas" value={Math.round(turmas?.ocupacaoMediaTurmas ?? 0)} max={100} color="purple" />
            {eng.aulasCanceladasNoMes > 0 && (
              <div className="mt-3 flex items-center gap-2 text-xs text-red-500">
                <XCircle size={13} />
                {eng.aulasCanceladasNoMes} aula(s) cancelada(s) no mês
              </div>
            )}
          </div>

          {/* Top faltas */}
          <div className="bg-[var(--fh-card)] border border-[var(--fh-border)] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                <AlertTriangle size={16} className="text-red-500" />
              </div>
              <h3 className="font-semibold text-[var(--fh-text)] text-sm">Top 5 – Mais Faltas no Mês</h3>
            </div>
            {eng.top5AlunosComMaisFaltasNoMes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 gap-2">
                <CheckCircle2 size={32} className="text-green-500" />
                <p className="text-sm text-[var(--fh-muted)]">Nenhuma falta registrada!</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {eng.top5AlunosComMaisFaltasNoMes.map((a, idx) => (
                  <li key={a.alunoId} className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                      ${idx === 0 ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' :
                        idx === 1 ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400' :
                        'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                      {idx + 1}
                    </span>
                    <Link to={`/alunos/${a.alunoId}`} className="flex-1 text-sm text-[var(--fh-text)] hover:text-[var(--fh-primary)] transition-colors truncate">
                      {a.nome}
                    </Link>
                    <span className="text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
                      {a.faltas} falta{a.faltas !== 1 ? 's' : ''}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* Quick access */}
      <section>
        <h2 className="text-sm font-semibold text-[var(--fh-muted)] uppercase tracking-wider mb-4">Acesso Rápido</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {quickCards.map(c => <QuickAccessCard key={c.to} {...c} />)}
        </div>
      </section>
    </div>
  );
};

// ─── ProfessorDashboard ───────────────────────────────────────────────────────

const ProfessorDashboard: React.FC = () => {
  const quickCards: QuickCard[] = [
    { to: '/aulas-professor',       label: 'Minhas Aulas',          description: 'Veja suas aulas agendadas e gerencie presenças',  icon: BookOpen,    gradient: 'bg-orange-500/10', textColor: 'text-orange-600 dark:text-orange-400' },
    { to: '/alunos',                label: 'Alunos',                description: 'Consulte os alunos da academia',                  icon: GraduationCap, gradient: 'bg-blue-500/10',  textColor: 'text-blue-600 dark:text-blue-400' },
    { to: '/turmas',                label: 'Turmas',                description: 'Veja as turmas e sua composição',                 icon: Users2,      gradient: 'bg-purple-500/10', textColor: 'text-purple-600 dark:text-purple-400' },
    { to: '/estatisticas-alunos',   label: 'Desempenho dos Alunos', description: 'Analise presença e evolução por aluno',           icon: BarChart3,   gradient: 'bg-indigo-500/10', textColor: 'text-indigo-600 dark:text-indigo-400' },
  ];
  return (
    <section>
      <h2 className="text-sm font-semibold text-[var(--fh-muted)] uppercase tracking-wider mb-4">Acesso Rápido</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {quickCards.map(c => <QuickAccessCard key={c.to} {...c} />)}
      </div>
    </section>
  );
};

// ─── AlunoDashboard ───────────────────────────────────────────────────────────

const AlunoDashboard: React.FC<{ alunoId?: string }> = ({ alunoId }) => {
  const [stats, setStats] = useState<{ presencas: number; faltas: number; inscricoes: number } | null>(null);
  const [aluno, setAluno] = useState<{ faixa?: string; grau?: number; nome?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!alunoId) { setLoading(false); return; }
    Promise.all([
      alunosApi.buscarPorId(alunoId),
      presencasApi.minhasPresencas(0, 200),
      inscricoesApi.minhasInscricoes(0, 200),
    ]).then(([alunoData, presData, inscData]) => {
      const presContent: any[] = presData.content ?? presData ?? [];
      const inscContent: any[] = inscData.content ?? inscData ?? [];
      const totalPresente = presContent.filter((p: any) => p.presente).length;
      const totalFaltou   = presContent.filter((p: any) => !p.presente).length;
      setStats({ presencas: totalPresente, faltas: totalFaltou, inscricoes: inscContent.filter((i: any) => i.status === 'INSCRITO').length });
      setAluno({ faixa: alunoData.graduacaoAluno?.belt, grau: alunoData.graduacaoAluno?.degree, nome: alunoData.nome });
    }).catch(console.error).finally(() => setLoading(false));
  }, [alunoId]);

  const taxaPresenca = stats && (stats.presencas + stats.faltas) > 0
    ? Math.round((stats.presencas / (stats.presencas + stats.faltas)) * 100)
    : null;

  const quickCards: QuickCard[] = [
    { to: '/minhas-aulas',    label: 'Minhas Aulas',    description: 'Inscreva-se em treinos disponíveis',   icon: BookOpen,   gradient: 'bg-orange-500/10', textColor: 'text-orange-600 dark:text-orange-400' },
    { to: '/meu-desempenho',  label: 'Meu Desempenho', description: 'Veja sua taxa de presença e histórico', icon: TrendingUp, gradient: 'bg-blue-500/10',   textColor: 'text-blue-600 dark:text-blue-400' },
  ];

  return (
    <div className="space-y-8">
      {/* Belt + stats */}
      <section className="bg-gradient-to-br from-[var(--fh-primary)]/5 to-[var(--fh-accent)]/5 border border-[var(--fh-border)] rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs text-[var(--fh-muted)] uppercase tracking-wider mb-1">Sua Graduação</p>
            {loading ? (
              <Skeleton className="h-7 w-32" />
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <BeltBadge belt={aluno?.faixa} />
                {aluno?.grau !== undefined && aluno.grau > 0 && (
                  <span className="flex items-center gap-1 text-xs text-[var(--fh-muted)]">
                    <Star size={11} className="text-yellow-500 fill-yellow-400" />
                    {aluno.grau} grau{aluno.grau !== 1 ? 's' : ''}
                  </span>
                )}
                {!aluno?.faixa && <span className="text-sm text-[var(--fh-muted)]">Sem graduação registrada</span>}
              </div>
            )}
          </div>
          {!loading && taxaPresenca !== null && (
            <div className="text-right">
              <p className="text-xs text-[var(--fh-muted)] uppercase tracking-wider mb-1">Taxa de Presença</p>
              <p className={`text-3xl font-black ${taxaPresenca >= 75 ? 'text-green-600 dark:text-green-400' : taxaPresenca >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-500'}`}>
                {taxaPresenca}%
              </p>
            </div>
          )}
        </div>
        {!loading && stats && (
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              { label: 'Presenças', value: stats.presencas, icon: CheckCircle2,  color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
              { label: 'Faltas',    value: stats.faltas,    icon: XCircle,       color: 'text-red-500',                       bg: 'bg-red-50 dark:bg-red-900/20' },
              { label: 'Inscritas', value: stats.inscricoes,icon: Calendar,       color: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
            ].map(({ label, value, icon: I, color, bg }) => (
              <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
                <I size={18} className={`${color} mx-auto mb-1`} />
                <p className="text-xl font-bold text-[var(--fh-text)]">{value}</p>
                <p className="text-xs text-[var(--fh-muted)]">{label}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick access */}
      <section>
        <h2 className="text-sm font-semibold text-[var(--fh-muted)] uppercase tracking-wider mb-4">Acesso Rápido</h2>
        <div className="grid grid-cols-2 gap-4">
          {quickCards.map(c => <QuickAccessCard key={c.to} {...c} />)}
        </div>
      </section>
    </div>
  );
};

// ─── ResponsavelDashboard ─────────────────────────────────────────────────────

const ResponsavelDashboard: React.FC = () => {
  const quickCards: QuickCard[] = [
    { to: '/aulas-dependentes',     label: 'Aulas dos Dependentes',    description: 'Veja os treinos agendados dos seus filhos',    icon: BookOpen,  gradient: 'bg-orange-500/10', textColor: 'text-orange-600 dark:text-orange-400' },
    { to: '/desempenho-dependentes',label: 'Desempenho dos Dependentes',description: 'Acompanhe presenças e evolução dos seus filhos', icon: TrendingUp, gradient: 'bg-blue-500/10', textColor: 'text-blue-600 dark:text-blue-400' },
  ];
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-[var(--fh-border)] rounded-2xl p-6 flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
          <Trophy size={24} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="font-semibold text-[var(--fh-text)]">Acompanhe os dependentes</p>
          <p className="text-sm text-[var(--fh-muted)] mt-1">
            Como responsável, você pode visualizar as aulas agendadas e acompanhar o desempenho e presença dos seus dependentes na academia.
          </p>
        </div>
      </div>
      <section>
        <h2 className="text-sm font-semibold text-[var(--fh-muted)] uppercase tracking-wider mb-4">Acesso Rápido</h2>
        <div className="grid grid-cols-2 gap-4">
          {quickCards.map(c => <QuickAccessCard key={c.to} {...c} />)}
        </div>
      </section>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { logout, user } = useAuth();
  const [showBirthdateModal, setShowBirthdateModal] = useState(false);
  const [showBirthdateSuccessModal, setShowBirthdateSuccessModal] = useState(false);
  const [alunoId, setAlunoId] = useState<string | null>(null);
  const [alunoNome, setAlunoNome] = useState<string>('');
  const [isMinorWithoutResponsible, setIsMinorWithoutResponsible] = useState(false);
  const [isMinorLoading, setIsMinorLoading] = useState(true);
  const [userPhoto, setUserPhoto] = useState<string | undefined>(undefined);

  useEffect(() => {
    const checkBirthdateAndResponsible = async () => {
      if (user?.role !== 'ALUNO' || !user?.alunoId) {
        setIsMinorLoading(false);
        return;
      }
      try {
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
            const birthDate = new Date(aluno.dataNascimento);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear() -
              (today.getMonth() < birthDate.getMonth() ||
               (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()) ? 1 : 0);
            if (age < 18 && (!aluno.responsaveis || aluno.responsaveis.length === 0)) {
              setIsMinorWithoutResponsible(true);
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
    if (isMinor) setShowBirthdateSuccessModal(true);
    else setShowBirthdateModal(false);
  };

  if (user?.role === 'ALUNO' && isMinorWithoutResponsible && !isMinorLoading) {
    return <BlockedMinorAccess userName={user?.name} />;
  }

  const firstName = user?.name?.split(' ')[0] || 'Usuário';
  const isAdminOrCoord = user?.role === 'ADMIN' || user?.role === 'COORDENADOR';

  return (
    <Layout
      userName={user?.name}
      userRole={user?.role}
      userPhoto={userPhoto}
      onLogout={logout}
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
          onClose={() => { setShowBirthdateSuccessModal(false); setShowBirthdateModal(false); }}
          onLogout={logout}
        />
      )}
      {isAdminOrCoord && <PendingMinorsNotification />}

      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-br from-[var(--fh-primary)] via-[var(--fh-primary-dark)] to-[var(--fh-accent)] p-6 sm:p-8 text-white shadow-xl">
        {/* decorative blobs */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-black/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock size={13} className="opacity-70" />
              <span className="text-xs opacity-70 capitalize">{formatDate()}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black leading-tight">
              {getGreeting()}, {firstName}!
            </h1>
            <p className="mt-1.5 text-white/70 text-sm sm:text-base">
              {isAdminOrCoord   && 'Aqui está o resumo da sua academia hoje.'}
              {user?.role === 'PROFESSOR'    && 'Pronto para mais um dia de treino?'}
              {user?.role === 'ALUNO'        && 'Continue treinando e evoluindo na arte suave.'}
              {user?.role === 'RESPONSAVEL'  && 'Acompanhe os seus dependentes aqui.'}
            </p>
          </div>
          <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <Dumbbell size={32} className="text-white" />
          </div>
        </div>
      </div>

      {/* ── Role-based content ── */}
      {isAdminOrCoord                && <AdminDashboard />}
      {user?.role === 'PROFESSOR'    && <ProfessorDashboard />}
      {user?.role === 'ALUNO'        && <AlunoDashboard alunoId={user.alunoId} />}
      {user?.role === 'RESPONSAVEL'  && <ResponsavelDashboard />}
    </Layout>
  );
}
