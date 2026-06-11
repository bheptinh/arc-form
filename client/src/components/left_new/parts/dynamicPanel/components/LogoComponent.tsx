import React, { useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { updatePreloaderStatus } from '../../../../../redux/features/common/commonSlice';
import {
  controlPanelHistoryAdd,
  controlPanelUpdateBreadCrumbs,
} from '../../../../../redux/features/control/controlPanelSlice';
import Lock from '../../../../common/Lock';
import HoverComponent from '../../controlPanel/components/HoverComponent';
import { useTranslation } from '../../../../../api/hooks/useTranslation';

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
    borderRight: '1px solid #E9E9E9',
    borderBottom: '1px solid #E9E9E9',
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
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 10px',
    '& > img:not($editMatImg_no_image)': {
      width: '100%',
      maxHeight: '100%',
      maxWidth: 'fit-content',
    },
  },
  editMatImg_no_image: {},
  prod_item_zamok_btn: {
    width: '18px',
    height: '18px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#fff',
    borderRadius: '50%',
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 1,
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    '& svg': {
      width: 18,
      height: 'auto',
    },
  },
  editMatEditIcon: {
    extend: editMatEditIcon,
    cursor: 'pointer',
    '& rect': {
      transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    },
    '&:hover': {
      '& rect': {
        fill: '#B8E11F',
      },
    },
  },
  editMatEditIcon_disabled: {
    extend: editMatEditIcon,
  },

  editMatAddColor: {
    color: '#65BCF1',
    letterSpacing: '.03em',
  },
  btn_hover: {
    position: 'absolute',
    background: '#81e7ff',
    display: 'none',
    fontSize: 12,
    width: 'max-content',
    padding: '2px 7px',
    transition: 'all .1s ease',
    userSelect: 'none',
    zIndex: 999,
    visibility: 'hidden',
  },
  editMat_copy: {},
  editMat_paste: {},
  editMatItem_main: {
    width: '100%',
    height: '100%',
  },
});

