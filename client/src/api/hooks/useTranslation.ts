import { useQuery } from '@tanstack/react-query';

import { translationQueryOptions } from '../i18n';

export function useTranslation() {
  return useQuery(translationQueryOptions).data ?? {};
}
