import React from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { user } from '../../../initR2D';
import { changeMetricsActive, selectMetrics } from '../../../redux/features/metrics/metricsSLice';

const useStyles = createUseStyles({
  bar_dropdown_wrap: {
    position: 'relative',
    height: '100%',
    minWidth: 30,
    '&:hover $bar_dropdown_active': {
      background: 'var(--color-surface-muted)',
    },
  },
  bar_dropdown_active: {
    background: 'var(--color-white)',
    cursor: 'pointer',
    borderRadius: 3,
    border: '1px solid var(--color-white)',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'var(--color-slate)',
    fontSize: '12px',

    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    '&:hover': {
      '& svg:not($bar_dropdown_wrap_svg_hover_circle) path, & svg:not($bar_dropdown_wrap_svg_hover_circle) circle, & svg:not($bar_dropdown_wrap_svg_hover_circle) rect':
        {
          fill: 'var(--color-highlight)',
        },
      '& $bar_dropdown_wrap_svg_hover_circle circle': {
        fill: 'var(--color-highlight)',
      },
    },
    '& p': {
      marginLeft: 5,
    },
  },
  bar_dropdown_option_wrap: {
    position: 'absolute',
    bottom: 'calc(100% - 4px)',
    left: '-4px',
    width: 'calc(100% + 8px)',
    overflow: 'hidden',
    padding: 4,
    minWidth: 'fit-content',
    pointerEvents: 'none',
    zIndex: '-2',
  },
  bar_dropdown_wrap_svg_hover_circle: {},
  bar_dropdown_option_wr: {
    paddingBottom: 2,
    borderRadius: 3,
    pointerEvents: 'auto',
    transform: 'translateY(calc(100% + 15px))',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    boxShadow: '0px 0px 7px 0px rgba(0, 0, 0, 0.15)',
  },
  bar_dropdown_option_wr_metric: {},
  bar_dropdown_option: {
    background: 'var(--color-white)',
    cursor: 'pointer',
    height: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    color: 'var(--color-slate)',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    position: 'relative',
    '&:hover': {
      background: 'var(--color-surface-muted)',
    },
    '& p': {
      marginLeft: 12,
    },
  },
  bar_dropdown_option_active: {
    display: 'none',
    background: 'var(--color-text)',
  },
  bar_dropdown_wrap_hover: {
    '& $bar_dropdown_option_wr': {
      transform: 'translateY(0%)',
    },
  },
});

const Metrics = (props) => {
  const classes = useStyles();

  const dispatch = useDispatch();

  const metrics = useSelector(selectMetrics);

  const onEnterDropdown = (e) => e.currentTarget.classList.add(classes.bar_dropdown_wrap_hover);

  const onLeaveDropdown = (e) => e.currentTarget.classList.remove(classes.bar_dropdown_wrap_hover);

  const onTouchStartDropdown = (e) => {
    document.removeEventListener('touchstart', onTouchStartHideDropdown);
    setTimeout(() => document.addEventListener('touchstart', onTouchStartHideDropdown), 0);
    if (!e.target.closest('.' + classes.bar_dropdown_option_wr))
      e.currentTarget.classList.toggle(classes.bar_dropdown_wrap_hover);
  };

  const onTouchStartHideDropdown = (e) => {
    document
      .querySelector('.' + classes.bar_dropdown_wrap_hover)
      ?.classList.remove(classes.bar_dropdown_wrap_hover);
    document.removeEventListener('touchstart', onTouchStartHideDropdown);
  };

  const onChangeDimension = (dimension) => {
    user.changeDimension(dimension);
    dispatch(changeMetricsActive(dimension));
    if (WC.WallsEditor._instance.state == WC.WallsEditor._instance.stateAlignDrawing)
      WC.WallsEditor._instance.state.draw();
    onTouchStartHideDropdown();
  };

  const dimensionsData = [];

  metrics.dimensionsAll.forEach((item) => {
    dimensionsData.push(
      <div
        key={item}
        className={
          classes.bar_dropdown_option +
          ' js_set_metric ' +
          (metrics.active == item ? classes.bar_dropdown_option_active : '')
        }
        onClick={(e) => onChangeDimension(item)}
      >
        {item}
      </div>
    );
  });

  return (
    <div
      className={classes.bar_dropdown_wrap + ' ' + classes.barMetricsBtn}
      onMouseEnter={onEnterDropdown}
      onMouseLeave={onLeaveDropdown}
      onTouchStart={onTouchStartDropdown}
    >
      <div className={classes.bar_dropdown_active + ' ' + classes.barMetricsActive}>
        {metrics.active}
      </div>
      <div className={classes.bar_dropdown_option_wrap}>
        <div
          className={classes.bar_dropdown_option_wr + ' ' + classes.bar_dropdown_option_wr_metric}
        >
          {dimensionsData}
        </div>
      </div>
    </div>
  );
};

export default Metrics;
