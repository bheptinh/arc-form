import 'simplebar-react/dist/simplebar.min.css';

import {
  IconCopyFilled,
  IconEdit,
  IconFileSymlink,
  IconPlus,
  IconShare,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';

import { useTranslation } from '../../api/hooks/useTranslation';
import { deleteProject, projectsInfiniteQueryOptions } from '../../api/projects';
import { planner, user } from '../../initR2D';
import { selectControlPanelData } from '../../redux/features/control/controlPanelSlice';
import {
  closeActivePopup,
  selectPopups,
  setActivePopup,
} from '../../redux/features/popups/popupsSlice';
import { showTip } from '../../redux/features/tips/tipsSlice';
import { selectUserProfileData } from '../../redux/features/user/userSlice';
import { Card } from '../../shared-components/Card';
import { SortBar } from '../../shared-components/SortBar';
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
  const queryClient = useQueryClient();

  const {
    data: projectsQueryData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery(projectsInfiniteQueryOptions);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: projectsInfiniteQueryOptions.queryKey }),
  });
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
          <IconX size={24} color="#2F2F2F" className={classes.planner_popup_close_icon} />
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

              <SortBar
                options={[
                  { value: 'opened', label: translation['TEXT_CREATED'] },
                  { value: 'modified', label: translation['TEXT_LAST_UPDATED'] },
                ]}
                activeLabel={activeSortText}
                direction={sortDirection as 'asc' | 'desc'}
                onOptionSelect={(opt) => {
                  setSortType(opt.value);
                  setActiveSortText(opt.label);
                }}
                onDirectionToggle={() =>
                  setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
                }
              />
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
                    <IconPlus
                      className={classes.planner_popup_item_add_img}
                      size={24}
                      color="#2F2F2F"
                    />
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
                            >
                              <Card
                                name={item.name}
                                preview={item.preview ? R2D.URL.DOMAIN + item.preview : undefined}
                                modified={item.modified}
                                created={item.opened}
                                userPlan={item.userPlan}
                                onClick={() => onProjectOpen(item)}
                                actions={[
                                  {
                                    icon: <IconFileSymlink size={25} color="#fff" />,
                                    label: translation['BUTTON_OPEN_PLAN'],
                                    onClick: () => onProjectOpen(item),
                                  },
                                  {
                                    icon: <IconCopyFilled size={25} color="#fff" />,
                                    label: translation['BUTTON_COPY_PLAN'],
                                    onClick: () => onProjectCopy(item),
                                  },
                                  {
                                    icon: <IconEdit size={25} color="#fff" />,
                                    label: translation['BUTTON_RENAME_SCENE'],
                                    onClick: () => onClickRename(item),
                                  },
                                  {
                                    icon: <IconShare size={25} color="#fff" />,
                                    label: translation['BUTTON_SHARE_PLAN'],
                                    onClick: () => onProjectShare(item),
                                  },
                                  {
                                    icon: <IconTrash size={25} color="#AF3131" />,
                                    label: translation['BUTTON_DELETE_PLAN'],
                                    onClick: () => deleteMutation.mutate(item.id),
                                  },
                                ]}
                              />
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
