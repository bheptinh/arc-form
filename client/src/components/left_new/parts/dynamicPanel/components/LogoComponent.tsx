import { IconCopy } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch } from 'react-redux';

import { useTranslation } from '../../../../../api/hooks/useTranslation';
import { updatePreloaderStatus } from '../../../../../redux/features/common/commonSlice';
import {
  controlPanelHistoryAdd,
  controlPanelUpdateBreadCrumbs,
} from '../../../../../redux/features/control/controlPanelSlice';
import HoverComponent from '../../controlPanel/components/HoverComponent';

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

  const timeoutId = undefined;

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
    document.querySelector('.product_hover')?.remove();

    if (props.mouseLeaveMaterial) {
      props.mouseLeaveMaterial();
    }
  };

  const onPaste = () => props.onCopyPaste.paste(activeLogoHash);

  const onClickPreview = async () => {
    if (props.disableClick) return;
    if (props.onCustomClick) {
      props.onCustomClick();
    } else {
      if (props.previewSrc) {
        const historyObj = { index: props.onCopyPaste.index, type: 'logoEditor' };

        document.querySelector('.product_hover')?.remove();

        dispatch(controlPanelHistoryAdd(historyObj));
        dispatch(controlPanelUpdateBreadCrumbs({ data: historyObj, updateType: 'add' }));
      } else {
        R2D.LogoEditor.uploadLogoImg().then((curLogoIndex) => {
          currObj.logoEditor.updateAfterUploadLogo(activeLogoHash, curLogoIndex).then((res) => {
            const historyObj = { index: props.onCopyPaste.index, type: 'logoEditor' };
            document.querySelector('.product_hover')?.remove();
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

  const mouseLeaveCopyPaste = () => {
    clearTimeout(timeoutId);
    const hoverDiv = document.querySelector('.' + classes.btn_hover);
    hoverDiv?.remove();
  };

  const mouseUpBtnCopy = () =>
    R2D.CopyPaste.copyLogoMesh({ ...currObj.logoEditor.getLogoParams(activeLogoHash) });

  const onMouseUpCopyPaste = () => document.removeEventListener('mouseup', onMouseUpCopyPaste);

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

            <div className={classes.editMat} ref={copyPasteDiv}>
              {showCopy ? (
                <div className={classes.editMat_copy} ref={copyDiv}>
                  <HoverComponent
                    hoverText={translation['BUTTON_COPY_MATERIAL']}
                    parentRef={copyDiv}
                    hoverTextPositionX={'right'}
                    hoverTextPositionY={'top'}
                  >
                    <IconCopy
                      className={classes.editMatEditIcon}
                      size={16}
                      onMouseDown={mouseDownBtnCopyPaste}
                      onMouseUp={mouseUpBtnCopy}
                      color="#ffffff"
                    />
                  </HoverComponent>
                </div>
              ) : (
                <IconCopy className={classes.editMatEditIcon_disabled} size={16} color="#828282" />
              )}

              <div className={classes.editMat_paste} ref={pasteDiv}>
                <HoverComponent
                  hoverText={translation['BUTTON_PASTE_MATERIAL']}
                  parentRef={pasteDiv}
                  hoverTextPositionX={'right'}
                  hoverTextPositionY={'top'}
                >
                  <IconCopy
                    className={classes.editMatEditIcon}
                    size={16}
                    onMouseDown={mouseDownBtnCopyPaste}
                    onMouseUp={onPaste}
                    color="#ffffff"
                  />
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
