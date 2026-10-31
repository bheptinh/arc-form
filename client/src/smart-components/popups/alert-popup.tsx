import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from '../../api/hooks/useTranslation';
import { closeActivePopup, selectPopups } from '../../redux/features/popups/popupsSlice';
import ActionModal from '../../shared-components/modals/action';

export default function AlertPopup() {
  const dispatch = useDispatch();
  const translation = useTranslation();
  const popups = useSelector(selectPopups);

  const alertText = popups.alert.data?.id || popups.alert.data;

  const onClickOK = () => {
    dispatch(closeActivePopup({ name: 'alert' }));
  };

  return (
    <ActionModal
      content={
        translation[alertText?.toUpperCase()] || alertText || translation['TEXT_ERROR_LOAD_DATA']
      }
      onConfirm={onClickOK}
    />
  );
}
