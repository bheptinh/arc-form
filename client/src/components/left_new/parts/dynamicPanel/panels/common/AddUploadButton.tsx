import { IconPlus } from '@tabler/icons-react';
import { MouseEventHandler } from 'react';

import { useTranslation } from '../../../../../../api/hooks/useTranslation';
import classes from './AddUploadButton.module.css';

type Props = {
  onMouseUp: MouseEventHandler;
  onClick?: MouseEventHandler;
};

/** The "add new model" row at the top of a list of the user's uploads. */
export default function AddUploadButton({ onMouseUp, onClick }: Props) {
  const translation = useTranslation();
  return (
    <div className={classes.addButton} onMouseUp={onMouseUp} onClick={onClick}>
      <IconPlus size={25} color="#2a3435" className={classes.addIcon} />
      {translation['TIPS_ADD_NEW_MODEL']}
    </div>
  );
}
