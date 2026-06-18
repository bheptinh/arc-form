// TODO: move to shared-components/ once props are typed and domain imports (planner, Redux) are extracted
import { IconChevronDown, IconChevronUp, IconHelpHexagonFilled } from '@tabler/icons-react';
import React, { useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useSelector } from 'react-redux';

import { planner } from '../../initR2D';
import { selectMetrics } from '../../redux/features/metrics/metricsSLice';

const useStyle = createUseStyles({
  text: {
    fontSize: 13,
    color: '#828282',
    display: 'flex',
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
    },
  },
  input: {
    outline: 'none',
    border: 'none',
    padding: '3px 0',
    textAlign: 'center',
    color: 'rgb(68, 68, 68)',
    margin: '0 8px 0 4px',
    borderRadius: 3,
    '&::-webkit-inner-spin-button': {
      display: 'none',
    },
    '&:hover': {
      background: 'rgb(244, 244, 244)',
    },
    '&:focus': {
      color: '#2A3435',
      cursor: 'auto',
      backgroundColor: 'rgb(244, 244, 244)',
      border: '1px solid #BEBCBC',
      outline: 'none',
      borderRadius: '3px',
    },
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
    },
  },
  arrows: {
    display: 'grid',
    gridGap: 3,
  },
  arrowUp: {
    cursor: 'pointer',

    '& path': {
      transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    },
    '&:hover': {
      '& path': {
        fill: '#a0a0a0',
      },
    },
  },
  arrowDown: {
    cursor: 'pointer',

    '& path': {
      transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    },
    '&:hover': {
      '& path': {
        fill: '#a0a0a0',
      },
    },
  },
  changerInputs: {
    display: 'flex',
    textAlign: 'center',
    alignItems: 'center',
  },
  changerInputs_main: {
    display: 'flex',
    textAlign: 'center',
    alignItems: 'center',
  },
  changerMain: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 30,
  },
  valueText: {
    fontSize: 13,
    outline: 'none',
    border: 'none',
    padding: '3px 5px',
    color: 'rgb(153 153 153)',
    margin: '0 8px 0 4px',
    background: 'none',
    cursor: 'default',
  },
  labelAfter: {
    fontSize: 13,
  },
  changerMain_bottom: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
  },
  changerMain_info: {
    marginLeft: 5,
  },
  changerMain_info_hover: {
    position: 'absolute',
    background: '#81e7ff',
    display: 'none',
    fontSize: 12,
    width: 'max-content',
    zIndex: 9,
    padding: '2px 7px',
    transition: 'all .1s ease',
    userSelect: 'none',
  },
  addStyles_style_1_main: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 15,
    '& $text': {
      marginBottom: 2,
    },
  },
  addStyles_style_2_main: {
    flexDirection: 'row',
    alignItems: 'center',
    '@media screen and (max-width: 950px)': {
      margin: 0,
    },
  },
  addStyles_style_1_input: {
    margin: 0,
    textAlign: 'left',
  },
  addStyles_style_2_input: {
    margin: 0,
  },
  addStyles_style_1_arrows: {
    marginLeft: '10px',
    height: '25px',
    width: '15px',
    position: 'relative',
    '@media screen and (max-width: 950px)': {
      marginLeft: 5,
    },
  },
  addStyles_style_2_arrows: {
    marginLeft: '10px',
    height: '25px',
    width: '15px',
    position: 'relative',
    '@media screen and (max-width: 950px)': {
      marginLeft: 5,
      height: '20px',
      width: '20px',
    },
  },
  addStyles_style_1_arrowUp: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  addStyles_style_2_arrowUp: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  addStyles_style_1_arrowDown: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  addStyles_style_2_arrowDown: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  changerInputs_input: {
    display: 'flex',
    alignItems: 'center',
  },
  changerInputs_input_style_1: {
    minWidth: 49,
  },
  addStyles_style_3_main: {
    '& $labelAfter': {
      color: '#ffffff',
    },
    '& $changerMain_bottom': {
      marginLeft: 15,
    },
  },
  addStyles_style_3_input: {
    color: '#ffffff',
    margin: '0 0 0 4px',
    background: 'transparent',
    '&:hover': {
      background: 'rgb(244, 244, 244)',
      color: '#464646',
    },
  },
  addStyles_style_3_arrowUp: {
    '& path': {
      fill: '#ffffff',
    },
  },
  addStyles_style_3_arrowDown: {
    '& path': {
      fill: '#ffffff',
    },
  },
});

