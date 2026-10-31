import { useDispatch } from 'react-redux';

import { setActivePopup } from '../redux/features/popups/popupsSlice';

type LoginPopupOptions = {
  type?: string;
  data?: unknown;
};

export const useMerchantLogin = () => {
  const dispatch = useDispatch();

  return (options?: LoginPopupOptions) => {
    if (!R2D.config.data.enable_merchant_login) {
      dispatch(setActivePopup({ name: 'login', ...options }));
    } else {
      R2D.postMessageToParent(JSON.stringify({ action: 'merchant_login' }));
    }
  };
};
