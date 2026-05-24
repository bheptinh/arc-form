import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectTranslation,  } from '../../../redux/features/language/languageSlice';
import { user } from '../../../initR2D';
import {createUseStyles} from 'react-jss'

let bar_settings_dropdown_title = {
  background: "#DADADA",
  fontSize: 13,
  padding: 7,
  display: 'flex',
  height: 29
}

const useStyles = createUseStyles({
    bar_settings_dropdown_wrap: {
        position: 'relative',
        width: 30,
        margin: '0 1px 1px 0',
        zIndex: 1,
        '&:hover':{
            pointerEvents: 'auto',
        }
      },
    bar_settings_dropdown_wrap_hover:{
        '& $bar_settings_dropdown_active':{
            background: '#E9E9E9'
        },
        '&  $bar_dropdown_option_wrap':{
            pointerEvents: 'auto'
        },
        '&  $bar_dropdown_option_wr':{
            transform: 'translateX(0%)',
            pointerEvents: 'auto'
        }
    },
      bar_settings_dropdown_title:{
        extend: bar_settings_dropdown_title,
        alignItems: 'center'
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
          }
      },
    bar_dropdown_option_wrap:{
        top: "-4px",
        right: "calc(100% - 2px)",
        padding: "4px",
        zIndex: -2,
        overflow: "hidden",
        position: "absolute",
        minWidth: "fit-content",
        pointerEvents: "none"
    },
      bar_dropdown_option_wr: {
          transform: "translateX(calc(100% + 15px))",
          boxShadow: "0px 0px 7px 0px rgba(0, 0, 0, 0.15)",
          transition: "all 0.9s cubic-bezier(0.19, 1, 0.22, 1)",
          borderRadius: 3,
          pointerEvents: "auto",
          overflow: 'hidden'
      },
    bar_dropdown_option_setting: {
        background: '#fff',
        cursor: 'pointer',
        height: 30,
        alignItems: 'center',
        fontSize: 12,
        color: '#2A3435',
        padding: '0 15px 0',
        whiteSpace: 'nowrap',
        transition: "all 0.9s cubic-bezier(0.19, 1, 0.22, 1)",
        gridTemplateColumns: '24px auto',
        gridGap: 21,
        display:'grid',
        '&:hover': {
            background: '#E9E9E9',
        },
        '@media screen and (max-width: 950px)':{
            fontSize: 11,
            height: 25
        }
    },
    arrow_right_down: {
      width: 0,
      height: 0,
      borderLeft: '5px solid transparent',
      borderBottom: '5px solid #2A3435',
      position: 'absolute',
      right: 2,
      bottom: 2
    },
    switch_wr:{
        position: "relative",
        display: "inline-block",
        height: "10px",
        width: "100%"
    },
    switch_slider:{
        position: "absolute",
        cursor: "pointer",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        backgroundColor: "#D9D9D9",
        WebkitTransition: ".4s",
        transition: ".4s",
        borderRadius: "8px",
        boxShadow: "inset 0 0 1px 0 rgba(0, 0, 0, 0.25)",
        '&:before':{
            position: "absolute",
            content: '""',
            height: "13px",
            width: "13px",
            left: "0px",
            bottom: "-1px",
            backgroundColor: "#2A3435",
            transition: ".4s",
            borderRadius: "50%"
        }

    },
    switch_wr_active:{
        '& $switch_slider:before':{
            transform: 'translateX(11px)'
        },
        '& $switch_slider':{
            background: '#B2D924'
        }
    },
    bar_dropdown_option_settings_active: {
    
    },
});

const Settings = props => {

    let translations = useSelector(selectTranslation);

    const classes = useStyles();

    let [settings, clickSettingsItem] = useState([
        { name: "snapToPoints", translation: "SNAP_TO_POINTS", active: WC.snapTool.pointsSnap },
        { name: "alignByPoints", translation: "ALIGN_BY_POINTS", active: WC.snapTool.pointsAlign },
        { name: "alignAxises", translation: "ALIGN_BY_ORTO", active: WC.snapTool.orthoAlign },
        { name: "alignMediana", translation: "ALIGN_BY_BISECTOR", active: WC.snapTool.bisectorAlign },
        { name: "showSizes", translation: "SHOW_SIZES", active: WC.wallsEditor.sizesVisible }
    ]);

    let settingsMenu = useRef(null);

    let [settingsDataUI, setSettingsDataUI] = useState([]);

    let onClickSettingsItem = itemName => {
        let newState = settings.map(i => {
            if(i.name == itemName) i.active = !i.active;
            return i;
        });
        clickSettingsItem([...newState]);
        user.settingsItemClick(itemName);
    }

    let onSettingsDropdownEnter = e => e.currentTarget.classList.add(classes.bar_settings_dropdown_wrap_hover);

    let onSettingsDropdownLeave = e => e.currentTarget.classList.remove(classes.bar_settings_dropdown_wrap_hover);

    let onTouchStartDropdown = e => {
      document.removeEventListener('touchstart', onTouchStartHideDropdown);
      setTimeout(() => document.addEventListener('touchstart', onTouchStartHideDropdown), 0) 
      if(!e.target.closest('.' + classes.bar_dropdown_option_wrap)) e.currentTarget.classList.toggle(classes.bar_settings_dropdown_wrap_hover);
  }

  let onTouchStartHideDropdown = e => {
      document.removeEventListener('touchstart', onTouchStartHideDropdown);
      document.querySelector('.' + classes.bar_settings_dropdown_wrap_hover)?.classList.remove(classes.bar_settings_dropdown_wrap_hover);
  }
    
    useLayoutEffect(() => {
        settingsMenu.current.setAttribute("style", "width: auto");
        return () => settingsMenu.current.removeAttribute("style");
    });

    useEffect(() => {
      let settingsData = [];
        settings.forEach(i => {
          settingsData.push(
              <div onClick={e => onClickSettingsItem(i.name)} key={i.name} className={classes.bar_dropdown_option_setting + " " +  (i.active ? classes.switch_wr_active : "")}>
                  <div className={classes.switch_wr}>
                      <span className={classes.switch_slider}></span>
                  </div>
                  { translations[i.translation] }
              </div>
          )
        });
      setSettingsDataUI(settingsData);
    }, [settings, translations])
    
    return (
        <div className={classes.bar_settings_dropdown_wrap} onTouchStart={onTouchStartDropdown} onMouseEnter={onSettingsDropdownEnter} onMouseLeave={onSettingsDropdownLeave}>
            <div className={classes.bar_settings_dropdown_active}>
                <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
                    <line x1="0.75" y1="2.25" x2="15.25" y2="2.25" stroke="#2A3435" strokeWidth="1.5" strokeLinecap="round"></line>
                    <line x1="0.75" y1="7.25" x2="15.25" y2="7.25" stroke="#2A3435" strokeWidth="1.5" strokeLinecap="round"></line>
                    <line x1="0.75" y1="12.25" x2="15.25" y2="12.25" stroke="#2A3435" strokeWidth="1.5" strokeLinecap="round"></line>
                    <circle cx="5" cy="2" r="2" fill="#2A3435"></circle><circle cx="12" cy="7" r="2" fill="#2A3435"></circle>
                    <circle cx="7" cy="12" r="2" fill="#2A3435"></circle>
                </svg>

                <span className={classes.arrow_right_down}></span>
            </div>
            <div ref={settingsMenu} className={classes.bar_dropdown_option_wrap}>
                <div className={classes.bar_dropdown_option_wr}>
                    { settingsDataUI }
                </div>
            </div>
        </div>
    )
}

export default Settings;