// import { FacebookShareButton } from 'next-share';
import { IconCopy, IconHelpHexagon } from '@tabler/icons-react';
import { useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from '../../api/hooks/useTranslation';
import { planner } from '../../initR2D';
import { updateIsProjectOnlyView } from '../../redux/features/common/commonSlice';
import { closeActivePopup, selectPopups } from '../../redux/features/popups/popupsSlice';
import Checkbox from '../../shared-components/inputs/checkbox';
import TextArea from '../../shared-components/inputs/text-area';
import TextInput from '../../shared-components/inputs/text-input';
import DefaultModal from '../../shared-components/modals/default';
import { createViewerUrl } from '../../utils/UrlHelper';
import { useEffectAsync } from '../../utils/useEffectAsync';
// import HoverComponent from '../left_new/parts/controlPanel/components/HoverComponent';

const useStyle = createUseStyles({
  input_wrap: {
    display: 'grid',
    gridGap: '10px',
    marginBottom: 15,
  },
  input_wr: {
    color: 'var(--color-white)',
    '&:last-child': {
      marginBottom: '0',
    },
  },
  planner_popup_text: {
    fontSize: 14,
    color: 'var(--color-text)',
    marginBottom: 10,
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
    },
  },
  formInputWr: {
    display: 'grid',
    gridTemplateColumns: 'auto 22px',
    alignItems: 'center',
    gridGap: 6,
  },
  formShareIcon: {
    width: 22,
    height: 22,
    cursor: 'pointer',
    '& path': {
      transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    },
    '&:hover': {
      '& path': {
        fill: '#a0a0a0',
      },
    },
  },
  formInput: {
    borderRadius: 3,
    paddingLeft: 10,
    fontSize: 14,
    color: 'var(--color-black)',
    width: '100%',
    border: '1px solid #e8dede',
    height: 30,
    background: 'var(--color-white)',
    outline: 'none',
    resize: 'none',
    transition: 'all 0.4s ease-out',
    '@media screen and (max-width: 950px)': {
      height: 26,
      fontSize: 11,
    },
  },

  planner_popup_bottom: {
    display: 'grid',
    gridTemplateColumns: 'auto auto auto auto',
    justifyContent: 'left',
    gridGap: 6,
    alignItems: 'center',
    fontSize: 14,
    color: 'var(--color-text)',
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
    },
  },
  formInputSize: {
    fontSize: '13px',
    borderRadius: 3,
    color: 'var(--color-black)',
    width: 45,
    textAlign: 'center',
    border: '1px solid #e8dede',
    height: 32,
    background: 'var(--color-white)',
    outline: 'none',
    resize: 'none',
    transition: 'all 0.4s ease-out',
    '@media screen and (max-width: 950px)': {
      height: 26,
      fontSize: 11,
      width: 40,
    },
  },
  planner_popup_checkbox: {
    margin: '10px 0',
    display: 'flex',
    flexDirection: 'column',
  },
  planner_popup_checkbox_top: {
    display: 'flex',
    alignItems: 'start',
  },
  additional_info: {
    marginLeft: 5,
  },
});

