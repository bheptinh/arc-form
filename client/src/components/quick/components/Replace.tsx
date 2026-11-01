import { IconReplaceFilled } from '@tabler/icons-react';
import { useRef } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch } from 'react-redux';

import { useTranslation } from '../../../api/hooks/useTranslation';
import { planner } from '../../../initR2D';
import { changeActiveControlPanelMode } from '../../../redux/features/control/controlPanelSlice';
import HoverComponent from '../../left_new/parts/controlPanel/components/HoverComponent';

const useStyle = createUseStyles({
  info_model_btn: {
    width: 32,
    height: 32,
    background: 'var(--color-white)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    position: 'relative',
    borderRadius: 3,
    border: '1px solid var(--color-white)',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    '& img': {
      userSelect: 'none',
      pointerEvents: 'none',
    },
    '&:hover': {
      background: 'var(--color-surface-muted)',
    },
  },
  info_model_btn_overlay: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  info_model_main: {},
});

const Replace = (props) => {
  const translation = useTranslation();
  const dispatch = useDispatch();
  const classes = useStyle();
  const btnReplace = useRef(null);

  const onReplaceDown = () => {
    document.addEventListener('mouseup', onMouseUp);
  };

  const onReplaceUp = () => {
    props.onClickReplace();

    R2D.scene.isRotation3dActive = false;
    R2D.scene3d.top.children.forEach((i) => {
      if (i.name == 'rotationRings') {
        i.clear();
        i.removeFromParent();
      }
    });

    if (planner.mih().state.setOnRotationDownStatus) {
      planner.mih().state.setOnRotationDownStatus(false);
    } else {
      planner.mih().stateSelectedProduct.setOnRotationDownStatus(false);
    }

    planner.mih()._currentViewer.rendererUpdate();

    dispatch(changeActiveControlPanelMode({ mode: 'replaceModel' }));
  };

  const onMouseUp = () => document.removeEventListener('mouseup', onMouseUp);

  return (
    <HoverComponent hoverText={translation['HINT_BUTTON_REPLACE']}>
      <div
        className={classes.info_model_btn}
        style={props.addStyles ? { ...props.addStyles } : null}
        ref={btnReplace}
      >
        <IconReplaceFilled size={16} color="#323232" />

        <div
          className={classes.info_model_btn_overlay}
          onMouseUp={onReplaceUp}
          onMouseDown={onReplaceDown}
        ></div>
      </div>
    </HoverComponent>
  );
};

export default Replace;
