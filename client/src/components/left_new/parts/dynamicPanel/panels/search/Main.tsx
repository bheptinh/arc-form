import { IconSearch } from '@tabler/icons-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

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
import CatalogScreen from '../common/CatalogScreen';
import classes from './Search.module.css';

const Main = () => {
  const dispatch = useDispatch();
  const translation = useTranslation();

  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const dynamicPanelPreviewViewType = useSelector(selectDynamicPanelPreviewViewType);

  // The last search, kept in the panel history so it survives navigating away and back.
  const [lastSearch, setLastSearch] = useState(() => lastHistoryElem?.data);
  const searchedList: Product[] | undefined = lastSearch?.searchResult;
  const [preloaderStatus, setPreloaderStatus] = useState(false);

  const searchInput = useRef<HTMLInputElement>(null);

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
    document.addEventListener('keyup', onEnterClick);
    planner.scene.addEventListener(planner.scene.PRODUCTS_UPDATED, onSearchQueryUpdate);
    return () => {
      planner.scene.removeEventListener(planner.scene.PRODUCTS_UPDATED, onSearchQueryUpdate);
      document.removeEventListener('keyup', onEnterClick);
    };
  }, []);

  return (
    <CatalogScreen
      header={
        <div className={classes.top}>
          <div className={classes.searchContainer}>
            <input
              type="text"
              placeholder={translation['SEARCH_PLACEHOLDER']}
              className={classes.searchInput}
              ref={searchInput}
              defaultValue={lastSearch?.searchQuery}
            />

            <div className={classes.searchBtn} onClick={onClickSearchBtn}>
              <IconSearch size={14} color="#2a3435" className={classes.searchIcon} />
            </div>
          </div>
          {lastSearch?.searchTotal ? (
            <div className={classes.resultRow}>
              <div className={classes.resultTitle}>
                {translation['SEARCH_RESULT']} <span>{' (' + lastSearch.searchTotal + ')'} </span>
              </div>
              <CatalogScreen.Settings />
            </div>
          ) : null}
        </div>
      }
      isLoading={preloaderStatus}
    >
      {searchedList ? (
        <TileGrid size={dynamicPanelPreviewViewType}>
          {searchedList.map((elem) => (
            <CatalogTile key={elem.id} product={elem} />
          ))}
        </TileGrid>
      ) : null}
    </CatalogScreen>
  );
};

export default Main;
