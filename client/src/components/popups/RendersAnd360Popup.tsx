import 'simplebar-react/dist/simplebar.min.css';

import {
  IconCalendarMonth,
  IconClock,
  IconDownload,
  IconFileSymlink,
  IconPlus,
  IconRotateClockwise2,
  IconShare,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import React, { useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';

import { useLanguages } from '../../api/hooks/useLanguages';
import { useTranslation } from '../../api/hooks/useTranslation';
import { planner, user } from '../../initR2D';
import {
  closeActivePopup,
  selectPopups,
  setActivePopup,
} from '../../redux/features/popups/popupsSlice';
import { historyUpdate } from '../../redux/features/viewMode/viewModeSlice_legacy';

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
    },
  },
  planner_popup_wr: {
    color: '#000',
    width: '100%',
    height: '100%',
    transform: 'scale(0.5)',
    boxShadow: '0px 1px 10px 0px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
    padding: '73px 0px 0px ',
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
      gridGap: 14,
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
    '@media screen and (max-width: 950px)': {
      padding: 0,
    },
  },
  planner_popup_info: {
    marginTop: 24,
  },
  planner_popup_text: {
    color: '#373737',
    fontSize: 13,
    '& span': {
      fontWeight: 700,
    },
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
    },
  },
  planner_popup_link: {
    color: '#66ACF4',
    fontSize: 13,
    marginTop: 5,
    textDecoration: 'underline',
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'none',
    },
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
    },
  },
  planner_popup_tabs_wrap: {
    display: 'flex',
    justifyContent: 'center',
    position: 'relative',
  },
  planner_popup_create_tour_btn: {
    fontSize: 14,
    color: '#2B2B2B',
    textTransform: 'uppercase',
    background: '#BAE51F',
    borderRadius: 3,
    display: 'flex',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    height: 36,
    padding: '0 14px',
    cursor: 'pointer',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    '&:hover': {
      background: '#8fc32d',
    },
    '@media screen and (max-width: 950px)': {
      fontSize: 10,
      height: 28,
      padding: '0 7px',
    },
  },
  planner_popup_create_tour_btn_icon: {
    width: 18,
    marginRight: 7,
    '@media screen and (max-width: 950px)': {
      width: 11,
    },
  },
  planner_popup_tabs_wr: {
    display: 'inline-grid',
    gridTemplateColumns: 'auto auto',
    gridGap: 2,
    border: '2px solid #fff',
    height: '40px',
    background: '#fff',
    borderRadius: '6px',
    boxShadow: '0px 0px 3px 0px rgba(0, 0, 0, 0.12)',
    '@media screen and (max-width: 950px)': {
      height: 28,
    },
  },
  planner_popup_tab: {
    color: '#2F2F2F',
    fontSize: '17px',
    padding: '0 20px',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '3px',
    cursor: 'pointer',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    '&:hover': {
      background: '#E9E9E9',
    },
    '@media screen and (max-width: 950px)': {
      fontSize: 12,
    },
  },
  planner_popup_tab_active: {
    pointerEvents: 'none',
    background: '#BAE51F',
    color: '#2F2F2F',
    fontSize: '17px',
    padding: '0 20px',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '3px',
    cursor: 'pointer',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    '@media screen and (max-width: 950px)': {
      fontSize: 12,
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
  planner_popup_tab_content: {
    height: '100%',
    position: 'relative',
  },
  planner_popup_tab_cont: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
    opacity: 0,
    pointerEvents: 'none',
    transform: 'translateY(-102%)',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
  },
  planner_popup_tab_cont_show: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
    opacity: 1,
    pointerEvents: 'auto',
    transform: 'translateY(0)',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
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
  planner_popup_proj_error: {
    '&:after': {
      boxShadow: 'inset 0 0 0 4px #ff3333!important',
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
  preloader_render: {
    background: 'rgba(255, 255, 255, 0.6)',
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 99,
  },
  planner_popup_proj_process: {
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    display: 'flex',
    padding: '0 10px',
    position: 'absolute',
    background: 'rgb(0 0 0 / 75%)',
    transition: '0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    alignItems: 'center',
    borderRadius: '6px 6px 0 0',
    justifyContent: 'center',
  },
  planner_popup_proj_process_text: {
    color: '#fff',
  },
  planner_popup_proj_content_error_text: {
    color: '#ff3333',
    gridColumnStart: 1,
    gridColumnEnd: 3,
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

const RendersAnd360Popup = (props) => {
  const classes = useStyle();
  const dispatch = useDispatch();
  const translation = useTranslation();
  const popups = useSelector(selectPopups);
  const startType = popups.rendersAnd360Popup.data?.type;
  const [animPopupClass, setAnimPopupClass] = useState(false);
  const [rendersTotal, setRendersTotal] = useState(0);
  const [rendersShow, setRendersShow] = useState([]);
  const [rendersData, setRendersData] = useState([]);
  const [activeRenderTypeShow, setActiveRenderTypeShow] = useState(startType || 'renders');
  const [currentOffsetForRenders, setCurrentOffsetForRenders] = useState(0);
  const languages = useLanguages();
  const currLanguage = languages.find((i) => i.current == 1).code;

  const [tours360Show, setTours360Show] = useState([]);
  const [tours360Data, setTours360Data] = useState([]);
  const [renders360Array, setRenders360Array] = useState(false);
  const [needToUploadMore, setNeedToUploadMore] = useState(false);
  const [preloaderStatus, setPreloaderStatus] = useState(true);

  const scrollRef = useRef();

  const onClickClose = (e) => {
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'rendersAnd360Popup' })), 500);
  };

  const openRender = async (id, type, actions) => {
    if (R2D.Storage.load('r2d_rendersOpenPopup')) {
      if (type == '360') window.open(`${R2D.URL.DOMAIN}${actions.open.link}`);
      else {
        const renderImgUrl = await user.openRender(id);
        if (renderImgUrl.type == 'error')
          return dispatch(setActivePopup({ name: 'alert', data: renderImgUrl.data }));
        window.open(`${R2D.URL.DOMAIN}${renderImgUrl.url}`);
      }
    } else
      dispatch(
        setActivePopup({ name: 'confirm', type: 'render_open', data: { id, type, actions } })
      );
  };

  const loadRender = async (id) => {
    dispatch(setActivePopup({ name: 'loadingMessage', data: 'TEXT_WAIT' }));
    const renderImgUrl = await user.openRender(id);
    if (renderImgUrl.type == 'error')
      return dispatch(setActivePopup({ name: 'alert', data: renderImgUrl.data }));

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const imageNew = new Image();
    imageNew.crossOrigin = 'anonymous';
    imageNew.src = R2D.URL.DOMAIN + renderImgUrl.url;
    imageNew.onload = () => {
      canvas.width = imageNew.width;
      canvas.height = imageNew.height;
      context.drawImage(imageNew, 0, 0);
      const link = document.createElement('a');
      link.setAttribute('href', canvas.toDataURL());
      link.setAttribute('download', `render_ID_${id}`);
      link.click();
      dispatch(closeActivePopup({ name: 'loadingMessage' }));
    };
  };

  const onCreateNewTour = (e) => {
    if (!user.isLogged()) {
      !R2D.config.data.enable_merchant_login
        ? dispatch(setActivePopup({ name: 'login' }))
        : R2D.postMessageToParent(JSON.stringify({ action: 'merchant_login' }));
      return;
    }
    dispatch(setActivePopup({ name: 'tour360Create' }));
  };

  const deleteRender = (id) =>
    dispatch(setActivePopup({ name: 'confirm', type: 'render_delete', data: id }));

  const onReloadRender = async (id) => {
    dispatch(setActivePopup({ name: 'loadingMessage', data: 'TEXT_WAIT' }));
    const response = await user.reloadRender(id);
    if (response.type == 'error') dispatch(setActivePopup({ name: 'alert', data: response.data }));
    else {
      const renders = await user.loadRenders();
      if (renders.type == 'error')
        dispatch(setActivePopup({ name: 'alert', data: renders.data.items }));
      else {
        dispatch(closeActivePopup({ name: 'loadingMessage' }));
        dispatch(historyUpdate(renders.data.items));

        clearInterval(planner.renders.activeIntId);
        planner.renders.activeIntId = null;

        planner.renders.inProgressIds.push(response.data.renderId);

        setTimeout(() => {
          const key = setInterval(async () => {
            const inProgressIds = planner.renders.inProgressIds;
            if (inProgressIds.length < 1) {
              clearInterval(key);
              planner.renders.activeIntId = null;
              return;
            }

            const renders = await user.loadRenders();
            if (!renders || renders.type == 'error') {
              dispatch(setActivePopup({ name: 'alert', data: renders.data.items }));
              clearInterval(key);
              return;
            }
            if (renders.data.items) {
              renders.data.items.forEach((item) => {
                inProgressIds.forEach((renderId) => {
                  if (
                    item.renderId == renderId &&
                    (item.status == 'stored' || item.status == 'error')
                  ) {
                    planner.renders.inProgressIds = inProgressIds.filter((i) => i != renderId);
                    planner.apiScene.dispatchEvent(
                      new Event(planner.apiScene.RENDERS_UPDATE, {
                        renders: renders.data.items,
                        status: item.status,
                      })
                    );
                  }
                });
              });
            }
          }, 15000);
          planner.renders.activeIntId = key;
        }, 15000);
      }
    }
    dispatch(closeActivePopup({ name: 'loadingMessage' }));
  };

  const onRendersUpdate = async (e) => {
    const response = await user.loadRenders(20, currentOffsetForRenders);
    if (response.type == 'error') {
      dispatch(setActivePopup({ name: 'alert', data: response.data }));
    } else {
      setRendersData(response.data.items);
      setRendersTotal(response.data.total);
    }
  };

  const update360Data = async (e) => {
    const tours360 = await user.uTours360_load();
    if (tours360.type == 'error') dispatch(setActivePopup({ name: 'alert', data: tours360.data }));
    else setTours360Data(tours360.reverse());
  };

  const onScrollItemsWrap = (e) => {
    const el = e.target;
    if (
      el.scrollTop + el.offsetHeight >= el.scrollHeight - 10 &&
      rendersData.length !== rendersTotal
    ) {
      el.removeEventListener('scroll', onScrollItemsWrap);
      setPreloaderStatus(true);
      setCurrentOffsetForRenders(rendersData.length);
      setNeedToUploadMore(true);
    }
  };

  const onTourOpen = async (tourUrl) =>
    dispatch(setActivePopup({ name: 'tour360Create', data: tourUrl }));

  const onTourShare = (view) =>
    dispatch(setActivePopup({ name: 'share', data: view, type: 'tour' }));

  const deleteTour = async (item) =>
    dispatch(setActivePopup({ name: 'confirm', type: 'tour_delete', data: item.delete }));

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

  function onChangeRenderTypeShow(type) {
    setActiveRenderTypeShow(type);
  }

  useEffect(() => {
    const timer = setTimeout(() => setAnimPopupClass(true), 0);
    clearInterval(planner.renders.activeIntId);
    planner.renders.activeIntId = null;
    planner.renders.inProgressIds = [];

    user.loadRenders(20, 0).then((response) => {
      setRendersData(response.data.items);
      setRendersTotal(response.data.total);
    });

    user.uTours360_load().then((tours360) => {
      setTours360Data(tours360.reverse());
    });

    planner.apiScene.addEventListener(planner.apiScene.UPDATE_TOURS, update360Data);
    planner.scene.addEventListener(planner.scene.RENDERS_DATA_UPDATED, onRendersUpdate);
    setPreloaderStatus(false);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const rendersArray = [];
    if (rendersData && rendersData.length > 0) {
      rendersData.forEach &&
        rendersData.forEach((item) => {
          const createdDate = new Date(item.created * 1000);
          const createdYear = createdDate.getFullYear();
          const createdMonth = String(createdDate.getMonth() + 1).padStart(2, '0');
          const createdDay = String(createdDate.getDate()).padStart(2, '0');
          const createdFormattedDate = `${createdYear}-${createdMonth}-${createdDay}`;
          if (item.status != 'deleted') {
            rendersArray.push(
              <div
                className={
                  classes.planner_popup_proj +
                  ' ' +
                  (item.status == 'error' ? classes.planner_popup_proj_error : null)
                }
                key={item.id}
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

                  {item.status == 'stored' ? (
                    <div className={classes.planner_popup_proj_btns_wr}>
                      <div
                        className={classes.planner_popup_proj_btn}
                        onClick={(e) => openRender(item.renderId, item.type, item.actions)}
                      >
                        <IconFileSymlink size={25} color="#fff" />

                        <div className={classes.planner_popup_proj_btn_text}>
                          {translation['BUTTON_OPEN_PLAN']}
                        </div>
                      </div>

                      <div
                        className={classes.planner_popup_proj_btn}
                        onClick={(e) => loadRender(item.renderId)}
                      >
                        <IconDownload size={25} color="#fff" />

                        <div className={classes.planner_popup_proj_btn_text}>
                          {translation['BUTTON_DOWNLOAD_RENDER']}
                        </div>
                      </div>

                      <div
                        className={classes.planner_popup_proj_btn}
                        onClick={(e) => deleteRender(item.renderId)}
                      >
                        <IconTrash size={25} color="#AF3131" />

                        <div className={classes.planner_popup_proj_btn_text}>
                          {translation['BUTTON_DELETE_PLAN']}
                        </div>
                      </div>
                    </div>
                  ) : item.status == 'error' ? (
                    <div className={classes.planner_popup_proj_btns_wr}>
                      <div
                        className={classes.planner_popup_proj_btn}
                        onClick={(e) => onReloadRender(item.renderId)}
                      >
                        <IconRotateClockwise2 size={25} color="#fff" />
                        <div className={classes.planner_popup_proj_btn_text}>
                          {translation['BUTTON_RELOAD_RENDER']}
                        </div>
                      </div>

                      <div
                        className={classes.planner_popup_proj_btn}
                        onClick={(e) => deleteRender(item.renderId)}
                      >
                        <IconTrash size={25} color="#AF3131" />
                        <div className={classes.planner_popup_proj_btn_text}>
                          {translation['BUTTON_DELETE_PLAN']}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {item.status == 'waiting' ||
                  item.status == 'created' ||
                  item.status == 'rendering' ||
                  item.status == 'taken' ||
                  item.status == 'start' ||
                  item.status == 'finished' ? (
                    <div className={classes.planner_popup_proj_process}>
                      <p className={classes.planner_popup_proj_process_text}>
                        {item.status == 'waiting'
                          ? translation['TEXT_RENDER_WAITING']
                          : translation['TEXT_RENDER_IN_PROGRESS']}
                      </p>
                    </div>
                  ) : null}
                </div>

                <div className={classes.planner_popup_proj_info}>
                  <div className={classes.planner_popup_proj_title}> {item.type}</div>
                  <div className={classes.planner_popup_proj_content}>
                    <div className={classes.planner_popup_proj_id}>
                      ID:
                      <p>{item.id}</p>
                    </div>
                    {item.status == 'error' ? (
                      <div className={classes.planner_popup_proj_content_error_text}>
                        {translation['TEXT_RENDER_ERROR']}
                      </div>
                    ) : (
                      <div className={classes.planner_popup_proj_info_created}>
                        <IconCalendarMonth size={16} color="#7B7B7B" />
                        <span>Created:</span> {createdFormattedDate}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }
        });

      setRendersShow(rendersArray);
      rendersData && setRenders360Array(rendersData.find((i) => i.type == '360') || false);
    }
    if (rendersData && rendersData.filter && !planner.renders.activeIntId) {
      const rendersNotCreatedArray = rendersData.filter(
        (i) => i.status == 'created' || i.status == 'start' || i.status == 'finished'
      );
      rendersNotCreatedArray.forEach((i) => planner.renders.inProgressIds.push(i.renderId));
      if (rendersNotCreatedArray.length > 0) {
        setTimeout(() => {
          const key = setInterval(async () => {
            const renders = await user.loadRenders();
            if (renders) {
              renders.data.items.forEach((item) => {
                if (planner.renders.inProgressIds.length < 1) {
                  clearInterval(key);
                  planner.renders.activeIntId = null;
                }
                planner.renders.inProgressIds.forEach((renderId) => {
                  if (
                    item.renderId == renderId &&
                    (item.status == 'stored' || item.status == 'error')
                  ) {
                    planner.renders.inProgressIds = planner.renders.inProgressIds.filter(
                      (i) => i != renderId
                    );
                    planner.apiScene.dispatchEvent(
                      new Event(planner.apiScene.RENDERS_UPDATE, {
                        renders: renders.data.items,
                        status: item.status,
                      })
                    );
                  }
                });
              });
            }
          }, 15000);
          planner.renders.activeIntId = key;
        });
      }
    }
  }, [rendersData]);

  useEffect(() => {
    const tours360Array = [];
    if (tours360Data && tours360Data.length > 0) {
      tours360Data.forEach &&
        tours360Data.forEach((item) => {
          tours360Array.push(
            <div
              className={classes.planner_popup_proj}
              key={Math.random()}
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
                    onClick={(e) => onTourOpen(item.edit)}
                  >
                    <IconFileSymlink size={25} color="#fff" />
                    <div className={classes.planner_popup_proj_btn_text}>
                      {translation['BUTTON_OPEN_PLAN']}
                    </div>
                  </div>

                  <div
                    className={classes.planner_popup_proj_btn}
                    onClick={(e) => onTourShare(item.view)}
                  >
                    <IconShare size={25} color="#fff" />
                    <div className={classes.planner_popup_proj_btn_text}>
                      {translation['BUTTON_SHARE_PLAN']}
                    </div>
                  </div>

                  <div className={classes.planner_popup_proj_btn} onClick={(e) => deleteTour(item)}>
                    <IconTrash size={25} color="#AF3131" />
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
                    <p>{item.h}</p>
                  </div>
                  <div className={classes.planner_popup_proj_modified}>
                    <IconClock size={16} color="#7B7B7B" />
                    <span>{translation['TEXT_MODIFIED']}:</span> {item.updatedAt.substring(0, 10)}
                  </div>
                  {item.status == 'error' ? (
                    <div className={classes.planner_popup_proj_content_error_text}>
                      {translation['TEXT_RENDER_ERROR']}
                    </div>
                  ) : (
                    <div className={classes.planner_popup_proj_info_created}>
                      <IconCalendarMonth size={16} color="#7B7B7B" />
                      <span>Created:</span> {item.createdAt.substring(0, 10)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        });

      setTours360Show(tours360Array);
    }
  }, [tours360Data]);

  useEffect(() => {
    const el = scrollRef.current?.getScrollElement?.();
    if (el && rendersShow?.length > 0) {
      const shouldAttachScroll = rendersShow.length < rendersTotal;
      if (shouldAttachScroll) {
        el.addEventListener('scroll', onScrollItemsWrap);
      }
      return () => {
        if (shouldAttachScroll) {
          el.removeEventListener('scroll', onScrollItemsWrap);
        }
      };
    }
  }, [rendersShow.length, rendersTotal]);

  useEffect(() => {
    if (needToUploadMore) {
      user
        .loadRenders(20, currentOffsetForRenders)
        .then((response) => {
          if (response.type == 'error')
            return dispatch(setActivePopup({ name: 'alert', data: response.data.items }));
          setRendersData((state) => state.concat(response.data.items || []));
        })
        .finally(() => {
          setNeedToUploadMore(false);
          setPreloaderStatus(false);
        });
    }
  }, [needToUploadMore]);

  return (
    <div
      className={
        animPopupClass
          ? classes.planner_popup_wrap + ' ' + classes.planner_popup_wrap_show
          : classes.planner_popup_wrap
      }
      style={{ zIndex: popups.rendersAnd360Popup.zIndex }}
    >
      <div className={classes.planner_popup_wr}>
        <div className={classes.planner_popup_close} onClick={onClickClose}>
          <IconX size={24} color="#2F2F2F" className={classes.planner_popup_close_icon} />
        </div>

        <div className={classes.planner_popup_cont}>
          <div className={classes.planner_popup_top}>
            <div className={classes.planner_popup_tabs_wrap}>
              {renders360Array && activeRenderTypeShow === '360' ? (
                <div className={classes.planner_popup_create_tour_btn} onClick={onCreateNewTour}>
                  <IconPlus size={18} color="#2B2B2B" />
                  {translation['TOURS_MAKE_NEW']}
                </div>
              ) : null}

              <div className={classes.planner_popup_tabs_wr}>
                <div
                  className={
                    activeRenderTypeShow === 'renders'
                      ? classes.planner_popup_tab_active
                      : classes.planner_popup_tab
                  }
                  onClick={(e) => onChangeRenderTypeShow('renders')}
                >
                  {translation['FR_TOURS_TRANS_123']}
                </div>
                <div
                  className={
                    activeRenderTypeShow === '360'
                      ? classes.planner_popup_tab_active
                      : classes.planner_popup_tab
                  }
                  onClick={(e) => onChangeRenderTypeShow('360')}
                >
                  {translation['TEXT_360_TOURS']}
                </div>
              </div>
            </div>
            {activeRenderTypeShow === '360' ? (
              <div className={classes.planner_popup_info}>
                <div>
                  <div className={classes.planner_popup_text}>
                    {translation['TOURS_MAKE_WARNING']}
                  </div>
                  <a
                    href={R2D.URL.DOMAIN + '/' + currLanguage + '/tour/aap/'}
                    target="_blank"
                    className={classes.planner_popup_link}
                  >
                    {translation['TOURS_MAKE_EXAMPLE']}
                  </a>
                </div>
              </div>
            ) : null}
          </div>

          <div className={classes.planner_popup_scroll}>
            {preloaderStatus ? (
              <div className={classes.preloader_render + ' preloader'}>
                <div className="preloader-cube"></div>
              </div>
            ) : null}

            <div className={classes.planner_popup_tab_content}>
              <div
                className={
                  activeRenderTypeShow === 'renders'
                    ? classes.planner_popup_tab_cont_show
                    : classes.planner_popup_tab_cont
                }
              >
                <SimpleBar
                  style={{ height: '100%' }}
                  autoHide={false}
                  forceVisible="y"
                  ref={scrollRef}
                >
                  <div className={classes.planner_popup_projects}>{rendersShow}</div>
                </SimpleBar>
              </div>

              <div
                className={
                  activeRenderTypeShow === '360'
                    ? classes.planner_popup_tab_cont_show
                    : classes.planner_popup_tab_cont
                }
              >
                <SimpleBar style={{ height: '100%' }} autoHide={false} forceVisible="y">
                  <div className={classes.planner_popup_projects}>{tours360Show}</div>
                </SimpleBar>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RendersAnd360Popup;
