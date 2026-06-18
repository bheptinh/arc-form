import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { createUseStyles } from 'react-jss';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';

import { useTranslation } from '../../../../../../api/hooks/useTranslation';
import {
  controlPanelHistoryReplaceArray,
  controlPanelUpdateBreadCrumbs,
  selectActiveControlPanelMode,
  selectActiveControlPanelModeData,
} from '../../../../../../redux/features/control/controlPanelSlice';

const useStyle = createUseStyles({
  breadCrumbs: {
    width: '100%',
    backgroundColor: 'rgba(129, 129, 129, 0.9)',
    fontSize: '13px',
    color: '#fff',
    padding: 5,
    display: 'flex',
    flexWrap: 'wrap',
    '& p': {
      margin: '5px 3px',
    },
    '@media screen and (max-width: 950px)': {
      fontSize: 12,
    },
  },
  breadCrumbs__item: {
    position: 'relative',
    display: 'flex',
    fontSize: 12,
    color: '#D6D6D6',
    '& p:first-child': {
      cursor: 'pointer',
      '&:hover': {
        color: '#ffffff',
      },
    },
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
    },
  },
  catalog_top_btn: {
    marginLeft: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    '&:first-child': {
      position: 'relative',
      zIndex: 3,
      marginLeft: '0',
    },
    '& path': {
      transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    },
    '&:hover $breadcrumbs_wrap': {
      opacity: 1,
      pointerEvents: 'all',
    },
    '&:hover path': {
      fill: '#B8E11F',
    },
  },
  breadcrumbs_wrap: {
    display: 'flex',
    alignItems: 'center',
    background: '#fff',
    borderRadius: '3px',
    border: '1px solid #BEBCBC',
    left: '-7px',
    position: 'absolute',
    top: '-6px',
    height: '30px',
    paddingLeft: '24px',
    paddingRight: '10px',
    pointerEvents: 'none',
    //overflow: "hidden",
    zIndex: 2,
    opacity: 0,
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
  },
  breadcrumbs_dot: {
    width: '3px',
    height: '3px',
    borderRadius: '50%',
    background: '#CDCBCB',
    margin: '0 4px',
  },
  breadcrumbs_link: {
    color: '#979797',
    fontSize: '13px',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'color .9s cubic-bezier(.19,1,.22,1)',
    position: 'relative',
    fontFamily: 'RobotoCondensed-Regular',
    '&:hover': {
      color: '#000',
    },
    '@media screen and (max-width: 950px)': {
      fontSize: '9px',
    },
  },
  breadcrumbs_link_decor_furtinure: {
    color: '#979797',
    fontSize: '13px',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'color .9s cubic-bezier(.19,1,.22,1)',
    position: 'relative',
    fontFamily: 'RobotoCondensed-Regular',
    '& $breadcrumbs_selected_model_preview': {
      opacity: '0.5',
    },
    '&:hover': {
      color: '#000',
      '& $breadcrumbs_selected_model_preview': {
        opacity: 1,
      },
    },
    '@media screen and (max-width: 950px)': {
      fontSize: '9px',
    },
  },
  breadcrumbs_link_active: {
    pointerEvents: 'none',
    color: '#000',
  },
  breadcrumbs_static_wr: {
    width: '100%',
    height: '16px',
    position: 'relative',
    display: 'flex',
    justifyContent: 'end',
    '&:empty': {
      height: 0,
    },
    '@media screen and (max-width: 950px)': {
      height: '14px',
    },
  },
  breadcrumbs_static_wr_hover: {},
  breadcrumbs_static: {
    top: '-6px',
    left: '0',
    /*maxWidth: "calc(100% - 14px)",*/
    position: 'absolute',
    width: '100%',
    height: 26,
  },
  breadcrumbs_static_hidden: {
    overflow: 'hidden',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
  },
  breadcrumbs_static_hover: {
    top: '-8px',
    left: '-7px',
    borderLeft: 0,
    height: '30px',
    display: 'flex',
    zIndex: 0,
    opacity: 0,
    position: 'absolute',
    background: '#fff',
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    alignItems: 'center',
    paddingLeft: '7px',
    borderRadius: '3px',
    paddingRight: '10px',
    pointerEvents: 'none',
    '@media screen and (max-width: 950px)': {
      top: '-2px',
      height: 19,
    },
  },
  breadcrumbs_static_hover_created: {
    top: '2px',
    left: '4px',
    border: '1px solid #BEBCBC',
    borderLeft: 0,
    height: '30px',
    display: 'flex',
    zIndex: 0,
    opacity: 0,
    position: 'absolute',
    background: '#fff',
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    alignItems: 'center',
    paddingLeft: '7px',
    borderRadius: '3px',
    paddingRight: '10px',
    pointerEvents: 'none',
    '@media screen and (max-width: 950px)': {
      height: 21,
      paddingLeft: 2,
    },
  },
  breadcrumbs_static_hover_created_show: {
    opacity: 1,
    pointerEvents: 'auto',
  },
  breadcrumbs_selected_model_preview: {
    width: '19px',
    height: '16px',
    position: 'relative',
    flexShrink: 0,
    cursor: 'pointer',
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    '& img': {
      maxWidth: '100%',
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      left: '0',
    },
    '&:hover': {
      opacity: '0.5',
    },
    '@media screen and (max-width: 950px)': {
      height: 14,
      width: 11,
    },
  },
  catalog_top_title: {
    lineHeight: 0.8,
    fontSize: 17,
    fontFamily: 'RobotoCondensed-Regular',
    color: '#000',
    '& span': {
      color: '#939393',
      fontSize: '12px',
      fontFamily: 'Roboto-Regular',
    },
    '@media screen and (max-width: 950px)': {
      fontSize: 9,
    },
  },
  breadcrumbs_space: {
    width: 3,
  },
  breadcrumbs_link_title: {
    pointerEvents: 'none',
  },
  breadcrumbs_static_hover_home: {
    display: 'flex',
    alignItems: 'center',
  },
});

