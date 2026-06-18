import { IconX } from '@tabler/icons-react';
import React, { useEffect } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch } from 'react-redux';

import { closeActivePopup } from '../../../redux/features/popups/popupsSlice';
import RendersSlider4k from './slider/RenderSlider4k';

const useStyle = createUseStyles({
  compare_popup_wrap: {
    height: '100vh',
    width: '100%',
    position: 'absolute',
    top: '0%',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    opacity: '0',
    pointerEvents: 'none',
    zIndex: '101',
    WebkitPerspective: '800px',
    perspective: '800px',
    minHeight: '550px',
    overflow: 'auto',
    background: 'rgba(30, 28, 28, 0.9)',
  },
  compare_popup_wrap_show: {
    top: '0',
    opacity: '1',
    pointerEvents: 'auto',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
  },
  compare_popup_wr: {
    color: '#000',
    width: '100%',
    height: '100%',
  },
  compare_popup_cont: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  compare_popup_login_wrap: {},
  compare_popup_close: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    cursor: 'pointer',
    zIndex: '2',
    width: 61,
    height: 61,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    '& path': {
      transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
    },
    '&:hover': {
      '& path': {
        fill: '#ffd119',
      },
    },
  },
  compare_popup_close_icon: {
    width: '100%',
  },
  swiper_slider_wr: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    background: 'grey',
  },
});

const RenderExample4k = (props) => {
  const classes = useStyle();

  const dispatch = useDispatch();

  useEffect(() => {
    // GTM
    window.dataLayer?.push({ event: 'click_gallery_render' });
  }, []);

  return (
    <div className={classes.compare_popup_wrap + ' ' + classes.compare_popup_wrap_show}>
      <div className={classes.compare_popup_wr}>
        <div className={classes.compare_popup_cont}>
          <div
            className={classes.compare_popup_close}
            onClick={() => dispatch(closeActivePopup({ name: 'renderExample4k' }))}
          >
            <IconX size={24} color="#2F2F2F" className={classes.compare_popup_close_icon} />
          </div>
          <div className={classes.swiper_slider_wr}>
            <RendersSlider4k />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenderExample4k;
