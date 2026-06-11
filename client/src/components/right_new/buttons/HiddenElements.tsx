import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { planner } from '../../../initR2D';
import {
  selectHiddenButtonWasShowed,
  updateHiddenButtonWasShowedStatus,
} from '../../../redux/features/common/commonSlice';
import { removeQuickPanelAll } from '../../../redux/features/quickPanels/quickPanelsSlice';
import { useTranslation } from '../../../api/hooks/useTranslation';

const bar_settings_dropdown_title = {
  background: '#DADADA',
  fontSize: 13,
  padding: '7px 7px 7px 24px',
  display: 'flex',
  height: 29,
};

const useStyles = createUseStyles({
  bar_settings_dropdown_wrap: {
    position: 'relative',
    width: 30,
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    zIndex: 1,
    '&:hover $bar_settings_dropdown_active': {
      background: '#E9E9E9',
    },
  },
  bar_settings_dropdown_title: {
    extend: bar_settings_dropdown_title,
    alignItems: 'center',
  },
  bar_settings_dropdown_active: {
    cursor: 'pointer',
    width: 30,
    height: 30,
    borderRadius: 3,
    background: '#fff',
    border: '1px solid #fff',
    boxShadow: '0px 0px 3px 0px rgba(0, 0, 0, 0.12)',
    display: 'flex',
    alignItems: 'center',
    color: '#fff',
    fontSize: 11,
    justifyContent: 'center',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    position: 'relative',
    zIndex: 2,
    '&:hover': {
      background: '#E9E9E9',
      color: '#ffd119',
    },
  },

  bar_dropdown_option_wrap: {
    top: '-4px',
    right: 'calc(100% - 2px)',
    padding: '4px',
    zIndex: -2,
    overflow: 'hidden',
    position: 'absolute',
    minWidth: 'fit-content',
    pointerEvents: 'none',
  },
  bar_dropdown_option_wr: {
    transform: 'translateX(calc(100% + 15px))',
    boxShadow: '0px 0px 7px 0px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    borderRadius: 3,
    pointerEvents: 'auto',
    paddingRight: 2,
    overflow: 'hidden',
  },
  bar_settings_dropdown_wrap_hover: {
    '&  $bar_dropdown_option_wrap': {
      pointerEvents: 'auto',
    },
    '&  $bar_dropdown_option_wr': {
      transform: 'translateX(0%)',
      pointerEvents: 'auto',
    },
  },

  bar_dropdown_option_setting: {
    color: '#2A3435',
    cursor: 'pointer',
    height: '30px',
    display: 'grid',
    padding: '0 15px 0',
    gridGap: '21px',
    fontSize: '12px',
    background: '#fff',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    gridTemplateColumns: '24px auto',
    '&:hover': {
      background: '#E9E9E9',
    },
  },
  bar_dropdown_option_settings_active: {
    '& $switch_slider': {
      background: '#B2D924',
      '&:before': {
        transform: 'translateX(11px)',
      },
    },
  },
  bar_settings_dropdown_wrap_animation: {
    position: 'relative',
  },
  switch_wr: {
    position: 'relative',
    display: 'inline-block',
    height: '10px',
    width: '100%',
  },
  switch_slider: {
    position: 'absolute',
    cursor: 'pointer',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    backgroundColor: '#D9D9D9',
    WebkitTransition: '.4s',
    transition: '.4s',
    borderRadius: '8px',
    boxShadow: 'inset 0 0 1px 0 rgba(0, 0, 0, 0.25)',
    '&:before': {
      position: 'absolute',
      content: '""',
      height: '13px',
      width: '13px',
      left: '0px',
      bottom: '-1px',
      backgroundColor: '#2A3435',
      transition: '.4s',
      borderRadius: '50%',
    },
  },
  switch_wr_active: {
    '& $switch_slider:before': {
      transform: 'translateX(11px)',
    },
    '& $switch_slider': {
      background: '#B2D924',
    },
  },
});

