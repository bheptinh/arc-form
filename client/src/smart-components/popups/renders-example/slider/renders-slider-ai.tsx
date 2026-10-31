import 'swiper/css';

import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
import React, { useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { Navigation, Pagination } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

import ThreeCanvas from '../../upload-custom-popups/components/three-canvas';

const useStyle = createUseStyles({
  swiper_slider_wr: {
    padding: '0 72px',
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    '@media screen and (max-width: 950px)': {
      padding: '0 40px',
    },
  },
  swiper_slider: {
    width: '100%',
    height: 370,
    overflow: 'hidden',
    '@media screen and (max-width: 950px)': {
      height: 170,
    },
  },
  paginationWrap: {
    width: '100%',
    display: 'flex',
    padding: '0 21px',
    justifyContent: 'center',
    marginTop: '20px',
    '@media screen and (max-width: 950px)': {
      marginTop: 10,
    },
  },
  paginationWr: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  pagination: {
    margin: '0 6px',
    display: 'flex',
    '& span': {
      width: 16,
      height: 16,
      opacity: 1,
      background: '#fff',
      display: 'block',
      borderRadius: 10,
      margin: '0 3px',
      cursor: 'pointer',
      '&.swiper-pagination-bullet-active': {
        background: '#9DD900',
      },
      '@media screen and (max-width: 950px)': {
        width: 10,
        height: 10,
      },
    },
  },
  prevBtn: {
    cursor: 'pointer',
    position: 'absolute',
    zIndex: 2,
    left: 10,
    top: '50%',
    width: 50,
    height: 50,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transform: 'translateY(calc(-50% - 20px))',
    transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
    '&.swiper-button-disabled': {
      opacity: '0.2',
      pointerEvents: 'none',
    },
    '&:hover': {
      background: '#BAE51F',
    },
    '@media screen and (max-width: 950px)': {
      width: 30,
      height: 30,
      left: 0,
      '& svg': {
        height: 'auto',
        width: '60%',
      },
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
    right: 10,
    top: '50%',
    width: 50,
    height: 50,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transform: 'translateY(calc(-50% - 20px))',
    transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
    '&.swiper-button-disabled': {
      opacity: '0.2',
      pointerEvents: 'none',
    },
    '&:hover': {
      background: '#BAE51F',
    },
    '@media screen and (max-width: 950px)': {
      width: 30,
      height: 30,
      right: 0,
      '& svg': {
        height: 'auto',
        width: '60%',
      },
    },
  },
  nextBtnArrow: {
    transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
  },
  slide: {
    display: 'flex',
    height: '100%',
  },
  slide_4k_img_wr: {
    display: 'inline-block',
    width: '50%',
    height: '100%',
  },
  slide_4k_img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    userSelect: 'none',
    pointerEvents: 'none',
  },
});

const RendersSliderAi = (props) => {
  const [sliderItems, setSliderItems] = useState(null);

  const useSwiperRef = () => {
    const [wrapper, setWrapper] = useState(null);
    const ref = useRef(null);

    useEffect(() => {
      setWrapper(ref.current);
    }, []);

    return [wrapper, ref];
  };

  const [paginationEl, paginationRef] = useSwiperRef();

  const classes = useStyle();
  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);

  useEffect(() => {
    const sliderArrayItems = [];
    renders_ai.forEach((i, index) => {
      sliderArrayItems.push(
        <SwiperSlide key={index}>
          <div className={classes.slide}>
            <div className={classes.slide_4k_img_wr}>
              <img src={R2D.URL.DOMAIN + i.img_1} className={classes.slide_4k_img} />
            </div>

            <div className={classes.slide_4k_img_wr}>
              <ThreeCanvas modelId={i.id} />
            </div>
          </div>
        </SwiperSlide>
      );
    });
    setSliderItems(sliderArrayItems);
  }, []);

  return (
    <div className={classes.swiper_slider_wr}>
      {sliderItems && (
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
          {sliderItems}
        </Swiper>
      )}

      <div className={classes.prevBtn} ref={navigationPrevRef}>
        <IconArrowLeft className={classes.prevBtnArrow} size={22} color="#070707" />
      </div>

      <div className={classes.nextBtn} ref={navigationNextRef}>
        <IconArrowRight className={classes.nextBtnArrow} size={22} color="#070707" />
      </div>

      <div className={classes.paginationWrap}>
        <div className={classes.paginationWr}>
          <div className={classes.pagination} ref={paginationRef}></div>
        </div>
      </div>
    </div>
  );
};

export default RendersSliderAi;
