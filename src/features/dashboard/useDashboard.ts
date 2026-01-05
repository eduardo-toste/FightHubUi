import { getBaseUrl } from '../../lib/env';
import api from '../../lib/apiClient';
import { DashboardResponse } from '../../types';
import mock from '../../mocks/dashboard';

export async function getDashboard(): Promise<DashboardResponse> {
  const base = getBaseUrl();
  if (!base) {
    return mock.getDashboard();
  }
  const res = await api.get('/dashboard');
  return res.data;
}