const LogoComponent = (props) => {
  const dispatch = useDispatch();

  const classes = useStyle();

  const translation = useTranslation();

  const [isLoaded, setIsLoaded] = useState({ status: false, materialSrc: '', needUpdate: 0 });
  const [matName, setMatName] = useState(null);
  const [showCopy, setShowCopy] = useState(
    props.onCopyPaste.hasOwnProperty('statusCopy') ? props.onCopyPaste.statusCopy : true
  );
  const currObj = R2D.scene.currentView3DObject || R2D.scene.prevSelectedView3DObject;
  const activeLogoHash =
    currObj?.logoEditor &&
    Object.keys(currObj.logoEditor.getDataForUIAllLogos())[props.onCopyPaste.index];
  const activeLogoData =
    currObj?.logoEditor &&
    Object.values(currObj.logoEditor.getDataForUIAllLogos())[props.onCopyPaste.index];

  const mainDiv = useRef(null);

  const copyPasteDiv = useRef(null);
  const copyDiv = useRef(null);
  const pasteDiv = useRef(null);

  const copyImage = useRef(null);
  const pasteImage = useRef(null);

  const timeoutId = null;

  const mouseEnter = (e) => {
    const product = e.currentTarget;
    const hoverWindow = document.createElement('div');
    hoverWindow.classList.add('product_hover');
    document.querySelector('body').append(hoverWindow);
    const matText = document.createElement('p');
    matText.textContent = matName;
    hoverWindow.append(matText);
    hoverWindow.style.left = product.getBoundingClientRect().left + product.offsetWidth + 'px';
    hoverWindow.style.top =
      product.getBoundingClientRect().top +
      (product.offsetHeight - hoverWindow.offsetHeight) / 2 +
      'px';

    if (props.mouseEnterMaterial) props.mouseEnterMaterial();
  };

  const mouseLeave = () => {
    document.querySelector('.product_hover')
      ? document.querySelector('.product_hover').remove()
      : null;
    if (props.mouseLeaveMaterial) props.mouseLeaveMaterial();
  };

  const onPaste = (e) => props.onCopyPaste.paste(activeLogoHash);

  const onClickPreview = async (e) => {
    if (props.disableClick) return;
    if (props.onCustomClick) {
      props.onCustomClick();
    } else {
      if (props.previewSrc) {
        const historyObj = { index: props.onCopyPaste.index, type: 'logoEditor' };
        document.querySelector('.product_hover') &&
          document.querySelector('.product_hover').remove();
        dispatch(controlPanelHistoryAdd(historyObj));
        dispatch(controlPanelUpdateBreadCrumbs({ data: historyObj, updateType: 'add' }));
      } else {
        R2D.LogoEditor.uploadLogoImg().then((curLogoIndex) => {
          currObj.logoEditor.updateAfterUploadLogo(activeLogoHash, curLogoIndex).then((res) => {
            const historyObj = { index: props.onCopyPaste.index, type: 'logoEditor' };
            document.querySelector('.product_hover') &&
              document.querySelector('.product_hover').remove();
            setTimeout(() => {
              dispatch(controlPanelHistoryAdd(historyObj));
              dispatch(controlPanelUpdateBreadCrumbs({ data: historyObj, updateType: 'add' }));
              dispatch(updatePreloaderStatus(false));
            }, 0);
          });
        });
      }
    }
  };

  const mouseLeaveCopyPaste = (e) => {
    clearTimeout(timeoutId);
    const hoverDiv = document.querySelector('.' + classes.btn_hover);
    hoverDiv && hoverDiv.remove();
  };

  const mouseUpBtnCopy = (e) =>
    R2D.CopyPaste.copyLogoMesh({ ...currObj.logoEditor.getLogoParams(activeLogoHash) });

  const mouseUpBtnPaste = (e) => onPaste(e);

  const onMouseUpCopyPaste = (e) => document.removeEventListener('mouseup', onMouseUpCopyPaste);

  const mouseDownBtnCopyPaste = (e) => {
    document.addEventListener('mouseup', onMouseUpCopyPaste);
    mouseLeaveCopyPaste(e);
  };

  useEffect(() => {
    setMatName(
      activeLogoData?.src ? translation['EDIT_YOUR_IMAGE'] : translation['UPLOAD_YOUR_IMAGE']
    );
    return () => {
      document.querySelector('.product_hover') && document.querySelector('.product_hover').remove();
    };
  }, [props.onCopyPaste.index]);

  useEffect(() => {
    setIsLoaded({ ...isLoaded, status: false });
    setTimeout(
      () => setIsLoaded({ ...isLoaded, materialSrc: props.previewSrc, status: true }),
      500
    );
  }, [props.previewSrc, isLoaded.needUpdate]);

  useEffect(() => {
    setShowCopy(
      props.onCopyPaste.hasOwnProperty('statusCopy') ? props.onCopyPaste.statusCopy : true
    );
  }, [props.onCopyPaste]);

  return (
    <div className={classes.editMatItemWr} ref={mainDiv} style={props.customStyles}>
      <div className={classes.editMatItem} onMouseEnter={mouseEnter} onMouseLeave={mouseLeave}>
        {isLoaded.status ? (
          <div className={classes.editMatItem_main}>
            <div className={classes.editMatImg} onClick={onClickPreview}>
              {props.previewSrc ? (
                <img src={props.previewSrc} />
              ) : (
                <img
                  className={classes.editMatImg_no_image}
                  src={'/src_designer/images/no_image_logo.svg'}
                />
              )}
            </div>

            {props.lockMaterialStatus && (
              <Lock
                additionalClass={classes.prod_item_zamok_btn}
                dontShowText={props.lockMaterialStatus}
                tipPositionY={'top'}
                tipPositionX={'right'}
                textHover={'UPGRADE_YOUR_PLAN_TEXT'}
                parentClass={classes.editMatItem}
              />
            )}

            <div className={classes.editMat} ref={copyPasteDiv}>
              {showCopy ? (
                <div className={classes.editMat_copy} ref={copyDiv}>
                  <HoverComponent
                    hoverText={translation['BUTTON_COPY_MATERIAL']}
                    parentRef={copyDiv}
                    hoverTextPositionX={'right'}
                    hoverTextPositionY={'top'}
                  >
                    <svg
                      className={classes.editMatEditIcon}
                      ref={copyImage}
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      onMouseDown={mouseDownBtnCopyPaste}
                      onMouseUp={mouseUpBtnCopy}
                    >
                      <rect x="3.5" y="0.5" width="12" height="12" stroke="white" />
                      <rect
                        className={classes.rectHover2}
                        y="3"
                        width="2"
                        height="1"
                        fill="white"
                      />
                      <rect
                        className={classes.rectHover}
                        y="15"
                        width="13"
                        height="1"
                        fill="white"
                      />
                      <rect
                        className={classes.rectHover}
                        y="15"
                        width="11"
                        height="1"
                        transform="rotate(-90 0 15)"
                        fill="white"
                      />
                      <rect
                        className={classes.rectHover}
                        x="12"
                        y="15"
                        width="1"
                        height="1"
                        transform="rotate(-90 12 15)"
                        fill="white"
                      />
                    </svg>
                  </HoverComponent>
                </div>
              ) : (
                <svg
                  className={classes.editMatEditIcon_disabled}
                  ref={copyImage}
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <rect x="3.5" y="0.5" width="12" height="12" stroke="#828282" />
                  <rect className={classes.rectHover2} y="3" width="2" height="1" fill="#828282" />
                  <rect className={classes.rectHover} y="15" width="13" height="1" fill="#828282" />
                  <rect
                    className={classes.rectHover}
                    y="15"
                    width="11"
                    height="1"
                    transform="rotate(-90 0 15)"
                    fill="#828282"
                  />
                  <rect
                    className={classes.rectHover}
                    x="12"
                    y="15"
                    width="1"
                    height="1"
                    transform="rotate(-90 12 15)"
                    fill="#828282"
                  />
                </svg>
              )}

              <div className={classes.editMat_paste} ref={pasteDiv}>
                <HoverComponent
                  hoverText={translation['BUTTON_PASTE_MATERIAL']}
                  parentRef={pasteDiv}
                  hoverTextPositionX={'right'}
                  hoverTextPositionY={'top'}
                >
                  <svg
                    className={classes.editMatEditIcon}
                    ref={pasteImage}
                    width="15"
                    height="16"
                    viewBox="0 0 15 16"
                    fill="none"
                    onMouseDown={mouseDownBtnCopyPaste}
                    onMouseUp={mouseUpBtnPaste}
                  >
                    <rect
                      x="0.5"
                      y="-0.5"
                      width="11.1875"
                      height="12"
                      transform="matrix(1 0 0 -1 2.8125 15)"
                      fill="white"
                      stroke="white"
                    />
                    <rect width="1.875" height="1" transform="matrix(1 0 0 -1 0 13)" fill="white" />
                    <rect
                      width="12.1875"
                      height="1"
                      transform="matrix(1 0 0 -1 0 1)"
                      fill="white"
                    />
                    <rect
                      width="11"
                      height="0.9375"
                      transform="matrix(-4.37114e-08 1 1 4.37114e-08 0 1)"
                      fill="white"
                    />
                    <rect
                      width="1"
                      height="0.9375"
                      transform="matrix(-4.09794e-08 1 1 4.66255e-08 11.25 1)"
                      fill="white"
                    />
                  </svg>
                </HoverComponent>
              </div>
            </div>
          </div>
        ) : (
          <div className={'preloader-cube'}></div>
        )}
      </div>
    </div>
  );
};

export default LogoComponent;
