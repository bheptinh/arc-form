import React, { useState, useRef, useEffect } from 'react';
import {createUseStyles} from "react-jss";
import { Navigation, Pagination, } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { ReactCompareSlider, ReactCompareSliderImage, styleFitContainer  } from 'react-compare-slider';
import { useSelector } from 'react-redux';
import { selectTranslation } from '../../../../redux/features/language/languageSlice';

const useStyle = createUseStyles({
    swiper_slider:{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
    },
    paginationWrap:{
        position: 'absolute',
        left: 0,
        bottom: 30,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        padding: '0 21px',
        zIndex: 1
    },
    paginationWr:{
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
    },
    pagination:{
        margin: '0 16px',
        display: 'flex',
        '& span':{
            width: 20,
            height: 20,
            opacity: 1,
            background: '#fff',
            display: 'block',
            borderRadius: 10,
            margin: '0 4px',
            cursor: 'pointer',
            '&.swiper-pagination-bullet-active':{
                background: '#9DD900',
            }
        }
    },
    prevBtn:{
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
        '&.swiper-button-disabled':{
            opacity: '0.2',
            pointerEvents: 'none'
        },
        '&:hover':{
            background: '#BAE51F'
        }
    },
    prevBtnArrow:{
        transform: 'scale(-1)',
        '& path':{
            transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
        }
    },
    nextBtn:{
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
        '&.swiper-button-disabled':{
            opacity: '0.2',
            pointerEvents: 'none'
        },
        '&:hover':{
            background: '#BAE51F'
        }
    },
    nextBtnArrow:{
        '& path':{
            transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
        }
    },
    shadowBot:{
        position: 'absolute',
        width: '100%',
        left: 0,
        bottom: '-30px',
        pointerEvents: 'none',
    },
    renderTypeWr:{

    },
    renderTypeText:{
        color: '#fff',
        fontSize: 38,
        textShadow: '1px 1px 1px #000, 0 0 1em #000, 0 0 .1em #000'
    },
    renderTypeSize:{
        color: '#fff',
        fontSize: 16,
        textAlign: 'right',
        letterSpacing: '-1px',
        textShadow: '1px 1px 1px #000, 0 0 1em #000, 0 0 .1em #000'
    },
    compare_drag_line:{
        width: '5px',
        height: '100%',
        background: '#9dd900',
        border: '1px solid #fff',
    },
    compare_drag_icon:{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        cursor: 'ew-resize'
    },
    slider_img_text_1:{
        position: "absolute",
        left: 30,
        bottom: 50,
        fontSize: 30,
        fontWeight: "bold",

    },
    slider_img_text_2:{
        position: "absolute",
        right: 30,
        bottom: 50,
        fontSize: 30,
        fontWeight: "bold",
    }
});

const RendersSlider = props => {
    const classes = useStyle();
    const navigationPrevRef = useRef(null);
    const navigationNextRef = useRef(null);

    let translation = useSelector(selectTranslation);

    const useSwiperRef = () => {
        const [wrapper, setWrapper] = useState(null);
        const ref = useRef(null);

        useEffect(() => {
            setWrapper(ref.current);
        }, []);

        return [
            wrapper,
            ref
        ]
    };
    const [paginationEl, paginationRef] = useSwiperRef();
    const MyCustomHandle = () => {
        return(
            <div className={classes.compare_drag_line}>
                <img className={classes.compare_drag_icon} src="/src_designer/images/icon_drag.svg"/>
            </div>
        )
    };

    let slider_items = [];

    switch_image.forEach((i, index) => {
        slider_items.push(
            <SwiperSlide key={index}>
                <ReactCompareSlider
                    style={{
                        ...styleFitContainer({
                            objectFit: 'contain',
                            objectPosition: 'center',
                        })
                    }}
                    handle={<MyCustomHandle />}
                    onlyHandleDraggable={true}
                    itemOne={
                        <div>
                            <ReactCompareSliderImage src={~i.img_1.indexOf("http") ? i.img_1 : R2D.URL.DOMAIN + i.img_1}  alt="Image one" />
                            <div className={classes.slider_img_text_1}>
                                <p className={classes.renderTypeText}>{ translation["RENDER_EXAMPLE_SCREENSHOT"] }</p>
                            </div>
                        </div>

                    }
                    itemTwo={
                        <div>
                            <ReactCompareSliderImage src={~i.img_2.indexOf("http") ? i.img_2 : R2D.URL.DOMAIN + i.img_2}  alt="Image two" />
                            <div className={classes.slider_img_text_2}>
                                <p className={classes.renderTypeText}>{ translation["RENDER_EXAMPLE_2K"] }</p>
                                <span className={classes.renderTypeSize}>1920 x 1080 px.</span>
                            </div>
                        </div>
                    }
                />
            </SwiperSlide>
        )
    });

    return (
        <Swiper className={classes.swiper_slider}
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
                    el: paginationEl
                }}>
            { slider_items }


            <div className={classes.prevBtn} ref={navigationPrevRef}>
                <svg className={classes.prevBtnArrow} width="27" height="22" viewBox="0 0 27 22" fill="none">
                    <path opacity="0.99" fillRule="evenodd" clipRule="evenodd" d="M15.0919 0L14.1045 0.966647L23.2476 9.95569H0.534842V11.3779H23.3426L14.0645 20.3591L15.0442 21.3333L25.009 11.6874L25.0165 11.6948L26.0039 10.7282L15.0919 0Z" fill="#070707"/>
                </svg>
            </div>

            <div className={classes.nextBtn} ref={navigationNextRef}>
                <svg className={classes.nextBtnArrow} width="27" height="22" viewBox="0 0 27 22" fill="none">
                    <path opacity="0.99" fillRule="evenodd" clipRule="evenodd" d="M15.0919 0L14.1045 0.966647L23.2476 9.95569H0.534842V11.3779H23.3426L14.0645 20.3591L15.0442 21.3333L25.009 11.6874L25.0165 11.6948L26.0039 10.7282L15.0919 0Z" fill="#070707"/>
                </svg>
            </div>

            <div className={classes.paginationWrap}>

                <img className={classes.shadowBot} src="/src_designer/images/shadow_compare.png"/>

                <div className={classes.paginationWr}>

                    <div className={classes.pagination} ref={paginationRef}></div>


                </div>

            </div>

        </Swiper>
    )
}

export default RendersSlider;