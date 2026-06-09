import React, { useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useSelector } from 'react-redux';

import { planner } from '../../../../../initR2D';
import { selectMetrics } from '../../../../../redux/features/metrics/metricsSLice';
import HoverComponent from '../../controlPanel/components/HoverComponent';

const useStyle = createUseStyles({
  text: {
    fontSize: 14,
    color: '#2F2F2F',
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
    color: '#2F2F2F',
    margin: '0 8px 0 4px',
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
  changerMain: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 30,
    '@media screen and (max-width: 950px)': {
      marginBottom: 5,
      minHeight: 10,
    },
  },
  changerInputs_main: {
    display: 'flex',
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
    transition: 'all 0s ease-in-out 1s',
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
      minWidth: 'fit-content',
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
      height: '55px',
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

const ChangeSize = (props) => {
  const classes = useStyle();
  const inputEl = useRef(null);
  const metrics = useSelector(selectMetrics);

  const [value, setValue] = useState(
    props.notConvertToCurrentMetric ? +props.value : planner.units.valueToString(+props.value)
  );

  let key = null;

  const incrDecrStep = props.notConvertToCurrentMetric ? 1 : planner.units.getStep();

  const onBlurInput = (e) => {
    const convertedValue = props.notConvertToCurrentMetric
      ? e.target.value
      : planner.units.stringToValue(e.target.value);
    let newValue = props.notConvertToCurrentMetric
      ? convertedValue
      : planner.units.valueToString(convertedValue);
    newValue = planner.units.getSystem() == 1 ? newValue : isNaN(newValue) ? props.value : newValue;
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

  const mouseDownArrows = (action) => (key = setTimeout(() => onChangeSize(action, true), 200));

  const mouseUpArrows = (action) => {
    clearTimeout(key);
    onChangeSize(action, false);
  };

  const onFocusInput = (e) => document.addEventListener('keydown', onEnterClick);

  const onEnterClick = (e) =>
    e.code == 'Enter' ? inputEl.current && inputEl.current.blur() : null;

  const windowMouseUp = (e) =>
    props.mouseDown.status == true ? mouseUpArrows(props.mouseDown.action, false) : null;

  useEffect(() => {
    if (inputEl.current && !props.isFixedSize) {
      document.addEventListener('mouseup', windowMouseUp);

      if (props.mouseDown.status == true && props.mouseDown.type == props.valueChangeType) {
        key = setTimeout(() => {
          onChangeSize(props.mouseDown.action, true);
        }, 100);
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

  useEffect(() => {
    if (inputEl.current)
      inputEl.current.style.width =
        (inputEl.current.value.length + 1) * 7 +
        (props.type && (props.type == 'style_1' || props.type == 'style_2') ? -3 : 5) +
        'px';
  }, []);

  return (
    <div
      className={classes.changerMain + ' ' + classes['addStyles_' + props.type + '_main']}
      style={{ ...props.additionalStyles }}
    >
      <div className={classes.text}>
        {props.label ? <div className={classes.text}>{props.label}</div> : null}
        {props.infoHover && (
          <HoverComponent hoverText={props.infoHover} hoverTextPositionX={'right'}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              className={classes.changerMain_info}
            >
              <circle cx="9" cy="9" r="9" fill="#2D8BDB" />
              <path
                d="M10.0621 10.1938H8.76172C8.76535 9.86368 8.79255 9.58076 8.84333 9.34499C8.89774 9.10922 8.98661 8.89702 9.10993 8.70841C9.23326 8.51617 9.40011 8.32029 9.61049 8.1208C9.77734 7.96483 9.92606 7.81792 10.0566 7.68009C10.1908 7.53863 10.296 7.39172 10.3722 7.23938C10.4484 7.08341 10.4865 6.90749 10.4865 6.71162C10.4865 6.49036 10.4502 6.30537 10.3777 6.15665C10.3087 6.00793 10.2054 5.89549 10.0675 5.81932C9.93331 5.73952 9.76465 5.69962 9.56152 5.69962C9.39467 5.69962 9.23689 5.73408 9.08817 5.803C8.93945 5.87191 8.81975 5.97892 8.72907 6.12401C8.63839 6.26547 8.58943 6.45046 8.58217 6.67897H7.14035C7.15123 6.2038 7.26367 5.80844 7.47768 5.49287C7.69169 5.17367 7.98005 4.93609 8.34277 4.78012C8.7055 4.62052 9.11175 4.54072 9.56152 4.54072C10.0585 4.54072 10.4828 4.62415 10.8347 4.791C11.1902 4.95422 11.4604 5.19362 11.6454 5.50919C11.834 5.82476 11.9283 6.20562 11.9283 6.65177C11.9283 6.97096 11.8666 7.25752 11.7433 7.51142C11.62 7.7617 11.4568 7.99566 11.2536 8.21329C11.0505 8.43093 10.8311 8.65037 10.5953 8.87163C10.3885 9.05662 10.2489 9.25431 10.1763 9.46469C10.1038 9.67507 10.0657 9.91809 10.0621 10.1938ZM8.6257 11.8859C8.6257 11.6682 8.69824 11.4869 8.84333 11.3418C8.99205 11.1967 9.19155 11.1241 9.44182 11.1241C9.6921 11.1241 9.88979 11.1967 10.0349 11.3418C10.1836 11.4869 10.258 11.6682 10.258 11.8859C10.258 12.0962 10.1836 12.274 10.0349 12.4191C9.88979 12.5642 9.6921 12.6367 9.44182 12.6367C9.19155 12.6367 8.99205 12.5642 8.84333 12.4191C8.69824 12.274 8.6257 12.0962 8.6257 11.8859Z"
                fill="#E5E5E5"
              />
            </svg>
          </HoverComponent>
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
                ' ' +
                classes['changerInputs_input' + '_' + props.type]
              }
            >
              <input
                className={classes.input + ' ' + classes['addStyles_' + props.type + '_input']}
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
                className={classes.arrows + ' ' + classes['addStyles_' + props.type + '_arrows']}
              >
                <svg
                  width="15"
                  height="8"
                  viewBox="0 0 15 8"
                  fill="none"
                  className={
                    classes.arrowUp + ' ' + classes['addStyles_' + props.type + '_arrowUp']
                  }
                  onMouseUp={(e) => mouseUpArrows('incr')}
                  onMouseDown={(e) => mouseDownArrows('incr')}
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M8.28092 1.18536L7.728 0.62854L7.72409 0.632419L7.72018 0.62854L7.16726 1.18535L0.723633 7.58394H2.9054L7.72409 2.74945L12.5428 7.58394H14.7245L8.28092 1.18536Z"
                    fill="#2F2F2F"
                  />
                </svg>

                <svg
                  width="15"
                  height="8"
                  viewBox="0 0 15 8"
                  fill="none"
                  className={
                    classes.arrowDown + ' ' + classes['addStyles_' + props.type + '_arrowDown']
                  }
                  onMouseUp={(e) => mouseUpArrows('decr')}
                  onMouseDown={(e) => mouseDownArrows('decr')}
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M8.34954 6.68041L7.72708 7.30725L7.72269 7.30288L7.71927 7.30627L7.23596 6.81956L0.722721 0.351854L2.90449 0.351854L7.72269 5.18586L12.5419 0.350878L14.7236 0.350878L8.34954 6.68041Z"
                    fill="#2F2F2F"
                  />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChangeSize;
