import { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch } from 'react-redux';

import { useTranslation } from '../../api/hooks/useTranslation';
import { closeActivePopup } from '../../redux/features/popups/popupsSlice';
import Button from '../../shared-components/inputs/button';
import Checkbox from '../../shared-components/inputs/checkbox';
import DefaultModal from '../../shared-components/modals/default';

const useStyle = createUseStyles({
  planner_popup_wr: {},
  planner_popup_cont: {
    color: 'var(--color-black)',
    backgroundColor: 'var(--color-white)',
    borderRadius: 6,
    position: 'relative',
    height: '100%',
    padding: '64px 73px 71px',
  },
  planner_popup_text: {
    color: 'var(--color-text-muted)',
    fontSize: 16,
    textAlign: 'center',
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

        <DefaultModal.Actions spaced>
          <Button onClick={onClickOk}>{translation['BUTTON_OK']}</Button>
        </DefaultModal.Actions>

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
