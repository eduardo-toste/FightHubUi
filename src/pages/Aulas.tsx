import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAulas } from '../mocks/aulas';
import { AulaItem } from '../types';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

export default function AulasPage() {
  const { data = [], isLoading } = useQuery<AulaItem[]>(['aulas'], getAulas);
  const [filter, setFilter] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const pageSize = 8;

  const filtered = useMemo(() => {
    return data.filter((a) => {
      if (status && a.status !== status) return false;
      if (filter && !a.title.toLowerCase().includes(filter.toLowerCase()))
        return false;
      return true;
    });
  }, [data, filter, status]);

  const pageCount = Math.ceil(filtered.length / pageSize) || 1;
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const { user, logout } = useAuth();

  if (isLoading) return <div className="p-6">Carregando aulas...</div>;

  return (
    <Layout userName={user?.name} onLogout={logout}>
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Aulas</h2>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Pesquisar"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="fh-input w-40"
            >
              <option value="">Todos</option>
              <option value="scheduled">Agendada</option>
              <option value="canceled">Cancelada</option>
              <option value="completed">Realizada</option>
            </select>
            <Button variant="secondary">Filtro</Button>
          </div>
        </div>

        <Card>
          <table className="fh-table">
            <thead>
              <tr className="text-left text-[var(--fh-muted)] text-sm">
                <th className="p-3">Título</th>
                <th className="p-3">Data</th>
                <th className="p-3">Turma</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((a) => (
                <tr key={a.id} className="border-t border-[var(--fh-divider)]">
                  <td className="p-3 text-[var(--fh-text)]">{a.title}</td>
                  <td className="p-3 text-[var(--fh-muted)]">{a.date}</td>
                  <td className="p-3 text-[var(--fh-muted)]">{a.turma}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        a.status === 'canceled'
                          ? 'bg-yellow-200 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div className="flex items-center gap-2">
          <Button onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Anterior
          </Button>
          <div className="text-sm text-[var(--fh-muted)]">
            Página {page} / {pageCount}
          </div>
          <Button onClick={() => setPage((p) => Math.min(pageCount, p + 1))}>
            Próxima
          </Button>
        </div>
      </div>
    </Layout>
  );
}
