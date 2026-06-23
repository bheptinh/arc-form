import { IconX } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { useTranslation } from '../../api/hooks/useTranslation';
import { user } from '../../initR2D';
import {
  changeActiveControlPanelMode,
  updateDynamicPanelStatus,
} from '../../redux/features/control/controlPanelSlice';
import {
  closeActivePopup,
  selectPopups,
  setActivePopup,
} from '../../redux/features/popups/popupsSlice';
import { showTip } from '../../redux/features/tips/tipsSlice';
import Checkbox from '../../shared-components/inputs/checkbox';

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
    maxWidth: 1257,
    width: '95%',
    maxHeight: '95%',
    transform: 'scale(0)',
    boxShadow: '0px 1px 10px 0px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
  },
  planner_popup_cont: {
    color: '#000',
    backgroundColor: '#72C4FF',
    borderRadius: 6,
    height: '100%',
    position: 'relative',
    padding: '9% 102px 13%',
    '@media screen and (max-width: 1200px)': {
      padding: '9% 50px 10%',
    },
    '@media screen and (max-width: 950px)': {
      padding: '5% 20px 5%',
    },
  },
  modal_pro_wr: {
    background: '#63bbf0',
    width: '100%',
    height: '100%',
  },
  planner_popup_close: {
    width: 20,
    height: 20,
    position: 'absolute',
    top: 8,
    right: 8,
    cursor: 'pointer',
    zIndex: '2',
    '& path': {
      transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
    },
    '&:hover': {
      '& path': {
        fill: '#BAE51F',
      },
    },
  },
  planner_popup_close_icon: {
    width: '100%',
  },
  start_title: {
    color: '#282828',
    fontSize: 34,
    fontWeight: 300,
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'RobotoCondensed-Regular',
    '@media screen and (max-width: 950px)': {
      fontSize: 30,
    },
  },
  start_text: {
    textAlign: 'center',
    fontSize: 19,
    color: '#232323',
    marginBottom: 74,
    fontFamily: 'Roboto-Light',
    '@media screen and (max-width: 950px)': {
      marginBottom: 10,
    },
  },
  start_items: {
    display: 'flex',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    '@media screen and (max-width: 950px)': {},
  },
  start_item: {
    width: '24%',
    width: 252,
    margin: '0 5px',
    cursor: 'pointer',
    '&:hover $start_item_img_wr:after': {
      opacity: 1,
    },
    '&:hover $start_item_img_wr': {
      borderRadius: 7,
    },
    '@media screen and (max-width: 950px)': {
      '&:not(:last-child)': {
        marginBottom: 20,
      },
    },
  },
  start_item_img_wr: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 212,
    background: '#fff',
    borderRadius: 6,
    marginBottom: 16,
    position: 'relative',
    transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
    '&:after': {
      top: '-2%',
      left: '-2%',
      width: '104%',
      border: '1px solid #fff',
      height: '104%',
      content: '" "',
      position: 'absolute',
      boxShadow: 'inset 0px 0px 0px 5px #9dd900',
      opacity: 0,
      borderRadius: 12,
      transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
    },
    '@media screen and (max-width: 950px)': {
      height: 160,
    },
  },
  start_item_img: {
    maxWidth: '100%',
    maxHeight: '100%',
  },
  start_item_title: {
    textAlign: 'center',
    fontSize: 15,
    color: '#373737',
    textTransform: 'uppercase',
    '@media screen and (max-width: 950px)': {
      fontSize: 13,
    },
  },
  start_item_subtitle: {
    textAlign: 'center',
    fontSize: 15,
    color: '#373737',
  },
  compare_checkbox_wr: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    display: 'flex',
    justifyContent: 'center',
    '& label': {
      color: '#ffffff',
      fontSize: 15,
      '&:before': {
        background: '#fff',
      },
    },
  },
});