const HiddenElements = (props) => {
  const translations = useTranslation();

  const dispatch = useDispatch();

  const classes = useStyles();
  const [showHiddenObjectsStatus, setShowHiddenObjectsStatus] = useState(
    R2D.scene.showPartialVisibleElements
  );
  const isHiddenButtonWasShowed = useSelector(selectHiddenButtonWasShowed);
  const isHiddenButtonWasShowedMemo = useMemo(() => isHiddenButtonWasShowed, []);

  const onSettingsDropdownEnter = (e) =>
    e.currentTarget.classList.add(classes.bar_settings_dropdown_wrap_hover);

  const onSettingsDropdownLeave = (e) =>
    e.currentTarget.classList.remove(classes.bar_settings_dropdown_wrap_hover);

  const onTouchStartDropdown = (e) => {
    document.removeEventListener('touchstart', onTouchStartHideDropdown);
    setTimeout(() => document.addEventListener('touchstart', onTouchStartHideDropdown), 0);
    if (!e.target.closest('.' + classes.bar_dropdown_option_wr))
      e.currentTarget.classList.toggle(classes.bar_settings_dropdown_wrap_hover);
  };

  const onTouchStartHideDropdown = (e) => {
    document.removeEventListener('touchstart', onTouchStartHideDropdown);
    document
      .querySelector('.' + classes.bar_settings_dropdown_wrap_hover)
      ?.classList.remove(classes.bar_settings_dropdown_wrap_hover);
  };

  const onToggleHiddenElements = (e) => {
    showHiddenObjectsStatus
      ? planner.scene.hideAllPartialVisibleElements()
      : planner.scene.makeAllHiddenElementsPartialVisible();
    R2D.scene.showPartialVisibleElements = !R2D.scene.showPartialVisibleElements;
    setShowHiddenObjectsStatus(!showHiddenObjectsStatus);
    dispatch(removeQuickPanelAll());
  };

  const variants = {
    visible: { transform: 'scale(1)', opacity: 1 },
    hidden: { transform: 'scale(10)', opacity: 0 },
    exit: { transform: 'scale(10)', opacity: 0 },
  };

  useEffect(() => {
    !isHiddenButtonWasShowed &&
      setTimeout(() => dispatch(updateHiddenButtonWasShowedStatus(true)), 2000);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={isHiddenButtonWasShowedMemo ? null : variants}
        className={classes.bar_settings_dropdown_wrap}
        onTouchStart={onTouchStartDropdown}
        onMouseEnter={onSettingsDropdownEnter}
        onMouseLeave={onSettingsDropdownLeave}
      >
        <div className={classes.bar_settings_dropdown_active}>
          <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
            <path
              d="M9.05 10.5192C5.50049 10.5192 2.54433 8.57773 1.43042 5.94946C2.54433 3.32119 5.50049 1.37969 9.05 1.37969C12.5995 1.37969 15.5557 3.32119 16.6696 5.94946C15.5557 8.57773 12.5995 10.5192 9.05 10.5192Z"
              stroke="#2A3435"
              strokeWidth="1.1793"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9.05073 9.04531C10.7604 9.04531 12.1464 7.65934 12.1464 5.94966C12.1464 4.23998 10.7604 2.854 9.05073 2.854C7.34105 2.854 5.95508 4.23998 5.95508 5.94966C5.95508 7.65934 7.34105 9.04531 9.05073 9.04531Z"
              fill="#2A3435"
            />
          </svg>
        </div>
        <div className={classes.bar_dropdown_option_wrap}>
          <div className={classes.bar_dropdown_option_wr}>
            <div
              onClick={onToggleHiddenElements}
              className={
                classes.bar_dropdown_option_setting +
                ' ' +
                (showHiddenObjectsStatus ? classes.bar_dropdown_option_settings_active : '')
              }
            >
              <div className={classes.switch_wr}>
                <span className={classes.switch_slider}></span>
              </div>

              {translations['HIDDEN_ELEMENTS_TEXT']}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default HiddenElements;
