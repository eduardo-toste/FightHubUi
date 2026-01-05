export function getBaseUrl(): string | undefined {
  const raw = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
  if (!raw) return undefined;
  return raw;
}
