import 'simplebar-react/dist/simplebar.min.css';

import { IconSearch } from '@tabler/icons-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';

import { useTranslation } from '../../../../../../api/hooks/useTranslation';
import { planner, user } from '../../../../../../initR2D';
import {
  controlPanelHistoryDataUpdate,
  selectActiveControlPanelModeData,
  selectDynamicPanelPreviewViewType,
} from '../../../../../../redux/features/control/controlPanelSlice';
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
    padding: '6px 6px 6px 6px',
    '@media screen and (max-width: 950px)': {
      padding: 5,
    },
  },
  searchContainer: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'space-between',
  },
  searchInput: {
    color: 'var(--color-text)',
    outline: 'none',
    padding: '3px 6px',
    fontSize: '13px',
    background: 'transparent',
    fontWeight: 400,
    flexGrow: 1,
    border: '1px solid var(--color-surface-muted)',
    marginRight: '5px',
    borderRadius: 3,
    '@media screen and (max-width: 950px)': {
      fontSize: '11px',
      width: 137,
    },
  },
  search_btn_wr: {
    width: 36,
    height: 26,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'var(--color-surface-subtle)',
    border: '1px solid var(--color-surface-muted)',
    borderRadius: 3,
    cursor: 'pointer',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    '&:hover': {
      background: 'var(--color-slate)',
      '& svg': {
        stroke: 'var(--color-white)',
      },
    },
  },
  searchBtn: {
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
  },
  seach_title_wr: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 2,
    paddingRight: 9,
  },
  seach_title: {
    fontSize: 13,
    color: 'var(--color-text)',
    fontFamily: 'RobotoCondensed-Regular',
    '& span': {
      color: '#939393',
    },
    '@media screen and (max-width: 950px)': {
      fontSize: 9,
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
    zIndex: 9,
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

  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const isAdded = lastHistoryElem?.isAdded;
  const dynamicPanelPreviewViewType = useSelector(selectDynamicPanelPreviewViewType);

  // The last search, kept in the panel history so it survives navigating away and back.
  const [lastSearch, setLastSearch] = useState(() => lastHistoryElem?.data);
  const searchedList: Product[] | undefined = lastSearch?.searchResult;
  const [styleAnimation, setStyleAnimation] = useState(
    isAdded ? { transform: 'translateX(100%)' } : { transform: 'translateX(-100%)' }
  );
  const [preloaderStatus, setPreloaderStatus] = useState(false);

  const classes = useStyle();

  const searchInput = useRef<HTMLInputElement>(null);

  const currOS = R2D.controller.getCurrentOS();
  const isCurrDeviceAPhone = currOS == 'iOS' || currOS == 'Android';

  const onClickSearchBtn = async () => {
    const query = searchInput.current?.value;
    if (!query) return;
    setPreloaderStatus(true);
    const searchResult = await user.uGetSearchResult(query);
    if (searchResult?.type != 'error') {
      const search = {
        searchResult: searchResult.data.items,
        searchTotal: searchResult.data.total,
        searchQuery: query,
      };
      setLastSearch(search);
      dispatch(controlPanelHistoryDataUpdate(search));
    }
    setPreloaderStatus(false);
  };

  const onEnterClick = (e: KeyboardEvent) =>
    e.code == 'Enter' && searchInput.current == document.activeElement && onClickSearchBtn();

  const onSearchQueryUpdate = () => onClickSearchBtn();

  useEffect(() => {
    const keyTimeout = setTimeout(() => setStyleAnimation({ transform: 'translateX(0%)' }), 50);
    document.addEventListener('keyup', onEnterClick);
    planner.scene.addEventListener(planner.scene.PRODUCTS_UPDATED, onSearchQueryUpdate);
    return () => {
      planner.scene.removeEventListener(planner.scene.PRODUCTS_UPDATED, onSearchQueryUpdate);
      document.removeEventListener('keyup', onEnterClick);
      clearTimeout(keyTimeout);
    };
  }, []);

  return (
    <div className={classes.planner_catalog_cont} style={styleAnimation}>
      <div className={classes.catalog_top_wr}>
        <div className={classes.searchContainer}>
          <input
            type="text"
            placeholder={translation['SEARCH_PLACEHOLDER']}
            className={classes.searchInput}
            ref={searchInput}
            defaultValue={lastSearch?.searchQuery}
          />

          <div className={classes.search_btn_wr} onClick={onClickSearchBtn}>
            <IconSearch size={14} color="#2a3435" className={classes.searchBtn} />
          </div>
        </div>
        {lastSearch?.searchTotal ? (
          <div className={classes.seach_title_wr}>
            <div className={classes.seach_title}>
              {translation['SEARCH_RESULT']} <span>{' (' + lastSearch.searchTotal + ')'} </span>
            </div>
            {!isCurrDeviceAPhone ? <AdditionalSettings hideCategoryTree={true} /> : null}
          </div>
        ) : null}
      </div>
      {searchedList ? (
        <div className={classes.catalog_wr}>
          <SimpleBar style={{ height: '100%' }} autoHide={false} forceVisible="y">
            <TileGrid size={dynamicPanelPreviewViewType}>
              {searchedList.map((elem) => (
                <CatalogTile key={elem.id} product={elem} />
              ))}
            </TileGrid>
          </SimpleBar>
        </div>
      ) : null}
      <div
        className={classes.preloaderBlock}
        style={preloaderStatus ? { opacity: 1 } : { opacity: 0, zIndex: -1 }}
      >
        <div className={'preloader-cube'}></div>
      </div>
    </div>
  );
};

export default Main;
