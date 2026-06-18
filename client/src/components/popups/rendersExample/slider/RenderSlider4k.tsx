import 'swiper/css';

import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
import React, { useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useSelector } from 'react-redux';
import { Navigation, Pagination } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

import { useTranslation } from '../../../../api/hooks/useTranslation';

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
    zIndex: 1,
  },
  slider_img_text_2: {
    position: 'absolute',
    right: 30,
    bottom: 50,
    fontSize: 30,
    fontWeight: 'bold',
    zIndex: 1,
  },
  slide_4k: {
    display: 'flex',
    height: '100%',
  },
  slide_4k_item_left: {
    width: '50%',
    height: '100%',
    position: 'absolute',
    overflow: 'hidden',
    left: 0,
    top: 0,
  },
  slide_4k_item_right: {
    width: '50%',
    height: '100%',
    position: 'absolute',
    overflow: 'hidden',
    right: 0,
    top: 0,
  },
  slide_4k_line: {
    position: 'absolute',
    top: 0,
    left: '50%',
    background: '#9DD900',
    borderLeft: '1px solid #fff',
    borderRight: '1px solid #fff',
    transform: 'translateX(-50%)',
    height: '100%',
  },
  slide_4k_img_wr: {
    position: 'absolute',
    display: 'inline-block',
    cursor: 'grab',
    '&:active': {
      cursor: 'grabbing',
    },
  },
  slide_4k_img: {
    width: 'auto',
    height: '100%',
    userSelect: 'none',
    pointerEvents: 'none',
  },
  slide_4k_test: {
    /*width: '200%',
        height: '200%',*/
    border: '1px solid black',
    borderRadius: 10,
    textAlign: 'center',
    background: 'rgba(0,0,0,.8)',
    width: '100px',
    height: '100px',
    backgroundColor: 'lightblue',
    position: 'absolute',
    cursor: 'pointer',
  },
});

const RendersSlider4k = (props) => {
  const classes = useStyle();
  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);

  const translation = useTranslation();

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

  const posArray = renders_2k_4k.map((i) => {
    return [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ];
  });
  const [position, setPosition] = useState(posArray);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState(posArray);

  const handleMouseDown = (e, index, imageIndex) => {
    setIsDragging(true);
    setStartPos((state) => {
      const oldState = JSON.parse(JSON.stringify(state));
      oldState[index][imageIndex] = { x: e.clientX, y: e.clientY };
      return oldState;
    });
  };

  const handleMouseMove = (e, index, imageIndex) => {
    if (isDragging) {
      const deltaX = e.clientX - startPos[index][imageIndex].x;
      const deltaY = e.clientY - startPos[index][imageIndex].y;

      const mejaRight =
        e.currentTarget.querySelector('.' + classes.slide_4k_img_wr).clientWidth -
        e.currentTarget.clientWidth;
      const mejaBot =
        e.currentTarget.querySelector('.' + classes.slide_4k_img_wr).clientHeight -
        e.currentTarget.clientHeight;

      let newX = position[index][imageIndex].x + deltaX;
      let newY = position[index][imageIndex].y + deltaY;
      if (newX > 0) newX = 0;
      else if (newX < -mejaRight) newX = -mejaRight;
      if (newY > 0) newY = 0;
      else if (newY < -mejaBot) newY = -mejaBot;

      setPosition((state) => {
        const oldState = JSON.parse(JSON.stringify(state));
        oldState[index][imageIndex] = { x: newX, y: newY };
        return oldState;
      });
      setStartPos((state) => {
        const oldState = JSON.parse(JSON.stringify(state));
        oldState[index][imageIndex] = { x: e.clientX, y: e.clientY };
        return oldState;
      });
    }
  };

  const handleMouseUp = (e) => {
    setIsDragging(false);
  };

  renders_2k_4k.forEach((i, index) => {
    slider_items.push(
      <SwiperSlide key={index}>
        <div className={classes.slide_4k}>
          <div className={classes.slider_img_text_1}>
            <p className={classes.renderTypeText}>{translation['RENDER_FULL_HD']}</p>
            <span className={classes.renderTypeSize}>1920 x 1080 px.</span>
          </div>

          <div className={classes.slider_img_text_2}>
            <p className={classes.renderTypeText}>{translation['RENDER_4K']}</p>
            <span className={classes.renderTypeSize}>3840 x 2160 px.</span>
          </div>

          <div
            className={classes.slide_4k_item_left}
            onMouseMove={(e) => handleMouseMove(e, index, 0)}
            onMouseUp={handleMouseUp}
            style={{ position: 'relative', width: '50%', height: '100%', overflow: 'hidden' }}
          >
            <div
              className={classes.slide_4k_img_wr}
              style={{ left: position[index][0].x, top: position[index][0].y }}
              onMouseDown={(e) => handleMouseDown(e, index, 0)}
              draggable="false"
            >
              <img
                src={R2D.URL.DOMAIN + i.img_1}
                className={classes.slide_4k_img}
                draggable="false"
              />
            </div>
          </div>

          <div className={classes.slide_4k_line}></div>

          <div
            className={classes.slide_4k_item_right}
            onMouseMove={(e) => handleMouseMove(e, index, 1)}
            onMouseUp={handleMouseUp}
            style={{ position: 'relative', width: '50%', height: '100%', overflow: 'hidden' }}
          >
            <div
              className={classes.slide_4k_img_wr}
              draggable="false"
              style={{ left: position[index][1].x, top: position[index][1].y }}
              onMouseDown={(e) => handleMouseDown(e, index, 1)}
            >
              <img
                src={R2D.URL.DOMAIN + i.img_2}
                className={classes.slide_4k_img}
                draggable="false"
              />
            </div>
          </div>
        </div>
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

export default RendersSlider4k;
