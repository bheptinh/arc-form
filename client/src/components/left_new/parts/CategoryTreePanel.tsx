import { IconListTree } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';

import { useCatalogMaterials } from '../../../api/catalog';
import { useLanguages } from '../../../api/hooks/useLanguages';
import { planner } from '../../../initR2D';
import {
  changeActiveControlPanelMode,
  controlPanelHistoryReplaceArray,
  controlPanelUpdateBreadCrumbs,
  selectActiveControlPanelCatagoryTreeShowStatus,
  selectActiveControlPanelMode,
  selectActiveControlPanelModeData,
  selectCategoryTreePanelStatus,
  selectPrevControlPanelMode,
  updateCategoryTreePanelStatus,
} from '../../../redux/features/control/controlPanelSlice';
import { removeQuickPanelAll } from '../../../redux/features/quickPanels/quickPanelsSlice';
import Accordion from '../../../shared-components/Accordion';

const useStyle = createUseStyles({
  planner_catalog_cont: {
    borderRight: '1px solid var(--color-border-light)',
    background: 'var(--color-white)',
    height: '100%',
    display: 'grid',
    alignContent: 'baseline',
    gridTemplateRows: '1fr',
    transition: 'all .5s cubic-bezier(0.19, 1, 0.22, 1)',
    width: 309,
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 3,
  },
  category_tree_close: {
    width: '15px',
    height: '15px',
    position: 'absolute',
    top: '11px',
    right: '12px',
    cursor: 'pointer',
    zIndex: '2',
    '& path': {
      transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
    },
    '&:hover': {
      '& path': {
        fill: 'var(--color-icon)',
      },
    },
  },
  category_tree_close_icon: {
    width: '100%',
    height: 'auto',
  },
  catalog_wr: {
    overflow: 'hidden',
    height: '100%',
    background: 'var(--color-white)',
    borderTop: '1px solid var(--color-border)',
    paddingTop: 7,
  },
  tree_wr: {
    minHeight: '100%',
    '& ul': {
      listStyle: 'none',
      marginBottom: 5,
    },
    '&>ul:first-child': {
      paddingLeft: 0,
    },
  },
  $dropdown: {
    background: 'red',
  },
  tree_dropdown_title: {
    color: 'var(--color-black)',
    marginBottom: '5px',
    whiteSpace: 'nowrap',
    fontSize: '17px',
    cursor: 'pointer',
    position: 'relative',
    fontFamily: 'RobotoCondensed-Regular',
    zIndex: 1,
    display: 'flex',
    alignItems: 'flex-end',
    '&:before': {
      content: "''",
      position: 'absolute',
      top: '50%',
      zIndex: -1,
      left: '50%',
      width: '500%',
      height: 'calc(100% + 4px)',
      transform: 'translate(-50%, -50%)',
      background: 'var(--color-surface-muted)',
      opacity: 0,
      transition: 'all .9s cubic-bezier(.19, 1, .22, 1)',
    },
    '&:hover:before': {
      opacity: 1,
    },
  },
  tree_dropdown_arrow_wr: {
    transform: 'translateY(-2px)',
    padding: '0 0 0 6px',
    paddingRight: 7,
    position: 'relative',
    zIndex: 2,
  },
  tree_dropdown_arrow: {
    pointerEvents: 'none',
    transform: 'rotate(-90deg)',
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
  },
  tree_dropdown_arrow_open: {
    transform: 'rotate(0deg)',
  },
  // titles below the first level
  tree_dropdown_nested: {
    '& .tree_dropdown_title': {
      fontSize: '13px',
      color: 'var(--color-black)',
      marginBottom: '0px',
      whiteSpace: 'nowrap',
      padding: '4.5px 0',
    },
  },
  tree_dropdown_name: {
    paddingRight: '5px',
    flexGrow: 1,
    fontFamily: 'RobotoCondensed-Regular',
  },
  tree_dropdown_option: {
    position: 'relative',
    zIndex: 1,
    cursor: 'pointer',
    fontSize: '13px',
    color: '#555555',
    '&:before': {
      content: "''",
      position: 'absolute',
      top: '50%',
      zIndex: -1,
      left: '50%',
      width: '500%',
      height: 'calc(100%)',
      transform: 'translate(-50%, -50%)',
      background: 'var(--color-surface-muted)',
      opacity: 0,
      transition: 'all .9s cubic-bezier(.19, 1, .22, 1)',
    },
    '&:hover:before': {
      opacity: 1,
    },
  },
  tree_dropdown_title_active: {
    '&:before': {
      background: 'var(--color-accent-soft)',
      opacity: 1,
    },
    '&>$tree_dropdown_name': {
      color: 'var(--color-black)',
    },
  },
  tree_dropdown_overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
});

