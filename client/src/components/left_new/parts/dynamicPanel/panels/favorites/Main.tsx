import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { favoritesQueryOptions } from '../../../../../../api/favorites';
import { useTranslation } from '../../../../../../api/hooks/useTranslation';
import { planner } from '../../../../../../initR2D';
import {
  changeActiveControlPanelMode,
  selectControlPanelData,
  selectDynamicPanelPreviewViewType,
  selectPrevControlPanelMode,
} from '../../../../../../redux/features/control/controlPanelSlice';
import { selectIsLogged } from '../../../../../../redux/features/user/userSlice';
import { TileGrid } from '../../../../../../shared-components/TileGrid';
import CatalogTile from '../../../../../../smart-components/catalog/catalog-tile';
import type { Product } from '../../../../../../smart-components/catalog/tile-parts';
import CatalogScreen from '../common/CatalogScreen';

const Main = () => {
  const dispatch = useDispatch();
  const translation = useTranslation();
  const controlPanelData = useSelector(selectControlPanelData);
  const dynamicPanelPreviewViewType = useSelector(selectDynamicPanelPreviewViewType);
  const isLogged = useSelector(selectIsLogged);
  const prevControlPanelMode = useSelector(selectPrevControlPanelMode);
  const { data: favorites, isPending } = useQuery(favoritesQueryOptions);
  const items = ((favorites?.items ?? []) as Product[]).filter(Boolean);
  const hadItems = useRef(items.length > 0);

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
    <CatalogScreen
      header={
        <CatalogScreen.Header
          icon="/src_designer/images/icon_favorite.svg"
          title={translation['FAVORITES_TITLE']}
        />
      }
      isLoading={isPending}
    >
      <TileGrid size={dynamicPanelPreviewViewType}>
        {items.map((elem) => (
          <CatalogTile key={elem.id + '_' + (elem.addData || '')} product={elem} />
        ))}
      </TileGrid>
    </CatalogScreen>
  );
};

export default Main;
