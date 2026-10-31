import { IconHeart } from '@tabler/icons-react';
import React, { useEffect, useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { planner, user } from '../../../../../../initR2D';
import { selectActiveControlPanelModeData } from '../../../../../../redux/features/control/controlPanelSlice';
import { setActivePopup } from '../../../../../../redux/features/popups/popupsSlice';
import { selectIsLogged } from '../../../../../../redux/features/user/userSlice';
import Navigation from '../../navigation/Navigation';

const plannerChangeRotation_axis = {
  width: 10,
  height: 10,
  borderRadius: 10,
};

const plannerChangeRotation = {
  display: 'flex',
  justifyContent: 'space-between',
};

const useStyle = createUseStyles({
  cont: {
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
    display: 'grid',
    position: 'absolute',
    background: '#F1F1F1',
    borderLeft: '1px solid #cdcdcd',
    transition: 'all .5s cubic-bezier(0.19, 1, 0.22, 1)',
  },
  wrap: {
    height: '100%',
    overflow: 'auto',
    background: '#fff',
  },
  wr: {
    padding: 18,
    '@media screen and (max-width: 950px)': {
      padding: '18px 10px',
    },
  },
  wr_top_favorites_main: {
    top: '5px',
    left: '5px',
    width: '15px',
    height: '15px',
    display: 'flex',
    zIndex: 1,
    position: 'absolute',
    alignItems: 'center',
    borderRadius: '50%',
    justifyContent: 'center',
    '& svg': {
      transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    },
    '&:hover': {
      '& svg': {
        stroke: '#64BCF0',
      },
    },
  },
  wr_top: {
    textAlign: 'center',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    '& img': {
      maxWidth: 200,
      '@media screen and (max-width: 950px)': {
        maxWidth: 150,
      },
    },
  },
  title: {
    width: '100%',
    height: '29px',
    backgroundColor: 'rgba(129, 129, 129, 0.9)',
    fontSize: '13px',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    padding: '0 5px',
  },
  plannerChangeSizesWrap: {
    display: 'grid',
    gridTemplateColumns: 'auto 27px',
    gridGap: 24,
    marginBottom: 20,
    paddingRight: 10,
  },
  plannerChangeSizes: {},
  plannerChangeRotationWrap: {
    borderTop: '1px solid rgba(196, 196, 196, .3)',
    marginBottom: 20,
  },
  plannerChangeRotation: {
    extend: plannerChangeRotation,
    paddingBottom: 5,
  },
  plannerChangeRotation_hide: {
    extend: plannerChangeRotation,
    overflow: 'hidden',
    paddingBottom: 0,
    height: 1,
  },
  plannerChangeRotation_item: {
    display: 'flex',
    alignItems: 'center',
  },
  plannerChangeRotation_axis_x: {
    extend: plannerChangeRotation_axis,
    background: '#BE3939',
  },
  plannerChangeRotation_axis_y: {
    extend: plannerChangeRotation_axis,
    background: '#B5CB38',
  },
  plannerChangeRotation_axis_z: {
    extend: plannerChangeRotation_axis,
    background: '#66ACF4',
  },
  changeSizesLockWr: {
    position: 'relative',
    height: 94,
    display: 'grid',
    paddingTop: 13,
    '@media screen and (max-width: 950px)': {
      height: 150,
    },
  },
  changeSizesLockLine1: {
    width: '100%',
    height: 11,
    borderTop: '1px solid #A1A1A1',
    borderRight: '1px solid #A1A1A1',
    opacity: '0.5',
    '@media screen and (max-width: 950px)': {
      height: 51,
    },
  },
  changeSizesLockLine2: {
    borderTop: '1px solid #A1A1A1',
    opacity: '0.5',
    width: 13,
  },
  changeSizesLockLine3: {
    width: '100%',
    height: 11,
    borderBottom: '1px solid #444444',
    borderRight: '1px solid #444444',
    '@media screen and (max-width: 950px)': {
      height: 51,
    },
  },
  materialsGrid: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  plannerChangeRotation_accordion: {
    margin: '10px 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    '& h2': {
      fontSize: 13,
      fontWeight: 400,
      marginRight: 6,
    },
    '& svg': {
      transition: 'all .3s cubic-bezier(0.19, 1, 0.22, 1)',
    },
  },
  arrowUp: {
    transform: 'rotate(90deg)',
    marginRight: 5,
    cursor: 'pointer',
    '& path': {
      transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    },
    '&:hover': {
      '& path': {
        fill: '#a0a0a0',
      },
    },
  },

  plannerChangeRotationMode: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 20,
    '@media screen and (max-width: 950px)': {
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
  },

  plannerChangeRotationMode_text: {
    fontSize: 13,
    fontWeight: 400,
    '@media screen and (max-width: 950px)': {
      marginBottom: 10,
    },
  },

  plannerChangeRotationMode_button: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 12,
    fontWeight: 400,
  },

  plannerChangeRotationMode_switch: {
    background: '#D9D9D9',
    borderRadius: 8,
    width: 21,
    height: 10,
    position: 'relative',
    margin: '0 7px',
    cursor: 'pointer',
    '& span': {
      width: 13.5,
      height: 13.5,
      borderRadius: 20,
      background: '#444444',
      position: 'absolute',
      top: -2,
      transition: 'all .1s ease',
    },
  },
  planner_origModel_button: {
    width: '100%',
    margin: '20px 0',
    '& button': {
      width: '100%',
      background: '#828282',
      padding: '7px 0',
      color: '#ffffff',
      fontSize: 13,
      fontWeight: 400,
      border: 'none',
      cursor: 'pointer',
      transition: 'all .3s ease',
      '&:hover': {
        background: '#ffd119',
      },
    },
  },
  plannerLight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '30px 0 10px',
  },
  plannerLight_top: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 5,
  },
  plannerLight_settings: {
    fontSize: 13,
    fontWeight: 400,
    color: '#66ACF4',
    textDecoration: 'underline',
    cursor: 'pointer',
    transition: 'all .2s ease',
    '&:hover': {
      color: '#F5D141',
    },
  },
  plannerLight_off: {
    marginRight: 5,
  },
  plannerLight_button: {
    background: '#D9D9D9',
    borderRadius: 8,
    width: 21,
    height: 10,
    position: 'relative',
    margin: '0 7px',
    cursor: 'pointer',
    marginTop: 5,
    '& span': {
      width: 13.5,
      height: 13.5,
      borderRadius: 20,
      background: '#444444',
      position: 'absolute',
      top: -2,
      transition: 'all .1s ease',
    },
  },
  preloaderBlock: {
    background: 'rgba(0, 0, 0, .2)',
    zIndex: 99,
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    width: '100%',
  },
  wr_top_productURL: {
    width: '100%',
    background: '#66ACF4',
    padding: '10px 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '40px 0 10px',
    textTransform: 'uppercase',
    fontSize: 13,
    color: '#ffffff',
    cursor: 'pointer',
    transition: 'all .5s ease',
    '& svg': {
      marginLeft: 5,
    },
    '&:hover': {
      background: '#fcc749',
    },
  },
  product_hover: {
    maxHeight: 150,
    padding: '6px 20px',
    textAlign: 'center',
    border: '1px solid #000',
    position: 'absolute',
    display: 'inline',
    zIndex: 105,
    background: '#fff',
    pointerEvents: 'none',
    fontSize: 12,
    '&:after': {
      content: "''",
      position: 'absolute',
      left: '100%',
      top: '50%',
      transform: 'translate(calc(-50% + 1px), -50%) rotate(-45deg)',
      width: 10,
      height: 10,
      background: '#fff',
      borderRight: '1px solid #000',
      borderBottom: '1px solid #000',
    },
    '& p': {
      fontSize: 12,
    },
  },
  selectedTouched: {
    border: '1px solid #000',
    transition: 'all .5s ease',
  },
  wr_top_image: {
    position: 'relative',
    '& > img': {
      position: 'relative',
      zIndex: 2,
    },
  },
  wr_top_image_overlay: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 3,
  },
  previewSelectedObject: {
    userSelect: 'none',
    position: 'absolute',
    pointerEvents: 'none',
    zIndex: 3,
  },
  navigation: {
    display: 'flex',
    borderBottom: '1px solid #cdcdcd',
    alignItems: 'center',
  },
});