const CategoryTreePanel = (props) => {
  const dispatch = useDispatch();

  const activeControlPanelMode = useSelector(selectActiveControlPanelMode);
  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = activeControlPanelData?.history;
  const lastHistoryElem =
    controlPanelModeHistory && controlPanelModeHistory[controlPanelModeHistory.length - 1];

  const languages = useLanguages();
  const catalogMaterials = useCatalogMaterials();

  const prevControlPanelMode = useSelector(selectPrevControlPanelMode);
  const activeControlPanelCatagoryTreeShowStatus = useSelector(
    selectActiveControlPanelCatagoryTreeShowStatus
  );

  const [catalogProducts, setCataloProducts] = useState(null);
  const [categoryTreeView, setCategoryTreeView] = useState(null);
  const categoryTreePanelStatus = useSelector(selectCategoryTreePanelStatus);

  const classes = useStyle();

  const onUpdateCurrentDynamicPanelData = (dataArray) => {
    if (!activeControlPanelCatagoryTreeShowStatus) {
      planner.mih().unsetActiveObject();
      dispatch(removeQuickPanelAll());
      dispatch(changeActiveControlPanelMode({ mode: prevControlPanelMode }));
    }
    dispatch(controlPanelHistoryReplaceArray(dataArray));
    dispatch(controlPanelUpdateBreadCrumbs({ data: dataArray, updateType: 'replaceArray' }));
  };

  const getDynamicPanelDataFromPassedData = (data, parentId) => {
    const dataObj = {
      name: data.name,
      id: data.id,
      privateMaterialType: data.privateMaterialType,
      parentId: parentId || null,
      data: null,
      lastSavedScroll: 0,
    };
    if (data.type == 'product' && data.privateMaterialType != 6) {
      const urlList = data.urlList;
      dataObj.type = 'products';
      dataObj.urlList =
        dataObj.privateMaterialType == 1
          ? urlList.replace(
              '/api/category/materialsByCategory',
              R2D.URL.URL_CATALOG_SEARCH.replace(/\?key=\w{1,}$/gm, '')
            ) + '&category_type=1'
          : urlList.replace(
              '/api/category/products',
              R2D.URL.URL_CATALOG_SEARCH.replace(/\?key=\w{1,}$/gm, '')
            );
    } else if (data.type == 'colorpicker') {
      dataObj.type = 'colorpicker';
      const urlList = data.urlList;
      dataObj.urlList =
        dataObj.privateMaterialType == 1
          ? urlList.replace(
              '/api/category/materialsByCategory',
              R2D.URL.URL_CATALOG_SEARCH.replace(/\?key=\w{1,}$/gm, '')
            ) + '&category_type=1'
          : urlList.replace(
              '/api/category/products',
              R2D.URL.URL_CATALOG_SEARCH.replace(/\?key=\w{1,}$/gm, '')
            );
    } else {
      dataObj.type = 'catalog';
      dataObj.data = data.nodes;
    }
    return dataObj;
  };

  const categoryDataProccessingFunction = (data, dataHistory, level, isOpened) => {
    const dataReactArray = [];
    const currentHistoryArray = [...dataHistory];
    currentHistoryArray.push(getDynamicPanelDataFromPassedData(data, data.parentId));
    const lastElemCurrentHistory = currentHistoryArray[currentHistoryArray.length - 1];

    if (data.nodes) {
      function findParentsByName(data, targetId) {
        const parents = new Set();
        function search(node, parentIds = []) {
          if (!node || typeof node !== 'object') return;
          if (node.id === targetId) {
            parentIds.forEach((id) => parents.add(id));
          }
          if (Array.isArray(node.nodes)) {
            for (const child of node.nodes) {
              search(child, [...parentIds, node.id]);
            }
          }
        }
        search(data, [targetId]);
        return Array.from(parents);
      }
      const parentsActiveElem = findParentsByName(data, lastHistoryElem?.id);
      isOpened = parentsActiveElem.includes(data.id);

      dataReactArray.push(
        <li key={Math.random}>
          <Accordion
            header={({ open, setOpen }) => (
              <div
                style={{ paddingLeft: `${dataHistory.length === 0 ? 0 : 11 * level}px` }}
                className={
                  lastElemCurrentHistory.id == lastHistoryElem?.id &&
                  lastElemCurrentHistory.parentId == lastHistoryElem?.parentId
                    ? classes.tree_dropdown_title_active +
                      ' ' +
                      classes.tree_dropdown_title +
                      ' ' +
                      'tree_dropdown_title ' +
                      isOpened
                    : classes.tree_dropdown_title + ' ' + 'tree_dropdown_title ' + isOpened
                }
              >
                <div className={classes.tree_dropdown_arrow_wr} onClick={() => setOpen(!open)}>
                  <img
                    className={
                      classes.tree_dropdown_arrow +
                      ' ' +
                      'tree_dropdown_arrow' +
                      (open ? ' ' + classes.tree_dropdown_arrow_open : '')
                    }
                    src="/src_designer/images/arrow_down_tree.svg"
                  />
                </div>
                <div
                  className={classes.tree_dropdown_name}
                  dangerouslySetInnerHTML={{ __html: data.name }}
                ></div>
                <div
                  className={classes.tree_dropdown_overlay}
                  onClick={(e) => {
                    onUpdateCurrentDynamicPanelData(currentHistoryArray);
                    setOpen(true);
                  }}
                ></div>
              </div>
            )}
            open={isOpened}
          >
            <ul className={classes.tree_dropdown_nested}>
              {data.nodes.map((i) =>
                categoryDataProccessingFunction(
                  { ...i, parentId: data.id },
                  currentHistoryArray,
                  level + 1
                )
              )}
            </ul>
          </Accordion>
        </li>
      );
    } else {
      dataReactArray.push(
        <li
          style={{ paddingLeft: `${dataHistory.length === 0 ? 0 : 11 * level}px` }}
          className={classes.tree_dropdown_option}
          key={Math.random()}
          onClick={(e) => onUpdateCurrentDynamicPanelData(currentHistoryArray)}
        >
          <div
            className={
              lastElemCurrentHistory.id == lastHistoryElem?.id &&
              lastElemCurrentHistory.parentId == lastHistoryElem?.parentId
                ? classes.tree_dropdown_title_active +
                  ' ' +
                  classes.tree_dropdown_title +
                  ' ' +
                  'tree_dropdown_title'
                : classes.tree_dropdown_title + ' ' + 'tree_dropdown_title'
            }
          >
            <div
              className={classes.tree_dropdown_name}
              style={{ paddingLeft: 22 }}
              dangerouslySetInnerHTML={{ __html: data.name }}
            ></div>
          </div>
        </li>
      );
    }
    return dataReactArray;
  };

  useEffect(() => {
    if (!catalogProducts) return;
    const level = 1;
    const categoryTreeViewArray = [];
    catalogProducts.nodes.forEach((i) =>
      categoryTreeViewArray.push(
        categoryDataProccessingFunction(
          { ...i, parentId: catalogProducts.parentId },
          [],
          level,
          null
        )
      )
    );
    setCategoryTreeView(categoryTreeViewArray);
  }, [controlPanelModeHistory, catalogProducts, activeControlPanelMode]);

  useEffect(() => {
    if (activeControlPanelMode == 'furniture') {
      const furniture = planner.getCatalogProducts();
      setCataloProducts({ parentId: furniture.id, nodes: furniture });
    } else if (activeControlPanelMode == 'decor') {
      setCataloProducts({ parentId: null, nodes: catalogMaterials });
    }
  }, [activeControlPanelMode, languages, catalogMaterials]);

  return (
    <div className={classes.planner_catalog_cont}>
      <div
        className={classes.category_tree_close}
        onClick={() => dispatch(updateCategoryTreePanelStatus(!categoryTreePanelStatus))}
      >
        <IconListTree className={classes.category_tree_close_icon} size={24} color="#444" />
      </div>

      <div className={classes.catalog_wr}>
        <SimpleBar style={{ height: '100%' }} autoHide={false} forceVisible="y">
          <div className={classes.tree_wr}>
            <ul>{categoryTreeView}</ul>
          </div>
        </SimpleBar>
      </div>
    </div>
  );
};

export default CategoryTreePanel;