export default function SharePopup() {
  const dispatch = useDispatch();
  const translation = useTranslation();
  const popups = useSelector(selectPopups);

  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);

  const popupType = popups.share.type;

  const popupData =
    popupType == 'tour'
      ? R2D.URL.DOMAIN + popups.share.data
      : popups.share.data
        ? popups.share.data
        : R2D.scene.getProjectHash();

  const createdLink =
    popupType == 'tour' ? popupData : window.location.origin + createViewerUrl(popupData);

  const classes = useStyle();

  const [checkboxProjectOnlyView, setCheckboxProjectOnlyView] = useState(
    planner.scene.getProjectOnlyViewState()
  );

  const [preloaderStatus, setPreloaderStatus] = useState(false);

  const inputRef = useRef(null);

  const handleCopy = () => {
    if (inputRef.current) {
      inputRef.current.select();
      const textToCopy = inputRef.current.value;
      navigator.clipboard.writeText(textToCopy);
    }
  };

  const onChangeOnlyView = async (status) => {
    setPreloaderStatus(true);
    setCheckboxProjectOnlyView(status);
    await planner.scene.setOnlyViewParam(status, popupData);
    if (R2D.scene.getProjectHash() == popupData) {
      planner.scene.updateProjectOnlyViewState(status);
      dispatch(updateIsProjectOnlyView(status));
    }
    setCheckboxProjectOnlyView(status);
    setPreloaderStatus(false);
  };

  useEffectAsync(async () => {
    if (popupType == 'listProject') {
      setPreloaderStatus(true);
      if (R2D.scene.getProjectHash() == popupData) {
        setCheckboxProjectOnlyView(R2D.scene.viewOnly);
      } else {
        const result = await R2D.controller.shareDataLoad(popupData);
        setCheckboxProjectOnlyView(result.data.viewOnly);
      }
      setPreloaderStatus(false);
    }
  }, [popupType]);

  return (
    <DefaultModal
      loading={preloaderStatus}
      title={
        popupType == 'tour' ? translation['TITLE_SHARE_TOUR'] : translation['TITLE_SHARE_PROJECT']
      }
      onClose={() => dispatch(closeActivePopup({ name: 'share' }))}
    >
      <div>
        <form>
          <fieldset className={classes.input_wrap}>
            <div className={classes.input_wr}>
              <div className={classes.planner_popup_text}>
                {popupType == 'tour'
                  ? translation['TEXT_SHARE_LINK_TO_TOUR']
                  : translation['TEXT_SHARE_LINK_TO_PROJECT']}
              </div>
              <div className={classes.formInputWr}>
                <TextInput
                  ref={inputRef}
                  inputClassName={classes.formInput}
                  name="link"
                  readOnly
                  value={createdLink}
                />
                <IconCopy
                  onClick={handleCopy}
                  className={classes.formShareIcon}
                  size={22}
                  color="#323232"
                />
              </div>
            </div>

            <fieldset className={classes.planner_popup_checkbox}>
              <div className={classes.planner_popup_checkbox_top}>
                <Checkbox
                  name={'viewOnly'}
                  label={translation['TEXT_PROJECT_ONLY_VIEW']}
                  checked={checkboxProjectOnlyView}
                  onChange={onChangeOnlyView}
                />
                <div>
                  {/* <HoverComponent
                    hoverText={translation['TIPS_SHARE_ONLY_VIEW']}
                    hoverTextPositionX={'left'}
                    showOnMobile={true}
                  >
                    <IconHelpHexagon
                      size={18}
                      color="#2D8BDB"
                      className={classes.additional_info}
                    />
                  </HoverComponent> */}
                  <IconHelpHexagon size={18} color="#2D8BDB" className={classes.additional_info} />
                </div>
              </div>
            </fieldset>

            {popupType != 'tour' ? (
              <div className={classes.input_wr}>
                <div className={classes.planner_popup_text}>{translation['TEXT_SHARE_EMBED']}</div>
                <TextArea
                  name="embed"
                  readOnly
                  value={
                    "<iframe src='" +
                    createdLink +
                    "' style='width:" +
                    width +
                    'px' +
                    '; height:' +
                    height +
                    'px' +
                    ";'></iframe>"
                  }
                />
              </div>
            ) : null}
          </fieldset>
          {popupType != 'tour' ? (
            <fieldset className={classes.planner_popup_bottom}>
              <div>{translation['TEXT_SHARE_EMBED_SIZE']}</div>
              <TextInput
                inputClassName={classes.formInputSize}
                onChange={(e) =>
                  isNaN(e.target.value) ? setWidth(800) : setWidth(+e.target.value)
                }
                name="width"
                value={width}
              />
              x
              <TextInput
                inputClassName={classes.formInputSize}
                onChange={(e) =>
                  isNaN(e.target.value) ? setHeight(600) : setHeight(e.target.value)
                }
                name="height"
                value={height}
              />
            </fieldset>
          ) : null}
        </form>
      </div>
    </DefaultModal>
  );
}
