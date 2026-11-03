import { IconPlus } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';

import { useTranslation } from '../../../../../../api/hooks/useTranslation';
import { planner } from '../../../../../../initR2D';
import {
  selectActiveControlPanelModeData,
  selectDynamicPanelPreviewViewType,
} from '../../../../../../redux/features/control/controlPanelSlice';
import { setActivePopup } from '../../../../../../redux/features/popups/popupsSlice';
import { TileGrid } from '../../../../../../shared-components/TileGrid';
import SelectTile from '../../../../../../smart-components/catalog/select-tile';
import type { Product } from '../../../../../../smart-components/catalog/tile-parts';
import { useMaterialSelect } from '../../../../../../smart-components/catalog/use-material-select';
import Navigation from '../../navigation/Navigation';

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
  prod_item_upload_btn_wr: {
    height: '100%',
    width: '100%',
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexWrap: 'wrap',
  },
  prod_item_upload_btn: {
    width: '100%',
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 15px',
    fontSize: '16px',
    cursor: 'pointer',
    background: 'var(--color-white)',
    position: 'relative',
    borderBottom: '1px solid var(--color-border)',
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    fontFamily: 'RobotoCondensed-Regular',
    zIndex: 1,
    '&:after': {
      top: '0',
      left: '0',
      width: '100%',
      height: '29px',
      content: '""',
      zIndex: -1,
      position: 'absolute',
      background: 'linear-gradient(to bottom, var(--color-surface-subtle), transparent)',
      transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    },
    '&:hover': {
      background: 'var(--color-accent-soft)',
      '&:after': {
        opacity: 0,
      },
    },
    '@media screen and (max-width: 950px)': {
      height: 25,
      fontSize: '10px',
    },
  },
  prod_item_upload_btn_line: {
    background: 'var(--color-slate)',
    height: 1,
    width: '100%',
    position: 'relative',
    '&:before': {
      content: '" "',
      bottom: '100%',
      left: 0,
      width: '100%',
      height: 1,
      background: 'var(--color-white)',
      position: 'absolute',
    },
    '&:after': {
      content: '" "',
      top: '100%',
      left: 0,
      width: '100%',
      height: 1,
      background: 'var(--color-white)',
      position: 'absolute',
    },
  },
  prod_item_upload_btn_img: {
    userSelect: 'none',
    userDrag: 'none',
    marginRight: 16,
    '@media screen and (max-width: 950px)': {
      width: 13,
      height: 13,
    },
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

const Materials = (props) => {
  const dispatch = useDispatch();
  const translation = useTranslation();
  const dynamicPanelPreviewViewType = useSelector(selectDynamicPanelPreviewViewType);
  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const isAdded = lastHistoryElem?.isAdded;

  const { activeMaterial, setActiveMaterial, select } = useMaterialSelect(
    props.materialSelect,
    props.matId
  );
  const [styleAnimation, setStyleAnimation] = useState(
    isAdded ? { transform: 'translateX(100%)' } : { transform: 'translateX(-100%)' }
  );
  const [lastHistoryElemData, setLastHistoryElemData] = useState<Product[] | null>(null);
  const [preloaderStatus, setPreloaderStatus] = useState(true);

  const currOS = R2D.controller.getCurrentOS();
  const isCurrDeviceAPhone = currOS == 'iOS' || currOS == 'Android';
  const classes = useStyle();

  const materials = Array.isArray(lastHistoryElemData) ? lastHistoryElemData : null;
  const ownMaterials = materials?.filter((i) => i.isOwner) ?? [];
  const catalogMaterials = materials?.filter((i) => !i.isOwner) ?? [];
  const showUploadButton = lastHistoryElem.privateMaterialType && !isCurrDeviceAPhone;

  const onCustomMatAddMouseUp = () =>
    dispatch(setActivePopup({ name: 'uploadCustomMaterialPopup' }));

  const updateMaterialsEvent = () =>
    setActiveMaterial(R2D.scene.currentConstructorElementData.getMaterial());

  const onProductsUpdated = async () => {
    setPreloaderStatus(true);
    const loadedData = await planner.scene.categoryDataLoad(
      lastHistoryElem.urlList,
      R2D.controller.getCountry()
    );
    setLastHistoryElemData(loadedData);
    setPreloaderStatus(false);
  };

  useEffect(() => {
    setStyleAnimation({ transform: 'translateX(0%)' });
    planner.scene.addEventListener(planner.scene.CLEAR_MATERIALS, updateMaterialsEvent);
    planner.scene.addEventListener(planner.scene.PRODUCTS_UPDATED, onProductsUpdated);
    return () => {
      planner.scene.removeEventListener(planner.scene.CLEAR_MATERIALS, updateMaterialsEvent);
      planner.scene.removeEventListener(planner.scene.PRODUCTS_UPDATED, onProductsUpdated);
    };
  }, []);

  useEffect(() => {
    planner.scene
      .categoryDataLoad(lastHistoryElem.urlList, R2D.controller.getCountry())
      .then((loadedData: Product[]) => setLastHistoryElemData(loadedData));
  }, [lastHistoryElem.urlList]);

  const tile = (i: Product) => (
    <SelectTile
      key={i.id}
      product={i}
      active={activeMaterial == i.id}
      onSelect={() => select(i.id)}
    />
  );

  const uploadButton = (
    <div className={classes.prod_item_upload_btn} onMouseUp={onCustomMatAddMouseUp}>
      <IconPlus size={26} color="#2a3435" className={classes.prod_item_upload_btn_img} />
      {translation['TIPS_ADD_NEW_MODEL']}
    </div>
  );

  return (
    <div className={classes.planner_catalog_cont} style={styleAnimation}>
      <Navigation
        panelPreviewIcon={props.panelPreviewIcon}
        hideCategoryTree={props.hideCategoryTree}
        breadcrumsTitle={props.breadcrumsTitle}
        isAddSettingsDisabled={props.isAddSettingsDisabled}
        closeButtonStatus={props.closeButtonStatus}
        isHomeDisabled={props.isHomeDisabled}
        breadCrumbsLongShow={props.breadCrumbsLongShow}
      />
      <div className={classes.catalog_wr}>
        <SimpleBar style={{ height: '100%' }} autoHide={false} forceVisible="y">
          <TileGrid size={dynamicPanelPreviewViewType}>
            {ownMaterials.length > 0 ? (
              <div className={classes.prod_item_upload_btn_wr}>
                {showUploadButton ? uploadButton : null}
                {ownMaterials.map(tile)}
                <div className={classes.prod_item_upload_btn_line}></div>
              </div>
            ) : showUploadButton ? (
              uploadButton
            ) : null}
            {catalogMaterials.map(tile)}
          </TileGrid>
        </SimpleBar>
        <div
          className={classes.preloaderBlock}
          style={materials || !preloaderStatus ? { opacity: 0, zIndex: -1 } : { opacity: 1 }}
        >
          <div className="preloader-cube"></div>
        </div>
      </div>
    </div>
  );
};

export default Materials;
