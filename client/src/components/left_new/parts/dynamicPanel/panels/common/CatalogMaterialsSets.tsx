import { useEffect, useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';

import {
  selectActiveControlPanelModeData,
  selectDynamicPanelPreviewViewType,
} from '../../../../../../redux/features/control/controlPanelSlice';
import { TileGrid } from '../../../../../../shared-components/TileGrid';
import SelectTile from '../../../../../../smart-components/catalog/select-tile';
import type { Product } from '../../../../../../smart-components/catalog/tile-parts';
import Navigation from '../../navigation/Navigation';

const planer_catalog_elem = {
  width: 46,
  height: 46,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundPosition: 'center',
  backgroundSize: 'cover',
  position: 'relative',
  userSelect: 'none',
  cursor: 'pointer',
  boxShadow: '1px 1px 2px 1px rgba(0, 0, 0, 0.11)',
  transition: 'all .5s cubic-bezier(0.19, 1, 0.22, 1)',
  '& img': {
    width: '100%',
    height: '100%',
  },
  '& $planer_catalog_prem_zamok': {
    width: 'auto',
    height: 'auto',
    position: 'absolute',
    top: -10,
    right: -11,
    cursor: 'pointer',
    '& rect': {
      transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    },
    '&:hover': {
      '& rect': {
        fill: '#ffd119',
      },
    },
  },
  '&:hover': {
    border: '1px solid #9DD900',
  },
  '@media screen and (max-width: 950px)': {
    width: 'calc(25% - 6px)',
    marginBottom: 10,
  },
};

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
    borderTop: '1px solid var(--color-border)',
  },
  planer_add_elem_lock: {
    border: '1px solid #969696',
    '&:hover': {
      border: '1px solid var(--color-accent-strong)',
    },
  },
  planer_catalog_prem_zamok: {},
  planer_catalog_elem_add: {
    extend: planer_catalog_elem,
    cursor: 'pointer',
    border: '1px solid #969696',
    transition: 'all .2s ease',
    '&:hover': {
      border: '1px solid var(--color-accent-strong)',
      '& $planer_catalog_elem_favorites': {
        opacity: 1,
      },
    },
  },
  planer_catalog_prem_add_img: {
    maxWidth: '60%',
    maxHeight: '60%',
  },

  planer_catalog_elem_upload: {
    borderBottom: '1px solid rgb(178, 178, 178)',
    paddingBottom: 15,
    width: '100%',
    display: 'grid',
    gridGap: 10,
    gridTemplateColumns: 'repeat(4, calc(25% - 5px))',
    '& img': {
      width: 'auto',
    },
    '& $planer_catalog_elem_custom_delete': {
      height: 'auto',
    },
  },
  planer_catalog_elem_custom: {
    '&:hover $planer_catalog_elem_custom_delete': {
      opacity: 1,
    },
  },
  planer_catalog_elem_custom_delete: {
    position: 'absolute',
    right: 0,
    top: 0,
    cursor: 'pointer',
    opacity: 0,
    zIndex: 9,
  },
  planer_catalog_elem_list: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, calc(25% - 5px))',
    gridGap: '10px',
    width: '100%',
    marginTop: 15,
  },
  planer_catalog_elem_wr_flex: {
    padding: 15,
  },
});

const CatalogMaterialsSets = (props) => {
  const dynamicPanelPreviewViewType = useSelector(selectDynamicPanelPreviewViewType);
  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const isAdded = lastHistoryElem?.isAdded;
  const lastHistoryElemData: Product[] | undefined = lastHistoryElem?.data;

  const [activeMaterial, setActiveMaterial] = useState(props.matId);
  const [styleAnimation, setStyleAnimation] = useState(
    isAdded ? { transform: 'translateX(100%)' } : { transform: 'translateX(-100%)' }
  );

  const classes = useStyle();

  // Applies the material to whatever opened this panel, loading its data first if needed.
  const onMaterialSelect = (id: string) => {
    if (!R2D.Pool.getProductData(id)) {
      const loader = R2D.Pool.loadProductData(id);
      loader.addEventListener(Event.COMPLETE, () => {
        props.materialSelect(id, null, activeMaterial, null);
        setActiveMaterial(id);
      });
      loader.addEventListener(Event.ERROR, (e: unknown) =>
        console.log('Error loading material ', e)
      );
    } else {
      props.materialSelect(id, null, activeMaterial, null);
    }
    setActiveMaterial(id);
  };

  useEffect(() => {
    setStyleAnimation({ transform: 'translateX(0%)' });
  }, []);

  return (
    <div className={classes.planner_catalog_cont} style={styleAnimation}>
      <Navigation
        hideBreadCrumbsHomePanel={props.hideBreadCrumbsHomePanel}
        disableBreadcrumbs={props.disableBreadcrumbs}
        isAddSettingsDisabled={props.isAddSettingsDisabled}
        panelPreviewIcon={props.panelPreviewIcon}
        hideCategoryTree={props.hideCategoryTree}
        breadcrumsTitle={props.breadcrumsTitle}
        isHomeDisabled={props.isHomeDisabled}
        closeButtonStatus={props.closeButtonStatus}
        breadCrumbsLongShow={props.breadCrumbsLongShow}
      />
      <div className={classes.catalog_wr}>
        {lastHistoryElemData && (
          <SimpleBar style={{ height: '100%' }} autoHide={false} forceVisible="y">
            <TileGrid size={dynamicPanelPreviewViewType}>
              {lastHistoryElemData.map((i) => (
                <SelectTile
                  key={i.id}
                  product={i}
                  active={activeMaterial == i.id}
                  onSelect={() => onMaterialSelect(i.id)}
                />
              ))}
            </TileGrid>
          </SimpleBar>
        )}
      </div>
    </div>
  );
};

export default CatalogMaterialsSets;
