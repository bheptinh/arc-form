import { useQuery } from '@tanstack/react-query';

import { languagesQueryOptions } from '../i18n';

export function useLanguages() {
  return useQuery(languagesQueryOptions).data ?? [];
}
