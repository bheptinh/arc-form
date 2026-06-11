import { queryOptions } from '@tanstack/react-query';

import type { Language, TranslationMap } from '../../../shared/types/i18n';
import { patchUser } from './user';

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  return res.json() as Promise<T>;
}

export const languagesQueryOptions = queryOptions({
  queryKey: ['languages'] as const,
  queryFn: () => fetchJson<Language[]>('/server-api/i18n/languages'),
  staleTime: Infinity,
});

export const translationQueryOptions = queryOptions({
  queryKey: ['translation'] as const,
  queryFn: () => fetchJson<TranslationMap>('/server-api/i18n/translation'),
  staleTime: Infinity,
});

export async function setLanguage(code: string): Promise<void> {
  await patchUser({ language_code: code });
}
