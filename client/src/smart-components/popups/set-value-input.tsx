import React, { useRef, useState } from 'react';
import { useEffect } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { planner } from '../../initR2D';
import { closeActivePopup, selectPopups } from '../../redux/features/popups/popupsSlice';
import { useTranslation } from '../../api/hooks/useTranslation';
import DefaultModal from '../../shared-components/modals/default';

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
  planner_btn: {
    cursor: 'pointer',
    height: '35px',
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#2B2B2B',
    fontSize: 14,
    borderRadius: 3,
    padding: '0 20px',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    minWidth: 120,
    outline: 'none',
    background: '#fff',
    textTransform: 'uppercase',
    border: '1px solid #000',
    margin: '0 3px',
    '&:hover': {
      background: '#E9E9E9',
    },
  },
  planner_btn_done: {
    cursor: 'pointer',
    height: '35px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#2B2B2B',
    fontSize: 14,
    borderRadius: 3,
    padding: '0 20px',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    minWidth: 120,
    border: 'none',
    outline: 'none',
    background: '#BBE521',
    textTransform: 'uppercase',
    margin: '0 3px',
    '&:hover': {
      background: '#8fc32d',
    },
    '@media screen and (max-width: 950px)': {
      fontSize: 12,
      height: '26px',
      minWidth: 88,
    },
  },
  formInputWr: {
    padding: '0 10px',
    marginBottom: '20px',
  },
  formInput: {
    borderRadius: 3,
    paddingLeft: 10,
    fontSize: 14,
    color: '#000',
    width: '100%',
    border: '1px solid #e8dede',
    height: 30,
    background: '#ffffff',
    outline: 'none',
    resize: 'none',
    transition: 'all 0.4s ease-out',
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
        <input
          className={classes.formInput}
          type="text"
          defaultValue={100}
          ref={inputHeight}
          name="wallHeight"
          onChange={handleInputChange}
        />
      </div>
      <div className={classes.planner_popup_bottom}>
        <span className={classes.planner_btn} onClick={onClose}>
          {translation['BUTTON_CANCEL']}
        </span>
        <span className={classes.planner_btn_done} onClick={onClickOk}>
          {translation['BUTTON_OK']}
        </span>
      </div>
    </DefaultModal>
  );
};

export default SetValueInput;
