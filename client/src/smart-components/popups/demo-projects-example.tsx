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
import DefaultModal from '../../shared-components/modals/default';

const useStyle = createUseStyles({
  planner_popup_wr: {
    maxWidth: 1257,
    width: '95%',
    maxHeight: '95%',
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
    <DefaultModal
      visible={animPopupClass}
      zIndex={popups.demoProjectsExample.zIndex}
      className={classes.planner_popup_wr}
      contentClassName={classes.planner_popup_cont}
      onClose={onCloseBlueScreenPopupProjects}
      onBack={backToStartPopup}
    >
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
    </DefaultModal>
  );
};

export default DemoProjectsExample;
