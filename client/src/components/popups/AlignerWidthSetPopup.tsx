import React, { useRef, useState } from 'react';
import { useEffect } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { planner } from '../../initR2D';
import { selectTranslation } from '../../redux/features/language/languageSlice';
import { selectMetrics } from '../../redux/features/metrics/metricsSLice';
import { closeActivePopup } from '../../redux/features/popups/popupsSlice';

const useStyle = createUseStyles({
  planner_popup_wrap: {
    height: '100%',
    width: '100%',
    position: 'absolute',
    top: '0%',
    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
    opacity: '0',
    pointerEvents: 'none',
    zIndex: '101',
    WebkitPerspective: '800px',
    perspective: '800px',
    overflow: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.2)',
  },
  planner_popup_wrap_show: {
    opacity: '1',
    pointerEvents: 'auto',
    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
    '& $planner_popup_wr': {
      transform: 'scale(1)',
    },
  },
  planner_popup_wr: {
    color: '#000',
    maxWidth: 542,
    maxHeight: '90%',
    transform: 'scale(0)',
    boxShadow: '0px 1px 10px 0px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
  },
  planner_popup_cont: {
    color: '#000',
    backgroundColor: '#fff',
    borderRadius: 6,
    height: '100%',
    padding: '30px 60px',
    position: 'relative',
  },
  planner_popup_close: {
    width: '20px',
    height: '20px',
    position: 'absolute',
    top: '10px',
    right: '10px',
    cursor: 'pointer',
    zIndex: '2',
    '& path': {
      transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
    },
    '&:hover': {
      '& path': {
        fill: '#BBE521',
      },
    },
  },
  planner_popup_close_icon: {
    width: '100%',
  },
  text: {
    color: 'rgb(47, 47, 47)',
    margin: '0 10px 15px',
    fontSize: 15,
    textAlign: 'center',
    '@media screen and (max-width: 950px)': {
      fontSize: 14,
    },
  },
  planner_popup_bottom: {
    display: 'grid',
    gridTemplateColumns: 'auto auto',
    justifyContent: 'center',
  },
  planner_btn_ok: {
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
  planner_btn_close: {
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
    '@media screen and (max-width: 950px)': {
      fontSize: 12,
      height: '26px',
      minWidth: 88,
    },
  },
  popup_input: {
    padding: '0 10px',
    marginBottom: '20px',
  },
  popup_input_error: {
    '& > input': {
      border: '1px solid red',
    },
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
  planner_btn_disabled: {
    opacity: '.5',
    cursor: 'not-allowed',
    '&:hover': {
      background: '#828282',
    },
  },
});

const AlignerWidthSetPopup = (props) => {
  const dispatch = useDispatch();
  const translation = useSelector(selectTranslation);
  const metrics = useSelector(selectMetrics);
  const [textErrorStatus, setTextErrorStatus] = useState(false);
  const [animPopupClass, setAnimPopupClass] = useState(false);
  const [inputType, setInputType] = useState('number');
  const [inputDefaultValue, setInputDefaultValue] = useState(
    planner.units.valueToString(WC.WallsEditor._instance.state.getAlignerValue())
  );

  const onKeyDown = (e) => {
    if (e.code == 'Enter') onClickOk(e);
    else if (e.code == 'Escape') onClose(e);
  };

  const onClickOk = (e) => {
    if (textErrorStatus) return;
    let valuedInput = planner.units.stringToValue(alignerWidth.current.value);
    if (
      alignerWidth.current.value.trim()[0] == '-' ||
      alignerWidth.current.value.trim()[0] == '+'
    ) {
      valuedInput = WC.WallsEditor._instance.state.getAlignerValue() + valuedInput;
      if (valuedInput < 0) valuedInput = 0;
    }
    WC.WallsEditor._instance.state.setAlignerValue(valuedInput);
    dispatch(closeActivePopup({ name: 'alignerWidthSet' }));
  };

  const onClose = (e) => {
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'alignerWidthSet' })), 500);
  };

  const onBlurInput = (e) => {
    setInputDefaultValue(e.target.value);
    const ftValue = planner.units.stringToValue(alignerWidth.current.value);
    setTextErrorStatus(
      !(planner.units.getName() == 'ft'
        ? !ftValue?.error && (ftValue || (!ftValue && ftValue === 0))
        : /^(?:0|[1-9]\d*|0?[.,]\d+|\d+[.,]\d+)$/.test(e.target.value))
    );
  };

  const classes = useStyle();

  const alignerWidth = useRef();

  useEffect(() => {
    const timer = setTimeout(() => setAnimPopupClass(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    if (textErrorStatus) {
      document.querySelector('.' + classes.popup_input).classList.add(classes.popup_input_error);
      document.querySelector('.' + classes.planner_btn_ok).setAttribute('disabled', 'disabled');
      document
        .querySelector('.' + classes.planner_btn_ok)
        .classList.add(classes.planner_btn_disabled);
    } else {
      document.querySelector('.' + classes.popup_input).classList.remove(classes.popup_input_error);
      document.querySelector('.' + classes.planner_btn_ok).removeAttribute('disabled');
      document
        .querySelector('.' + classes.planner_btn_ok)
        .classList.remove(classes.planner_btn_disabled);
    }
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [textErrorStatus]);

  useEffect(() => {
    setInputType(metrics.active == 'ft' ? 'text' : 'number');
  }, [metrics]);

  useEffect(() => {
    setInputDefaultValue(
      planner.units.valueToString(WC.WallsEditor._instance.state.getAlignerValue())
    );
  }, [inputType]);

  return (
    <div
      className={
        animPopupClass
          ? classes.planner_popup_wrap + ' ' + classes.planner_popup_wrap_show
          : classes.planner_popup_wrap
      }
    >
      <div className={classes.planner_popup_wr}>
        <div className={classes.planner_popup_cont}>
          <div className="planner_popup_login_wrap">
            <div className={classes.text}>
              <p>{`${translation['TEXT_RULER_TYPE_SIZE']} ${metrics.active}`}</p>
            </div>
            <div className={classes.popup_input}>
              <input
                className={classes.formInput}
                type={inputType}
                value={inputDefaultValue}
                onChange={onBlurInput}
                ref={alignerWidth}
                name="alignerWidth"
              />
            </div>
            <div className={classes.planner_popup_bottom}>
              <button className={classes.planner_btn_close} onClick={onClose}>
                {translation['BUTTON_CANCEL']}
              </button>
              <button className={classes.planner_btn_ok} onClick={onClickOk}>
                {translation['BUTTON_OK']}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlignerWidthSetPopup;
