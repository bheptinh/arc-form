import 'simplebar-react/dist/simplebar.min.css';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';

import { favoritesQueryOptions } from '../../../../../../api/favorites';
import { useTranslation } from '../../../../../../api/hooks/useTranslation';
import { planner } from '../../../../../../initR2D';
import {
  changeActiveControlPanelMode,
  selectActiveControlPanelModeData,
  selectControlPanelData,
  selectDynamicPanelPreviewViewType,
  selectPrevControlPanelMode,
} from '../../../../../../redux/features/control/controlPanelSlice';
import { selectIsLogged } from '../../../../../../redux/features/user/userSlice';
import { TileGrid } from '../../../../../../shared-components/TileGrid';
import CatalogTile from '../../../../../../smart-components/catalog/catalog-tile';
import type { Product } from '../../../../../../smart-components/catalog/tile-parts';
import AdditionalSettings from '../../navigation/components/AdditionalSettings';

const useStyle = createUseStyles({
  planner_catalog_cont: {
    borderRight: '1px solid var(--color-border-light)',
    background: 'var(--color-white)',
    height: '100%',
    display: 'grid',
    alignContent: 'baseline',
    gridTemplateRows: 'auto 1fr',
    transition: 'all .5s cubic-bezier(0.19, 1, 0.22, 1)',
    width: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  catalog_top_wr: {
    padding: '10px 10px 10px 10px',
    '@media screen and (max-width: 950px)': {
      padding: 5,
    },
  },
  catalog_top_btns_wr: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  favoriteTitleWr: {
    display: 'flex',
    alignItems: 'center',
  },
  favoriteTitle: {
    fontSize: 17,
    color: 'var(--color-text)',
    fontFamily: 'RobotoCondensed-Regular',
    marginLeft: 3,
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
    },
  },
  catalog_top_selected_preview: {
    width: '17px',
    height: '16px',
    position: 'relative',
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    flexShrink: 0,
    '& img': {
      top: '50%',
      left: '0',
      position: 'absolute',
      maxWidth: '100%',
      height: 'auto',
      transform: 'translateY(-50%)',
    },
    '@media screen and (max-width: 950px)': {
      height: 14,
      width: 11,
    },
  },
  catalog_wr: {
    overflow: 'hidden',
    height: '100%',
    background: 'var(--color-white)',
    borderTop: '1px solid var(--color-border)',
  },

  preloaderBlock: {
    background: 'rgba(0, 0, 0, .2)',
    zIndex: 4,
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    width: '100%',
    transition: 'all .5s cubic-bezier(0.19, 1, 0.22, 1)',
  },
});

const Main = () => {
  const dispatch = useDispatch();
  const translation = useTranslation();
  const controlPanelData = useSelector(selectControlPanelData);
  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const isAdded = lastHistoryElem?.isAdded;
  const dynamicPanelPreviewViewType = useSelector(selectDynamicPanelPreviewViewType);
  const isLogged = useSelector(selectIsLogged);
  const prevControlPanelMode = useSelector(selectPrevControlPanelMode);
  const { data: favorites, isPending } = useQuery(favoritesQueryOptions);
  const items = ((favorites?.items ?? []) as Product[]).filter(Boolean);
  const hadItems = useRef(items.length > 0);

  const [styleAnimation, setStyleAnimation] = useState(
    isAdded ? { transform: 'translateX(100%)' } : { transform: 'translateX(-100%)' }
  );

  const classes = useStyle();

  const currOS = R2D.controller.getCurrentOS();
  const isCurrDeviceAPhone = currOS == 'iOS' || currOS == 'Android';

  useEffect(() => {
    setStyleAnimation({ transform: 'translateX(0%)' });
  }, []);

  useEffect(() => {
    if (!isLogged) dispatch(changeActiveControlPanelMode({ mode: prevControlPanelMode }));
  }, [isLogged]);

  // Removing the last favourite leaves the panel for the previous one, or the furniture catalog.
  useEffect(() => {
    if (items.length > 0) {
      hadItems.current = true;
      return;
    }
    if (!hadItems.current) return;
    hadItems.current = false;
    dispatch(
      changeActiveControlPanelMode(
        prevControlPanelMode
          ? { mode: prevControlPanelMode }
          : {
              mode: 'furniture',
              data:
                controlPanelData['furniture'].history.length < 1
                  ? {
                      type: 'catalog',
                      addType: 'main',
                      id: null,
                      lastSavedScroll: 0,
                      data: planner.getCatalogProducts(),
                    }
                  : null,
            }
      )
    );
  }, [items.length, controlPanelData, dispatch, prevControlPanelMode]);

  return (
    <div className={classes.planner_catalog_cont} style={styleAnimation}>
      <div className={classes.catalog_top_wr}>
        <div className={classes.catalog_top_btns_wr}>
          <div className={classes.favoriteTitleWr}>
            <div className={classes.catalog_top_selected_preview}>
              <img src="/src_designer/images/icon_favorite.svg" />
            </div>
            <div className={classes.favoriteTitle}>{translation['FAVORITES_TITLE']}</div>
          </div>
          {!isCurrDeviceAPhone ? <AdditionalSettings hideCategoryTree={true} /> : null}
        </div>
      </div>
      <div className={classes.catalog_wr}>
        <SimpleBar style={{ height: '100%' }} autoHide={false} forceVisible="y">
          <TileGrid size={dynamicPanelPreviewViewType}>
            {items.map((elem) => (
              <CatalogTile key={elem.id + '_' + (elem.addData || '')} product={elem} />
            ))}
          </TileGrid>
        </SimpleBar>
      </div>
      <div
        className={classes.preloaderBlock}
        style={isPending ? { opacity: 1 } : { opacity: 0, zIndex: -1 }}
      >
        <div className="preloader-cube"></div>
      </div>
    </div>
  );
};

export default Main;
