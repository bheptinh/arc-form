import React, { useEffect, useState } from 'react';
import Tips from './Tips';
import { createUseStyles } from 'react-jss';
import { useSelector } from 'react-redux';
import {AnimatePresence,motion} from "framer-motion";

import { selectActiveViewMode } from '../../redux/features/viewMode/viewModeSlice';
import { selectIsProjectBelongToLoggedUser, selectIsProjectOnlyView } from '../../redux/features/common/commonSlice';
import { selectActiveControlPanelMode } from '../../redux/features/control/controlPanelSlice';

import Ruler from './buttons/Ruler';
import ToCenter from './buttons/ToCenter';
import ZoomInOut from './buttons/ZoomInOut';
import FullScreen from './buttons/FullScreen';
import Metrics from './buttons/Metrics';

const useStyles = createUseStyles({
  panelBottom: {
    position: 'absolute',
    display: 'flex',
    right: 2,
    bottom: 2,
    zIndex: 2,
    'WebkitUserSelect': 'none',
    'MsUserSelect': 'none',
    'userSelect': 'none'
  },
  panel_bottom_right: {
      boxShadow: '0px 0px 3px 0px rgba(0, 0, 0, 0.12)',
      background: '#fff',
      borderRadius: 3,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: "relative",
      minWidth: 30,
      height: 30,
      marginRight: '1px',
      transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)'
  },
  panel_bottom_right_main:{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%'
  },
  copyright_container_element_text: {
    fontSize: 12,
    '& a': {
      color: 'rgb(47, 47, 47)'
    }
  }
});

const BottomPanel = props => {
  const classes = useStyles();

  let activeViewMode = useSelector(selectActiveViewMode);
  let activeControlPanelMode = useSelector(selectActiveControlPanelMode);
  let isProjectBelongToLoggedUser = useSelector(selectIsProjectBelongToLoggedUser);
  let isProjectOnlyView = useSelector(selectIsProjectOnlyView);

  let configTopUnits = R2D.config.data.ui.top_units;
  let currOS = R2D.controller.getCurrentOS();
  let isCurrDeviceAPhone = currOS == "iOS" || currOS == "Android";
  let isCurrDeviceIphone = currOS == "iOS";

  return (
    <div>
        <AnimatePresence>
          {
            activeViewMode != 'viewWalk' &&
                <motion.div
                    initial={{ transform: 'translateY(110%)'}}
                    animate={{ transform: 'translateY(0%)'}}
                    exit={{ transform: 'translateY(110%)' }}
                    transition={{ duration: 0.3}}
                    className={classes.panelBottom} key={'panelBottom'}>
                  {
                    activeControlPanelMode != "renderMake" &&
                    <div className={classes.panel_bottom_right}>
                      {
                          activeViewMode == "tileConfig" ? 
                          <div className={classes.panel_bottom_right_main}>
                            <ZoomInOut />
                            {configTopUnits && <Metrics />}
                          </div>
                          :
                          <div className={classes.panel_bottom_right_main}>
                            <AnimatePresence>
                                {
                                    activeViewMode == "view2d" || activeViewMode == "constr" ?
                                      !isProjectBelongToLoggedUser && isProjectOnlyView || activeControlPanelMode == "alignDrawing" ? null : <Ruler key={'ruler'}/>
                                    :null
                                }
                            </AnimatePresence>
                            <ZoomInOut />
                            <ToCenter />
                            { configTopUnits && <Metrics /> }
                            { !isCurrDeviceIphone && <FullScreen /> }
                          </div>
                      }
                    </div>
                  }
                </motion.div>
          }
        </AnimatePresence>

        {activeControlPanelMode != "renderMake" && !isCurrDeviceAPhone ? <Tips/> : null}
    </div>
  );
};

export default BottomPanel;
