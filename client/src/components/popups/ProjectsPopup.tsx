import 'simplebar-react/dist/simplebar.min.css';

import { useInfiniteQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';

import { planner, user } from '../../initR2D';
import { projectsInfiniteQueryOptions } from '../../api/projects';
import { selectControlPanelData } from '../../redux/features/control/controlPanelSlice';
import {
  closeActivePopup,
  selectPopups,
  setActivePopup,
} from '../../redux/features/popups/popupsSlice';
import { showTip } from '../../redux/features/tips/tipsSlice';
import { selectUserProfileData } from '../../redux/features/user/userSlice';
import { createProjectUrl } from '../../utils/UrlHelper';
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.2)',
    '& .simplebar-scrollable-y .simplebar-content': {
      paddingRight: '38px !important',
    },
  },
  planner_popup_wrap_show: {
    opacity: '1',
    pointerEvents: 'auto',
    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
    '& $planner_popup_wr': {
      transform: 'scale(1)',
      opacity: 1,
    },
  },
  planner_popup_wr: {
    color: '#000',
    width: '100%',
    height: '100%',
    transform: 'scale(0.5)',
    opacity: 0,
    boxShadow: '0px 1px 10px 0px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
    padding: '38px 0px 0px ',
    backgroundColor: '#EBEBEB',
    '@media screen and (max-width: 950px)': {
      padding: '14px 0px 0px ',
    },
  },
  planner_popup_cont: {
    color: '#000',
    height: '100%',
    display: 'grid',
    gridGap: '30px',
    position: 'relative',
    padding: '0 13px',
    gridTemplateRows: 'auto 1fr',
    alignItems: 'stretch',
    margin: 'auto',
    '@media screen and (max-width: 950px)': {
      gridGap: '14px',
    },
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
  planner_popup_top: {
    padding: '0 11%',
    paddingRight: 'calc(11% + 38px)',
    '@media screen and (max-width: 950px)': {
      padding: 0,
    },
  },
  planner_popup_title_wr: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  planner_popup_title: {
    color: '#2F2F2F',
    fontSize: 32,
    fontWeight: 300,
    '@media screen and (max-width: 950px)': {
      fontSize: 20,
    },
  },
  planner_popup_info: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '24px',
  },
  planner_popup_text: {
    color: '#373737',
    fontSize: 13,
    '& p': {
      display: 'inline',
    },
    '& span': {
      fontWeight: 700,
    },
  },
  planner_popup_link: {
    fontSize: 13,
    marginTop: 5,
    textDecoration: 'underline',
    cursor: 'pointer',
    color: '#66ACF4',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    '&:hover': {
      textDecoration: 'none',
    },
  },
  planner_popup_fil_wr: {
    position: 'relative',
    zIndex: 1,
    height: 26,
    display: 'flex',
    marginLeft: 40,
  },
  planner_popup_proj_pro_proekt: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    textTransform: 'uppercase',
    border: '1px solid #9AA3A4',
    color: '#9AA3A4',
    borderRadius: 3,
    padding: '1px 4px',
    fontSize: 14,
    '@media screen and (max-width: 950px)': {
      fontSize: 9,
    },
  },
  bar_dropdown_wrap: {
    borderRight: '1px solid #C4C4C4',
    position: 'relative',
    height: '100%',
    minWidth: 30,
    '&:hover $bar_dropdown_active': {
      background: '#E9E9E9',
    },
    '&:hover $bar_dropdown_option_wr': {
      transform: 'translateY(0)',
      pointerEvents: 'all',
    },
    '&:hover $bar_dropdown_active svg': {
      transform: 'rotate(180deg)',
    },
  },
  bar_dropdown_wrap_svg_hover_circle: {},
  bar_dropdown_wrap_lang: {},
  bar_dropdown_option_wr_lang: {},
  bar_dropdown_active: {
    boxShadow: '0px 0px 3px 0px rgba(0, 0, 0, 0.12)',
    background: '#fff',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    borderRadius: '3px 0 0 3px',
    border: '1px solid #fff',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#2A3435',
    fontSize: '12px',
    padding: '0 7px',
    display: 'grid',
    gridTemplateColumns: 'auto auto',
    gridGap: '20px',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    '& svg': {
      transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    },
    '&:hover': {},
    '& p': {
      marginLeft: 5,
    },
  },
  bar_btnScreenshotBtn: {},
  bar_dropdown_active_lang: {
    justifyContent: 'center',
  },
  bar_dropdown_option_wrap: {
    position: 'absolute',
    right: '-4px',
    width: 'calc(100% + 8px)',
    overflow: 'hidden',
    minWidth: 'fit-content',
    pointerEvents: 'none',
    zIndex: -1,
    padding: 4,
    top: 'calc(100% - 4px)',
  },
  bar_dropdown_option_wr: {
    paddingTop: 2,
    pointerEvents: 'auto',
    transform: 'translateY(calc(-100% - 15px))',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    borderRadius: 3,
    overflow: 'hidden',
    boxShadow: '0px 0px 7px 0px rgba(0, 0, 0, 0.15)',
  },
  bar_dropdown_option_svg_path_hover_stroke: {},
  bar_dropdown_option: {
    background: '#fff',
    cursor: 'pointer',
    height: 30,
    display: 'flex',
    alignItems: 'center',
    fontSize: 12,
    whiteSpace: 'nowrap',
    color: '#2A3435',
    padding: '0 10px',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    position: 'relative',
    '&:hover': {
      background: '#E9E9E9',
    },
    '& p': {
      marginLeft: 12,
    },
  },
  planner_popup_fil_sort_btn: {
    boxShadow: '0px 0px 3px 0px rgba(0, 0, 0, 0.12)',
    background: '#fff',
    cursor: 'pointer',
    borderRadius: '0 3px 3px 0',
    border: '1px solid #fff',
    height: '100%',
    width: 26,
    justifyContent: 'center',
    alignItems: 'center',
    display: 'grid',
    gridTemplateColumns: 'auto',
    alignContent: 'center',
    gridGap: '20px',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    '&:hover': {
      background: '#E9E9E9',
    },
  },
  planner_popup_scroll: {
    position: 'relative',
    overflow: 'hidden',
    height: '100%',
  },
  planner_popup_projects: {
    gridGap: 38,
    display: 'grid',
    gridTemplateColumns: 'repeat(4, calc(25% - 29px))',
    padding: '0 11% 70px',
    '@media screen and (max-width: 1250px)': {
      gridTemplateColumns: 'repeat(3, calc(33% - 22px))',
    },
    '@media screen and (max-width: 950px)': {
      padding: '0 0 14px',
      gridGap: 10,
      gridTemplateColumns: 'repeat(3, calc(33% - 5px))',
    },
  },
  planner_popup_proj_add: {
    background: '#fff',
    borderRadius: '6px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '19px',
    color: '#2F2F2F',
    position: 'relative',
    cursor: 'pointer',
    minHeight: 304,
    '& svg': {
      marginRight: 12,
      '@media screen and (max-width: 950px)': {
        width: 10,
      },
    },
    '&:after': {
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      content: '""',
      zIndex: 1,
      position: 'absolute',
      boxShadow: 'inset 0 0 0 0px #BAE51F',
      transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
      pointerEvents: 'none',
      borderRadius: 6,
    },
    '&:hover:after': {
      boxShadow: 'inset 0 0 0 4px #BAE51F',
    },
    '@media screen and (max-width: 950px)': {
      fontSize: 15,
      minHeight: 'auto',
    },
  },
  planner_popup_proj: {
    background: '#fff',
    borderRadius: '6px',
    position: 'relative',
    '&:after': {
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      content: '""',
      zIndex: 1,
      position: 'absolute',
      boxShadow: 'inset 0 0 0 0px #BAE51F',
      transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
      pointerEvents: 'none',
      borderRadius: 6,
    },
  },
  animateOut: {
    transform: 'scale(0)',
  },
  animateIn: {
    transform: 'scale(1)',
  },
  planner_popup_proj_hover: {
    '& $planner_popup_proj_btns_wr': {
      opacity: 1,
      pointerEvents: 'auto',
    },
    '&:after': {
      boxShadow: 'inset 0 0 0 4px #BAE51F',
      '@media screen and (max-width: 950px)': {
        display: 'none',
      },
    },
    '& $planner_popup_proj_btn': {
      display: 'block',
    },
  },
  planner_popup_proj_img_wr: {
    height: '181px',
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    '@media screen and (max-width: 950px)': {
      height: 'auto',
      display: 'block',
    },
  },
  planner_popup_proj_img: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'cover',
    '@media screen and (max-width: 950px)': {
      height: 108,
      margin: 'auto',
      display: 'block',
    },
  },
  planner_popup_proj_btns_wr: {
    position: 'absolute',
    borderRadius: '6px 6px 0 0',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    background: 'rgb(0 0 0 / 75%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: '0 10px',
    transition: '0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    opacity: 0,
    pointerEvents: 'none',
    '@media screen and (max-width: 950px)': {
      position: 'relative',
      height: 'auto',
      opacity: 1,
      pointerEvents: 'all',
      borderRadius: 0,
      padding: '5px 2px',
    },
  },
  planner_popup_proj_btn: {
    cursor: 'pointer',
    position: 'relative',
    '& path': {
      transition: '0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    },
    '&:hover': {
      '& path': {
        fill: '#B8E11F',
      },
      '& $planner_popup_proj_btn_text': {
        opacity: 1,
      },
    },
    '@media screen and (max-width: 950px)': {
      width: 15,
      height: 20,
      '& svg': {
        maxWidth: '100%',
        maxHeight: '100%',
      },
    },
  },
  planner_popup_proj_btn_text: {
    top: 'calc(100% + 2px)',
    left: '50%',
    color: '#B8E11F',
    opacity: 0,
    position: 'absolute',
    fontSize: '12px',
    transform: 'translateX(-50%)',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    whiteSpace: 'nowrap',
    '@media screen and (max-width: 950px)': {
      display: 'none',
    },
  },
  planner_popup_proj_info: {
    padding: '11px 20px 20px',
    '@media screen and (max-width: 950px)': {
      padding: 10,
    },
  },
  planner_popup_proj_title: {
    color: '#2F2F2F',
    fontSize: 18,
    marginBottom: 10,
    '@media screen and (max-width: 950px)': {
      fontSize: 12,
      marginBottom: 5,
    },
  },
  planner_popup_proj_content: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    fontSize: 13,
    '& span': {
      color: '#7B7B7B',
    },
    '& div:first-child': {
      color: '#7B7B7B',
    },
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
      gridGap: '3px 7px',
      '& svg': {
        width: 12,
        height: 'auto',
      },
    },
  },
  preloader_projects: {
    background: 'rgba(255, 255, 255, 0.6)',
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 99,
  },
  planner_popup_proj_id: {
    display: 'flex',
    marginBottom: 6,
    '& p': {
      marginLeft: 8,
      color: '#000',
    },
  },
  planner_popup_proj_modified: {
    display: 'flex',
    marginBottom: 6,
    '& span': {
      margin: '0 5px 0 8px',
    },
  },
  planner_popup_proj_info_created: {
    display: 'flex',
    alignItems: 'center',
    '& span': {
      margin: '0 5px 0 8px',
    },
  },
});

