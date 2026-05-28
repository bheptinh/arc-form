import React, {useEffect, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeActivePopup, selectPopups, setActivePopup } from '../../redux/features/popups/popupsSlice';
import { selectTranslation } from '../../redux/features/language/languageSlice';
import {createUseStyles} from "react-jss";
import { planner } from '../../initR2D';
import { useRef } from 'react';
import { updatePreloaderStatus } from '../../redux/features/common/commonSlice';

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
    text:{
        color: '#373737',
        fontSize: 16,
        textAlign: 'center',
        '@media screen and (max-width: 950px)':{
            fontSize: 14,
        }
    },
    planner_btn_done_wrap:{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 17
    },
    planner_btn:{
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
        outline: 'none',
        background: '#fff',
        textTransform: 'uppercase',
        border: '1px solid #000',
        margin: '0 3px',
        '&:hover': {
            background: '#E9E9E9'
        },
        '@media screen and (max-width: 950px)':{
            fontSize: 12,
            height: '26px',
            minWidth: 88
        }
    },
    planner_btn_done:{
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
        margin: '0 3px',
        '&:hover': {
            background: '#8fc32d'
        },
        '@media screen and (max-width: 950px)':{
            fontSize: 12,
            height: '26px',
            minWidth: 88
        }
    },
    input_wr:{
        color: '#fff',
        width: '100%',
        margin: 'auto',
        marginTop: 15
    },
    formInput:{
        paddingLeft: '5px',
        fontSize: '14px',
        color: '#000',
        width: '100%',
        border: '1px solid #e8dede',
        height: '30px',
        background: '#ffffff',
        outline: 'none',
        resize: 'none',
        transition: 'all 0.4s ease-out',
        borderRadius: "3px"
    },

});

const ChangeProjectNamePopup = props => {
    const classes = useStyle();
    let popups = useSelector(selectPopups);
    let translation = useSelector(selectTranslation);
    let dispatch = useDispatch();
    let changeProjectForm = useRef(null);
    const popupData = popups.changeProjectName;
    let projectActiveName = popupData.data.name;
    let [animPopupClass, setAnimPopupClass] = useState(false);

    let onClickClosePopUp = e => {
        e.preventDefault();
        setAnimPopupClass(false);
        setTimeout(() => dispatch(closeActivePopup({name: "changeProjectName"})), 500);
    }

    let onSubmit = async e => {
        e.preventDefault();
        const updatedName = e.target.elements.name.value;

        dispatch(updatePreloaderStatus(true));

        let response = await planner.scene.renameProject(popupData.data.id, popupData.data.name, updatedName);
        if(response.status == "error") {
            dispatch(updatePreloaderStatus(false));
            return dispatch(setActivePopup({name: "alert", data: response.data}));
        }

        dispatch(setActivePopup({ name: "completeMessage", positionX: "left", data: "NOTIFY_RENAME_PLAN_COMPLETE" }));

        dispatch(updatePreloaderStatus(false));
        planner.scene.dispatchEvent(new Event(planner.scene.PROJECTS_UPDATE, {}));
        setAnimPopupClass(false);
        setTimeout(() => dispatch(closeActivePopup({name: "changeProjectName"})), 500);
    };

    useEffect(() => {
        const timer = setTimeout(() => setAnimPopupClass(true), 0);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={animPopupClass ? classes.planner_popup_wrap +' '+ classes.planner_popup_wrap_show : classes.planner_popup_wrap} style={{zIndex: popups.changeProjectName.zIndex}}>
            <div className={classes.planner_popup_wr}>
                <div className={classes.planner_popup_cont}>

                    <div className={classes.planner_popup_close} onClick={onClickClosePopUp}>
                        <svg  width="25" height="25" fill="none" viewBox="0 0 25 25" className={classes.planner_popup_close_icon}>
                            <path fill="#2F2F2F" fillRule="evenodd" d="M.102 1.417 1.22.329l12.34 12.07-.007.006v.002l-.23.221-.88.858-.005-.005L1.172 24.329.064 23.233l11.259-10.842L.103 1.417Z" clipRule="evenodd"/>
                            <path fill="#2F2F2F" fillRule="evenodd" d="M.102 1.417 1.22.329l12.34 12.07-.007.006v.002l-.23.221-.88.858-.005-.005L1.172 24.329.064 23.233l11.259-10.842L.103 1.417Z" clipRule="evenodd"/>
                            <path fill="#2F2F2F" fillRule="evenodd" d="M24.73 1.417 23.613.329 11.273 12.4l.008.006-.002.002.23.221.881.858.005-.005L23.66 24.329l1.108-1.096L13.51 12.391 24.73 1.417Z" clipRule="evenodd"/>
                            <path fill="#2F2F2F" fillRule="evenodd" d="M24.73 1.417 23.613.329 11.273 12.4l.008.006-.002.002.23.221.881.858.005-.005L23.66 24.329l1.108-1.096L13.51 12.391 24.73 1.417Z" clipRule="evenodd"/>
                        </svg>
                    </div>

                    <form ref={changeProjectForm} onSubmit={onSubmit}>
                        <div className={classes.text}> { translation["TEXT_ENTER_NAME_SCENE"] } </div>
                        <fieldset>
                            <div className={classes.input_wr}>
                                <input className={classes.formInput} type="text" name="name" defaultValue={ projectActiveName }/>
                            </div>
                        </fieldset>
                        <fieldset className={classes.planner_btn_done_wrap}>
                            <button className={classes.planner_btn} onClick={onClickClosePopUp}> { translation["BUTTON_CANCEL"] } </button>
                            <button className={classes.planner_btn_done} type='submit'> { translation["BUTTON_OK"] } </button>
                        </fieldset>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ChangeProjectNamePopup;