import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '../features/dashboard/useDashboard';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';

export default function DashboardPage() {
  const { logout, user } = useAuth();
  const { data, isLoading, isError, refetch } = useQuery(
    ['dashboard'],
    getDashboard,
  );

  if (isLoading)
    return (
      <Layout userName={user?.name} onLogout={logout}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="fh-card p-6">
            <div className="fh-skeleton h-6 w-32 mb-4" />
          </div>
          <div className="fh-card p-6">
            <div className="fh-skeleton h-6 w-32 mb-4" />
          </div>
          <div className="fh-card p-6">
            <div className="fh-skeleton h-6 w-32 mb-4" />
          </div>
        </div>
      </Layout>
    );
  if (isError)
    return (
      <Layout userName={user?.name} onLogout={logout}>
        <div className="p-6">
          <Card>
            <div>Erro ao carregar dados.</div>
            <div className="mt-4">
              <Button onClick={() => refetch()}>Tentar novamente</Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  const d = data!;

  return (
    <Layout userName={user?.name} onLogout={logout}>
      <div className="grid gap-6">
        <div className="fh-hero">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-extrabold text-[var(--fh-primary)]">
                FightHub
              </div>
              <div className="text-sm text-[var(--fh-muted)]">
                Disciplina. Evolução. Conquista.
              </div>
            </div>
            <div className="text-sm text-[var(--fh-muted)]">
              Bem-vindo, {user?.name}
            </div>
          </div>
          <div className="mt-4 border-t border-[var(--fh-divider)] pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="Alunos ativos"
                value={String(d.alunos.ativos)}
                subtitle={`${d.alunos.novos30dias} novos (30d)`}
              />
              <StatCard
                title="Turmas ativas"
                value={String(d.turmas.ativas)}
                subtitle={`Ocupação ${(d.turmas.ocupacaoMedia * 100).toFixed(
                  0,
                )}%`}
              />
              {d.engajamento ? (
                <StatCard
                  title="Aulas previstas"
                  value={String(d.engajamento.aulasPrevistas)}
                  subtitle={`Realizadas: ${d.engajamento.realizadas}`}
                />
              ) : (
                <div className="p-4 fh-card">Em breve</div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card header={<div className="font-semibold">Resumo de Alunos</div>}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-[var(--fh-muted)]">Ativos</div>
                <div className="text-xl font-bold text-[var(--fh-text)]">
                  {d.alunos.ativos}
                </div>
              </div>
              <div>
                <div className="text-sm text-[var(--fh-muted)]">Inativos</div>
                <div className="text-xl font-bold text-[var(--fh-text)]">
                  {d.alunos.inativos}
                </div>
              </div>
            </div>
          </Card>

          <Card header={<div className="font-semibold">Turmas</div>}>
            <div className="text-sm text-[var(--fh-muted)]">
              Média alunos por aula
            </div>
            <div className="text-xl font-bold">
              {d.turmas.mediaAlunosPorAula}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