const Material = () => {
  const classes = useStyle();
  const dispatch = useDispatch();

  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const isAdded = lastHistoryElem?.isAdded;
  const lastHistoryElemData = lastHistoryElem?.data;

  const isLogged = useSelector(selectIsLogged);

  const [isInFavorites, setIsInFavorites] = useState(null);
  const [userFavorites, setUserFavorites] = useState(user.data.favorites?.items);

  const [styleAnimation, setStyleAnimation] = useState(
    isAdded ? { transform: 'translateX(100%)' } : { transform: 'translateX(-100%)' }
  );

  const [preloaderStatus, setPreloaderStatus] = useState(false);

  let timer = null;
  let dragTimeout = null;

  const updateFavorites = async () => {
    if (!isLogged) return dispatch(setActivePopup({ name: 'login' }));
    const id = lastHistoryElemData?.id;
    if (isInFavorites) {
      await user.uRemoveFromFavorites(id);
      setUserFavorites((prev) => prev.filter((i) => i?.id != id));
    } else {
      const response = await user.uAddToFavorites(id);
      setUserFavorites((prev) => {
        const newArray = prev;
        return [...newArray, response];
      });
    }
    setIsInFavorites(!isInFavorites);
    planner.apiScene.dispatchEvent(new Event(planner.apiScene.FAVORITES_BUTTON, {}));
  };

  const onMouseDownProduct = (e) => {
    const id = lastHistoryElemData.id;
    document.addEventListener('mousemove', onObjectMove);
    document.addEventListener('mouseup', onObjectMouseUp);
    timer = Date.now();
    dragTimeout = setTimeout(() => {
      e.nativeEvent.button == 0 ? planner.scene.dragProductFromCatalog(id) : null;
    }, 100);
  };

  const onObjectMove = (e) =>
    Date.now() - timer > 100 && planner.mih().state && planner.mih().state.mouseMove(e);

  const onObjectMouseUp = (e) => {
    clearTimeout(dragTimeout);
    document.removeEventListener('mousemove', onObjectMove);
    document.removeEventListener('mouseup', onObjectMouseUp);
    document.querySelector('.product_hover')?.remove();

    if (Date.now() - timer > 100) {
      if (e.clientX < R2D.Viewers._instance.getOffsetWidthDueToOpenedPanels())
        planner.mih().state && planner.mih().state.mouseUp(e);
    }
  };

  useEffect(() => {
    setTimeout(() => setStyleAnimation({ transform: 'translateX(0%)' }), 50);
  }, []);

  useEffect(() => {
    lastHistoryElemData &&
      setIsInFavorites(userFavorites?.find((i) => i?.id == lastHistoryElemData?.id));
  }, [lastHistoryElemData]);
  useEffect(() => {
    setUserFavorites(user.data.favorites?.items || []);
  }, [isLogged]);

  return (
    <div className={classes.cont} style={styleAnimation}>
      <div className={classes.wrap}>
        <Navigation breadcrumsTitle={props.breadcrumsTitle} />
        <div className={classes.wr}>
          <div className={classes.wr_top}>
            <div className={classes.wr_top_favorites_main}>
              <IconHeart
                size={16}
                onClick={updateFavorites}
                color={isInFavorites ? '#64BCF0' : '#C8C8C8'}
              />
            </div>

            <div className={classes.wr_top_image}>
              <img
                src={
                  lastHistoryElemData
                    ? R2D.URL.DOMAIN + lastHistoryElemData.source?.images.preview
                    : ''
                }
              />
              <div
                className={classes.wr_top_image_overlay}
                onMouseDown={onMouseDownProduct}
                onTouchStart={onMouseDownProduct}
              ></div>
            </div>
          </div>
        </div>
      </div>
      <div
        className={classes.preloaderBlock}
        style={preloaderStatus ? { opacity: 1 } : { opacity: 0, zIndex: -1 }}
      >
        <div className="preloader-cube"></div>
      </div>
    </div>
  );
};

export default Material;
