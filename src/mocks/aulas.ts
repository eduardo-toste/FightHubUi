import { AulaItem } from '../types';

const items: AulaItem[] = Array.from({ length: 34 }).map((_, i) => ({
  id: String(i + 1),
  title: `Aula ${i + 1}`,
  date: `2026-01-${(i % 28) + 1}`,
  turma: `Turma ${(i % 6) + 1}`,
  status: i % 7 === 0 ? 'canceled' : i % 5 === 0 ? 'completed' : 'scheduled',
}));

export async function getAulas(): Promise<AulaItem[]> {
  await new Promise((r) => setTimeout(r, 200));
  return items;
}

export default { getAulas };
