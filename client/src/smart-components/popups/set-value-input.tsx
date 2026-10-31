import React, { useRef, useState } from 'react';
import { useEffect } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { planner } from '../../initR2D';
import { closeActivePopup, selectPopups } from '../../redux/features/popups/popupsSlice';
import { useTranslation } from '../../api/hooks/useTranslation';
import DefaultModal from '../../shared-components/modals/default';
import TextInput from '../../shared-components/inputs/text-input';
import Button from '../../shared-components/inputs/button';

const useStyle = createUseStyles({
  planner_popup_wr: {},
  planner_popup_cont: {
    color: '#000',
    backgroundColor: '#fff',
    borderRadius: 6,
    height: '100%',
    padding: '30px 60px',
    position: 'relative',
  },
  planner_popup_text: {
    fontSize: 14,
    color: '#2F2F2F',
    textAlign: 'center',
    marginBottom: 30,
    '& sup': {
      fontSize: 10,
    },
  },
  planner_popup_bottom: {
    display: 'grid',
    gridTemplateColumns: 'auto auto',
    justifyContent: 'center',
  },
  formInputWr: {
    padding: '0 10px',
    marginBottom: '20px',
  },
});

const SetValueInput = (props) => {
  const dispatch = useDispatch();
  const translation = useTranslation();
  const popups = useSelector(selectPopups);
  const popupType = popups.setValueInput.type;
  const [animPopupClass, setAnimPopupClass] = useState(false);
  const classes = useStyle();
  const inputHeight = useRef(null);
  let onClickOk;
  let confirmText;
  let onClose;
  let onKeyDown;

  if (popupType == 'changeWallHeight') {
    confirmText = translation['TEXT_SET_HEIGHT_LOWER_CONTOUR'];
    onClickOk = (e) => {
      planner.constr.setAreaHeight(planner.units.stringToValue(inputHeight.current.value));
      WC.wallsEditor.api.dispatchEvent(
        new Event(WC.wallsEditor.api.STATE_CONSTR_STOP, { state: 'stateEditing' })
      );
      planner.apiScene.dispatchEvent(new Event(planner.apiScene.ESTIMATION_SEND, {}));
      setAnimPopupClass(false);
      setTimeout(() => dispatch(closeActivePopup({ name: 'setValueInput' })), 500);
    };
    onClose = (e) => {
      WC.wallsEditor.api.dispatchEvent(
        new Event(WC.wallsEditor.api.STATE_CONSTR_STOP, { state: 'stateEditing' })
      );
      setAnimPopupClass(false);
      setTimeout(() => dispatch(closeActivePopup({ name: 'setValueInput' })), 500);
    };

    onKeyDown = (e) => {
      if (e.code == 'Enter') onClickOk(e);
      else if (e.code == 'Escape') onClose(e);
    };
  }

  if (popupType == 'setImagePlanArea') {
    confirmText = R2D.DimensionSystem.isMetric()
      ? translation['IMG_PLAN_INPUT_AREA_M']
      : translation['IMG_PLAN_INPUT_AREA_FT'];
    onClickOk = (e) => {
      WC.wallsEditor.stateAlignDrawingByArea.setAlignerValue(
        R2D.DimensionSystem.squareFromString(parseFloat(inputHeight.current.value))
      );
      setAnimPopupClass(false);
      setTimeout(() => dispatch(closeActivePopup({ name: 'setValueInput' })), 500);
    };

    onClose = (e) => {
      WC.wallsEditor.stateAlignDrawingByArea.setAlignerValue(-1);
      setAnimPopupClass(false);
      setTimeout(() => dispatch(closeActivePopup({ name: 'setValueInput' })), 500);
    };

    onKeyDown = (e) => {
      if (e.code == 'Enter') onClickOk(e);
      else if (e.code == 'Escape') onClose(e);
    };
  }

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    const cleaned = inputValue.replace(/[^0-9\s.,'"-]/g, '');
    if (cleaned !== inputValue) {
      inputHeight.current.value = cleaned;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    const timer = setTimeout(() => setAnimPopupClass(true), 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <DefaultModal
      visible={animPopupClass}
      zIndex={101}
      className={classes.planner_popup_wr}
      contentClassName={classes.planner_popup_cont}
    >
      <div className={classes.planner_popup_text}>
        <p dangerouslySetInnerHTML={{ __html: confirmText }}></p>
      </div>
      <div className={classes.formInputWr}>
        <TextInput
          defaultValue={100}
          ref={inputHeight}
          name="wallHeight"
          onChange={handleInputChange}
        />
      </div>
      <div className={classes.planner_popup_bottom}>
        <Button variant="secondary" onClick={onClose}>
          {translation['BUTTON_CANCEL']}
        </Button>
        <Button onClick={onClickOk}>{translation['BUTTON_OK']}</Button>
      </div>
    </DefaultModal>
  );
};

export default SetValueInput;
