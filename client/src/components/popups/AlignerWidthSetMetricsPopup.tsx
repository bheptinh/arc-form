import React, { useEffect } from 'react';
import { useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { user } from '../../initR2D';
import { changeMetricsActive, selectMetrics } from '../../redux/features/metrics/metricsSLice';
import { closeActivePopup, setActivePopup } from '../../redux/features/popups/popupsSlice';
import { useTranslation } from '../../api/hooks/useTranslation';

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
  planner_popup_main: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 50,
  },
  text: {
    fontSize: 14,
    color: '#2F2F2F',
    marginRight: 70,
    textAlign: 'center',
  },
  planner_btn_done_wrap: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
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
    '&:hover': {
      background: '#8fc32d',
    },
    '@media screen and (max-width: 950px)': {
      fontSize: 12,
      height: '26px',
      minWidth: 88,
    },
  },
  bar_dropdown_wrap: {
    position: 'relative',
    height: '100%',
    minWidth: '42px',
    zIndex: 1,
    '&:hover $bar_dropdown_option_wr': {
      transform: 'translateY(0%)',
    },
    '&:hover & path, & circle, & rect': {
      fill: '#BBE521',
    },
    '&:hover $bar_dropdown_active': {
      background: '#E9E9E9',
    },
  },
  bar_dropdown_active: {
    color: '#2A3435',
    border: '1px solid #fff',
    cursor: 'pointer',
    height: '100%',
    display: 'flex',
    fontSize: '12px',
    minHeight: 30,
    background: '#fff',
    boxShadow: '0px 0px 3px 0px rgba(0, 0, 0, 0.12)',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    alignItems: 'center',
    borderRadius: '3px',
    justifyContent: 'center',
  },
  bar_dropdown_option_wrap: {
    top: 'calc(100% - 4px)',
    left: '-2px',
    width: 'calc(100% + 4px)',
    padding: '4px',
    zIndex: -1,
    overflow: 'hidden',
    position: 'absolute',
    minWidth: 'fit-content',
    pointerEvents: 'none',
  },
  bar_dropdown_option_wr: {
    transform: 'translateY(calc(-100% - 15px))',
    boxShadow: '0px 0px 7px 0px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    borderRadius: '3px',
    overflow: 'hidden',
    pointerEvents: 'auto',
  },
  bar_dropdown_option: {
    color: '#2A3435',
    cursor: 'pointer',
    height: '30px',
    display: 'flex',
    position: 'relative',
    fontSize: '12px',
    background: '#fff',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
      background: '#E9E9E9',
    },
  },
});

const AlignerWidthSetMetricsPopup = (props) => {
  const dispatch = useDispatch();
  const translation = useTranslation();

  const metricsGlobal = useSelector(selectMetrics);

  const [metrics, setMetrics] = useState({
    active: metricsGlobal.active,
    dimensionsAll: ['cm', 'mm', 'm', 'ft'],
  });
  const [animPopupClass, setAnimPopupClass] = useState(false);

  const onClickOk = (e) => {
    dispatch(setActivePopup({ name: 'alignerWidthSet' }));
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'alignerWidthSetMetrics' })), 500);
  };

  const onChangeDimension = (dimension) => setMetrics({ ...metrics, active: dimension });

  const dimensionsData = [];
  const classes = useStyle();
  metrics.dimensionsAll.forEach((item) => {
    dimensionsData.push(
      <div
        key={item}
        className={
          classes.bar_dropdown_option +
          ' js_set_metric ' +
          (metrics.active == item ? ' bar_dropdown_option_active' : '')
        }
        onClick={(e) => onChangeDimension(item)}
      >
        {item}
      </div>
    );
  });

  useEffect(() => {
    dispatch(changeMetricsActive(metrics.active));
    user.changeDimension(metrics.active);
  }, [metrics]);

  useEffect(() => {
    const timer = setTimeout(() => setAnimPopupClass(true), 0);
    return () => clearTimeout(timer);
  }, []);

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
            <div className={classes.planner_popup_main}>
              <div className={classes.text}>
                <p>{translation['TEXT_CHOOSE_UNITS']}</p>
              </div>

              <div className={classes.bar_dropdown_wrap}>
                <div className={classes.bar_dropdown_active}>{metrics.active}</div>
                <div className={classes.bar_dropdown_option_wrap}>
                  <div className={classes.bar_dropdown_option_wr}>{dimensionsData}</div>
                </div>
              </div>
            </div>

            <div className={classes.planner_btn_done_wrap}>
              <div className={classes.planner_btn_done} onClick={onClickOk}>
                {translation['RENDER_CONTINUE']}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlignerWidthSetMetricsPopup;
