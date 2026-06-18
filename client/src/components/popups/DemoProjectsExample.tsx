import { IconArrowLeft, IconX } from '@tabler/icons-react';
import React, { useState } from 'react';
import { useEffect } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';

import { useTranslation } from '../../api/hooks/useTranslation';
import {
  closeActivePopup,
  selectPopups,
  setActivePopup,
} from '../../redux/features/popups/popupsSlice';
import { createProjectUrl } from '../../utils/UrlHelper';

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
  planner_popup_back: {
    position: 'absolute',
    left: 11,
    top: 12,
    cursor: 'pointer',
    zIndex: 1,
    transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
    '&:hover': {
      stoke: '#BAE51F',
    },
  },
  planer_popup_close: {
    width: 20,
    height: 20,
    position: 'absolute',
    top: 8,
    right: 8,
    cursor: 'pointer',
    zIndex: '2',
    '&:hover': {
      '& svg': {
        stroke: '#BAE51F',
      },
    },
  },
  planer_popup_close_icon: {
    transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
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
});

const DemoProjectsExample = (props) => {
  const classes = useStyle();
  const dispatch = useDispatch();
  const translation = useTranslation();

  const popups = useSelector(selectPopups);
  const checkBoxStatus = popups.demoProjectsExample.data;

  const backToStartPopup = (e) => {
    if (dataHistory.length < 2) {
      setAnimPopupClass(false);
      setTimeout(() => dispatch(closeActivePopup({ name: 'demoProjectsExample' })), 500);
      dispatch(setActivePopup({ name: 'startPopup', data: checkBoxStatus }));
    } else {
      setDataHistory(dataHistory.slice(0, dataHistory.length - 1));
    }
  };

  const [dataHistory, setDataHistory] = useState([
    R2D.config?.data?.start_popup?.demoProjects?.projects,
  ]);
  const demoProjectsMainTitle = R2D.config?.data?.start_popup?.demoProjects?.title || '';

  const [buttonsArray, setButtonsArray] = useState([]);
  const [projectsToShow, setProjectsToShow] = useState(null);
  const [animPopupClass, setAnimPopupClass] = useState(false);

  const onClickProject = (hash) => {
    if (checkBoxStatus) R2D.Storage.save('r2d_blueScreenPopup', true);
    window.history.replaceState(null, null, createProjectUrl(hash));
    window.location.reload();
  };

  const onClickCategory = (data) => setDataHistory((state) => [...state, data]);

  const onCloseBlueScreenPopupProjects = (e) => {
    if (checkBoxStatus) R2D.Storage.save('r2d_blueScreenPopup', true);
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'demoProjectsExample' })), 500);
  };

  useEffect(() => {
    const tempData = [];
    dataHistory[dataHistory.length - 1]?.forEach &&
      dataHistory[dataHistory.length - 1].forEach((i, index) => {
        if (i.children) {
          tempData.push(
            <div
              className={classes.start_item}
              key={index}
              onClick={(e) => onClickCategory(i.children)}
            >
              <div className={classes.start_item_img_wr}>
                <img className={classes.start_item_img} src={i.preview} />
              </div>
              <div className={classes.start_item_title}>{i.name}</div>
            </div>
          );
        } else {
          tempData.push(
            <div className={classes.start_item} key={index} onClick={(e) => onClickProject(i.hash)}>
              <div className={classes.start_item_img_wr}>
                <img className={classes.start_item_img} src={i.preview} />
              </div>
              <div className={classes.start_item_title}>{i.name}</div>
            </div>
          );
        }
        setProjectsToShow(tempData);
        setButtonsArray(tempData);
      });
  }, [dataHistory]);

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
      style={{ zIndex: popups.demoProjectsExample.zIndex }}
    >
      <div className={classes.planner_popup_wr}>
        <div className={classes.planner_popup_cont}>
          <IconArrowLeft
            className={classes.planner_popup_back}
            size={24}
            color="#444444"
            onClick={backToStartPopup}
          />

          <div
            className={classes.planer_popup_close}
            id="js_close_popup"
            onClick={onCloseBlueScreenPopupProjects}
          >
            <IconX size={24} color="#444444" className={classes.planer_popup_close_icon} />
          </div>
          <div className={classes.start_title}>
            {demoProjectsMainTitle || translation['PRECONF_PROJECTS_TITLE']}
          </div>
          <div className={classes.start_text}></div>
          <div
            className={classes.start_items}
            style={{ justifyContent: buttonsArray.length < 4 ? 'center' : 'flex-start' }}
          >
            {projectsToShow}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoProjectsExample;
