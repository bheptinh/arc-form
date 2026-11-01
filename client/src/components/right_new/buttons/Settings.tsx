import { IconAdjustmentsHorizontal } from '@tabler/icons-react';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useSelector } from 'react-redux';

import { useTranslation } from '../../../api/hooks/useTranslation';
import { user } from '../../../initR2D';

const bar_settings_dropdown_title = {
  background: '#DADADA',
  fontSize: 13,
  padding: 7,
  display: 'flex',
  height: 29,
};

const useStyles = createUseStyles({
  bar_settings_dropdown_wrap: {
    position: 'relative',
    width: 30,
    margin: '0 1px 1px 0',
    zIndex: 1,
    '&:hover': {
      pointerEvents: 'auto',
    },
  },
  bar_settings_dropdown_wrap_hover: {
    '& $bar_settings_dropdown_active': {
      background: 'var(--color-surface-muted)',
    },
    '&  $bar_dropdown_option_wrap': {
      pointerEvents: 'auto',
    },
    '&  $bar_dropdown_option_wr': {
      transform: 'translateX(0%)',
      pointerEvents: 'auto',
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
    background: 'var(--color-white)',
    border: '1px solid var(--color-white)',
    boxShadow: '0px 0px 3px 0px rgba(0, 0, 0, 0.12)',
    display: 'flex',
    alignItems: 'center',
    color: 'var(--color-white)',
    fontSize: 11,
    justifyContent: 'center',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    position: 'relative',
    zIndex: 2,
    '&:hover': {
      background: 'var(--color-surface-muted)',
      color: 'var(--color-highlight)',
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
    overflow: 'hidden',
  },
  bar_dropdown_option_setting: {
    background: 'var(--color-white)',
    cursor: 'pointer',
    height: 30,
    alignItems: 'center',
    fontSize: 12,
    color: 'var(--color-text-slate)',
    padding: '0 15px 0',
    whiteSpace: 'nowrap',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    gridTemplateColumns: '24px auto',
    gridGap: 21,
    display: 'grid',
    '&:hover': {
      background: 'var(--color-surface-muted)',
    },
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
      height: 25,
    },
  },
  arrow_right_down: {
    width: 0,
    height: 0,
    borderLeft: '5px solid transparent',
    borderBottom: '5px solid var(--color-text-slate)',
    position: 'absolute',
    right: 2,
    bottom: 2,
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
    backgroundColor: 'var(--color-surface-grey)',
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
      backgroundColor: 'var(--color-text-slate)',
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
  bar_dropdown_option_settings_active: {},
});

const Settings = () => {
  const translations = useTranslation();

  const classes = useStyles();

  const [settings, clickSettingsItem] = useState([
    { name: 'snapToPoints', translation: 'SNAP_TO_POINTS', active: WC.snapTool.pointsSnap },
    { name: 'alignByPoints', translation: 'ALIGN_BY_POINTS', active: WC.snapTool.pointsAlign },
    { name: 'alignAxises', translation: 'ALIGN_BY_ORTO', active: WC.snapTool.orthoAlign },
    { name: 'alignMediana', translation: 'ALIGN_BY_BISECTOR', active: WC.snapTool.bisectorAlign },
    { name: 'showSizes', translation: 'SHOW_SIZES', active: WC.wallsEditor.sizesVisible },
  ]);

  const settingsMenu = useRef(null);

  const [settingsDataUI, setSettingsDataUI] = useState([]);

  const onClickSettingsItem = (itemName) => {
    const newState = settings.map((i) => {
      if (i.name == itemName) i.active = !i.active;
      return i;
    });
    clickSettingsItem([...newState]);
    user.settingsItemClick(itemName);
  };

  const onSettingsDropdownEnter = (e) =>
    e.currentTarget.classList.add(classes.bar_settings_dropdown_wrap_hover);

  const onSettingsDropdownLeave = (e) =>
    e.currentTarget.classList.remove(classes.bar_settings_dropdown_wrap_hover);

  const onTouchStartDropdown = (e) => {
    document.removeEventListener('touchstart', onTouchStartHideDropdown);
    setTimeout(() => document.addEventListener('touchstart', onTouchStartHideDropdown), 0);
    if (!e.target.closest('.' + classes.bar_dropdown_option_wrap))
      e.currentTarget.classList.toggle(classes.bar_settings_dropdown_wrap_hover);
  };

  const onTouchStartHideDropdown = () => {
    document.removeEventListener('touchstart', onTouchStartHideDropdown);
    document
      .querySelector('.' + classes.bar_settings_dropdown_wrap_hover)
      ?.classList.remove(classes.bar_settings_dropdown_wrap_hover);
  };

  useLayoutEffect(() => {
    settingsMenu.current?.setAttribute('style', 'width: auto');
    return () => settingsMenu.current?.removeAttribute('style');
  });

  useEffect(() => {
    const settingsData = [];
    settings.forEach((i) => {
      settingsData.push(
        <div
          onClick={(e) => onClickSettingsItem(i.name)}
          key={i.name}
          className={
            classes.bar_dropdown_option_setting + ' ' + (i.active ? classes.switch_wr_active : '')
          }
        >
          <div className={classes.switch_wr}>
            <span className={classes.switch_slider}></span>
          </div>
          {translations[i.translation]}
        </div>
      );
    });
    setSettingsDataUI(settingsData);
  }, [settings, translations]);

  return (
    <div
      className={classes.bar_settings_dropdown_wrap}
      onTouchStart={onTouchStartDropdown}
      onMouseEnter={onSettingsDropdownEnter}
      onMouseLeave={onSettingsDropdownLeave}
    >
      <div className={classes.bar_settings_dropdown_active}>
        <IconAdjustmentsHorizontal size={16} color="#2A3435" />

        <span className={classes.arrow_right_down}></span>
      </div>
      <div ref={settingsMenu} className={classes.bar_dropdown_option_wrap}>
        <div className={classes.bar_dropdown_option_wr}>{settingsDataUI}</div>
      </div>
    </div>
  );
};

export default Settings;