const ProjectsPopup = (props) => {
  const classes = useStyle();
  const dispatch = useDispatch();
  const translation = useTranslation();
  const popups = useSelector(selectPopups);
  const userData = useSelector(selectUserProfileData);
  const scrollRef = useRef();
  const controlPanelData = useSelector(selectControlPanelData);

  const { data: projectsQueryData, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery(projectsInfiniteQueryOptions);
  const projectsData = useMemo(
    () => projectsQueryData?.pages.flatMap((p) => p.items) ?? [],
    [projectsQueryData]
  );

  const [animPopupClass, setAnimPopupClass] = useState(false);
  const [sortType, setSortType] = useState('modified');
  const [sortDirection, setSortDirection] = useState('desc');
  const [activeSortText, setActiveSortText] = useState(translation['TEXT_LAST_UPDATED']);
  const [isAnimating, setIsAnimating] = useState(false);

  const currOS = R2D.controller.getCurrentOS();
  const isCurrDeviceAPhone = currOS == 'iOS' || currOS == 'Android';

  const [sortedProjects, setSortedProjects] = useState([]);
  const [deletedId, setDeletedId] = useState(null);
  const prevProjectsRef = useRef([]);
  const [newProjectIds, setNewProjectIds] = useState([]);

  const onClickClose = (e) => {
    controlPanelData == 'constr' && dispatch(showTip({ name: 'constructorButtons' }));
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'projectsPopup' })), 500);
  };

  const onProjectCopy = async (item) => {
    const data = await R2D.controller.loadProjectData(item.hash);

    if (data?.type == 'error')
      return dispatch(setActivePopup({ name: 'alert', data: 'TEXT_ERROR_LOAD_DATA' }));

    const productsDataLoader = new R2D.ProductDataLoader();
    productsDataLoader.addEventListener(Event.COMPLETE, productsDataLoaderEventHandler);
    productsDataLoader.addEventListener(Event.ERROR, productsDataLoaderEventHandler);
    productsDataLoader.load([data?.uniqueMaterialsIds]);

    function productsDataLoaderEventHandler(e) {
      productsDataLoader.removeEventListener(Event.COMPLETE, productsDataLoaderEventHandler);
      productsDataLoader.removeEventListener(Event.ERROR, productsDataLoaderEventHandler);
      if (e.type == Event.COMPLETE) {
        const jsonString = productsDataLoader.data;
        let jsonObject = null;
        let parserResult = null;

        try {
          jsonObject = JSON.parse(jsonString);
        } catch (error) {
          console.error('Error parse JSON string!');
          console.log(jsonString);
          return;
        }

        if (!jsonObject.hasOwnProperty('status')) {
          console.error('Received object has no property "status"!');
          console.log(jsonObject);
          return dispatch(setActivePopup({ name: 'alert', data: 'TEXT_ERROR_LOAD_DATA' }));
        }
        if (jsonObject['status'] != 'ok') {
          console.error('Received status is not "success"!');
          console.log(jsonObject);
          return dispatch(setActivePopup({ name: 'alert', data: 'TEXT_ERROR_LOAD_DATA' }));
        }
        if (!jsonObject.hasOwnProperty('data')) {
          console.error('Received object has no property "products"!');
          console.log(jsonObject);
          return dispatch(setActivePopup({ name: 'alert', data: 'TEXT_ERROR_LOAD_DATA' }));
        }

        parserResult = R2D.ProductDataParser.parseJSON(jsonObject.data.items);

        let allPremiumPlanOfSceneObjects = new Set();
        let allElemsWithOwner = new Set();

        parserResult.concat(data.scene.products).forEach((i) => {
          Array.isArray(i.plan) && allPremiumPlanOfSceneObjects.add(i.plan[0]);
          i.isOwner && allElemsWithOwner.add(i.type);
        });
        allPremiumPlanOfSceneObjects = Array.from(allPremiumPlanOfSceneObjects);
        allElemsWithOwner = Array.from(allElemsWithOwner);
        const isThereObjectsWithOwnerThatDontMatchUserPremiumPlan =
          allElemsWithOwner.length > 0 &&
          (user.data.plan == 'free' ||
            (user.data.plan == 'basic' &&
              allElemsWithOwner.find((i) => i == R2D.ProductType.MODEL)));
        const isTherePremiumObjectThatDontMatchUserPremiumPlan =
          allPremiumPlanOfSceneObjects.length > 0 &&
          (user.data.plan == 'free' ||
            (user.data.plan == 'basic' && allPremiumPlanOfSceneObjects.find((i) => i == 'pro')));
        const neededPlan =
          allPremiumPlanOfSceneObjects.find((i) => i == 'pro') ||
          allElemsWithOwner.find((i) => i == R2D.ProductType.MODEL)
            ? 'pro'
            : allPremiumPlanOfSceneObjects.find((i) => i == 'basic') || allElemsWithOwner.length > 0
              ? 'basic'
              : 'free';

        if (user.data.maxProjects > 0 && user.data.projectCount >= user.data.maxProjects)
          dispatch(
            setActivePopup({
              name: 'upgradePlan',
              type: 'upgradeOverLimit',
              addData: { plan: neededPlan, action: { name: 'copy' } },
            })
          );
        else {
          if (
            isTherePremiumObjectThatDontMatchUserPremiumPlan ||
            isThereObjectsWithOwnerThatDontMatchUserPremiumPlan
          )
            dispatch(
              setActivePopup({
                name: 'upgradePlan',
                type: 'createNewPremiumProject',
                addData: { plan: neededPlan, action: { name: 'copy' } },
              })
            );
          else dispatch(setActivePopup({ name: 'setProjectName', data: item, type: 'copy' }));
        }
      } else {
        console.warn('R2D.Pool._loaderProductDataEventHandler: Error load data of product!');
      }
    }
  };

  const onProjectShare = (item) =>
    dispatch(setActivePopup({ name: 'share', type: 'listProject', data: item.hash }));

  const onProjectOpen = async (item) => {
    if (
      planner.scene.wasChanged() &&
      userData.autoSave &&
      R2D.controller.getProjectId() &&
      R2D.controller.getProjectUserKey() == user.getKey()
    ) {
      const result = await planner.scene.saveProject();
      if (result?.type == 'error')
        return dispatch(
          setActivePopup({ name: 'alert', data: result?.data || 'TEXT_ERROR_LOAD_DATA' })
        );
    }
    if (!planner.scene.wasChanged()) {
      planner.scene.clearSceneAutoSaveStorage();
      window.history.replaceState(null, null, createProjectUrl(item.hash));
      window.location.reload();
    } else {
      dispatch(setActivePopup({ name: 'saveBefore', type: 'open', data: item }));
    }
  };

  const onClickRename = async (item) => {
    dispatch(setActivePopup({ name: 'changeProjectName', data: item }));
  };
  const createNewProject = async (e) => {
    if (
      planner.scene.wasChanged() &&
      userData.autoSave &&
      R2D.controller.getProjectId() &&
      R2D.controller.getProjectUserKey() == user.getKey()
    ) {
      const result = await planner.scene.saveProject();
      if (result?.type == 'error')
        return dispatch(
          setActivePopup({ name: 'alert', data: result?.data || 'TEXT_ERROR_LOAD_DATA' })
        );
    }
    if (planner.scene.wasChanged()) {
      dispatch(setActivePopup({ name: 'saveBefore', type: 'createNew' }));
    } else {
      planner.scene.clearSceneAutoSaveStorage();
      window.history.replaceState(null, null, createProjectUrl(''));
      window.location.reload();
    }
  };

  const deleteProject = (item) =>
    dispatch(setActivePopup({ name: 'confirm', type: 'project_delete', data: item }));

  const onEnterItem = (e) => e.currentTarget.classList.add(classes.planner_popup_proj_hover);
  const onLeaveItem = (e) => e.currentTarget.classList.remove(classes.planner_popup_proj_hover);

  const onTouchStartItem = (e) => {
    document.removeEventListener('touchstart', onTouchStartHideItem);
    setTimeout(() => document.addEventListener('touchstart', onTouchStartHideItem), 0);
    if (!e.target.closest('.' + classes.planner_popup_proj))
      e.currentTarget.classList.toggle(classes.planner_popup_proj_hover);
  };

  const onTouchStartHideItem = (e) => {
    document
      .querySelector('.' + classes.planner_popup_proj_hover)
      ?.classList.remove(classes.planner_popup_proj_hover);
    document.removeEventListener('touchstart', onTouchStartItem);
  };

  const onScrollItemsWrap = (e) => {
    const el = e.target;
    if (
      el.scrollTop + el.offsetHeight >= el.scrollHeight - 10 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      el.removeEventListener('scroll', onScrollItemsWrap);
      fetchNextPage();
    }
  };

  const getSortedProjects = () => {
    const arr = [...projectsData];
    arr.sort((a, b) => {
      const valA = new Date(a[sortType]);
      const valB = new Date(b[sortType]);
      return sortDirection === 'asc' ? valA - valB : valB - valA;
    });
    return arr;
  };

  useEffect(() => {
    const timer = setTimeout(() => setAnimPopupClass(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const el = scrollRef.current?.getScrollElement?.();
    if (el && sortedProjects?.length > 0 && hasNextPage) {
      el.addEventListener('scroll', onScrollItemsWrap);
      return () => el.removeEventListener('scroll', onScrollItemsWrap);
    }
  }, [sortedProjects.length, hasNextPage]);

  useEffect(() => {
    const prevProjects = prevProjectsRef.current;

    let isDeletion = false;
    let deletedProjectId = null;

    if (prevProjects.length > projectsData.length) {
      const deleted = prevProjects.find((prev) => !projectsData.some((p) => p.id === prev.id));

      if (deleted) {
        deletedProjectId = deleted.id;
        isDeletion = true;
      }
    }
    let isAddition = false;
    let addedProjectIds = [];

    if (prevProjects.length < projectsData.length) {
      addedProjectIds = projectsData
        .filter((p) => !prevProjects.some((prev) => prev.id === p.id))
        .map((p) => p.id);

      if (addedProjectIds.length > 0) {
        isAddition = true;
      }
    }

    prevProjectsRef.current = projectsData;

    if (isDeletion) {
      setDeletedId(deletedProjectId);
      setIsAnimating(false);
      const sorted = getSortedProjects();
      setSortedProjects(sorted);

      const timer = setTimeout(() => {
        setDeletedId(null);
      }, 300);

      return () => clearTimeout(timer);
    } else if (isAddition) {
      setIsAnimating(false);
      const sorted = getSortedProjects();
      setSortedProjects(sorted);
      setNewProjectIds(addedProjectIds);
      const timer = setTimeout(() => {
        setNewProjectIds([]);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setIsAnimating(true);

      const timer = setTimeout(() => {
        const sorted = getSortedProjects();
        setSortedProjects(sorted);
        setIsAnimating(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [projectsData, sortType, sortDirection]);

  return (
    <div
      className={
        animPopupClass
          ? classes.planner_popup_wrap + ' ' + classes.planner_popup_wrap_show
          : classes.planner_popup_wrap
      }
      style={{ zIndex: popups.projectsPopup.zIndex }}
    >
      <div className={classes.planner_popup_wr}>
        <div className={classes.planner_popup_close} onClick={onClickClose}>
          <svg
            width="25"
            height="25"
            fill="none"
            viewBox="0 0 25 25"
            className={classes.planner_popup_close_icon}
          >
            <path
              fill="#2F2F2F"
              fillRule="evenodd"
              d="M.102 1.417 1.22.329l12.34 12.07-.007.006v.002l-.23.221-.88.858-.005-.005L1.172 24.329.064 23.233l11.259-10.842L.103 1.417Z"
              clipRule="evenodd"
            />
            <path
              fill="#2F2F2F"
              fillRule="evenodd"
              d="M.102 1.417 1.22.329l12.34 12.07-.007.006v.002l-.23.221-.88.858-.005-.005L1.172 24.329.064 23.233l11.259-10.842L.103 1.417Z"
              clipRule="evenodd"
            />
            <path
              fill="#2F2F2F"
              fillRule="evenodd"
              d="M24.73 1.417 23.613.329 11.273 12.4l.008.006-.002.002.23.221.881.858.005-.005L23.66 24.329l1.108-1.096L13.51 12.391 24.73 1.417Z"
              clipRule="evenodd"
            />
            <path
              fill="#2F2F2F"
              fillRule="evenodd"
              d="M24.73 1.417 23.613.329 11.273 12.4l.008.006-.002.002.23.221.881.858.005-.005L23.66 24.329l1.108-1.096L13.51 12.391 24.73 1.417Z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <div className={classes.planner_popup_cont}>
          <div className={classes.planner_popup_top}>
            <div className={classes.planner_popup_title_wr}>
              <div className={classes.planner_popup_title}>
                {translation['BUTTON_WELCOOME_SHOW_PROJECTS']}
              </div>
            </div>
            <div className={classes.planner_popup_info}>
              <div>
                <div className={classes.planner_popup_text}>
                  {translation['PROJECT_USED']} <span>{userData?.projectCount} </span>
                  {userData?.plan == 'free' ? (
                    <p>
                      {translation['PROJECT_USED_OF']} <span>3</span>
                    </p>
                  ) : null}
                </div>
                {userData?.plan == 'free' ? (
                  <div className={classes.planner_popup_text}>
                    <a
                      className={classes.planner_popup_link}
                      onClick={(e) => dispatch(setActivePopup({ name: 'payPro', type: 'user' }))}
                    >
                      {translation['UPGRADE_USER_PLAN']}
                    </a>
                    ,{translation['UPGRADE_TO_GET_MORE_END_TEXT']}
                  </div>
                ) : null}
              </div>

              <div className={classes.planner_popup_fil_wr}>
                <div className={classes.bar_dropdown_wrap}>
                  <div className={classes.bar_dropdown_active}>
                    {activeSortText}
                    <svg width="11" height="7" fill="none" viewBox="0 0 11 7">
                      <path
                        fill="#555"
                        fillRule="evenodd"
                        d="m9.514 1.18.408.414-4.526 4.57-.408-.413.003-.003L.92 1.575l.412-.41L5.4 5.335l4.114-4.154Z"
                        clipRule="evenodd"
                      />
                      <path
                        fill="#555"
                        d="m9.922 1.594.142-.14.14.14-.14.141-.142-.14Zm-.408-.413-.142-.141.142-.144.142.144-.142.14ZM5.396 6.165l.142.14-.142.144-.142-.144.142-.14Zm-.408-.414-.142.14-.139-.14.139-.14.142.14Zm.003-.003.143-.14.137.141-.138.14-.142-.14ZM.92 1.575l-.142.14-.138-.142.14-.14.14.142Zm.412-.41-.141-.142.143-.143.141.145-.143.14ZM5.4 5.335l.142.141-.143.145-.143-.146.144-.14Zm4.38-3.6-.408-.414.284-.28.408.413-.285.28ZM5.253 6.024l4.526-4.57.284.281-4.526 4.57-.284-.281ZM5.13 5.61l.407.413-.284.281-.408-.414.285-.28Zm.002.278-.003.003-.284-.282.003-.003.284.282Zm-.285-.001L.778 1.715l.287-.28 4.07 4.174-.287.279ZM.78 1.433l.41-.41.283.283-.41.41-.283-.283Zm.695-.408 4.067 4.17-.287.28-4.066-4.17.286-.28Zm8.18.296L5.542 5.476l-.284-.281L9.372 1.04l.284.281Z"
                      />
                    </svg>
                  </div>
                  <div className={classes.bar_dropdown_option_wrap}>
                    <div className={classes.bar_dropdown_option_wr}>
                      <div
                        className={classes.bar_dropdown_option}
                        onClick={(e) => {
                          setSortType('opened');
                          setActiveSortText(e.currentTarget.textContent);
                        }}
                      >
                        {translation['TEXT_CREATED']}
                      </div>
                      <div
                        className={classes.bar_dropdown_option}
                        onClick={(e) => {
                          setSortType('modified');
                          setActiveSortText(e.currentTarget.textContent);
                        }}
                      >
                        {' '}
                        {translation['TEXT_LAST_UPDATED']}
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={classes.planner_popup_fil_sort_btn}
                  onClick={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                >
                  {sortDirection == 'desc' ? (
                    <svg width="15" height="11" fill="none" viewBox="0 0 15 11">
                      <path
                        fill="#555"
                        d="M1.01 7.737a.48.48 0 0 0-.011.68l2.004 2.012c-.06-.026.044.046 0 0 .059.025.128.115.192.115.065 0 .123-.09.182-.115-.044.046.06-.026 0 0l2.005-2.013a.48.48 0 1 0-.69-.668L3.67 8.802V1.126a.48.48 0 1 0-.96 0v7.675L1.629 7.708c-.089-.091-.15-.104-.278-.106a.48.48 0 0 0-.342.135Zm11.8-3.658a.48.48 0 0 0-.48-.48H7.12a.48.48 0 0 0 0 .96h5.21a.48.48 0 0 0 .48-.48Zm-1.498 2.954a.48.48 0 0 0-.48-.48H7.119a.48.48 0 0 0 0 .96h3.713a.48.48 0 0 0 .48-.48ZM7.12 9.507a.48.48 0 1 0 0 .96h2.215a.48.48 0 0 0 0-.96H7.119ZM13.83.646H7.12a.48.48 0 0 0 0 .96h6.71a.48.48 0 1 0 0-.96Z"
                      />
                    </svg>
                  ) : (
                    <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
                      <path
                        d="M1.00924 3.76432C0.917802 3.67568 0.865321 3.55435 0.863339 3.42701C0.861358 3.29968 0.91004 3.17677 0.998675 3.08533L3.00269 1.073C2.94348 1.0983 3.04721 1.02648 3.00269 1.073C3.06191 1.04771 3.13092 0.957581 3.19531 0.957581C3.2597 0.957581 3.31814 1.04771 3.37735 1.073C3.33284 1.02648 3.43657 1.0983 3.37735 1.073L5.38185 3.08533C5.42781 3.13014 5.46432 3.18371 5.48922 3.24287C5.51412 3.30203 5.52691 3.36558 5.52683 3.42976C5.52675 3.49395 5.5138 3.55747 5.48875 3.61656C5.4637 3.67566 5.42706 3.72914 5.38098 3.77383C5.33491 3.81852 5.28035 3.85352 5.22052 3.87676C5.16069 3.9 5.0968 3.91101 5.03264 3.90914C4.96848 3.90727 4.90535 3.89256 4.84698 3.86587C4.7886 3.83918 4.73617 3.80106 4.69278 3.75376L3.66997 2.70022V10.3756C3.66997 10.5029 3.61938 10.6251 3.52933 10.7151C3.43928 10.8052 3.31714 10.8558 3.18978 10.8558C3.06243 10.8558 2.94029 10.8052 2.85024 10.7151C2.76018 10.6251 2.70959 10.5029 2.70959 10.3756V2.7007L1.62891 3.79352C1.54027 3.88495 1.47826 3.89768 1.35092 3.89966C1.22359 3.90164 1.10068 3.85296 1.00924 3.76432ZM12.8104 7.42241C12.8104 7.54977 12.7598 7.6719 12.6698 7.76196C12.5797 7.85201 12.4576 7.9026 12.3302 7.9026H7.11918C6.99183 7.9026 6.86969 7.85201 6.77964 7.76196C6.68958 7.6719 6.63899 7.54977 6.63899 7.42241C6.63899 7.29506 6.68958 7.17292 6.77964 7.08287C6.86969 6.99281 6.99183 6.94222 7.11918 6.94222H12.3302C12.4576 6.94222 12.5797 6.99281 12.6698 7.08287C12.7598 7.17292 12.8104 7.29506 12.8104 7.42241ZM11.3122 4.46924C11.3122 4.59659 11.2616 4.71873 11.1716 4.80879C11.0815 4.89884 10.9594 4.94943 10.832 4.94943H7.11918C6.99183 4.94943 6.86969 4.89884 6.77964 4.80879C6.68958 4.71873 6.63899 4.59659 6.63899 4.46924C6.63899 4.34189 6.68958 4.21975 6.77964 4.12969C6.86969 4.03964 6.99183 3.98905 7.11918 3.98905H10.832C10.9594 3.98905 11.0815 4.03964 11.1716 4.12969C11.2616 4.21975 11.3122 4.34189 11.3122 4.46924ZM7.11918 1.99434C6.99183 1.99434 6.86969 1.94375 6.77964 1.85369C6.68958 1.76364 6.63899 1.6415 6.63899 1.51415C6.63899 1.38679 6.68958 1.26466 6.77964 1.1746C6.86969 1.08455 6.99183 1.03396 7.11918 1.03396H9.33382C9.46117 1.03396 9.58331 1.08455 9.67337 1.1746C9.76342 1.26466 9.81401 1.38679 9.81401 1.51415C9.81401 1.6415 9.76342 1.76364 9.67337 1.85369C9.58331 1.94375 9.46117 1.99434 9.33382 1.99434H7.11918ZM13.8284 10.8558H7.11918C6.99183 10.8558 6.86969 10.8052 6.77964 10.7151C6.68958 10.6251 6.63899 10.5029 6.63899 10.3756C6.63899 10.2482 6.68958 10.1261 6.77964 10.036C6.86969 9.94598 6.99183 9.89539 7.11918 9.89539H13.8284C13.9558 9.89539 14.0779 9.94598 14.1679 10.036C14.258 10.1261 14.3086 10.2482 14.3086 10.3756C14.3086 10.5029 14.258 10.6251 14.1679 10.7151C14.0779 10.8052 13.9558 10.8558 13.8284 10.8558Z"
                        fill="#555555"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M5.07266 3.84301L5.48047 3.42947L3.18851 1.11505L2.7807 1.52859L2.78301 1.53092L0.929688 3.4317L1.34065 3.84202L3.19168 1.94359L5.07266 3.84301Z"
                        fill="#555555"
                      />
                      <path
                        d="M5.48047 3.42947L5.62287 3.5699L5.76165 3.42918L5.62258 3.28874L5.48047 3.42947ZM5.07266 3.84301L4.93056 3.98374L5.07296 4.12755L5.21507 3.98344L5.07266 3.84301ZM3.18851 1.11505L3.33062 0.974321L3.18821 0.830516L3.0461 0.974621L3.18851 1.11505ZM2.7807 1.52859L2.6383 1.38816L2.49953 1.52888L2.63859 1.66932L2.7807 1.52859ZM2.78301 1.53092L2.92621 1.67054L3.0634 1.52983L2.92512 1.39019L2.78301 1.53092ZM0.929688 3.4317L0.78649 3.29208L0.648513 3.43359L0.788377 3.57323L0.929688 3.4317ZM1.34065 3.84202L1.19934 3.98356L1.34256 4.12655L1.48385 3.98165L1.34065 3.84202ZM3.19168 1.94359L3.33379 1.80286L3.19057 1.65824L3.04848 1.80397L3.19168 1.94359ZM5.33806 3.28904L4.93026 3.70258L5.21507 3.98344L5.62287 3.5699L5.33806 3.28904ZM3.0464 1.25578L5.33836 3.5702L5.62258 3.28874L3.33062 0.974321L3.0464 1.25578ZM2.92311 1.66902L3.33091 1.25548L3.0461 0.974621L2.6383 1.38816L2.92311 1.66902ZM2.92512 1.39019L2.92282 1.38786L2.63859 1.66932L2.64089 1.67164L2.92512 1.39019ZM2.63981 1.3913L0.78649 3.29208L1.07289 3.57132L2.92621 1.67054L2.63981 1.3913ZM0.788377 3.57323L1.19934 3.98356L1.48196 3.70049L1.071 3.29017L0.788377 3.57323ZM1.48385 3.98165L3.33488 2.08322L3.04848 1.80397L1.19746 3.7024L1.48385 3.98165ZM5.21477 3.70228L3.33379 1.80286L3.04957 2.08432L4.93056 3.98374L5.21477 3.70228Z"
                        fill="#555555"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className={classes.planner_popup_scroll}>
            {isLoading ? (
              <div className={classes.preloader_projects + ' preloader'}>
                <div className="preloader-cube"></div>
              </div>
            ) : null}
            <SimpleBar style={{ height: '100%' }} autoHide={false} forceVisible="y" ref={scrollRef}>
              <div className={classes.planner_popup_projects}>
                {!isCurrDeviceAPhone ? (
                  <div className={classes.planner_popup_proj_add} onClick={createNewProject}>
                    <svg
                      width="26"
                      height="26"
                      fill="none"
                      viewBox="0 0 26 26"
                      className={classes.planner_popup_item_add_img}
                    >
                      <rect
                        width="2.977"
                        height="25"
                        x="11.506"
                        y=".209"
                        fill="#2E3839"
                        rx="1.488"
                      ></rect>
                      <rect
                        width="2.977"
                        height="25"
                        x="25.494"
                        y="11.221"
                        fill="#2E3839"
                        rx="1.488"
                        transform="rotate(90 25.494 11.221)"
                      ></rect>
                    </svg>
                    {translation['TEXT_NEW_PLAN']}
                  </div>
                ) : null}

                <AnimatePresence mode="popLayout">
                  {!isAnimating
                    ? sortedProjects.map(
                        (item) =>
                          item.id !== deletedId && (
                            <motion.div
                              key={item.id}
                              initial={
                                newProjectIds.includes(item.id) ? { transform: 'scale(0)' } : false
                              }
                              animate={{ transform: 'scale(1)' }}
                              exit={{ transform: 'scale(0)' }}
                              transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                              className={classes.planner_popup_proj}
                              onMouseLeave={onLeaveItem}
                              onMouseEnter={onEnterItem}
                              onTouchStart={onTouchStartItem}
                            >
                              <div className={classes.planner_popup_proj_img_wr}>
                                <img
                                  className={classes.planner_popup_proj_img}
                                  src={
                                    item.preview
                                      ? R2D.URL.DOMAIN + item.preview
                                      : '/src_designer/images/no_preview_image.png'
                                  }
                                />
                                <div className={classes.planner_popup_proj_btns_wr}>
                                  <div
                                    className={classes.planner_popup_proj_btn}
                                    onClick={(e) => onProjectOpen(item)}
                                  >
                                    <svg width="25" height="25" fill="none" viewBox="0 0 25 25">
                                      <path
                                        fill="#fff"
                                        d="M.879 24.429v-20h2v20h-2Zm21 0v-11h2v11h-2Zm0 0h-19v-2h19v2Z"
                                      />
                                      <path fill="#fff" d="M6.879 6.429h-4v-2h4v2Z" />
                                      <path
                                        fill="#fff"
                                        fillRule="evenodd"
                                        d="M17.842 1.26 18.945.186l5.356 5.238-.006.006.037.037-5.477 5.274-1.094-1.083 3.353-3.229h-7.227v9h-2v-11h9.195l-3.24-3.169Z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    <div className={classes.planner_popup_proj_btn_text}>
                                      {translation['BUTTON_OPEN_PLAN']}
                                    </div>
                                  </div>
                                  <div
                                    className={classes.planner_popup_proj_btn}
                                    onClick={(e) => onProjectCopy(item)}
                                  >
                                    <svg width="22" height="27" fill="none" viewBox="0 0 22 27">
                                      <path
                                        fill="#fff"
                                        d="M6.125 5.307h15v21h-15zm-6-5h15v2h-15v-2Zm0 19h6v2h-6v-2Z"
                                      />
                                      <path
                                        fill="#fff"
                                        d="M.125 19.307v-17h2v17h-2Zm13-14v-3h2v3h-2Z"
                                      />
                                    </svg>
                                    <div className={classes.planner_popup_proj_btn_text}>
                                      {translation['BUTTON_COPY_PLAN']}{' '}
                                    </div>
                                  </div>
                                  <div
                                    className={classes.planner_popup_proj_btn}
                                    onClick={(e) => onClickRename(item)}
                                  >
                                    <svg width="27" height="27" fill="none" viewBox="0 0 27 27">
                                      <path
                                        fill="#fff"
                                        fillRule="evenodd"
                                        d="M22.733 26.164V.45h2.005v25.712h-2.005Z"
                                        clipRule="evenodd"
                                      />
                                      <path
                                        fill="#fff"
                                        fillRule="evenodd"
                                        d="M21.104.406h5.271V2.41h-5.271V.406Zm-.035 24.274h5.27v2.006h-5.27v-2.005Zm-.01-20.93H.859v19.114h20.2v-1.607H2.466v-15.9H21.06V3.748Zm2.26 19.114h.001V3.75h-.002v19.115Z"
                                        clipRule="evenodd"
                                      />
                                      <path
                                        fill="#fff"
                                        d="M9.12 17.028v-3.647c0-.263-.044-.487-.13-.674a.957.957 0 0 0-.4-.446c-.177-.106-.407-.16-.69-.16-.241 0-.45.044-.627.13a.91.91 0 0 0-.409.355.983.983 0 0 0-.144.537H4.54c0-.348.081-.678.243-.991.161-.313.396-.588.704-.825a3.474 3.474 0 0 1 1.097-.567 4.737 4.737 0 0 1 1.438-.205c.635 0 1.2.106 1.695.318.494.212.883.53 1.165.954.288.423.432.953.432 1.589v3.503c0 .45.027.818.083 1.105.055.283.136.53.242.742v.129H9.437a3.147 3.147 0 0 1-.242-.833 6.86 6.86 0 0 1-.076-1.014Zm.287-3.14.015 1.233H8.203c-.287 0-.537.033-.749.098a1.396 1.396 0 0 0-.522.28 1.083 1.083 0 0 0-.303.41 1.42 1.42 0 0 0-.09.514c0 .186.042.355.128.507.086.146.21.262.371.348.161.08.35.121.568.121.328 0 .613-.066.855-.197.242-.13.429-.292.56-.484.136-.192.207-.373.212-.545l.575.923a3.74 3.74 0 0 1-.333.643c-.136.223-.31.432-.522.629-.212.191-.467.35-.765.476-.297.121-.65.182-1.06.182-.519 0-.99-.103-1.414-.31a2.58 2.58 0 0 1-1-.87 2.285 2.285 0 0 1-.362-1.272c0-.429.08-.81.242-1.143a2.23 2.23 0 0 1 .711-.84c.318-.232.714-.406 1.188-.522a6.705 6.705 0 0 1 1.65-.181h1.264Zm3.587-6.637h2.18v9.747l-.22 1.877h-1.96V7.25Zm7.363 7.446v.16c0 .61-.066 1.17-.197 1.68-.126.509-.323.95-.59 1.324a2.83 2.83 0 0 1-1 .862c-.393.202-.857.303-1.392.303-.499 0-.933-.1-1.301-.303a2.643 2.643 0 0 1-.916-.855 4.862 4.862 0 0 1-.598-1.294 9.857 9.857 0 0 1-.34-1.62v-.347a9.82 9.82 0 0 1 .34-1.62c.152-.494.351-.926.598-1.294s.553-.653.916-.855c.363-.202.792-.303 1.286-.303.54 0 1.01.104 1.408.31.403.202.736.49.999.863.267.368.464.807.59 1.317a6.64 6.64 0 0 1 .197 1.672Zm-2.18.16v-.16a5.53 5.53 0 0 0-.075-.938 2.48 2.48 0 0 0-.242-.78 1.368 1.368 0 0 0-.477-.537c-.197-.13-.452-.197-.764-.197-.298 0-.55.051-.757.152-.207.1-.379.242-.515.424a1.93 1.93 0 0 0-.295.65 3.95 3.95 0 0 0-.121.818v.991c.015.399.08.752.197 1.06.12.302.302.542.544.718.248.172.568.258.962.258.307 0 .562-.06.764-.182a1.23 1.23 0 0 0 .47-.515c.115-.221.196-.481.241-.779.046-.303.068-.63.068-.984Z"
                                      />
                                    </svg>
                                    <div className={classes.planner_popup_proj_btn_text}>
                                      {translation['BUTTON_RENAME_SCENE']}
                                    </div>
                                  </div>
                                  <div
                                    className={classes.planner_popup_proj_btn}
                                    onClick={(e) => onProjectShare(item)}
                                  >
                                    <svg width="24" height="29" fill="none" viewBox="0 0 24 29">
                                      <path
                                        fill="#fff"
                                        fillRule="evenodd"
                                        d="M23.167 4.45a4.107 4.107 0 0 1-7.145 2.764L8.039 12.66c.22.504.343 1.061.343 1.646 0 .415-.061.815-.175 1.192l8.157 5.567a4.107 4.107 0 1 1-1 1.306L7.419 16.95a4.107 4.107 0 1 1-.327-5.632L15.18 5.8a4.107 4.107 0 1 1 7.988-1.35Z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    <div className={classes.planner_popup_proj_btn_text}>
                                      {translation['BUTTON_SHARE_PLAN']}
                                    </div>
                                  </div>
                                  <div
                                    className={classes.planner_popup_proj_btn}
                                    onClick={(e) => deleteProject(item)}
                                  >
                                    <svg width="24" height="31.38" viewBox="0 0 13 17" fill="none">
                                      <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M5.10547 0.164063V0.164083H7.50437V0.164062L7.98438 0.164063V0.164083H7.985V0.644083H7.98438V1.60406H7.50437V0.644083H5.10547L5.10547 1.60406H4.62547L4.62547 0.644083H4.625V0.164083H4.62547V0.164062L5.10547 0.164063Z"
                                        fill="#AF3131"
                                      ></path>
                                      <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M5.10547 0.164063V0.164083H7.50437V0.164062L7.98438 0.164063V0.164083H7.985V0.644083H7.98438V1.60406H7.50437V0.644083H5.10547L5.10547 1.60406H4.62547L4.62547 0.644083H4.625V0.164083H4.62547V0.164062L5.10547 0.164063Z"
                                        fill="#AF3131"
                                      ></path>
                                      <path
                                        d="M0.304688 2.08355C4.24869 1.13699 8.36069 1.13699 12.3047 2.08355V3.04355H0.304688V2.08355Z"
                                        fill="#AF3131"
                                      ></path>
                                      <path
                                        d="M0.304688 2.08355C4.24869 1.13699 8.36069 1.13699 12.3047 2.08355V3.04355H0.304688V2.08355Z"
                                        fill="#AF3131"
                                      ></path>
                                      <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M10.8656 3.52344H1.26562V15.725C1.26562 16.1436 1.60355 16.4834 2.0197 16.4834H10.5915C11.0077 16.4834 11.3456 16.1436 11.3456 15.725V3.52344H10.8656ZM9.9068 5.20383C9.9068 4.80639 9.58424 4.48383 9.1868 4.48383C8.78936 4.48383 8.4668 4.80639 8.4668 5.20383V13.3638C8.4668 13.7613 8.78936 14.0838 9.1868 14.0838C9.58424 14.0838 9.9068 13.7613 9.9068 13.3638V5.20383ZM6.30594 4.48384C6.70338 4.48384 7.02594 4.8064 7.02594 5.20384V13.3638C7.02594 13.7613 6.70338 14.0838 6.30594 14.0838C5.9085 14.0838 5.58594 13.7613 5.58594 13.3638V5.20384C5.58594 4.8064 5.9085 4.48384 6.30594 4.48384ZM4.14508 5.20383C4.14508 4.80639 3.82252 4.48383 3.42508 4.48383C3.02764 4.48383 2.70508 4.80639 2.70508 5.20383V13.3638C2.70508 13.7613 3.02764 14.0838 3.42508 14.0838C3.82252 14.0838 4.14508 13.7613 4.14508 13.3638V5.20383Z"
                                        fill="#AF3131"
                                      ></path>
                                      <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M10.8656 3.52344H1.26562V15.725C1.26562 16.1436 1.60355 16.4834 2.0197 16.4834H10.5915C11.0077 16.4834 11.3456 16.1436 11.3456 15.725V3.52344H10.8656ZM9.9068 5.20383C9.9068 4.80639 9.58424 4.48383 9.1868 4.48383C8.78936 4.48383 8.4668 4.80639 8.4668 5.20383V13.3638C8.4668 13.7613 8.78936 14.0838 9.1868 14.0838C9.58424 14.0838 9.9068 13.7613 9.9068 13.3638V5.20383ZM6.30594 4.48384C6.70338 4.48384 7.02594 4.8064 7.02594 5.20384V13.3638C7.02594 13.7613 6.70338 14.0838 6.30594 14.0838C5.9085 14.0838 5.58594 13.7613 5.58594 13.3638V5.20384C5.58594 4.8064 5.9085 4.48384 6.30594 4.48384ZM4.14508 5.20383C4.14508 4.80639 3.82252 4.48383 3.42508 4.48383C3.02764 4.48383 2.70508 4.80639 2.70508 5.20383V13.3638C2.70508 13.7613 3.02764 14.0838 3.42508 14.0838C3.82252 14.0838 4.14508 13.7613 4.14508 13.3638V5.20383Z"
                                        fill="#AF3131"
                                      ></path>
                                    </svg>
                                    <div className={classes.planner_popup_proj_btn_text}>
                                      {translation['BUTTON_DELETE_PLAN']}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className={classes.planner_popup_proj_info}>
                                <div className={classes.planner_popup_proj_title}> {item.name}</div>
                                <div className={classes.planner_popup_proj_content}>
                                  <div className={classes.planner_popup_proj_id}>
                                    ID:
                                    <p>{item.id}</p>
                                  </div>
                                  <div className={classes.planner_popup_proj_modified}>
                                    <svg width="17" height="16" fill="none" viewBox="0 0 17 16">
                                      <path
                                        fill="#7B7B7B"
                                        fillRule="evenodd"
                                        d="m3.306 15.27-.879-.012-.047-4.275h.006v-.03l4.338.082.005.88-3.461-.066.038 3.42Z"
                                        clipRule="evenodd"
                                      />
                                      <path
                                        fill="#7B7B7B"
                                        fillRule="evenodd"
                                        d="m3.306 15.27-.879-.012-.047-4.275h.006v-.03l4.338.082.005.88-3.461-.066.038 3.42Z"
                                        clipRule="evenodd"
                                      />
                                      <path
                                        fill="#7B7B7B"
                                        fillRule="evenodd"
                                        d="M7.502 1.078a7.382 7.382 0 0 0-2.191.981L6 2.973a6.246 6.246 0 0 1 1.773-.785l-.27-1.11Zm1.243.931A6.278 6.278 0 1 1 3.8 11.102l-1.263-.015a7.422 7.422 0 0 0 14.279-2.833A7.42 7.42 0 0 0 8.754.862l-.009 1.147Zm-4.73 1.137.966.645a6.287 6.287 0 0 0-1.405 2.105l-1.04-.473a7.4 7.4 0 0 1 1.479-2.277ZM2.104 6.877l1.117.239a6.315 6.315 0 0 0 .06 2.565H2.114a7.457 7.457 0 0 1-.01-2.804Z"
                                        clipRule="evenodd"
                                      />
                                      <path fill="#7B7B7B" d="M8.816 3.229h1.427v5.137H8.816z" />
                                      <path
                                        fill="#7B7B7B"
                                        d="m13.45 10.876-1.008 1.01-3.633-3.633 1.01-1.01z"
                                      />
                                    </svg>
                                    <span>{translation['TEXT_MODIFIED']}:</span> {item.modified}
                                  </div>
                                  {item.opened.substring(0, 10) != '0000-00-00' ? (
                                    <div className={classes.planner_popup_proj_info_created}>
                                      <svg width="16" height="17" fill="none" viewBox="0 0 16 17">
                                        <path
                                          fill="#7B7B7B"
                                          d="M.385 4.706a3.018 3.018 0 0 1 3.014-2.828h.777v-.603a.604.604 0 0 1 1.207 0v.603h4.827v-.603a.603.603 0 0 1 1.207 0v.603h.777a3.018 3.018 0 0 1 3.014 2.828 74.009 74.009 0 0 1-.01 8.992 3.021 3.021 0 0 1-2.823 2.824 73.783 73.783 0 0 1-9.156 0 3.021 3.021 0 0 1-2.823-2.824 74.006 74.006 0 0 1-.011-8.992ZM1.6 13.623a1.812 1.812 0 0 0 1.694 1.694c2.987.186 6.018.186 9.006 0a1.812 1.812 0 0 0 1.693-1.694c.142-2.303.174-4.61.096-6.917H1.504a72.905 72.905 0 0 0 .096 6.917Zm9.214-9.33a.604.604 0 0 1-.604-.604v-.604H5.383v.604a.603.603 0 1 1-1.207 0v-.604h-.777a1.81 1.81 0 0 0-1.81 1.693c-.013.24-.02.481-.031.721h12.477c-.012-.24-.018-.48-.032-.72a1.81 1.81 0 0 0-1.81-1.694h-.775v.604a.604.604 0 0 1-.604.603Z"
                                        />
                                        <path
                                          fill="#7B7B7B"
                                          d="M10.813 10.327a.905.905 0 1 1 0-1.81.905.905 0 0 1 0 1.81Zm-3.015 0a.905.905 0 1 1 0-1.81.905.905 0 0 1 0 1.81Zm3.015 3.018a.905.905 0 1 1 0-1.81.905.905 0 0 1 0 1.81Zm-6.035-3.018a.905.905 0 1 1 0-1.81.905.905 0 0 1 0 1.81Zm0 3.018a.905.905 0 1 1 0-1.81.905.905 0 0 1 0 1.81Zm3.02 0a.905.905 0 1 1 0-1.81.905.905 0 0 1 0 1.81Z"
                                        />
                                      </svg>
                                      <span>{translation['TEXT_CREATED']}:</span>{' '}
                                      {item.opened.substring(0, 10)}
                                    </div>
                                  ) : null}
                                </div>
                              </div>

                              {item.userPlan != 'free' ? (
                                <div className={classes.planner_popup_proj_pro_proekt}>
                                  {item.userPlan}
                                </div>
                              ) : null}
                            </motion.div>
                          )
                      )
                    : null}
                </AnimatePresence>
              </div>
            </SimpleBar>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPopup;
