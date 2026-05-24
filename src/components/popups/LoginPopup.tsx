import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { saveLoggedStatus } from '../../redux/features/user/userSlice';
import { setActivePopup, closeActivePopup, selectPopups, setPopupData } from '../../redux/features/popups/popupsSlice';
import {createUseStyles} from "react-jss";
import { selectTranslation } from '../../redux/features/language/languageSlice';
import { planner, user } from '../../initR2D';
import {
    selectIsProjectOnlyView,
    updateIsProjectBelongToLoggedUser,
    updatePreloaderStatus
} from '../../redux/features/common/commonSlice';
import { removeQuickPanelAll } from '../../redux/features/quickPanels/quickPanelsSlice';
import { changeActiveControlPanelMode } from '../../redux/features/control/controlPanelSlice';

const useStyle = createUseStyles({
    planner_popup_wrap:{
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
    planner_popup_wrap_show:{
        opacity: '1',
        pointerEvents: 'auto',
        transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
        '& $planner_popup_wr':{
            transform: 'scale(1)'
        }
    },
    planner_popup_wr:{
        color: '#000',
        maxWidth: 624,
        width: '100%',
        maxHeight: '90%',
        transform: 'scale(0)',
        boxShadow: '0px 1px 10px 0px rgba(0, 0, 0, 0.15)',
        transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
    },
    planner_popup_cont:{
        color: '#000',
        backgroundColor: '#fff',
        borderRadius: 6,
        position: 'relative',
        height: '100%',
        padding: '64px 73px 71px',
        '@media screen and (max-width: 950px)':{
            padding: 14,
        }
    },
    planner_popup_login_wrap:{

    },
    planner_popup_close:{
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
    planner_popup_close_icon:{
        width: '100%'
    },
    planner_popup_facebook:{

    },
    planner_popup_facebook_text:{
        color: '#373737',
        fontSize: 16,
        textAlign: 'center',
        margin: '15px 10px',
        '@media screen and (max-width: 950px)':{
            fontSize: 11,
            margin: '14px 10px',
        }
    },
    planner_popup_facebook_google_icons_wr:{
        display: 'flex',
        justifyContent: 'center'
    },
    planner_popup_facebook_icon:{
        width: '23px',
        margin: '0 10px',
        cursor: 'pointer',
        '& img':{
            display: 'block'
        }
    },
    planner_popup_facebook_line:{
        background: 'rgb(217, 217, 217)',
        height: '1px',
        margin: '15px 40px',

    },
    planner_popup_login_wr:{
        marginBottom: '20px',
        '@media screen and (max-width: 950px)':{
            marginBottom: '10px',
        }
    },
    input_wrap:{        
        padding: '0 75px 0 65px',
        display: 'flex',
        gridGap: 20,
        border: 'none',
        justifyContent: 'flex-end',
        alignItems: 'center',
        position: 'relative',
        '@media screen and (max-width: 950px)':{
            padding: '0 15px',
            gridGap: 14
        }
    },
    input_wrap_password:{
        margin: '20px 0 25px'
    },
    input_text:{
        fontFamily: 'Roboto, sans-serif',
        fontSize: 14,
        color: '#2f2f2f',
        whiteSpace: 'nowrap',
        textAlign: 'right',
        '@media screen and (max-width: 950px)':{
            fontSize: 11,
        }
    },
    input_wr:{
        color: '#fff',
        maxWidth: 225,
        width: '100%',
        '&:last-child': {
            marginBottom: '0'
        }
    },
    formInput:{
        borderRadius: 3,
        paddingLeft: 10,
        fontSize: 14,
        color: '#000',
        width: '100%',
        border: '1px solid #e8dede',
        height: 30,
        background: '#ffffff',
        outline: 'none',
        resize: 'none',
        transition: 'all 0.4s ease-out',
        '@media screen and (max-width: 950px)':{
            height: 26,
            fontSize: 11,
        }
    },
    planner_btn_done_wrap:{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    planner_btn_done:{
        cursor: 'pointer',
        height: '35px',
        display: 'flex',
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
    },
    planner_popup_bottom:{
        display: 'flex',
        justifyContent: 'space-between'
    },
    planner_popup_bottom_link:{
        fontSize: 14,
        color: '#66ACF4',
        textDecoration: 'underline',
        cursor: 'pointer',
        '&:hover':{
            textDecoration: 'none',
        },
        '@media screen and (max-width: 950px)':{
            fontSize: 11
        }
    },
    input_pass_btn:{
        position: 'absolute',
        top: 5,
        right: 80,
        cursor: 'pointer'
    }
});

const LoginPopup = props => {
    let dispatch = useDispatch();
    let translation = useSelector(selectTranslation);
    let popups = useSelector(selectPopups);
    let popupData = popups.login.data;
    let popupType = popups.login.type;

    let isProjectOnlyView = useSelector(selectIsProjectOnlyView);

    let [isFacebookLoginShow, setIsFacebookLoginShow] = useState(R2D.config.data.ui.fb_login);
    let [animPopupClass, setAnimPopupClass] = useState(false);
    let [iconPasswordStatus, setIconPasswordStatus] = useState(false);

    const classes = useStyle();

    let currOS = R2D.controller.getCurrentOS();
    let isCurrDeviceAPhone = currOS == "iOS" || currOS == "Android";

    const onSubmit = async e => {
        e.preventDefault();
        dispatch(updatePreloaderStatus(true));
        let form = e.target;

        let email = form.elements.email;
        let password = form.elements.password;
            
        let responce = await user.tryLogin(email.value, password.value);
        if(responce.type == "error") {
            dispatch(setActivePopup({name: "alert", data: responce.data}))
            dispatch(updatePreloaderStatus(false));
        }
        else {
            dispatch(saveLoggedStatus(responce));
            setAnimPopupClass(false);

            setTimeout(() => dispatch(closeActivePopup({name: "login"})), 500);

            if(popupType == "buy_plan") {
                user.data.plan != "pro" ? dispatch(setPopupData({name: "payPro", data: popupData})) :
                setAnimPopupClass(false);
                setTimeout(() => dispatch(closeActivePopup({name: "payPro"})), 500);
            }

            popupType == "buy_credits" && dispatch(setPopupData({name: "buyCredits", data: {creditsNum: popupData}}));

            popupType == "startPopup" && dispatch(setActivePopup({name: "projectsPopup"}));

            if(popupType == "promoCredits") {
                let result = await user.promoLoad(popupData);
                if(result.type == "error") dispatch(setActivePopup({name: "alert", data: result.data}));
                else dispatch(setActivePopup({name: "alert", data: result.message}));
            }

            let isCurrentProjectBelongToUser = R2D.scene.getProjectUserKey() == user.getKey();
            planner.scene.setIsProjectBelongToLoggedUserStatus(isCurrentProjectBelongToUser);

            if(R2D.scene.viewOnly && !isCurrentProjectBelongToUser && R2D.mouseInteractionHelper.state.name != 'stateMain') {
                planner.mih().unsetActiveObject();
                planner.mih().changeState(planner.mih().stateMain);

                dispatch(removeQuickPanelAll());
                dispatch(changeActiveControlPanelMode({mode: 'to2d3d'}));
            }

            R2D.mouseInteractionHelper.state?.setIsSelectingModel && R2D.mouseInteractionHelper.state.setIsSelectingModel(!isProjectOnlyView || (isProjectOnlyView && isCurrentProjectBelongToUser));
            WC.wallsEditor.state.setIsSelectElementsActive && WC.wallsEditor.state.setIsSelectElementsActive(!isProjectOnlyView || (isProjectOnlyView && isCurrentProjectBelongToUser));
            dispatch(updateIsProjectBelongToLoggedUser(isCurrentProjectBelongToUser));
            dispatch(updatePreloaderStatus(false));

            if(popupType == "promoUpgradeLogin") dispatch(setActivePopup({name: 'alert', data: "PLAN_UPGRADE_SUCCESS_TEXT"}));
        }
    }

    let onTapToClose = e => {
        if(!e.target.closest('.' + classes.planner_popup_wr)) {
            document.removeEventListener('touchend', onTapToClose);
            setAnimPopupClass(false);
            setTimeout(() => dispatch(closeActivePopup({name: "login"})), 500);
        }
    }

    let onClickClosePopUp = e => {
        setAnimPopupClass(false);
        setTimeout(() => dispatch(closeActivePopup({name: "login"})), 500);
    }

    const openNewPopup = name => {
        setAnimPopupClass(false);
        dispatch(setActivePopup({ name }));
        setTimeout(() => dispatch(closeActivePopup({ name: "login" })), 500);
    }
    let onFacebookLogin = async e => {
        let response = await user.facebookLogin();
        if(response.type == "error") dispatch(setActivePopup({name: "alert", data: response.data}));

        else {
            dispatch(saveLoggedStatus(response));
            setAnimPopupClass(false);
            setTimeout(() => dispatch(closeActivePopup({name: "login"})), 500);
            if(popupType == "buy_plan")  {
                user.data.plan != "pro" ? dispatch(setPopupData({name: "payPro", data: popupData})) :
                setAnimPopupClass(false);
                setTimeout(() => dispatch(closeActivePopup({name: "payPro"})), 500);
            }
            popupType == "buy_credits" && dispatch(setPopupData({name: "buyCredits", data: {creditsNum: popupData}}));

            popupType == "startPopup" && dispatch(setActivePopup({name: "projectsPopup"}));

            popupType == "upgrade_plan" && user.data.plan != "pro" && dispatch(setActivePopup({name: 'upgradePlan'}));
        }
    }

    let onGoogleLogin = async e => {
        const response = await user.googleLogin();
        if(response.type == "error") {
            dispatch(setActivePopup({name: "alert", data: response.data}));
        } else {
            dispatch(saveLoggedStatus(response));
            dispatch(closeActivePopup({name: "login"}));

            if(popupType == "buy_plan")  {
                user.data.plan != "pro" ? dispatch(setPopupData({name: "payPro", data: popupData})) :
                setAnimPopupClass(false);
                setTimeout(() => dispatch(closeActivePopup({name: "payPro"})), 500);
            }
            popupType == "buy_credits" && dispatch(setPopupData({name: "buyCredits", data: {creditsNum: popupData}}));

            popupType == "startPopup" && dispatch(setActivePopup({name: "projectsPopup"}));

            popupType == "upgrade_plan" && user.data.plan != "pro" && dispatch(setActivePopup({name: 'upgradePlan'}));
        }
    }

    let onRadioPasswordShowStatus = e => setIconPasswordStatus(!iconPasswordStatus);
    
    useEffect(() => setIsFacebookLoginShow(R2D.config.data.ui.fb_login), [R2D.config.data.ui.fb_login]);

    useEffect(() => {
        isCurrDeviceAPhone && document.addEventListener('touchend', onTapToClose);
        const timer = setTimeout(() => setAnimPopupClass(true), 0);
        return () => {
            clearTimeout(timer);
            document.removeEventListener('touchend', onTapToClose);
        }
    }, []);
    
    return (
        <div className={animPopupClass ? classes.planner_popup_wrap +' '+ classes.planner_popup_wrap_show : classes.planner_popup_wrap} style={{zIndex: popups.login.zIndex}}>
            <div className={classes.planner_popup_wr}>
                <div className={classes.planner_popup_cont}>
                    <div className={classes.planner_popup_login_wrap}>
                        {
                            isFacebookLoginShow ?
                            <div className={classes.planner_popup_facebook}>
                                <div className={classes.planner_popup_facebook_text}>{ translation["TEXT_SIGN_IN_WITH"] }</div>

                                <div className={classes.planner_popup_facebook_google_icons_wr}>
                                    <div className={classes.planner_popup_facebook_icon} onClick={onFacebookLogin}>
                                        <img src="/src_designer/images/icon_facebook.svg" />
                                    </div>
                                    <div className={classes.planner_popup_facebook_icon} onClick={onGoogleLogin}>
                                        <img src="/src_designer/images/google.svg" />
                                    </div>
                                </div>
                                <div className={classes.planner_popup_facebook_line}></div>
                                <div className={classes.planner_popup_facebook_text}>{ translation["TEXT_SIGN_IN_OR"] }</div>
                            </div> :
                            null
                        }
                        <div className={classes.planner_popup_close}  onClick={onClickClosePopUp}>
                            <svg  width="25" height="25" fill="none" viewBox="0 0 25 25" className={classes.planner_popup_close_icon}>
                                <path fill="#2F2F2F" fillRule="evenodd" d="M.102 1.417 1.22.329l12.34 12.07-.007.006v.002l-.23.221-.88.858-.005-.005L1.172 24.329.064 23.233l11.259-10.842L.103 1.417Z" clipRule="evenodd"/>
                                <path fill="#2F2F2F" fillRule="evenodd" d="M.102 1.417 1.22.329l12.34 12.07-.007.006v.002l-.23.221-.88.858-.005-.005L1.172 24.329.064 23.233l11.259-10.842L.103 1.417Z" clipRule="evenodd"/>
                                <path fill="#2F2F2F" fillRule="evenodd" d="M24.73 1.417 23.613.329 11.273 12.4l.008.006-.002.002.23.221.881.858.005-.005L23.66 24.329l1.108-1.096L13.51 12.391 24.73 1.417Z" clipRule="evenodd"/>
                                <path fill="#2F2F2F" fillRule="evenodd" d="M24.73 1.417 23.613.329 11.273 12.4l.008.006-.002.002.23.221.881.858.005-.005L23.66 24.329l1.108-1.096L13.51 12.391 24.73 1.417Z" clipRule="evenodd"/>
                            </svg>
                        </div>
                        <div className={classes.planner_popup_login_wr}>
                            <form onSubmit={onSubmit}>
                                <fieldset className={classes.input_wrap}>
                                    <div className={classes.input_text}>{translation["INPUT_TEXT_LOGIN"]}</div>
                                    <div className={classes.input_wr}>
                                        <input id="formEmail" className={classes.formInput} type="text" name="email" required placeholder="" />
                                    </div>
                                </fieldset>
                                <fieldset className={classes.input_wrap + ' ' + classes.input_wrap_password}>
                                    <div className={classes.input_text}>{translation["INPUT_TEXT_PASSWORD"]}</div>
                                    <div className={classes.input_wr}>
                                        <input id="formPassword" className={classes.formInput} type={iconPasswordStatus ? "text" : "password"} name="password" required placeholder="" />
                                    </div>
                                    <div className={classes.input_pass_btn} onClick={onRadioPasswordShowStatus}>
                                        {
                                            iconPasswordStatus ? 
                                            <svg width="16" height="10" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M7.60645 0.678711C10.8059 0.678711 13.4587 2.41594 14.4785 4.75391C13.4588 7.09204 10.8061 8.8291 7.60645 8.8291C4.40666 8.82906 1.75299 7.09223 0.733398 4.75391C1.7531 2.41575 4.40681 0.678755 7.60645 0.678711Z" stroke="#2F2F2F" strokeWidth="1.35832" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M7.63486 7.13112C8.94767 7.13112 10.0119 6.06688 10.0119 4.75407C10.0119 3.44126 8.94767 2.37701 7.63486 2.37701C6.32205 2.37701 5.25781 3.44126 5.25781 4.75407C5.25781 6.06688 6.32205 7.13112 7.63486 7.13112Z" fill="#2F2F2F"/>
                                            </svg>
                                            : 
                                            <svg width="16" height="7" viewBox="0 0 16 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <g opacity="0.5">
                                                <path d="M0.0367804 0C1.08883 2.75949 4.09401 4.7541 7.64335 4.7541C11.1927 4.7541 14.1979 2.75949 15.2499 0H13.7655C12.7824 1.92685 10.4792 3.39579 7.64335 3.39579C4.80745 3.39579 2.50426 1.92685 1.52121 0H0.0367804Z" fill="#2F2F2F"/>
                                                <path d="M1.66726 1.35867L2.74853 2.18079L1.08127 4.07029L0 3.24817L1.66726 1.35867Z" fill="#2F2F2F"/>
                                                <path d="M3.93526 3.4718L5.29908 3.86245L4.33965 6.51566L2.97583 6.12502L3.93526 3.4718Z" fill="#2F2F2F"/>
                                                <path d="M10.4836 3.4778L9.10086 3.8245L9.97135 6.50405L11.3541 6.15735L10.4836 3.4778Z" fill="#2F2F2F"/>
                                                <path d="M13.6144 1.35867L12.5331 2.18079L14.2598 4.1484L15.341 3.32628L13.6144 1.35867Z" fill="#2F2F2F"/>
                                                </g>
                                            </svg>
                                        }
                                    </div>
                                </fieldset>
                                <fieldset className={classes.planner_btn_done_wrap}>
                                    <input type="submit" className={classes.planner_btn_done} id="login_sent" value="Ok" />
                                </fieldset>
                            </form>
                        </div>
                        <div className={classes.planner_popup_bottom}>
                            <span className={classes.planner_popup_bottom_link} onClick={e => openNewPopup("registration") }>{translation["TEXT_HEAD_REGISTRATION"]}</span>
                            <span className={classes.planner_popup_bottom_link} onClick={e => openNewPopup("forgotPassword") }>{ translation["TEXT_FORGOT_PASSWORD"] }</span>
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginPopup;