import { getBaseUrl } from '../../lib/env';
import api from '../../lib/apiClient';
import { DashboardResponse } from '../../types';

export async function getDashboard(): Promise<DashboardResponse> {
  const base = getBaseUrl();
  if (!base) {
    // Return empty dashboard data when no API is configured
    return {
      totalAlunos: 0,
      totalAulasHoje: 0,
      totalProfessores: 0,
      totalTurmas: 0
    };
  }
  const res = await api.get('/dashboard');
  return res.data;
}
