import { useState } from 'react';

import { useTranslation } from '../../../../api/hooks/useTranslation';
import ChangeSize from '../../../../components/common/ChangeSize';
import Button from '../../../../shared-components/inputs/button';
import TextInput from '../../../../shared-components/inputs/text-input';
import classes from './material-size.module.css';

type Props = {
  // Width divided by height of the loaded image; editing one side keeps it.
  ratio: number;
  imgWidth: number;
  imgHeight: number;
  defaultName: string;
  changeSize: (width: number, height: number) => void;
  onApply: (name: string) => void;
};

/** Name and real-world size (cm) of an uploaded material, poster or carpet, and the upload button. */
export default function MaterialSize({
  ratio,
  imgWidth,
  imgHeight,
  defaultName,
  changeSize,
  onApply,
}: Props) {
  const translation = useTranslation();
  const [name, setName] = useState(defaultName);
  const [mouseDown, setMouseDown] = useState<{
    status: boolean;
    action: string | null;
    type: 'w' | 'h' | null;
  }>({ status: false, action: null, type: null });

  const onSizeChange = (nextMouseDown: typeof mouseDown, value: number, side: 'w' | 'h') => {
    setMouseDown({ ...nextMouseDown, type: side });
    if (!value) return;
    if (side == 'w') changeSize(value, value / ratio);
    else changeSize(value * ratio, value);
  };

  return (
    <div className={classes.wrap}>
      <TextInput
        className={classes.name}
        label={translation['MATERIAL_NAME']}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <ChangeSize
        mouseDown={mouseDown}
        valueChangeType={'w'}
        zeroNotAllowed={true}
        changeValue={onSizeChange}
        value={imgWidth}
        label={translation['WIDTH']}
      />
      <ChangeSize
        mouseDown={mouseDown}
        valueChangeType={'h'}
        zeroNotAllowed={true}
        changeValue={onSizeChange}
        value={imgHeight}
        label={translation['HEIGHT']}
      />
      <Button onClick={() => onApply(name.trim())}>{translation['APPLY']}</Button>
    </div>
  );
}
