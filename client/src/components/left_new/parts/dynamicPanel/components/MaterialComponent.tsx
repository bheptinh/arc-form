import { IconCopy } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch } from 'react-redux';

import { useCatalogMaterials } from '../../../../../api/catalog';
import { useTranslation } from '../../../../../api/hooks/useTranslation';
import { planner, user } from '../../../../../initR2D';
import {
  controlPanelHistoryAddArray,
  controlPanelUpdateBreadCrumbs,
} from '../../../../../redux/features/control/controlPanelSlice';
import { setActivePopup } from '../../../../../redux/features/popups/popupsSlice';
import Tooltip from '../../../../../shared-components/Tooltip';

const editMatEditIcon = {
  width: 16,
  height: 16,
  margin: '0 5px',
  '@media screen and (max-width: 950px)': {
    width: 11,
    height: 11,
  },
};

const useStyle = createUseStyles({
  editMatItemWr: {
    aspectRatio: '1 / 1',
    position: 'relative',
    borderRight: '1px solid var(--color-surface-muted)',
    borderBottom: '1px solid var(--color-surface-muted)',
  },
  editMatItem: {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      '& $editMat': {
        transform: 'translateY(0%)',
      },
    },
  },
  editMat: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: 30,
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    background: 'rgba(68, 68, 68, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transform: 'translateY(102%)',
    '@media screen and (max-width: 950px)': {
      transform: 'translateY(0%)',
      height: 20,
    },
  },
  editMatImg: {
    width: '100%',
    height: '100%',
    cursor: 'pointer',
    backgroundSize: 'cover',
    position: 'relative',
  },
  editMatEditIcon: {
    extend: editMatEditIcon,
    cursor: 'pointer',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    '&:hover': {
      stroke: 'var(--color-accent-soft)',
    },
  },
  editMatEditIcon_disabled: {
    extend: editMatEditIcon,
  },

  editMatAddColor: {
    color: 'var(--color-icon-info)',
    letterSpacing: '.03em',
  },
  btn_hover: {
    position: 'absolute',
    background: 'var(--color-info-bright)',
    display: 'none',
    fontSize: 12,
    width: 'max-content',
    padding: '2px 7px',
    transition: 'all .1s ease',
    userSelect: 'none',
    zIndex: 999,
    visibility: 'hidden',
  },
  editMatItem_main: {
    width: '100%',
    height: '100%',
  },
});

