import 'simplebar-react/dist/simplebar.min.css';

import { IconView360Arrow } from '@tabler/icons-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';

import { useLanguages } from '../../../../../../../api/hooks/useLanguages';
import { useTranslation } from '../../../../../../../api/hooks/useTranslation';
import { planner } from '../../../../../../../initR2D';
import {
  changeActivePano,
  selectActivePano,
} from '../../../../../../../redux/features/common/commonSlice';
import {
  controlPanelHistoryAdd,
  controlPanelHistoryScrollSave,
  controlPanelUpdateBreadCrumbs,
  selectActiveControlPanelMode,
  selectActiveControlPanelModeData,
} from '../../../../../../../redux/features/control/controlPanelSlice';
import Navigation from '../../../navigation/Navigation';

const useStyle = createUseStyles({
  planner_catalog_cont: {
    borderRight: '1px solid var(--color-border-light)',
    background: 'var(--color-white)',
    height: '100%',
    display: 'grid',
    alignContent: 'baseline',
    gridTemplateRows: 'auto 1fr',
    transition: 'all .5s cubic-bezier(0.19, 1, 0.22, 1)',
    width: 309,
    position: 'absolute',
    left: 0,
    top: 0,
    '@media screen and (max-width: 950px)': {
      width: 189,
    },
  },
  catalog_wr: {
    overflow: 'hidden',
    height: '100%',
    position: 'relative',
    background: 'var(--color-white)',
    borderTop: '1px solid var(--color-border)',
  },
  roll_out_left: {
    transform: 'translateX(-100%)',
  },
  roll_out_right: {
    transform: 'translateX(100%)',
  },

  wr: {},
  title: {
    width: '100%',
    height: '29px',
    backgroundColor: 'rgba(129, 129, 129, 0.9)',
    fontSize: '13px',
    color: 'var(--color-white)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 5px',
  },
  viewItemStandart: {
    cursor: 'pointer',
    height: '160px',
    position: 'relative',
    '&:after': {
      top: '0',
      left: '0',
      width: 'calc(100%)',
      height: '100%',
      content: '""',
      zIndex: 1,
      position: 'absolute',
      boxShadow: 'inset 0 0 0 0px var(--color-accent)',
      transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
      pointerEvents: 'none',
    },
    '& path': {
      transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    },
    '&:hover': {
      '&:after': {
        boxShadow: 'inset 0 0 0 4px var(--color-accent)',
      },
    },
    '@media screen and (max-width: 950px)': {
      height: 110,
    },
  },
  viewItemStandart_active: {
    '&:after': {
      boxShadow: 'inset 0 0 0 4px var(--color-accent)',
    },
  },
  viewItemIcon: {
    '@media screen and (max-width: 950px)': {
      height: 'auto',
      width: 40,
    },
  },
  planner_catalog_elem_overlay: {
    position: 'absolute',
    left: '0',
    top: '0',
    width: '100%',
    height: '100%',
  },
  help_bot_item: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 10,
    fontSize: 13,
    color: 'var(--color-white)',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    '& svg': {
      marginLeft: 10,
      '@media screen and (max-width: 950px)': {
        marginLeft: 7,
        height: 'auto',
        width: 10,
      },
    },
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
      marginTop: 6,
    },
  },
  viewItem: {
    width: '100%',
    height: 115,
    border: '1px solid #dddddd',
    position: 'relative',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    '&:hover': {
      border: '1px solid var(--color-highlight)',
    },
  },
  viewItemImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    cursor: 'pointer',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  viewItemLock: {
    border: '1px solid #ca0707',
  },
  activePano: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(47, 47, 47, 0.7)',
    boxShadow: 'inset 0 0 0 4px var(--color-accent)',
    '&:hover': {
      '& path:not($leftMouse)': {
        fill: 'var(--color-accent)',
      },
      '& $help_bot_item': {
        color: 'var(--color-accent)',
      },
      '& p': {
        color: 'var(--color-accent)',
      },
    },
  },
  leftMouse: {},
  preloadContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    background: 'rgba(255, 255, 255, .5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rotateText: {
    position: 'absolute',
    top: 20,
    color: 'var(--color-white)',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
  },
});