const StartPopup = (props) => {
  const classes = useStyle();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const translation = useTranslation();

  const currOS = R2D.controller.getCurrentOS();

  const popups = useSelector(selectPopups);

  const [checkBoxStatus, setCheckBoxStatus] = useState(popups.startPopup.data || false);
  const [animPopupClass, setAnimPopupClass] = useState(false);
  const [buttonsArray, setButtonsArray] = useState([]);

  const checkBoxRef = useRef(null);

  const onOrderFloorPlanClick = (e) => {
    R2D.config.data.additional.orderFloorPlanUrl &&
      window.open(R2D.config.data.additional.orderFloorPlanUrl, '_blank');
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'startPopup' })), 500);
  };

  const onStartBuildClick = (e) => {
    if (checkBoxRef.current.querySelector('input').checked)
      R2D.Storage.save('r2d_blueScreenPopup', true);
    dispatch(
      changeActiveControlPanelMode({
        mode: 'constructor',
        data: { type: 'main', lastSavedScroll: 0 },
      })
    );
    dispatch(updateDynamicPanelStatus(true));
    dispatch(showTip({ name: 'constructorButtons' }));
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'startPopup' })), 500);
  };

  const onUploadPlanClick = async (e) => {
    if (checkBoxRef.current.querySelector('input').checked)
      R2D.Storage.save('r2d_blueScreenPopup', true);
    const dontShowTips = true;
    dispatch(
      changeActiveControlPanelMode({
        mode: 'constructor',
        data: { type: 'main', lastSavedScroll: 0 },
      })
    );
    dispatch(updateDynamicPanelStatus(true));
    dispatch(setActivePopup({ name: 'uploadPlanPopup' }));
    onCloseBlueScreenPopup(dontShowTips);
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'startPopup' })), 500);
  };

  const onMyProjectsOpen = async (e) => {
    if (checkBoxRef.current.querySelector('input').checked)
      R2D.Storage.save('r2d_blueScreenPopup', true);
    if (!user.isLogged()) {
      !R2D.config.data.enable_merchant_login
        ? dispatch(setActivePopup({ name: 'login', type: 'startPopup' }))
        : R2D.postMessageToParent(JSON.stringify({ action: 'merchant_login' }));
      return dispatch(closeActivePopup({ name: 'startPopup' }));
    }
    R2D.config.data.my_projects_merchant_logic
      ? R2D.postMessageToParent(JSON.stringify({ action: 'my_projects' }))
      : navigate('/projects');
    dispatch(
      changeActiveControlPanelMode({
        mode: 'constructor',
        data: { type: 'main', lastSavedScroll: 0 },
      })
    );
    dispatch(updateDynamicPanelStatus(true));
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'startPopup' })), 500);
  };

  const onCloseBlueScreenPopup = (dontShowTips) => {
    if (checkBoxRef.current.querySelector('input').checked)
      R2D.Storage.save('r2d_blueScreenPopup', true);
    setAnimPopupClass(false);
    dispatch(
      changeActiveControlPanelMode({
        mode: 'constructor',
        data: { type: 'main', lastSavedScroll: 0 },
      })
    );
    dispatch(updateDynamicPanelStatus(true));
    dontShowTips == undefined && dispatch(showTip({ name: 'constructorButtons' }));
    setTimeout(() => dispatch(closeActivePopup({ name: 'startPopup' })), 500);
  };

  const onPreConfigRoomClick = (e) => {
    setAnimPopupClass(false);
    dispatch(
      setActivePopup({
        name: 'demoProjectsExample',
        data: checkBoxRef.current.querySelector('input').checked,
      })
    );
    setTimeout(() => dispatch(closeActivePopup({ name: 'startPopup' })), 500);
  };

  const defaultStartButtonsData = {
    startFromScratch: {
      name: translation['START_POPUP_CONSTR'],
      preview: '/src_designer/images/startFromScratch.svg',
      buttonClick: onStartBuildClick,
    },
    uploadPlan: {
      name: translation['START_POPUP_UPLOAD_PLAN'],
      preview: '/src_designer/images/uploadPlan.svg',
      buttonClick: onUploadPlanClick,
    },
    myProjects: {
      name: translation['START_POPUP_PROJECTS'],
      preview: '/src_designer/images/myProjects.svg',
      buttonClick: onMyProjectsOpen,
    },
    orderFloorPlan: {
      name: translation['ORDER_FLOOR_PLAN_TITLE'],
      addText: translation['ORDER_FLOOR_PLAN_SUBTITLE'],
      preview: '/src_designer/images/orderFloorPlan.svg',
      buttonClick: onOrderFloorPlanClick,
    },
    demoProjects: {
      name: translation['PRECONF_PROJECTS_TITLE'],
      preview: '/src_designer/images/demoProjects.svg',
      buttonClick: onPreConfigRoomClick,
    },
  };

  useEffect(() => {
    const timer = setTimeout(() => setAnimPopupClass(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const buttonsArrayData = [];
    const dataToWorkWith =
      (R2D.config?.data?.start_popup?.items &&
        !Array.isArray(R2D.config?.data?.start_popup?.items) &&
        Object.entries(R2D.config?.data?.start_popup?.items)) ||
      Object.entries(defaultStartButtonsData).filter((i) => i[0] != 'demoProjects');
    for (const [key, data] of dataToWorkWith) {
      buttonsArrayData.push(
        <div
          className={classes.start_item}
          key={Math.random()}
          onClick={defaultStartButtonsData[key]?.buttonClick}
        >
          <div className={classes.start_item_img_wr}>
            <img
              className={classes.start_item_img}
              src={data.preview || defaultStartButtonsData[key]?.preview}
            />
          </div>
          <div className={classes.start_item_title}>
            {data.name || defaultStartButtonsData[key]?.name}
          </div>
          {data.addText || defaultStartButtonsData[key]?.addText ? (
            <div className={classes.start_item_subtitle}>
              {data.addText || defaultStartButtonsData[key]?.addText}
            </div>
          ) : null}
        </div>
      );
    }
    setButtonsArray(buttonsArrayData);
  }, []);

  return (
    <div
      className={
        animPopupClass
          ? classes.planner_popup_wrap + ' ' + classes.planner_popup_wrap_show
          : classes.planner_popup_wrap
      }
      style={{ zIndex: popups.startPopup.zIndex }}
    >
      <div
        className={classes.planner_popup_wr}
        style={
          currOS == 'iOS' || currOS == 'Android'
            ? { width: '100%', height: '100%', maxHeight: '100%' }
            : undefined
        }
      >
        <div className={classes.planner_popup_cont}>
          <div className={classes.planner_popup_close} onClick={onCloseBlueScreenPopup}>
            <IconX size={24} color="#2F2F2F" className={classes.planner_popup_close_icon} />
          </div>

          <div className={classes.start_title}>
            {R2D.config?.data?.start_popup?.title || translation['START_POPUP_TITLE']}
          </div>
          <div
            className={classes.start_items}
            style={{ justifyContent: buttonsArray.length < 4 ? 'center' : 'flex-start' }}
          >
            {buttonsArray}
          </div>

          <div className={classes.compare_checkbox_wr} ref={checkBoxRef}>
            <Checkbox
              label={translation['TEXT_DONT_SHOW_AGAIN']}
              onChange={() => setCheckBoxStatus(!checkBoxStatus)}
              checked={checkBoxStatus}
              name={'blueScreenPopup'}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartPopup;