const Breadcrumbs = (props) => {
  const dispatch = useDispatch();

  const activeControlPanelMode = useSelector(selectActiveControlPanelMode);
  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const currentStateBreadCrumbs = useMemo(() => activeControlPanelData?.breadCrumbs, []);
  const translation = useTranslation();

  const [breadCrumbsArrayReact, setBreadCrumbsArrayReact] = useState(null);

  const clickBreadCrumb = (index) => {
    dispatch(controlPanelHistoryReplaceArray(currentStateBreadCrumbs.slice(1, index + 1)));
    dispatch(
      controlPanelUpdateBreadCrumbs({
        data: currentStateBreadCrumbs.slice(1, index + 1),
        updateType: 'replaceArray',
      })
    );
  };

  const classes = useStyle();

  function decodeHtml(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  }

  const wrapperRef = useRef(null);
  const contentRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [dynamicPanelElement, setDynamicPanelElement] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  const currOS = R2D.controller.getCurrentOS();
  const isCurrDeviceAPhone = currOS == 'iOS' || currOS == 'Android';

  const onEnterMouse = (e) => {
    setIsHovered(true);
  };
  const onLeaveMouse = (e) => {
    setIsHovered(false);
  };
  const onTouchStartDropdown = (e) => {
    setIsHovered(true);
    setTimeout(() => setIsHovered(false), 3000);
  };
  useEffect(() => {
    const breadCrumbsArray = [];
    const breadCrumbsArrayReact = [];

    currentStateBreadCrumbs?.forEach((item, index) => {
      if (item.name) {
        const isLast = index === currentStateBreadCrumbs.length - 1;
        breadCrumbsArray.push({ id: item.id, name: item.name });
        breadCrumbsArrayReact.push(
          <div
            key={index}
            className={
              isLast
                ? classes.breadcrumbs_link + ' ' + classes.breadcrumbs_link_active
                : classes.breadcrumbs_link
            }
            onClick={(e) => clickBreadCrumb(index)}
          >
            <div className={classes.breadcrumbs_dot}></div>
            {decodeHtml(item.name)}
          </div>
        );
      }
    });
    setBreadCrumbsArrayReact(breadCrumbsArrayReact);
  }, [currentStateBreadCrumbs]);

  useEffect(() => {
    const el = document.querySelector('.dynamicPanel');
    el && setDynamicPanelElement(el);

    setTimeout(() => {
      requestAnimationFrame(() => {
        const wrapper = wrapperRef.current;
        const content = contentRef.current;
        if (wrapper && content) {
          setIsOverflowing(content.clientWidth > wrapper.clientWidth + 17);
        }
      });
    }, 0);
  }, []);

  return (
    <div
      className={classes.breadcrumbs_static_wr}
      ref={wrapperRef}
      onMouseEnter={onEnterMouse}
      onMouseLeave={onLeaveMouse}
    >
      <div
        className={classes.breadcrumbs_static}
        style={isOverflowing ? { maxWidth: 'calc(100% - 14px)' } : null}
      >
        <div className={classes.breadcrumbs_static_hidden}>
          {props.hideBreadCrumbsHomePanel ? (
            <div className={classes.breadcrumbs_link}>
              <div
                className={classes.breadcrumbs_selected_model_preview}
                onClick={props.onClickCloseButton}
              >
                <img src={props.panelPreviewIcon} />
              </div>
            </div>
          ) : props.panelPreviewIcon ? (
            activeControlPanelMode == 'furniture' ||
            activeControlPanelMode == 'decor' ||
            activeControlPanelMode == 'replaceModel' ? (
              <div
                className={
                  !breadCrumbsArrayReact || breadCrumbsArrayReact.length < 1
                    ? classes.breadcrumbs_link + ' ' + classes.breadcrumbs_link_title
                    : classes.breadcrumbs_link_decor_furtinure
                }
                onClick={(e) => clickBreadCrumb(0)}
              >
                <div
                  className={classes.breadcrumbs_selected_model_preview}
                  onClick={props.onClickCloseButton}
                >
                  <img src={props.panelPreviewIcon} />
                </div>

                <div className={classes.breadcrumbs_space}></div>
                {!breadCrumbsArrayReact || breadCrumbsArrayReact.length < 1 ? (
                  <div className={classes.catalog_top_title}>
                    {props.breadcrumsTitle
                      ? translation[props.breadcrumsTitle] || props.breadcrumsTitle
                      : ''}
                  </div>
                ) : (
                  <span>
                    {props.breadcrumsTitle
                      ? translation[props.breadcrumsTitle] || props.breadcrumsTitle
                      : ''}
                  </span>
                )}
              </div>
            ) : (
              <div className={classes.breadcrumbs_static_hover_home}>
                <div className={classes.breadcrumbs_link}>
                  <div
                    className={classes.breadcrumbs_selected_model_preview}
                    onClick={props.onClickCloseButton}
                  >
                    <img src={props.panelPreviewIcon} />
                  </div>
                  {/* <div className={classes.breadcrumbs_dot}></div> */}
                </div>
                <div
                  className={
                    !breadCrumbsArrayReact || breadCrumbsArrayReact.length < 1
                      ? classes.breadcrumbs_link + ' ' + classes.breadcrumbs_link_active
                      : classes.breadcrumbs_link
                  }
                  onClick={(e) => clickBreadCrumb(1)}
                >
                  {props.breadcrumsTitle
                    ? translation[props.breadcrumsTitle] || props.breadcrumsTitle
                    : ''}
                </div>
              </div>
            )
          ) : (
            <div
              className={classes.breadcrumbs_link}
              onClick={() =>
                clickBreadCrumb(
                  activeControlPanelMode == 'furniture' || activeControlPanelMode == 'decor' ? 0 : 1
                )
              }
            >
              {props.breadcrumsTitle
                ? translation[props.breadcrumsTitle] || props.breadcrumsTitle
                : ''}
            </div>
          )}
          {breadCrumbsArrayReact}
        </div>
      </div>

      {breadCrumbsArrayReact?.length > 0 ? (
        <div>
          {isOverflowing ? (
            <div
              className={classes.breadcrumbs_link}
              style={!isCurrDeviceAPhone ? { fontSize: 16 } : { fontSize: 16, paddingBottom: 3 }}
              onTouchStart={onTouchStartDropdown}
            >
              ...
            </div>
          ) : null}

          <div
            className={`${classes.breadcrumbs_static_hover} ${isHovered ? classes.breadcrumbs_static_hover_created_show : ''}`}
            ref={contentRef}
          >
            {props.hideBreadCrumbsHomePanel ? (
              <div className={classes.breadcrumbs_link}>
                <div
                  className={classes.breadcrumbs_selected_model_preview}
                  onClick={props.onClickCloseButton}
                >
                  <img src={props.panelPreviewIcon} />
                </div>
              </div>
            ) : props.panelPreviewIcon ? (
              activeControlPanelMode == 'furniture' ||
              activeControlPanelMode == 'decor' ||
              activeControlPanelMode == 'replaceModel' ? (
                <div
                  className={
                    !breadCrumbsArrayReact || breadCrumbsArrayReact.length < 1
                      ? classes.breadcrumbs_link + ' ' + classes.breadcrumbs_link_title
                      : classes.breadcrumbs_link_decor_furtinure
                  }
                  onClick={() => clickBreadCrumb(0)}
                >
                  <div
                    className={classes.breadcrumbs_selected_model_preview}
                    onClick={props.onClickCloseButton}
                  >
                    <img src={props.panelPreviewIcon} />
                  </div>
                  <div className={classes.breadcrumbs_space}></div>

                  {!breadCrumbsArrayReact || breadCrumbsArrayReact.length < 1 ? (
                    <div className={classes.catalog_top_title}>
                      {props.breadcrumsTitle
                        ? translation[props.breadcrumsTitle] || props.breadcrumsTitle
                        : ''}
                    </div>
                  ) : (
                    <span>
                      {props.breadcrumsTitle
                        ? translation[props.breadcrumsTitle] || props.breadcrumsTitle
                        : ''}
                    </span>
                  )}
                </div>
              ) : (
                <div className={classes.breadcrumbs_static_hover_home}>
                  <div className={classes.breadcrumbs_link}>
                    <div
                      className={classes.breadcrumbs_selected_model_preview}
                      onClick={props.onClickCloseButton}
                    >
                      <img src={props.panelPreviewIcon} />
                    </div>
                    {/* <div className={classes.breadcrumbs_dot}></div> */}
                  </div>
                  <div
                    className={
                      !breadCrumbsArrayReact || breadCrumbsArrayReact.length < 1
                        ? classes.breadcrumbs_link + ' ' + classes.breadcrumbs_link_active
                        : classes.breadcrumbs_link
                    }
                    onClick={() => clickBreadCrumb(1)}
                  >
                    {props.breadcrumsTitle
                      ? translation[props.breadcrumsTitle] || props.breadcrumsTitle
                      : ''}
                  </div>
                </div>
              )
            ) : (
              <div
                className={classes.breadcrumbs_link}
                onClick={(e) =>
                  clickBreadCrumb(
                    activeControlPanelMode == 'furniture' || activeControlPanelMode == 'decor'
                      ? 0
                      : 1
                  )
                }
              >
                {props.breadcrumsTitle
                  ? translation[props.breadcrumsTitle] || props.breadcrumsTitle
                  : ''}
              </div>
            )}
            {breadCrumbsArrayReact}
          </div>
        </div>
      ) : null}

      {breadCrumbsArrayReact &&
        breadCrumbsArrayReact.length > 0 &&
        ReactDOM.createPortal(
          <div
            className={`${classes.breadcrumbs_static_hover_created} ${isHovered ? classes.breadcrumbs_static_hover_created_show : ''}`}
            ref={contentRef}
          >
            {props.hideBreadCrumbsHomePanel ? (
              <div className={classes.breadcrumbs_link}>
                <div
                  className={classes.breadcrumbs_selected_model_preview}
                  onClick={props.onClickCloseButton}
                >
                  <img src={props.panelPreviewIcon} />
                </div>
              </div>
            ) : props.panelPreviewIcon ? (
              activeControlPanelMode == 'furniture' ||
              activeControlPanelMode == 'decor' ||
              activeControlPanelMode == 'replaceModel' ? (
                <div
                  className={
                    !breadCrumbsArrayReact || breadCrumbsArrayReact.length < 1
                      ? classes.breadcrumbs_link + ' ' + classes.breadcrumbs_link_title
                      : classes.breadcrumbs_link_decor_furtinure
                  }
                  onClick={() => clickBreadCrumb(0)}
                >
                  <div
                    className={classes.breadcrumbs_selected_model_preview}
                    onClick={props.onClickCloseButton}
                  >
                    <img src={props.panelPreviewIcon} />
                  </div>
                  <div className={classes.breadcrumbs_space}></div>

                  {!breadCrumbsArrayReact || breadCrumbsArrayReact.length < 1 ? (
                    <div className={classes.catalog_top_title}>
                      {props.breadcrumsTitle
                        ? translation[props.breadcrumsTitle] || props.breadcrumsTitle
                        : ''}
                    </div>
                  ) : (
                    <span>
                      {props.breadcrumsTitle
                        ? translation[props.breadcrumsTitle] || props.breadcrumsTitle
                        : ''}
                    </span>
                  )}
                </div>
              ) : (
                <div className={classes.breadcrumbs_static_hover_home}>
                  <div className={classes.breadcrumbs_link}>
                    <div
                      className={classes.breadcrumbs_selected_model_preview}
                      onClick={props.onClickCloseButton}
                    >
                      <img src={props.panelPreviewIcon} />
                    </div>
                    {/* <div className={classes.breadcrumbs_dot}></div> */}
                  </div>
                  <div
                    className={
                      !breadCrumbsArrayReact || breadCrumbsArrayReact.length < 1
                        ? classes.breadcrumbs_link + ' ' + classes.breadcrumbs_link_active
                        : classes.breadcrumbs_link
                    }
                    onClick={() => clickBreadCrumb(1)}
                  >
                    {props.breadcrumsTitle
                      ? translation[props.breadcrumsTitle] || props.breadcrumsTitle
                      : ''}
                  </div>
                </div>
              )
            ) : (
              <div
                className={classes.breadcrumbs_link}
                onClick={() =>
                  clickBreadCrumb(
                    activeControlPanelMode == 'furniture' || activeControlPanelMode == 'decor'
                      ? 0
                      : 1
                  )
                }
              >
                {props.breadcrumsTitle
                  ? translation[props.breadcrumsTitle] || props.breadcrumsTitle
                  : ''}
              </div>
            )}
            {breadCrumbsArrayReact}
          </div>,
          dynamicPanelElement
        )}
    </div>
  );
};

export default Breadcrumbs;
