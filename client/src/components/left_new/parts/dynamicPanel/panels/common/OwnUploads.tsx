import { MouseEventHandler, ReactNode } from 'react';

import AddUploadButton from './AddUploadButton';
import classes from './OwnUploads.module.css';

type Props = {
  // shows the "add new model" row first
  onAdd?: MouseEventHandler;
  // the user's own tiles
  children: ReactNode;
};

/** The user's own uploads at the top of a catalog grid, ruled off from the catalog below. */
export default function OwnUploads({ onAdd, children }: Props) {
  return (
    <div className={classes.ownUploads}>
      {onAdd ? <AddUploadButton onMouseUp={onAdd} /> : null}
      {children}
      <div className={classes.ownUploadsLine}></div>
    </div>
  );
}
