import { useMutation } from '@tanstack/react-query';

import { languagesQueryOptions, setLanguage, translationQueryOptions } from '../i18n';
import { queryClient } from '../queryClient';

export function useLanguageChange() {
  return useMutation({
    mutationFn: (code: string) => setLanguage(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: languagesQueryOptions.queryKey });
      queryClient.invalidateQueries({ queryKey: translationQueryOptions.queryKey });
    },
  });
}
