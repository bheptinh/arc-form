import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createUseStyles } from "react-jss";
import { FacebookShareButton } from 'next-share';

import { planner } from '../../initR2D';
import { selectTranslation } from '../../redux/features/language/languageSlice';
import { closeActivePopup, selectPopups, setActivePopup } from '../../redux/features/popups/popupsSlice';
import { selectUserProfileData, selectUserProjectActive } from '../../redux/features/user/userSlice';
import { selectIsProjectBelongToLoggedUser, updateIsProjectOnlyView } from '../../redux/features/common/commonSlice';
import HoverComponent from "../left_new/parts/controlPanel/components/HoverComponent";
import Checkbox from '../common/Checkbox';
import { useEffectAsync } from '../../utils/useEffectAsync';

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
            transform: 'scale(1)',
        }
    },
    planner_popup_wr:{
        color: '#000',
        maxWidth: 542,
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
        height: '100%',
        padding: '29px 60px 67px',
        position: 'relative',
        '@media screen and (max-width: 950px)':{
            padding: '14px 20px 14px',
        }
    },
    planner_popup_login_wrap:{
        position: 'relative'
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
                fill: '#a0a0a0'
            }
        }
    },
    planner_popup_close_icon:{
        width: '100%'
    },
    planner_popup_title:{
        fontSize: 25,
        fontWeight: 300,
        marginBottom: 25,
        color: '#373737',
        textAlign: 'center',
        '@media screen and (max-width: 950px)':{
            fontSize: 20,
        }
    },
    planner_popup_facebook:{
        display: 'flex',
        alignItems: 'center',
        marginBottom: 15
    },
    planner_popup_facebook_icon:{
        width: 29,
        marginLeft: 13,
        '& img':{
            display: 'block'
        },
        '@media screen and (max-width: 950px)':{
            width: 22,
            marginLeft: 9,
            transform: 'translateY(-5px)',
        }
    },
    planner_popup_facebook_line:{
        background: '#D9D9D9',
        height: 1,
        marginBottom: 15
    },
    planner_popup_login_wr:{

    },
    input_wrap:{
        display: 'grid',
        gridGap: '10px',
        marginBottom: 15
    },
    input_wr:{
        color: '#fff',
        '&:last-child': {
            marginBottom: '0'
        }
    },
    planner_popup_text:{
        fontSize: 14,
        color: '#2F2F2F',
        marginBottom: 10,
        '@media screen and (max-width: 950px)':{
            fontSize: 11,
        }
    },
    formInputWr:{
        display: 'grid',
        gridTemplateColumns: 'auto 22px',
        alignItems: 'center',
        gridGap: 6
    },
    formShareIcon:{
        width: 22,
        height: 22,
        cursor: 'pointer',
        '& path':{
            transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
        },
        '&:hover':{
            '& path':{
                fill: '#a0a0a0'
            }
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
    formTextarea:{
        padding: 5,
        fontSize: 14,
        borderRadius: 3,
        color: '#000',
        width: '100%',
        border: '1px solid #e8dede',
        height: 100,
        background: '#ffffff',
        outline: 'none',
        resize: 'none',
        transition: 'all 0.4s ease-out',
        '@media screen and (max-width: 950px)':{
            fontSize: 11,
            height: 55,
        }
    },

    important_input:{
        '& $formInput':{
            border: '1px solid #e84343 !important'
        }
    },
    planner_popup_report:{
        color: 'red',
        fontSize: '12px',
        marginBottom: '10px'
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
        }
    },
    planner_popup_bottom:{
        display: 'grid',
        gridTemplateColumns: 'auto auto auto auto',
        justifyContent: 'left',
        gridGap: 6,
        alignItems: 'center',
        fontSize: 14,
        color: '#2F2F2F',
        '@media screen and (max-width: 950px)':{
            fontSize: 11,
        }
    },
    formInputSize:{
        fontSize: '13px',
        borderRadius: 3,
        color: '#000',
        width: 45,
        textAlign: 'center',
        border: '1px solid #e8dede',
        height: 32,
        background: '#ffffff',
        outline: 'none',
        resize: 'none',
        transition: 'all 0.4s ease-out',
        '@media screen and (max-width: 950px)':{
            height: 26,
            fontSize: 11,
            width: 40,
        }
    },
    planner_popup_checkbox:{
        margin: '10px 0',
        display: 'flex',
        flexDirection: 'column'
    },
    planner_popup_checkbox_top:{
        display: 'flex',
        alignItems: 'start'
    },
    preloaderDiv:{
        position: 'absolute',
        left: 0,
        top: 0,
        height: '100%',
        width: '100%',
        zIndex: 5,
        background: 'rgba(0, 0, 0, .5)'
    },
    additional_info:{
        marginLeft: 5
    },
    additional_info_hover:{
        position: "absolute",
        background: "#81e7ff",
        display: "none",
        fontSize: 12,
        width: "max-content",
        zIndex: 999,
        padding: "2px 7px",
        transition: "all .1s ease",
        userSelect: "none"
    },
    planner_popup_checkbox_error: {
        paddingLeft: 22,
        marginTop: 2,
        display: 'flex',
        alignItems: 'center',
        '& > p':{
            fontSize: 13,
            color: '#2F2F2F'
        },
    },
    planner_popup_checkbox_error_red:{
        '& > p':{
            color: '#AF3131'
        }
    },
    planner_popup_checkbox_error_pro:{
        color: "#000",
        fontSize: "13px",
        marginLeft: "6px",
        borderRadius: "3px",
        padding: "5px 6px",
        position: 'relative',
        background: '#FFB400',
        textTransform: 'uppercase',
        zIndex: 1,
        marginRight: 9,
    },
    planner_popup_checkbox_error_text:{
        fontSize: 13,
        color: '#66ACF4',
        fontWeight: 400,
        textDecoration: 'underline',
        cursor: 'pointer',
        '&:hover':{
            textDecoration: 'none'
        }
    },
});

