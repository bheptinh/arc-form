import { useDispatch } from 'react-redux';

import { useTranslation } from '../../api/hooks/useTranslation';
import { closeActivePopup } from '../../redux/features/popups/popupsSlice';
import DefaultModal from '../../shared-components/modals/default';
import LoginForm from '../input-forms/login';

export default function AuthLoginPopup() {
  const dispatch = useDispatch();
  const translation = useTranslation();

  return (
    <DefaultModal
      title={translation['TEXT_SIGN_IN']}
      onClose={() => dispatch(closeActivePopup({ name: 'login' }))}
    >
      <LoginForm />
    </DefaultModal>
  );
}
