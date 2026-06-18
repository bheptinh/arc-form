import 'swiper/css';

import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
import React, { useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { Navigation, Pagination } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

const useStyle = createUseStyles({
  swiper_slider: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  paginationWrap: {
    position: 'absolute',
    left: 0,
    bottom: 30,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    padding: '0 21px',
    zIndex: 1,
  },
  paginationWr: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  pagination: {
    margin: '0 16px',
    display: 'flex',
    '& span': {
      width: 20,
      height: 20,
      opacity: 1,
      background: '#fff',
      display: 'block',
      borderRadius: 10,
      margin: '0 4px',
      cursor: 'pointer',
      '&.swiper-pagination-bullet-active': {
        background: '#9DD900',
      },
    },
  },
  prevBtn: {
    cursor: 'pointer',
    position: 'absolute',
    zIndex: 2,
    left: 20,
    top: '50%',
    width: 61,
    height: 61,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
    '&.swiper-button-disabled': {
      opacity: '0.2',
      pointerEvents: 'none',
    },
    '&:hover': {
      background: '#BAE51F',
    },
  },
  prevBtnArrow: {
    transform: 'scale(-1)',
    transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
  },
  nextBtn: {
    cursor: 'pointer',
    position: 'absolute',
    zIndex: 2,
    right: 20,
    top: '50%',
    width: 61,
    height: 61,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
    '&.swiper-button-disabled': {
      opacity: '0.2',
      pointerEvents: 'none',
    },
    '&:hover': {
      background: '#BAE51F',
    },
  },
  nextBtnArrow: {
    transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
  },
  shadowBot: {
    position: 'absolute',
    width: '100%',
    left: 0,
    bottom: '-30px',
    pointerEvents: 'none',
  },
  renderTypeWr: {},
  renderTypeText: {
    color: '#fff',
    fontSize: 38,
    textShadow: '1px 1px 1px #000, 0 0 1em #000, 0 0 .1em #000',
  },
  renderTypeSize: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'right',
    letterSpacing: '-1px',
    textShadow: '1px 1px 1px #000, 0 0 1em #000, 0 0 .1em #000',
  },
  compare_drag_line: {
    width: '5px',
    height: '100%',
    background: '#9dd900',
    border: '1px solid #fff',
  },
  compare_drag_icon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    cursor: 'ew-resize',
  },
  slider_img_text_1: {
    position: 'absolute',
    left: 30,
    bottom: 50,
    fontSize: 30,
    fontWeight: 'bold',
  },
  slider_img_text_2: {
    position: 'absolute',
    right: 30,
    bottom: 50,
    fontSize: 30,
    fontWeight: 'bold',
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
  },
});

const RendersSlider360 = (props) => {
  const classes = useStyle();
  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);

  const useSwiperRef = () => {
    const [wrapper, setWrapper] = useState(null);
    const ref = useRef(null);

    useEffect(() => {
      setWrapper(ref.current);
    }, []);

    return [wrapper, ref];
  };
  const [paginationEl, paginationRef] = useSwiperRef();

  const slider_items = [];

  images_360.forEach((i, index) => {
    slider_items.push(
      <SwiperSlide key={index}>
        <iframe className={classes.iframe} src={images_360[index].url} title="description"></iframe>
      </SwiperSlide>
    );
  });

  return (
    <Swiper
      className={classes.swiper_slider}
      modules={[Pagination, Navigation]}
      spaceBetween={30}
      slidesPerView={1}
      allowTouchMove={false}
      simulateTouch={false}
      navigation={{
        prevEl: navigationPrevRef.current,
        nextEl: navigationNextRef.current,
      }}
      onBeforeInit={(swiper) => {
        swiper.params.navigation.prevEl = navigationPrevRef.current;
        swiper.params.navigation.nextEl = navigationNextRef.current;
      }}
      pagination={{
        clickable: true,
        el: paginationEl,
      }}
    >
      {slider_items}

      <div className={classes.prevBtn} ref={navigationPrevRef}>
        <IconArrowLeft className={classes.prevBtnArrow} size={22} color="#070707" />
      </div>

      <div className={classes.nextBtn} ref={navigationNextRef}>
        <IconArrowRight className={classes.nextBtnArrow} size={22} color="#070707" />
      </div>

      <div className={classes.paginationWrap}>
        <img className={classes.shadowBot} src="/src_designer/images/shadow_compare.png" />

        <div className={classes.paginationWr}>
          <div className={classes.pagination} ref={paginationRef}></div>
        </div>
      </div>
    </Swiper>
  );
};

export default RendersSlider360;
