import { useRef, useState } from 'react';
import { useEffect } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from '../../api/hooks/useTranslation';
import { planner } from '../../initR2D';
import { selectMetrics } from '../../redux/features/metrics/metricsSLice';
import { closeActivePopup } from '../../redux/features/popups/popupsSlice';
import Button from '../../shared-components/inputs/button';
import TextInput from '../../shared-components/inputs/text-input';
import DefaultModal from '../../shared-components/modals/default';

const useStyle = createUseStyles({
  planner_popup_wr: {
    maxWidth: 542,
  },
  planner_popup_cont: {
    color: 'var(--color-black)',
    backgroundColor: 'var(--color-white)',
    borderRadius: 6,
    height: '100%',
    padding: '30px 60px',
    position: 'relative',
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
  planner_btn_ok: {},
  popup_input: {
    padding: '0 10px',
    marginBottom: '20px',
  },
  popup_input_error: {
    '& input': {
      border: '1px solid red',
    },
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
  const translation = useTranslation();
  const metrics = useSelector(selectMetrics);
  const [textErrorStatus, setTextErrorStatus] = useState(false);
  const [animPopupClass, setAnimPopupClass] = useState(false);
  const [inputType, setInputType] = useState<'number' | 'text'>('number');
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

  const alignerWidth = useRef<any>(null);

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
    <DefaultModal
      visible={animPopupClass}
      zIndex={101}
      className={classes.planner_popup_wr}
      contentClassName={classes.planner_popup_cont}
    >
      <div className="planner_popup_login_wrap">
        <div className={classes.text}>
          <p>{`${translation['TEXT_RULER_TYPE_SIZE']} ${metrics.active}`}</p>
        </div>
        <div className={classes.popup_input}>
          <TextInput
            type={inputType}
            value={inputDefaultValue}
            onChange={onBlurInput}
            ref={alignerWidth}
            name="alignerWidth"
          />
        </div>
        <DefaultModal.Actions>
          <Button variant="secondary" onClick={onClose}>
            {translation['BUTTON_CANCEL']}
          </Button>
          <Button className={classes.planner_btn_ok} onClick={onClickOk}>
            {translation['BUTTON_OK']}
          </Button>
        </DefaultModal.Actions>
      </div>
    </DefaultModal>
  );
};

export default AlignerWidthSetPopup;
