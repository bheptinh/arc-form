import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { closeActivePopup } from '../../redux/features/popups/popupsSlice';
import Checkbox from '../../shared-components/inputs/checkbox';
import { useTranslation } from '../../api/hooks/useTranslation';
import DefaultModal from '../../shared-components/modals/default';

const useStyle = createUseStyles({
  planner_popup_wr: {},
  planner_popup_cont: {
    color: '#000',
    backgroundColor: '#fff',
    borderRadius: 6,
    position: 'relative',
    height: '100%',
    padding: '64px 73px 71px',
  },
  planner_popup_text: {
    color: '#373737',
    fontSize: 16,
    textAlign: 'center',
  },
  planner_btn_done_wrap: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 17,
  },
  planner_btn_done: {
    cursor: 'pointer',
    height: '35px',
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#2B2B2B',
    fontSize: 14,
    borderRadius: 3,
    padding: '0 20px',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    minWidth: 120,
    border: 'none',
    outline: 'none',
    background: '#BBE521',
    textTransform: 'uppercase',
    '&:hover': {
      background: '#8fc32d',
    },
  },
  planner_popup_video: {
    marginTop: 20,
    marginBottom: 20,
    width: 665,
    height: 376,
    maxWidth: '100%',
    '& video': {
      outline: 'none',
      border: '1px solid #d9d9d9',
      width: '100%',
    },
  },
  compare_checkbox_wr: {
    position: 'absolute',
    left: 30,
    bottom: 30,
  },
});

const ImageUploadPopup = (props) => {
  const dispatch = useDispatch();
  const translation = useTranslation();

  const [imageUploadPopupShowCookie, setImageUploadPopupShowCookie] = useState(
    R2D.Storage.load('r2d_uploadImagePopup')
  );
  const [animPopupClass, setAnimPopupClass] = useState(false);

  const onClickOk = (e) => {
    imageUploadPopupShowCookie &&
      R2D.Storage.save('r2d_uploadImagePopup', imageUploadPopupShowCookie);
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'imageUpload' })), 500);
  };

  const notShowAgainClick = (e) => setImageUploadPopupShowCookie(!imageUploadPopupShowCookie);

  const classes = useStyle();

  useEffect(() => {
    const timer = setTimeout(() => setAnimPopupClass(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DefaultModal
      visible={animPopupClass}
      zIndex={101}
      className={classes.planner_popup_wr}
      contentClassName={classes.planner_popup_cont}
    >
      <div className="planner_popup_login_wrap">
        <div className={classes.planner_popup_text}>
          <p>{translation['TEXT_ALIGN_DRAWING_WALLS']}</p>
        </div>

        <div className={classes.planner_popup_video}>
          <video autoPlay controls>
            <source src="/src_designer/images/scaling_wall.mp4" type="video/mp4" />
          </video>
        </div>

        <div className={classes.planner_btn_done_wrap}>
          <div className={classes.planner_btn_done} onClick={onClickOk}>
            {translation['BUTTON_OK']}
          </div>
        </div>

        <div className={classes.compare_checkbox_wr}>
          <Checkbox
            label={translation['TEXT_DONT_SHOW_AGAIN']}
            onChange={notShowAgainClick}
            checked={imageUploadPopupShowCookie}
            name={'blueScreenPopup'}
          />
        </div>
      </div>
    </DefaultModal>
  );
};

export default ImageUploadPopup;
