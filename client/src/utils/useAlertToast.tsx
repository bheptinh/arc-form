import { IconAlertHexagonFilled } from '@tabler/icons-react';
import { toast } from 'sonner';

import { useTranslation } from '../api/hooks/useTranslation';

export const useAlertToast = () => {
  const translation = useTranslation();

  return (t?: string) => {
    // FIXME: response.errorLoadData is nested, but TranslationMap is Record<string, string>. Widen the type.
    const message = (t && translation[t]) || translation?.response?.errorLoadData || t;
    const errorMessage = message?.error || message;
    toast.error(errorMessage, {
      description: message?.description,
      duration: Infinity,
      dismissible: true,
      id: errorMessage + (message?.description || ''),
      position: 'bottom-center',
      icon: <IconAlertHexagonFilled size={16} />,
      action: {
        label: 'OK',
        onClick: () => {
          // FIXME: dismiss() without an id closes every toast, not only this one.
          toast.dismiss();
        },
      },
      onDismiss: () => {
        // FIXME: remove leftover log.
        console.log('Error toast dismissed');
      },
    });
  };
};