const Panorams = (props) => {
  const dispatch = useDispatch();
  const translation = useTranslation();
  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const activeControlPanelMode = useSelector(selectActiveControlPanelMode);
  const controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const isAdded = lastHistoryElem?.isAdded;
  const lastHistoryElemScroll = lastHistoryElem.lastSavedScroll;
  const activePano = useSelector(selectActivePano);
  const languages = useLanguages();

  const [activePanoId, setActivePanoId] = useState(R2D.scene.skyboxId);
  const [rotation, setRotaion] = useState(activePano.rotation);
  let [pannoArrayIter, setPannoArrayIter] = useState(0);
  const [styleAnimation, setStyleAnimation] = useState(
    isAdded ? { transform: 'translateX(100%)' } : { transform: 'translateX(-100%)' }
  );
  const [panoArray, setPanoArray] = useState();

  let startRotation = 0;
  let startX = 0;
  const sensitivity = 0.5;
  let positionX = 0;
  let activeId = null;

  const panoData = planner.getPanorams();

  const panorams = [];

  const classes = useStyle();

  const onSelectPano = async ({ e, id, rotation, previewImgSrc }) => {
    props.preloader && props.preloader(true);
    document.querySelector('.product_hover') && document.querySelector('.product_hover').remove();
    document.querySelector('.' + classes.preloadContainer) &&
      Array.from(document.querySelectorAll('.' + classes.preloadContainer)).forEach((i) =>
        i.remove()
      );
    activeId = id;
    const preloadContainer = document.createElement('div');
    preloadContainer.classList.add(classes.preloadContainer);
    const preload = document.createElement('div');
    preload.classList.add('preloader-cube');
    preloadContainer.append(preload);
    e.currentTarget.append(preloadContainer);
    if (id == 'transparent') {
      R2D.scene.skyboxId = id;
      R2D.scene.checkSkybox();
      if (props.renderType != 'topView') {
        R2D.scene.repositionSkybox();
      }
    } else {
      await R2D.scene.setSkyboxMat(activeId);
    }

    R2D.scene.setSkyboxRotation(rotation);
    R2D.scene.history.saveState();
    preloadContainer.remove();
    props.preloader && props.preloader(false);
    if (activeId == id) {
      dispatch(changeActivePano({ id, previewImgSrc: previewImgSrc, rotation }));
      setActivePanoId(activeId);
      setRotaion(0);
    }
  };

  const mouseEnter = (event, data) => {
    document.querySelector('.product_hover') && document.querySelector('.product_hover').remove();
    const product = event.target;
    const hoverWindow = document.createElement('div');
    hoverWindow.classList.add('product_hover');
    hoverWindow.innerHTML = data.name;
    document.querySelector('body').append(hoverWindow);
    hoverWindow.style.left = product.getBoundingClientRect().left + product.offsetWidth - 20 + 'px';
    hoverWindow.style.top =
      product.getBoundingClientRect().top +
      (product.offsetHeight - hoverWindow.offsetHeight) / 2 +
      'px';
  };

  const mouseLeave = () =>
    document.querySelector('.product_hover') && document.querySelector('.product_hover').remove();

  const rightPanelData = useRef(null);

  function startRotatePano(e) {
    startX = e.clientX;
    startRotation = rotation;
    document.addEventListener('mousemove', rotatePano);
    document.addEventListener('mouseup', endRotatePano);
  }

  function rotatePano(e) {
    positionX = e.clientX;
    const distance = startX - positionX;

    const newRotation = Math.round(startRotation + distance * sensitivity + 360) % 360;
    R2D.scene.setSkyboxRotation(newRotation);
    setRotaion(newRotation);
    dispatch(changeActivePano({ ...activePano, rotation: newRotation }));
  }

  function endRotatePano(e) {
    document.removeEventListener('mousemove', rotatePano);
    document.removeEventListener('mouseup', endRotatePano);
    R2D.scene.history.saveState();
  }

  const mainDiv = useRef(null);
  const scrollDiv = useRef(null);

  const onOpenColorPicker = (e) => {
    document.querySelector('.product_hover') && document.querySelector('.product_hover').remove();
    document.querySelector('.' + classes.preloadContainer) &&
      Array.from(document.querySelectorAll('.' + classes.preloadContainer)).forEach((i) =>
        i.remove()
      );
    dispatch(controlPanelHistoryAdd({ type: 'colorpicker' }));
    dispatch(controlPanelUpdateBreadCrumbs({ data: { type: 'colorpicker' }, updateType: 'add' }));
  };

  useEffect(() => {
    setTimeout(() => setStyleAnimation({ transform: 'translateX(0%)' }), 0);
  }, []);

  useEffect(() => {
    if (mainDiv.current) mainDiv.current.scrollTop = lastHistoryElemScroll;
  }, [mainDiv.current, lastHistoryElemScroll]);

  useEffect(() => {
    panoData.forEach((elem) => {
      panorams.push(
        <div
          key={elem.id}
          className={classes.viewItemStandart}
          onMouseLeave={mouseLeave}
          onMouseEnter={(e) => mouseEnter(e, elem)}
        >
          <img
            data-src={R2D.URL.DOMAIN + elem.source.images.preview}
            src={R2D.URL.DOMAIN + elem.source.images.preview}
            className={classes.viewItemImg + ' lazyload'}
          />
          {activePanoId == elem.id ? (
            <div className={classes.activePano} onMouseDown={startRotatePano}>
              <p className={classes.rotateText}> {rotation}° </p>
              <IconView360Arrow size={65} color="#FCFFFF" className={classes.viewItemIcon} />

              <div className={classes.help_bot_item}>
                <div>{translation['TEXT_ROTATE_PANORAMA']}</div>

                {/* TODO: Replace mouse icon */}
                <svg width="19" height="26" viewBox="0 0 19 26" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fill="#fff"
                    d="M4.39176 0.5H14.6071C16.7746 0.5 18.5 2.18908 18.5 4.23597V21.764C18.5 23.8099 16.7745 25.5 14.6071 25.5H4.39176C2.22554 25.5 0.5 23.81 0.5 21.764V4.23597C0.5 2.189 2.22546 0.5 4.39176 0.5Z"
                    stroke="#828282"
                  />
                  <rect x="9" width="1" height="11" fill="#828282" />
                  <rect
                    x="17"
                    y="11"
                    width="1"
                    height="15"
                    transform="rotate(90 17 11)"
                    fill="#828282"
                  />
                  <path
                    fillRule="evenodd"
                    className={classes.leftMouse}
                    clipRule="evenodd"
                    d="M4.68837 2H9C9.01951 3.67815 9 10.9992 9 10.9992C7.05106 11.0301 4.59176 11.004 1.99998 10.9992V4.51191C1.99998 3.05816 3.20298 2 4.68837 2Z"
                    fill="#2F2F2F"
                  />
                </svg>
              </div>
            </div>
          ) : (
            <div
              className={classes.planner_catalog_elem_overlay}
              onClick={(e) =>
                onSelectPano({
                  e,
                  id: elem.id,
                  rotation: 0,
                  previewImgSrc: elem.source.images.preview,
                })
              }
            ></div>
          )}
        </div>
      );
    });
    setPanoArray(panorams);
  }, [activePanoId, rotation, languages]);

  useEffect(() => {
    setRotaion(activePano.rotation || 0);
    setActivePanoId(activePano.id || planner.scene.getDefaultPanoId());
  }, [activePano]);

  useEffect(() => {
    if (pannoArrayIter == 0 && panoArray && panoArray.length > 0) {
      const activeElem = document.querySelector('.' + classes.activePano);
      if (!activeElem) return;
      mainDiv.current.scrollTop =
        activeElem.getBoundingClientRect().top -
        mainDiv.current.offsetHeight / 2 +
        document.querySelector('.' + classes.activePano / 2);
      setPannoArrayIter(++pannoArrayIter);
      dispatch(
        controlPanelHistoryScrollSave(
          activeElem.getBoundingClientRect().top -
            mainDiv.current.offsetHeight / 2 +
            document.querySelector('.' + classes.activePano / 2)
        )
      );
    }
  }, [panoArray]);

  useEffect(() => {
    planner.scene.dispatchEvent(new Event(planner.scene.TIPS_PANORAMS, {}));
  }, []);

  return (
    <div className={classes.planner_catalog_cont} ref={rightPanelData} style={styleAnimation}>
      {activeControlPanelMode == 'renderMake' ? (
        <Navigation
          disableBreadcrumbs={props.disableBreadcrumbs}
          isAddSettingsDisabled={props.isAddSettingsDisabled}
        />
      ) : null}

      <div className={classes.catalog_wr} ref={mainDiv}>
        <SimpleBar style={{ height: '100%' }} autoHide={false} forceVisible="y">
          <div className={classes.wr} ref={scrollDiv}>
            {props.renderType == 'exterior' || props.renderType == 'topView' ? (
              <div
                className={
                  classes.viewItemStandart +
                  ' ' +
                  (activePano.id?.indexOf && ~activePano.id.indexOf('#')
                    ? classes.viewItemStandart_active
                    : '')
                }
                onMouseLeave={mouseLeave}
                onMouseEnter={(e) => mouseEnter(e, { name: translation['COLORED_BACKGROUND'] })}
              >
                <img
                  data-src={'/src_designer/images/colorPickerBackground.png'}
                  src={'/src_designer/images/colorPickerBackground.png'}
                  className={classes.viewItemImg + ' lazyload'}
                />
                <div
                  className={classes.planner_catalog_elem_overlay}
                  onClick={onOpenColorPicker}
                ></div>
              </div>
            ) : null}
            {props.renderType == 'exterior' || props.renderType == 'topView' ? (
              <div
                className={
                  classes.viewItemStandart +
                  ' ' +
                  (activePano.id == 'transparent' ? classes.viewItemStandart_active : '')
                }
                onMouseLeave={mouseLeave}
                onMouseEnter={(e) => mouseEnter(e, { name: translation['TRANSPARENT_BACKGROUND'] })}
              >
                <img
                  data-src={'/src_designer/images/transparent_background.png'}
                  src={'/src_designer/images/transparent_background.png'}
                  className={classes.viewItemImg + ' lazyload'}
                />
                <div
                  className={classes.planner_catalog_elem_overlay}
                  onClick={(e) =>
                    onSelectPano({
                      e,
                      id: 'transparent',
                      rotation: 0,
                      previewImgSrc: '/src_designer/images/transparent_background.png',
                    })
                  }
                ></div>
              </div>
            ) : null}
            {props.renderType != 'topView' ? panoArray : null}
          </div>
        </SimpleBar>
      </div>
    </div>
  );
};

export default Panorams;
