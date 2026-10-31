import 'simplebar-react/dist/simplebar.min.css';

import {
  IconSquareLetterCFilled,
  IconSquareLetterVFilled,
  IconSquareLetterZFilled,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';

import { useTranslation } from '../../api/hooks/useTranslation';
import { closeActivePopup, selectPopups } from '../../redux/features/popups/popupsSlice';
import {
  IconKeyBackspace,
  IconKeyCmd,
  IconKeyCtrl,
  IconKeyDelete,
  IconKeyEsc,
  IconKeysArrow,
  IconKeyShift,
  IconKeySpace,
  IconKeysWASD,
  IconKeyTab,
  MouseLeft,
  MouseLeftMove,
  MouseRight,
  MouseRightMove,
  MouseScroll,
} from '../../shared-components/icons';
import DefaultModal from '../../shared-components/modals/default';

const useStyle = createUseStyles({
  planner_popup_wrap: {
    overflow: 'visible',
  },
  planner_popup_wr: {
    maxWidth: 836,
    width: '100%',
    height: '100%',
  },
  planner_popup_cont: {
    color: '#000',
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: '47px 16px 43px 94px',
    position: 'relative',
    height: '100%',
  },
  planner_popup_tips_wrap: {
    height: '100%',
  },
  planner_popup_tips_wr: {
    marginBottom: '20px',
    height: '100%',
  },
  divider_plus: {
    margin: '0 3px',
  },
  divider_or: {
    margin: '0 12px',
    fontSize: 14,
    color: '#323232',
  },
  planner_popup_tips_wr_block: {
    paddingRight: 48,
    '&:first-child': {
      marginBottom: 50,
    },
  },
  planner_popup_tips_wr_block_main_child: {
    display: 'flex',
    borderBottom: '1px solid #DBDBDB',
    padding: '10px 0',
    alignItems: 'center',
    '&:first-child': {
      borderTop: '1px solid #DBDBDB',
    },
  },
  planner_popup_tips_wr_block_main_child_images: {
    display: 'flex',
    flex: 1,
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingRight: 10,
  },
  planner_popup_tips_wr_block_main_child_text: {
    flex: 1,
    fontSize: 14,
    color: '#323232',
  },
  planner_popup_tips_wr_block_main_second_child_text: {
    display: 'flex',
    alignItems: 'center',
    borderTop: '1px solid #DBDBDB',
    paddingTop: 10,
    marginTop: 10,
  },
  planner_popup_tips_wr_title: {
    fontSize: 32,
    fontWeight: 300,
    marginBottom: 17,
    color: '#3F3F3F',
  },
  borderLineGrey: {
    height: 1,
    width: '100%',
    background: '#DBDBDB',
    margin: '10px 0',
  },
});

const TipsPopup = (props) => {
  const dispatch = useDispatch();
  const translation = useTranslation();
  const popups = useSelector(selectPopups);

  const classes = useStyle();

  const currentOS = R2D.controller.getCurrentOS();

  const buttons = {
    ctrl: <IconKeyCtrl />,
    z: <IconSquareLetterZFilled size={26} color="#66ACF4" />,
    shift: <IconKeyShift />,
    c: <IconSquareLetterCFilled size={26} color="#66ACF4" />,
    v: <IconSquareLetterVFilled size={26} color="#66ACF4" />,
    delete: <IconKeyDelete />,
    backspace: <IconKeyBackspace />,
    arrows: <IconKeysArrow />,
    wasd: <IconKeysWASD />,
    leftMouse: <MouseLeft />,
    leftMouseMove: <MouseLeftMove />,
    rightMouse: <MouseRight />,
    rightMouseMove: <MouseRightMove />,
    space: <IconKeySpace />,
    scrollMouse: <MouseScroll />,
    cmd: <IconKeyCmd />,
    esc: <IconKeyEsc />,
    tab: <IconKeyTab />,
  };

  const [animPopupClass, setAnimPopupClass] = useState(false);

  const onClickClosePopUp = (e) => {
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'tipsPopup' })), 500);
  };

  useEffect(() => {
    const timer = setTimeout(() => setAnimPopupClass(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DefaultModal
      visible={animPopupClass}
      zIndex={popups.tipsPopup.zIndex}
      className={classes.planner_popup_wr}
      contentClassName={classes.planner_popup_cont}
      wrapClassName={classes.planner_popup_wrap}
      onClose={onClickClosePopUp}
    >
      <div className={classes.planner_popup_tips_wrap}>
        <div className={classes.planner_popup_tips_wr}>
          <SimpleBar style={{ height: '100%' }} autoHide={false} forceVisible="y">
            <div className={classes.planner_popup_tips_wr_block}>
              <h2 className={classes.planner_popup_tips_wr_title}>
                {translation['TIPS_TEXT_SHORT_TITLE']}
              </h2>
              <div>
                <div className={classes.planner_popup_tips_wr_block_main_child}>
                  <div className={classes.planner_popup_tips_wr_block_main_child_images}>
                    {currentOS == 'Mac OS' ? buttons.cmd : buttons.ctrl}
                    <span className={classes.divider_plus}>+</span>
                    {buttons.c}
                  </div>
                  <div className={classes.planner_popup_tips_wr_block_main_child_text}>
                    {translation['TIPS_TEXT_COPY']}
                  </div>
                </div>
                <div className={classes.planner_popup_tips_wr_block_main_child}>
                  <div className={classes.planner_popup_tips_wr_block_main_child_images}>
                    {currentOS == 'Mac OS' ? buttons.cmd : buttons.ctrl}
                    <span className={classes.divider_plus}>+</span>
                    {buttons.v}
                  </div>
                  <div className={classes.planner_popup_tips_wr_block_main_child_text}>
                    {translation['TIPS_TEXT_PASTE']}
                  </div>
                </div>
                <div className={classes.planner_popup_tips_wr_block_main_child}>
                  <div className={classes.planner_popup_tips_wr_block_main_child_images}>
                    {currentOS == 'Mac OS' ? buttons.cmd : buttons.ctrl}
                    <span className={classes.divider_plus}>+</span>
                    {buttons.z}
                  </div>
                  <div className={classes.planner_popup_tips_wr_block_main_child_text}>
                    {translation['TIPS_TEXT_UNDO']}
                  </div>
                </div>
                <div className={classes.planner_popup_tips_wr_block_main_child}>
                  <div className={classes.planner_popup_tips_wr_block_main_child_images}>
                    {currentOS == 'Mac OS' ? buttons.cmd : buttons.ctrl}
                    <span className={classes.divider_plus}>+</span>
                    {buttons.shift}
                    <span className={classes.divider_plus}>+</span>
                    {buttons.z}
                  </div>
                  <div className={classes.planner_popup_tips_wr_block_main_child_text}>
                    {translation['TIPS_TEXT_REDO']}
                  </div>
                </div>
                <div className={classes.planner_popup_tips_wr_block_main_child}>
                  <div className={classes.planner_popup_tips_wr_block_main_child_images}>
                    {buttons.delete}
                    <span className={classes.divider_or}>{translation['TEXT_SIGN_IN_OR']}</span>
                    {buttons.backspace}
                  </div>
                  <div className={classes.planner_popup_tips_wr_block_main_child_text}>
                    {translation['TIPS_TEXT_DEL_SEL']}
                  </div>
                </div>
                <div className={classes.planner_popup_tips_wr_block_main_child}>
                  <div className={classes.planner_popup_tips_wr_block_main_child_images}>
                    {buttons.arrows}
                    <span className={classes.divider_or}>{translation['TEXT_SIGN_IN_OR']}</span>
                    {buttons.wasd}
                  </div>
                  <div className={classes.planner_popup_tips_wr_block_main_child_text}>
                    {translation['TIPS_TEXT_MOVE']}
                    <div className={classes.borderLineGrey}></div>
                    {translation['TIPS_TEXT_WALK']}
                  </div>
                </div>
                <div className={classes.planner_popup_tips_wr_block_main_child}>
                  <div className={classes.planner_popup_tips_wr_block_main_child_images}>
                    {buttons.shift}
                    <span className={classes.divider_plus}>+</span>
                    {buttons.arrows}
                    <span className={classes.divider_or}> {translation['TEXT_SIGN_IN_OR']}</span>
                    {buttons.wasd}
                  </div>
                  <div className={classes.planner_popup_tips_wr_block_main_child_text}>
                    {translation['TIPS_TEXT_WALK_BIG']}
                    <div className={classes.planner_popup_tips_wr_block_main_second_child_text}>
                      {translation['TEXT_MOVE_CAMERA_FASTER']}
                    </div>
                  </div>
                </div>
                <div className={classes.planner_popup_tips_wr_block_main_child}>
                  <div className={classes.planner_popup_tips_wr_block_main_child_images}>
                    {buttons.shift}
                    <span className={classes.divider_plus}>+</span>
                    {currentOS == 'Mac OS' ? buttons.cmd : buttons.ctrl}
                    <span className={classes.divider_plus}>+</span>
                    {buttons.arrows}
                  </div>
                  <div className={classes.planner_popup_tips_wr_block_main_child_text}>
                    {translation['TIPS_TEXT_WALK_SMALL']}
                  </div>
                </div>

                <div className={classes.planner_popup_tips_wr_block_main_child}>
                  <div className={classes.planner_popup_tips_wr_block_main_child_images}>
                    {buttons.tab}
                  </div>
                  <div className={classes.planner_popup_tips_wr_block_main_child_text}>
                    {translation['SWITCH_SIZE_INPUT_FIELD']}
                  </div>
                </div>
              </div>
            </div>
            <div className={classes.planner_popup_tips_wr_block}>
              <h2 className={classes.planner_popup_tips_wr_title}>
                {translation['TIPS_TEXT_CONTROLS_TITLE']}
              </h2>
              <div>
                <div className={classes.planner_popup_tips_wr_block_main_child}>
                  <div className={classes.planner_popup_tips_wr_block_main_child_images}>
                    {buttons.leftMouseMove}
                  </div>
                  <div className={classes.planner_popup_tips_wr_block_main_child_text}>
                    {translation['TIPS_TEXT_ROTATE']}
                  </div>
                </div>
                <div className={classes.planner_popup_tips_wr_block_main_child}>
                  <div className={classes.planner_popup_tips_wr_block_main_child_images}>
                    {buttons.rightMouseMove}
                    <span className={classes.divider_or}>{translation['TEXT_SIGN_IN_OR']}</span>
                    {buttons.space}
                    <span className={classes.divider_plus}>+</span>
                    {buttons.leftMouseMove}
                    <span className={classes.divider_or}>{translation['TEXT_SIGN_IN_OR']}</span>
                    {buttons.arrows}
                  </div>
                  <div className={classes.planner_popup_tips_wr_block_main_child_text}>
                    {translation['TIPS_TEXT_MOVE_SCENE']}
                  </div>
                </div>
                <div className={classes.planner_popup_tips_wr_block_main_child}>
                  <div className={classes.planner_popup_tips_wr_block_main_child_images}>
                    {buttons.scrollMouse}
                  </div>
                  <div className={classes.planner_popup_tips_wr_block_main_child_text}>
                    {translation['TIPS_TEXT_MOUSE_SCROLL']}
                  </div>
                </div>
                <div className={classes.planner_popup_tips_wr_block_main_child}>
                  <div className={classes.planner_popup_tips_wr_block_main_child_images}>
                    {currentOS == 'Mac OS' ? buttons.cmd : buttons.ctrl}
                    <span className={classes.divider_plus}>+</span>
                    {buttons.leftMouse}
                  </div>
                  <div className={classes.planner_popup_tips_wr_block_main_child_text}>
                    {translation['TIPS_TEXT_SELECT_TO_GROUP']}
                  </div>
                </div>
                <div className={classes.planner_popup_tips_wr_block_main_child}>
                  <div className={classes.planner_popup_tips_wr_block_main_child_images}>
                    {currentOS == 'Mac OS' ? buttons.cmd : buttons.ctrl}
                    <span className={classes.divider_plus}>+</span>
                    {buttons.leftMouseMove}
                  </div>
                  <div className={classes.planner_popup_tips_wr_block_main_child_text}>
                    {translation['TIPS_TEXT_MOVE_WITHOUT_SNAP']}
                  </div>
                </div>
                <div className={classes.planner_popup_tips_wr_block_main_child}>
                  <div className={classes.planner_popup_tips_wr_block_main_child_images}>
                    {buttons.shift}
                    <span className={classes.divider_plus}>+</span>
                    {buttons.leftMouseMove}
                  </div>
                  <div className={classes.planner_popup_tips_wr_block_main_child_text}>
                    {translation['TIPS_TEXT_MOVE_ONLY_VER_HOR']}
                  </div>
                </div>
                <div className={classes.planner_popup_tips_wr_block_main_child}>
                  <div className={classes.planner_popup_tips_wr_block_main_child_images}>
                    {buttons.esc}
                  </div>
                  <div className={classes.planner_popup_tips_wr_block_main_child_text}>
                    {translation['TIPS_TEXT_ESC']}
                  </div>
                </div>
              </div>
            </div>
          </SimpleBar>
        </div>
      </div>
    </DefaultModal>
  );
};

export default TipsPopup;