let key = null;

const ChangeSize = (props) => {
  const classes = useStyle();
  const inputEl = useRef(null);

  const metrics = useSelector(selectMetrics);

  const [value, setValue] = useState(
    props.notConvertToCurrentMetric ? +props.value : planner.units.valueToString(+props.value)
  );

  let timeoutId = null;
  const mouseDown = false;
  let time = null;

  const incrDecrStep = props.notConvertToCurrentMetric ? 1 : planner.units.getStep();

  const onBlurInput = (e) => {
    const convertedValue = props.notConvertToCurrentMetric
      ? e.target.value
      : planner.units.stringToValue(e.target.value);
    let newValue = props.notConvertToCurrentMetric
      ? convertedValue
      : planner.units.valueToString(convertedValue);
    newValue = planner.units.getSystem() == 1 ? newValue : isNaN(newValue) ? props.value : newValue;
    if (!props.lessThenZero) newValue = newValue <= 0 ? 0 : newValue;
    setValue(newValue);
    e.target.style.width = (newValue?.length + 1) * 7 + 5 + 'px';
    props.valueChangeType
      ? props.changeValue(
          { status: false, action: null },
          props.notConvertToCurrentMetric
            ? props.revertedSign
              ? newValue * -1
              : newValue
            : planner.units.stringToValue(newValue),
          props.valueChangeType
        )
      : props.changeValue(
          { status: false, action: null },
          props.notConvertToCurrentMetric
            ? props.revertedSign
              ? newValue * -1
              : newValue
            : planner.units.stringToValue(newValue)
        );
    document.removeEventListener('keydown', onEnterClick);
  };

  const onChangeSize = (action, mouseDownStatus) => {
    let changedValue = 0;
    const input = inputEl.current;
    switch (action) {
      case 'change':
        setValue(input.value);
        input.style.width = (value?.length + 1) * 8 + 5 + 'px';
        break;
      case 'incr':
        changedValue = +props.value + incrDecrStep;
        props.valueChangeType
          ? props.changeValue(
              { status: mouseDownStatus, action },
              props.revertedSign ? changedValue * -1 : changedValue,
              props.valueChangeType
            )
          : props.changeValue(
              { status: mouseDownStatus, action },
              props.revertedSign ? changedValue * -1 : changedValue
            );
        break;
      case 'decr':
        changedValue = props.value - incrDecrStep;
        if (props.zeroNotAllowed && changedValue == 0) return;
        if (!props.lessThenZero) changedValue = changedValue <= 0 ? 0 : changedValue;
        props.valueChangeType
          ? props.changeValue(
              { status: mouseDownStatus, action },
              props.revertedSign ? changedValue * -1 : changedValue,
              props.valueChangeType
            )
          : props.changeValue(
              { status: mouseDownStatus, action },
              props.revertedSign ? changedValue * -1 : changedValue
            );
        break;
    }
  };

  const mouseDownArrows = (action) => {
    time = Date.now();
    key = setTimeout(() => {
      onChangeSize(action, true);
    }, 200);
  };

  const mouseUpArrows = (action) => {
    clearTimeout(key);
    onChangeSize(action, false);
  };

  const onFocusInput = (e) => document.addEventListener('keydown', onEnterClick);

  const onEnterClick = (e) =>
    e.code == 'Enter' ? inputEl.current && inputEl.current.blur() : null;

  const windowMouseUp = (e) =>
    props.mouseDown.status == true ? mouseUpArrows(props.mouseDown.action, false) : null;

  let infoText;

  const mouseEnter = (e) => {
    if (!mouseDown) {
      infoText = document.createElement('div');
      infoText.classList.add(classes.changerMain_info_hover);
      infoText.textContent = props.infoHover;
      document.querySelector('body').append(infoText);
      if (!infoText) return;
      infoText.style.right = window.innerWidth - e.clientX + 5 + 'px';
      infoText.style.top = e.clientY - 15 + 'px';
      timeoutId = setTimeout(() => (infoText.style.display = 'block'), 1000);
    }
  };

  const mouseMove = (e) => {
    if (!mouseDown) {
      if (!infoText) return;
      infoText.style.right = window.innerWidth - e.clientX + 5 + 'px';
      infoText.style.top = e.clientY - 15 + 'px';
    }
  };

  const mouseLeave = (e) => {
    if (!mouseDown) {
      clearTimeout(timeoutId);
      infoText && infoText.remove();
    }
  };

  useEffect(() => {
    if (inputEl.current) {
      document.addEventListener('mouseup', windowMouseUp);

      if (props.mouseDown.status == true && props.mouseDown.type == props.valueChangeType) {
        key = setTimeout(() => onChangeSize(props.mouseDown.action, true), 100);
      }

      setValue(
        props.notConvertToCurrentMetric ? +props.value : planner.units.valueToString(+props.value)
      );
      inputEl.current.style.width = (inputEl.current.value.length + 1) * 7 + 5 + 'px';
    }

    return () => document.removeEventListener('mouseup', windowMouseUp);
  }, [props.value, metrics]);

  useEffect(() => {
    inputEl.current.disabled =
      props.isFixedSize && props.valueChangeType !== 'elevation' ? true : false;
  }, [props.isFixedSize]);

  // TODO: refactor useEffect, add dependencies, remove unnecessary ones and split into several useEffects if needed
  useEffect(() => {
    if (inputEl.current)
      inputEl.current.style.width =
        (inputEl.current.value.length + 1) * 7 +
        (props.type && (props.type == 'style_1' || props.type == 'style_2') ? -3 : 5) +
        'px';
  });

  return (
    <div
      className={
        classes.changerMain + (props.type ? ' ' + classes['addStyles_' + props.type + '_main'] : '')
      }
      style={{ ...props.additionalStyles }}
    >
      <div className={classes.text}>
        {props.label ? <div className={classes.text}>{props.label}</div> : null}
        {props.infoHover && (
          <IconHelpHexagonFilled
            className={classes.changerMain_info}
            size={18}
            color="#2D8BDB"
            style={{ marginLeft: 5 }}
          />
        )}
      </div>
      <div className={classes.changerInputs}>
        {props.isFixedSize ? (
          <input
            className={classes.valueText}
            ref={inputEl}
            onFocus={onFocusInput}
            onBlur={onBlurInput}
            onChange={(e) => onChangeSize('change')}
            value={value}
            type="text"
            style={!props.labelAfter ? { margin: '0 8px 0 4px' } : null}
          />
        ) : (
          <div className={classes.changerInputs_main}>
            <div
              className={
                classes.changerInputs_input +
                (props.type ? ' ' + classes['changerInputs_input_' + props.type] : '')
              }
            >
              <input
                className={
                  classes.input +
                  (props.type ? ' ' + classes['addStyles_' + props.type + '_input'] : '')
                }
                ref={inputEl}
                onFocus={onFocusInput}
                onBlur={onBlurInput}
                onChange={(e) => onChangeSize('change')}
                value={value}
                type="text"
              />
              {props.labelAfter ? (
                <div className={classes.labelAfter}>{props.labelAfter}</div>
              ) : null}
            </div>
            <div className={classes.changerMain_bottom}>
              <div
                className={
                  classes.arrows +
                  ' ' +
                  (props.type ? classes['addStyles_' + props.type + '_arrows'] : '')
                }
              >
                <IconChevronUp
                  className={
                    classes.arrowUp + ' ' + classes['addStyles_' + props.type + '_arrowUp']
                  }
                  onMouseUp={() => mouseUpArrows('incr')}
                  onMouseDown={() => mouseDownArrows('incr')}
                  color="#2F2F2F"
                  size={15}
                />
                <IconChevronDown
                  className={
                    classes.arrowDown + ' ' + classes['addStyles_' + props.type + '_arrowDown']
                  }
                  onMouseUp={(e) => mouseUpArrows('decr')}
                  onMouseDown={(e) => mouseDownArrows('decr')}
                  color="#2F2F2F"
                  size={15}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChangeSize;