const MaterialComponent = (props) => {
  const dispatch = useDispatch();

  const classes = useStyle();

  const translation = useTranslation();

  const [isLoaded, setIsLoaded] = useState({ status: false, materialSrc: '', needUpdate: 0 });
  const [matName, setMatName] = useState(null);
  const [showCopy, setShowCopy] = useState(
    props.onCopyPaste.hasOwnProperty('statusCopy') ? props.onCopyPaste.statusCopy : true
  );

  const catalogMaterials = useCatalogMaterials();

  const mouseEnter = (e) => {
    const product = e.currentTarget;
    const hoverWindow = document.createElement('div');
    hoverWindow.classList.add('product_hover');
    document.querySelector('body')?.append(hoverWindow);
    const matColor = document.createElement('p');
    matColor.textContent =
      props.matId?.indexOf && ~props.matId.indexOf('#')
        ? props.matId
        : matName
          ? matName
          : R2D.Pool.getProductData(props.matId)
            ? R2D.Pool.getProductData(props.matId).name
            : translation['UPLOAD_FROM_MODEL'];
    if (props.addMaterial) {
      const materialsName = document.createElement('p');
      matColor.classList.add(classes.editMatAddColor);
      materialsName.textContent = matName
        ? matName
        : R2D.Pool.getProductData(props.addMaterial)
          ? R2D.Pool.getProductData(props.addMaterial).name
          : '';
      hoverWindow.append(materialsName);
    }
    hoverWindow.append(matColor);
    hoverWindow.style.left = product.getBoundingClientRect().left + product.offsetWidth + 'px';
    hoverWindow.style.top =
      product.getBoundingClientRect().top +
      (product.offsetHeight - hoverWindow.offsetHeight) / 2 +
      'px';

    if (props.mouseEnterMaterial) props.mouseEnterMaterial();
    if (props.selectMeshOnHover) {
      if (props.hash) R2D.modelUploader.selectPart(props.hash);
    }
  };

  const mouseLeave = () => {
    document.querySelector('.product_hover')?.remove();
    if (props.mouseLeaveMaterial) props.mouseLeaveMaterial();
    if (props.selectMeshOnHover) {
      R2D.modelUploader.unselectParts();
    }
  };

  const onPaste = () => {
    if (props.type == 'group') {
      props.onCopyPaste.paste(props.matId, props.addMaterial);
    } else if (props.onCopyPaste.index || !isNaN(props.onCopyPaste.index)) {
      props.onCopyPaste.paste(props.onCopyPaste.index);
    } else {
      props.onCopyPaste.paste();
    }
  };

  const historyUpdateFunctions = (historyObj) => {
    dispatch(controlPanelHistoryAddArray(historyObj));
    dispatch(controlPanelUpdateBreadCrumbs({ data: historyObj, updateType: 'addArray' }));
  };

  function goForward(objData, parentId = null) {
    let resultForward;
    if (objData.type == 'materials') {
      if (objData.materials.find((i) => i.id == props.matId))
        resultForward = [
          {
            type: 'catalogMaterialsSets',
            parentId,
            id: objData.id,
            name: objData.text,
            data: objData.materials,
            added: true,
          },
        ];
      else resultForward = false;
    } else {
      objData.children.some((i) => {
        resultForward = goForward(i, objData.id);
        if (resultForward) {
          resultForward.push({
            type: 'catalogSets',
            parentId,
            data: objData.children,
            id: objData.id,
            name: objData.text,
            added: true,
          });
          return true;
        } else return false;
      });
    }
    return resultForward;
  }

  const onClickPreview = async (e) => {
    let passedClickRes;
    if (props.onClick) {
      passedClickRes = props.onClick();
      if (passedClickRes === false) return;
    }
    let historyObj;
    if (catalogMaterials && catalogMaterials.length > 0) {
      let dataArray = [];
      if (props.materialsSource.type == 'bank' || passedClickRes?.source == 'bank') {
        historyObj = {
          id: null,
          addType: 'main',
          data: catalogMaterials,
          type: 'catalog',
        };
        dataArray.push(historyObj);
        if (R2D.Pool.getProductData(props.matId)) {
          Object.values(
            typeof structuredClone !== 'undefined'
              ? structuredClone(R2D.Pool.getProductData(props.matId).categoryMaterial)
              : JSON.parse(JSON.stringify(R2D.Pool.getProductData(props.matId).categoryMaterial))
          )[0]
            ?.reverse()
            .reduce((prevVal, currVal, index, array) => {
              const activeArray = prevVal.find((y) => y.id == currVal.id);
              const parentId = (array[index - 1] && array[index - 1].id) || null;
              if (activeArray) {
                if (activeArray.nodes) {
                  historyObj = {
                    id: activeArray.id,
                    parentId,
                    data: activeArray.nodes,
                    id: activeArray.id,
                    name: activeArray.name,
                    type: 'catalog',
                  };
                  dataArray.push(historyObj);
                  return activeArray.nodes;
                } else {
                  historyObj = {
                    type: 'materials',
                    matShowType: 'bank',
                    parentId,
                    urlList:
                      activeArray.urlList?.replace(
                        '/api/category/materialsByCategory',
                        R2D.URL.URL_CATALOG_SEARCH.replace(/\?key=\w{1,}$/gm, '')
                      ) + '&category_type=1',
                    privateMaterialType: activeArray.privateMaterialType,
                    id: activeArray.id,
                    name: activeArray.name,
                    data: null,
                  };
                  dataArray.push(historyObj);
                }
              } else array.splice(1);
            }, catalogMaterials);
        } else if (props.matId?.indexOf && ~props.matId.indexOf('#')) {
          if (props.addMaterial && R2D.Pool.getProductData(props.addMaterial)) {
            Object.values(
              typeof structuredClone !== 'undefined'
                ? structuredClone(R2D.Pool.getProductData(props.addMaterial).categoryMaterial)
                : JSON.parse(
                    JSON.stringify(R2D.Pool.getProductData(props.addMaterial).categoryMaterial)
                  )
            )[0]
              ?.reverse()
              .reduce((prevVal, currVal, index, array) => {
                const activeArray = prevVal.find((y) => y.id == currVal.id);
                const parentId = (array[index - 1] && array[index - 1].id) || null;
                if (activeArray) {
                  if (activeArray.nodes && activeArray.type !== 'colorpicker') {
                    historyObj = {
                      id: activeArray.id,
                      parentId,
                      name: activeArray.name,
                      id: activeArray.id,
                      data: activeArray.nodes,
                      type: 'catalog',
                    };
                    dataArray.push(historyObj);
                    return activeArray.nodes;
                  } else {
                    historyObj = {
                      parentId,
                      urlList:
                        activeArray.urlList?.replace(
                          '/api/category/materialsByCategory',
                          R2D.URL.URL_CATALOG_SEARCH.replace(/\?key=\w{1,}$/gm, '')
                        ) + '&category_type=1',
                      id: activeArray.id,
                      name: activeArray.name,
                      privateMaterialType: activeArray.privateMaterialType,
                      type: 'colorpicker',
                    };
                    dataArray.push(historyObj);
                  }
                } else array.splice(1);
              }, catalogMaterials);
          }
        }
      }
      if (props.materialsSource.type == 'set') {
        if (props.materialsSource.data) {
          const loadedData = await user.loadRightPanelData(
            R2D.URL.URL_GET_SET_TREE + '&set_id=' + props.materialsSource.data
          );
          if (
            loadedData.status != 'success' ||
            !loadedData?.products ||
            (!loadedData?.products.set && !loadedData?.products.materials) ||
            (!loadedData?.products.set.nodes && loadedData?.products.materials.length < 1)
          ) {
            dispatch(setActivePopup({ name: 'alert', data: 'TEXT_ERROR_LOAD_DATA' }));
          } else {
            if (loadedData.products.materials.length > 0) {
              dataArray.push({
                type: 'catalogMaterialsSets',
                parentId: null,
                id: null,
                name: loadedData.products?.set?.text || '',
                data: loadedData.products.materials,
                added: true,
              });
            } else {
              let result;
              if (loadedData.products.set.nodes.length == 1) {
                loadedData.products.set.nodes.some((i) => {
                  result = goForward(i);
                  result &&
                    result.push({
                      type: 'catalogSets',
                      parentId: null,
                      data: loadedData.products.set.nodes,
                      id: null,
                      added: true,
                    });
                  return result ? true : false;
                });
              } else {
                result = [];
                result.push({
                  type: 'catalogSets',
                  parentId: null,
                  data: loadedData.products.set.nodes,
                  id: null,
                  added: true,
                });
              }
              dataArray = [...dataArray, ...result.reverse()];
            }
          }
        }
      }
      dataArray && dataArray.length > 0 && historyUpdateFunctions(dataArray);
    }
    return historyObj;
  };

  const timeoutId = undefined;

  const mouseLeaveCopyPaste = (e) => {
    clearTimeout(timeoutId);
    const hoverDiv = document.querySelector('.' + classes.btn_hover);
    hoverDiv?.remove();
  };

  const mouseUpBtnCopy = (e) =>
    props.onCopyPaste.copy(props.matId, props.addMaterial, props.onCopyPaste.index);

  const mouseUpBtnPaste = (e) => onPaste(e);

  const onMouseUpCopyPaste = (e) => {
    document.removeEventListener('mouseup', onMouseUpCopyPaste);
  };

  const mouseDownBtnCopyPaste = (e) => {
    document.addEventListener('mouseup', onMouseUpCopyPaste);
    mouseLeaveCopyPaste(e);
  };

  useEffect(
    () => () => {
      document.querySelector('.product_hover')
        ? document.querySelector('.product_hover').remove()
        : null;
    },
    []
  );

  useEffect(() => {
    const loadMaterial = async () => {
      setIsLoaded({ ...isLoaded, status: false });
      if (props.mesh) {
        const matSrc = R2D.Tool.getPrevEmbeddedMatFromMesh(
          R2D.scene.currentView3DObject.getMeshByHash(
            R2D.scene.currentSceneObject.getMaterials()[+props.mesh].hash
          )
        )?.toDataURL();
        setIsLoaded({ ...isLoaded, materialSrc: matSrc || '', status: true });
      } else if (props.hash)
        setIsLoaded({
          ...isLoaded,
          materialSrc: R2D.modelUploader.getPartMatPreview(props.hash).toDataURL(),
          status: true,
        });
      else {
        if (!props.matId) {
          if (props.matId === 0) setIsLoaded({ ...isLoaded, materialSrc: '', status: true });
          else return;
        } else {
          if (props.addMaterial) {
            const matPrevCanvas = await R2D.Tool.getMatPrevFromMatIdAndColor(
              props.addMaterial,
              props.matId
            );
            setIsLoaded({ ...isLoaded, materialSrc: matPrevCanvas.toDataURL(), status: true });
          } else {
            if (props.matId.indexOf && ~props.matId.indexOf('#'))
              setIsLoaded({ ...isLoaded, materialSrc: props.matId, status: true });
            else if (R2D.Pool.getProductData(props.matId))
              setIsLoaded({
                ...isLoaded,
                materialSrc:
                  R2D.URL.DOMAIN + R2D.Pool.getProductData(props.matId).source.images.preview,
                status: true,
              });
            else setTimeout(() => setIsLoaded({ ...isLoaded, needUpdate: Math.random() }), 100);
          }
        }
      }
    };

    loadMaterial();
  }, [props.matId, props.addMaterial, props.hash, props.mesh, isLoaded.needUpdate]);

  useEffect(() => {
    if (!props.addMaterial && props.matId && props.matId.indexOf && ~props.matId.indexOf('#'))
      return setMatName(props.matId);
    const currIdMat = props.addMaterial
      ? props.addMaterial
      : props.matId && (!props.matId.indexOf || props.matId.indexOf('#') == -1)
        ? props.matId
        : '';
    if (
      !currIdMat ||
      !R2D.Pool.getProductData(currIdMat) ||
      !R2D.Pool.getProductData(currIdMat).categoryMaterial
    )
      return;

    if (catalogMaterials && catalogMaterials.length > 0) {
      Object.values(
        typeof structuredClone !== 'undefined'
          ? structuredClone(R2D.Pool.getProductData(currIdMat).categoryMaterial)
          : JSON.parse(JSON.stringify(R2D.Pool.getProductData(currIdMat).categoryMaterial))
      )[0]
        ?.reverse()
        .reduce((prevVal, currVal, index, array) => {
          const activeArray = prevVal.find((y) => y.id == currVal.id);
          if (activeArray) {
            if (activeArray.nodes) return activeArray.nodes;
            else if (activeArray.urlList) {
              (async () => {
                const loadedData = await planner.scene.categoryDataLoad(
                  activeArray.urlList.replace(
                    '/api/category/materialsByCategory',
                    R2D.URL.URL_CATALOG_SEARCH.replace(/\?key=\w{1,}$/gm, '')
                  ) + '&category_type=1'
                );
                const materialName = loadedData?.find && loadedData.find((i) => i.id == currIdMat);
                setMatName(materialName?.name || '');
              })();
            }
          } else array.splice(1);
        }, catalogMaterials.materials);
    }
  }, [props.matId, props.addMaterial]);

  useEffect(() => {
    setShowCopy(
      props.onCopyPaste.hasOwnProperty('statusCopy') ? props.onCopyPaste.statusCopy : true
    );
  }, [props.onCopyPaste]);

  return (
    (props.matId != null || props.hash != null || props.mesh != null) && (
      <div className={classes.editMatItemWr} style={props.customStyles}>
        <div className={classes.editMatItem} onMouseEnter={mouseEnter} onMouseLeave={mouseLeave}>
          {isLoaded.status ? (
            <div className={classes.editMatItem_main}>
              <div
                className={classes.editMatImg + ' ' + (props.clickedElementAddClass || '')}
                style={
                  ~isLoaded.materialSrc.indexOf('#')
                    ? { backgroundColor: isLoaded.materialSrc }
                    : { backgroundImage: 'url(' + isLoaded.materialSrc + ')' }
                }
                onClick={onClickPreview}
              ></div>

              <div className={classes.editMat}>
                {showCopy ? (
                  <Tooltip content={translation['BUTTON_COPY_MATERIAL']}>
                    <IconCopy
                      size={18}
                      color="#ffffff"
                      className={classes.editMatEditIcon}
                      onMouseDown={mouseDownBtnCopyPaste}
                      onMouseUp={mouseUpBtnCopy}
                    />
                  </Tooltip>
                ) : (
                  <IconCopy
                    size={18}
                    color="#828282"
                    className={classes.editMatEditIcon_disabled}
                  />
                )}

                <Tooltip content={translation['BUTTON_PASTE_MATERIAL']}>
                  <IconCopy
                    size={18}
                    color="#ffffff"
                    className={classes.editMatEditIcon}
                    onMouseDown={mouseDownBtnCopyPaste}
                    onMouseUp={mouseUpBtnPaste}
                  />
                </Tooltip>
              </div>
            </div>
          ) : (
            <div className={'preloader-cube'}></div>
          )}
        </div>
      </div>
    )
  );
};

export default MaterialComponent;
