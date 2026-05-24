import React, {useEffect, useState} from 'react';
import {createUseStyles} from "react-jss";
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { selectTranslation } from '../../redux/features/language/languageSlice';
import { closeActivePopup } from '../../redux/features/popups/popupsSlice';

const useStyle = createUseStyles({
    '@font-face': [
        {
            fontFamily: "Roboto-Light",
            fontWeight: 300,
            fontDisplay: 'swap',
            src: 'url("/src_designer/Roboto-Light.ttf") format("truetype")'
        },
        {
            fontFamily: "Roboto-Bold",
            fontWeight: 700,
            fontDisplay: 'swap',
            src: 'url("/src_designer/Roboto-Bold.ttf") format("truetype")'
        },
    ],
    done_popup_wrap:{
        height: '100%',
        width: '100%',
        position: 'absolute',
        top: '0%',
        transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
        opacity: '0',
        pointerEvents: 'none',
        zIndex: '101',
        WebkitPerspective: '800px',
        perspective: '800px',
        overflow: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.2)'
    },
    done_popup_wrap_show:{
        opacity: '1',
        pointerEvents: 'auto',
        transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
        '& $done_popup_wr':{
            transform: 'scale(1)',
        }
    },
    done_popup_wr:{
        color: '#000',
        maxWidth: 490,
        width: '100%',
        maxHeight: '90%',
        borderRadius: 6,
        transform: 'scale(0)',
        boxShadow: '0px 1px 10px 0px rgba(0, 0, 0, 0.15)',
        transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
    },
    done_popup_cont:{
        color: '#000',
        backgroundColor: '#f1f1f1',
        borderRadius: 6,
        position: 'relative',
        height: '100%',
        overflow: 'hidden'
    },
    done_popup_close:{
        width: 20,
        height: 20,
        position: 'absolute',
        top: 8,
        right: 8,
        cursor: 'pointer',
        zIndex: '2',
        '& path': {
            transition: 'all 0.9s cubic-bezier(.19,1,.22,1)'
        },
        '&:hover':{
            '& path':{
                fill: '#BAE51F'
            }
        }
    },
    done_popup_close_icon:{
        width: '100%'
    },
    done_popup_top:{
        background: '#72C4FF',
        height: 210,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    done_popup_top_icon:{

    },
    done_popup_bot:{
        padding: '20px 10px 50px',
        textAlign: 'center',
    },
    done_popup_title:{
        color: '#2F2F2F',
        fontSize: 32,
        fontWeight: 300,
        textAlign: 'center',
        marginBottom: 10,
    },
    done_popup_text:{
        color: '#2F2F2F',
        fontSize: 14,
        fontWeight: 300,
        textAlign: 'center',
        marginBottom: 30
    },
    done_popup_btn:{
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
            background: '#8fc32d'
        },
        '@media screen and (max-width: 950px)':{
            fontSize: 12,
            height: '26px',
            minWidth: 88
        }
    }
});
const RenderDone = props => {
    const classes = useStyle();
    let dispatch = useDispatch();
    let translation = useSelector(selectTranslation);

    let [animPopupClass, setAnimPopupClass] = useState(false);

    let onClickClosePopUp = e => {
        setAnimPopupClass(false);
        setTimeout(() => dispatch(closeActivePopup({name: "renderMade"})), 500);
    }

    useEffect(() => {
        const timer = setTimeout(() => setAnimPopupClass(true), 0);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={animPopupClass ? classes.done_popup_wrap +' '+ classes.done_popup_wrap_show : classes.done_popup_wrap}>
            <div className={classes.done_popup_wr}>
                <div className={classes.done_popup_cont}>
                    <div className={classes.done_popup_close} onClick={onClickClosePopUp} id="js_close_popup">
                        <svg className={classes.done_popup_close_icon} viewBox="0 0 16.03 16.02" width="24px" height="24px">
                            <path fill="#444444" d="M1,0a1,1,0,0,0-.7,1.72L6.6,8,.31,14.3a1,1,0,0,0,1.39,1.44l0,0L8,9.42l6.29,6.29a1,1,0,1,0,1.44-1.39l0,0L9.43,8l6.29-6.29A1,1,0,1,0,14.31.3L8,6.6,1.72.3A1,1,0,0,0,1,0Z"/>
                        </svg>
                    </div>
                    <div className={classes.done_popup_login_wr}>
                        <div className={classes.done_popup_top}>
                            <svg className={classes.done_popup_top_icon} width="167" height="127" viewBox="0 0 167 127" fill="none">
                                <mask id="path-1-inside-1_1056_971" fill="white">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M166.309 17.6125L148.566 0L58.4549 90.7773L17.6777 50.0001L0 67.6777L58.4111 126.089L58.511 125.989L58.62 126.097L166.309 17.6125Z"/>
                                </mask>
                                <path fillRule="evenodd" clipRule="evenodd" d="M166.309 17.6125L148.566 0L58.4549 90.7773L17.6777 50.0001L0 67.6777L58.4111 126.089L58.511 125.989L58.62 126.097L166.309 17.6125Z" fill="#9DD900"/>
                                <path d="M148.566 0L149.271 -0.709705L148.561 -1.4142L147.857 -0.704499L148.566 0ZM166.309 17.6125L167.019 18.317L167.723 17.6073L167.014 16.9028L166.309 17.6125ZM58.4549 90.7773L57.7478 91.4844L58.4575 92.1941L59.1646 91.4818L58.4549 90.7773ZM17.6777 50.0001L18.3848 49.293L17.6777 48.5859L16.9706 49.293L17.6777 50.0001ZM0 67.6777L-0.707107 66.9706L-1.41421 67.6777L-0.707107 68.3848L0 67.6777ZM58.4111 126.089L57.704 126.796L58.4111 127.503L59.1182 126.796L58.4111 126.089ZM58.511 125.989L59.2155 125.279L58.5084 124.577L57.8039 125.282L58.511 125.989ZM58.62 126.097L57.9155 126.807L58.6253 127.511L59.3297 126.802L58.62 126.097ZM147.862 0.709705L165.605 18.3222L167.014 16.9028L149.271 -0.709705L147.862 0.709705ZM59.1646 91.4818L149.276 0.704499L147.857 -0.704499L57.7452 90.0728L59.1646 91.4818ZM16.9706 50.7072L57.7478 91.4844L59.162 90.0702L18.3848 49.293L16.9706 50.7072ZM0.707107 68.3848L18.3848 50.7072L16.9706 49.293L-0.707107 66.9706L0.707107 68.3848ZM59.1182 125.382L0.707107 66.9706L-0.707107 68.3848L57.704 126.796L59.1182 125.382ZM57.8039 125.282L57.704 125.382L59.1182 126.796L59.2181 126.696L57.8039 125.282ZM59.3245 125.387L59.2155 125.279L57.8065 126.699L57.9155 126.807L59.3245 125.387ZM165.599 16.908L57.9103 125.393L59.3297 126.802L167.019 18.317L165.599 16.908Z" fill="#CCEB8E" mask="url(#path-1-inside-1_1056_971)"/>
                            </svg>

                        </div>
                        <div className={classes.done_popup_bot}>
                            <div className={classes.done_popup_title}>
                                { translation["RENDER_WELL_DONE"] }
                            </div>
                            <div className={classes.done_popup_text} dangerouslySetInnerHTML={{__html: translation["RENDER_IN_PROGRESS"]}}></div>
                            <div className={classes.done_popup_btn} onClick={onClickClosePopUp}>{ translation["RENDER_CONTINUE"] }</div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default RenderDone;