const SharePopup = props => {
    let dispatch = useDispatch();
    let translation = useSelector(selectTranslation);
    let popups = useSelector(selectPopups);

    let [width, setWidth] = useState(800);
    let [height, setHeight] = useState(600);

    let [needToUpgrade, setNeedToUpgrade] = useState(false);

    let popupType = popups.share.type;

    let popupData = popupType == 'tour' ? R2D.URL.DOMAIN + popups.share.data : popups.share.data ? popups.share.data : R2D.scene.getProjectHash();

    let createdLink = popupType == 'tour' ? popupData : projectShareDomain + popupData;  

    let [configFacebookSharing, setFacebookSharing] = useState(R2D.config.data.ui.facebook_sharing);

    let isProjectBelongToLoggedUser = useSelector(selectIsProjectBelongToLoggedUser);

    let userProjectActive = useSelector(selectUserProjectActive);

    const classes = useStyle();
    
    let [checkboxProjectOnlyView, setCheckboxProjectOnlyView] = useState(planner.scene.getProjectOnlyViewState());

    let [preloaderStatus, setPreloaderStatus] = useState(false);
    let [animPopupClass, setAnimPopupClass] = useState(false);

    const inputRef = useRef(null);

    let userData = useSelector(selectUserProfileData);

    let onClickClosePopUp = e => {
        setAnimPopupClass(false);
        setTimeout(() => dispatch(closeActivePopup({name: "share"})), 500);
    }

    const handleCopy = () => {
        if (inputRef.current) {
            inputRef.current.select();
            const textToCopy = inputRef.current.value;
            navigator.clipboard.writeText(textToCopy);
        }
    };

    let onChangeOnlyView = async status => {
        if(userData.plan == 'pro' || (isProjectBelongToLoggedUser && userProjectActive.plan == 'pro')) {
            setNeedToUpgrade(false)
            setPreloaderStatus(true);
            setCheckboxProjectOnlyView(status);
            await planner.scene.setOnlyViewParam(status, popupData);
            if(R2D.scene.getProjectHash() == popupData) {
                planner.scene.updateProjectOnlyViewState(status);
                dispatch(updateIsProjectOnlyView(status));
            }
            setCheckboxProjectOnlyView(status);
            setPreloaderStatus(false);
        } else setNeedToUpgrade(true);
    };

    useEffect(() => {
        userData.plan == 'pro' && setNeedToUpgrade(false)
    }, [userData.plan]);

    useEffectAsync(async () => {
        if(popupType == 'listProject') {
            setPreloaderStatus(true);
            if(R2D.scene.getProjectHash() == popupData) {
                setCheckboxProjectOnlyView(R2D.scene.viewOnly);
            } else {
                let result = await R2D.controller.shareDataLoad(popupData);
                setCheckboxProjectOnlyView(result.data.viewOnly);
            }
            setPreloaderStatus(false);
        }
    }, [popupType]);

    useEffect(() => {
        const timer = setTimeout(() => setAnimPopupClass(true), 0);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={animPopupClass ? classes.planner_popup_wrap +' '+ classes.planner_popup_wrap_show : classes.planner_popup_wrap} style={{zIndex: popups.share.zIndex}}>
            <div className={classes.planner_popup_wr}>
                <div className={classes.planner_popup_cont}>
                    {
                        preloaderStatus ? 
                        <div className={classes.preloaderDiv}>
                            <div className='preloader'><div className="preloader-cube"></div></div>
                        </div> : null
                    }
                    <div className={classes.planner_popup_close} id="js_close_popup" onClick={onClickClosePopUp}>
                        <svg  width="25" height="25" fill="none" viewBox="0 0 25 25" className={classes.planner_popup_close_icon}>
                            <path fill="#2F2F2F" fillRule="evenodd" d="M.102 1.417 1.22.329l12.34 12.07-.007.006v.002l-.23.221-.88.858-.005-.005L1.172 24.329.064 23.233l11.259-10.842L.103 1.417Z" clipRule="evenodd"/>
                            <path fill="#2F2F2F" fillRule="evenodd" d="M.102 1.417 1.22.329l12.34 12.07-.007.006v.002l-.23.221-.88.858-.005-.005L1.172 24.329.064 23.233l11.259-10.842L.103 1.417Z" clipRule="evenodd"/>
                            <path fill="#2F2F2F" fillRule="evenodd" d="M24.73 1.417 23.613.329 11.273 12.4l.008.006-.002.002.23.221.881.858.005-.005L23.66 24.329l1.108-1.096L13.51 12.391 24.73 1.417Z" clipRule="evenodd"/>
                            <path fill="#2F2F2F" fillRule="evenodd" d="M24.73 1.417 23.613.329 11.273 12.4l.008.006-.002.002.23.221.881.858.005-.005L23.66 24.329l1.108-1.096L13.51 12.391 24.73 1.417Z" clipRule="evenodd"/>
                        </svg>
                    </div>
                    <div className={classes.planner_popup_login_wrap}>
                        <div className={classes.planner_popup_title}>{popupType == 'tour' ? translation["TITLE_SHARE_TOUR"] : translation["TITLE_SHARE_PROJECT"]}</div>
                        {
                            popupType != 'tour' && configFacebookSharing ? 
                            <div>
                                <div className={classes.planner_popup_facebook}>
                                    <div className={classes.planner_popup_text}>{translation["TEXT_SHARE_BY"]}</div>

                                    FACEBOOK BUTTON HERE
                                    {/* <FacebookShareButton
                                        url={createdLink}
                                        children={<img src={`${R2D.URL.DOMAIN}/files/render/69682/105640/013048a81eb659fe3f17fafaba8c8c70.png`}/>}
                                        hashtag={'#myProjectInRoomtodo'}
                                    >
                                        <div className={classes.planner_popup_facebook_icon}>
                                            <img src="/src_designer/images/icon_facebook.svg" />
                                        </div>
                                    </FacebookShareButton> */}
                                </div>
                                <div className={classes.planner_popup_facebook_line}></div>
                            </div> : null
                        }
                        
                        <div className={classes.planner_popup_login_wr}>
                            <form>
                                <fieldset className={classes.input_wrap}>
                                    <div className={classes.input_wr}>
                                        <div className={classes.planner_popup_text}>{ popupType == 'tour' ? translation["TEXT_SHARE_LINK_TO_TOUR"] : translation["TEXT_SHARE_LINK_TO_PROJECT"] }</div>
                                        <div className={classes.formInputWr}>
                                            <input ref={inputRef} className={classes.formInput} type="text" name="link" readOnly value={createdLink} />
                                            <svg onClick={handleCopy} className={classes.formShareIcon} width="22" height="22" viewBox="0 0 22 22" fill="none">
                                                <path d="M10.1322 7.9809L7.83223 10.2808C7.82779 10.2853 7.82503 10.2906 7.82061 10.2951C8.38721 10.2126 8.96927 10.2692 9.50884 10.4796L11.0698 8.91857C11.587 8.40144 12.428 8.40144 12.9451 8.91857C13.4623 9.43566 13.4623 10.2768 12.9451 10.7938C12.857 10.8821 10.5122 13.2268 10.6452 13.0938C10.124 13.6151 9.26885 13.5928 8.76988 13.0938C8.51146 12.8354 8.0907 12.8354 7.83223 13.0938L7.42969 13.4963C7.54134 13.686 7.66935 13.8686 7.83223 14.0315C8.81439 15.0136 10.505 15.0921 11.5686 14.0431C11.5731 14.0387 11.5784 14.0359 11.5829 14.0315L13.8828 11.7315C14.9185 10.6958 14.9185 9.01663 13.8828 7.9809C12.8471 6.94517 11.1679 6.94517 10.1322 7.9809Z" fill="#323232"/>
                                                <path d="M8.49952 15.2393L6.9335 16.8053C6.41641 17.3224 5.57532 17.3224 5.05823 16.8053C4.54109 16.2881 4.54109 15.4471 5.05823 14.9299L7.36319 12.625C7.88441 12.1038 8.73954 12.126 9.23851 12.625C9.49693 12.8835 9.91771 12.8835 10.1762 12.625L10.5787 12.2224C10.467 12.0327 10.339 11.8502 10.1762 11.6873C9.19587 10.707 7.50653 10.6236 6.43977 11.6757C6.43533 11.6801 6.42998 11.6829 6.42552 11.6873L4.12053 13.9923C3.08484 15.028 3.0848 16.7072 4.12053 17.743C5.15627 18.7787 6.83549 18.7787 7.87117 17.743L10.1761 15.438C10.1806 15.4335 10.1833 15.4282 10.1878 15.4237C9.62116 15.5062 9.03911 15.4497 8.49952 15.2393Z" fill="#323232"/>
                                                <path d="M15.7455 3.92627H2.51457C1.22505 3.92627 0.179688 4.97163 0.179688 6.26115V19.4921C0.179688 20.7816 1.22505 21.827 2.51457 21.827H15.7455C17.0351 21.827 18.0804 20.7816 18.0804 19.4921V6.26115C18.0804 4.97163 17.0351 3.92627 15.7455 3.92627ZM16.5238 19.4922C16.5238 19.922 16.1754 20.2705 15.7455 20.2705H2.51457C2.08471 20.2705 1.73626 19.922 1.73626 19.4922V6.26115C1.73626 5.83129 2.08471 5.48284 2.51457 5.48284H15.7455C16.1754 5.48284 16.5238 5.83129 16.5238 6.26115V19.4922Z" fill="#323232"/>
                                                <path d="M19.641 0.034668H5.63176C4.34224 0.034668 3.29688 1.08003 3.29688 2.36955C3.29688 2.7994 3.64533 3.14786 4.07518 3.14786C4.50504 3.14786 4.85345 2.7994 4.85345 2.36955C4.85345 1.93969 5.2019 1.59124 5.63176 1.59124H19.641C20.0709 1.59124 20.4193 1.93969 20.4193 2.36955V16.3788C20.4193 16.8087 20.0709 17.1571 19.641 17.1571C19.2112 17.1571 18.8627 17.5056 18.8627 17.9354C18.8627 18.3653 19.2112 18.7138 19.641 18.7138C20.9306 18.7138 21.9759 17.6684 21.9759 16.3789V2.36955C21.9759 1.08003 20.9306 0.034668 19.641 0.034668Z" fill="#323232"/>
                                            </svg>
                                        </div>
                                    </div>
                                    
                                    <fieldset className={classes.planner_popup_checkbox}>
                                        <div className={classes.planner_popup_checkbox_top}>
                                            <Checkbox name={"viewOnly"} label={translation["TEXT_PROJECT_ONLY_VIEW"]} checked={checkboxProjectOnlyView} onChange={onChangeOnlyView} />
                                            <div>
                                                <HoverComponent hoverText={translation["TIPS_SHARE_ONLY_VIEW"]} hoverTextPositionX={'left'} showOnMobile={true}>
                                                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className={classes.additional_info}>
                                                        <circle cx="9" cy="9" r="9" fill="#2D8BDB"/>
                                                        <path d="M10.0621 10.1938H8.76172C8.76535 9.86368 8.79255 9.58076 8.84333 9.34499C8.89774 9.10922 8.98661 8.89702 9.10993 8.70841C9.23326 8.51617 9.40011 8.32029 9.61049 8.1208C9.77734 7.96483 9.92606 7.81792 10.0566 7.68009C10.1908 7.53863 10.296 7.39172 10.3722 7.23938C10.4484 7.08341 10.4865 6.90749 10.4865 6.71162C10.4865 6.49036 10.4502 6.30537 10.3777 6.15665C10.3087 6.00793 10.2054 5.89549 10.0675 5.81932C9.93331 5.73952 9.76465 5.69962 9.56152 5.69962C9.39467 5.69962 9.23689 5.73408 9.08817 5.803C8.93945 5.87191 8.81975 5.97892 8.72907 6.12401C8.63839 6.26547 8.58943 6.45046 8.58217 6.67897H7.14035C7.15123 6.2038 7.26367 5.80844 7.47768 5.49287C7.69169 5.17367 7.98005 4.93609 8.34277 4.78012C8.7055 4.62052 9.11175 4.54072 9.56152 4.54072C10.0585 4.54072 10.4828 4.62415 10.8347 4.791C11.1902 4.95422 11.4604 5.19362 11.6454 5.50919C11.834 5.82476 11.9283 6.20562 11.9283 6.65177C11.9283 6.97096 11.8666 7.25752 11.7433 7.51142C11.62 7.7617 11.4568 7.99566 11.2536 8.21329C11.0505 8.43093 10.8311 8.65037 10.5953 8.87163C10.3885 9.05662 10.2489 9.25431 10.1763 9.46469C10.1038 9.67507 10.0657 9.91809 10.0621 10.1938ZM8.6257 11.8859C8.6257 11.6682 8.69824 11.4869 8.84333 11.3418C8.99205 11.1967 9.19155 11.1241 9.44182 11.1241C9.6921 11.1241 9.88979 11.1967 10.0349 11.3418C10.1836 11.4869 10.258 11.6682 10.258 11.8859C10.258 12.0962 10.1836 12.274 10.0349 12.4191C9.88979 12.5642 9.6921 12.6367 9.44182 12.6367C9.19155 12.6367 8.99205 12.5642 8.84333 12.4191C8.69824 12.274 8.6257 12.0962 8.6257 11.8859Z" fill="#E5E5E5"/>
                                                    </svg>
                                                </HoverComponent>
                                            </div>
                                        </div>
                                        {
                                            userData?.plan != 'pro' ?
                                                <div className={needToUpgrade? classes.planner_popup_checkbox_error + ' ' + classes.planner_popup_checkbox_error_red : classes.planner_popup_checkbox_error}>
                                                    <p>{ translation['EXPORT_ERROR_AVAIL_PRO'] }</p>
                                                    <div className={classes.planner_popup_checkbox_error_pro}>pro</div>
                                                    <a className={classes.planner_popup_checkbox_error_text} onClick={e => dispatch(setActivePopup({name: "payPro", type: 'user'}))}>{translation["TEXT_UPDATE"]}</a>
                                                </div>
                                            : null
                                        }

                                        
                                    </fieldset>

                                    {
                                        popupType != 'tour' ? 
                                        <div className={classes.input_wr}>
                                            <div className={classes.planner_popup_text}>{ translation["TEXT_SHARE_EMBED"] }</div>
                                            <textarea className={classes.formTextarea} type="text" name="embed" readOnly value={"<iframe src='"+ createdLink + "' style='width:" + width + "px" + "; height:" + height + "px" + ";'></iframe>"} />
                                        </div> : null
                                    }

                                </fieldset>
                                {
                                        popupType != 'tour' ? 
                                        <fieldset className={classes.planner_popup_bottom}>
                                            <div>{ translation["TEXT_SHARE_EMBED_SIZE"] }</div>
                                            <input type="text" className={classes.formInputSize} onChange={e => isNaN(e.target.value) ? setWidth(800) : setWidth(+e.target.value)} name="width" value={width} />
                                            x
                                            <input type="text" className={classes.formInputSize} onChange={e => isNaN(e.target.value) ? setHeight(600) : setHeight(e.target.value)} name="height" value={height} />
                                        </fieldset> : null
                                }  
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SharePopup;