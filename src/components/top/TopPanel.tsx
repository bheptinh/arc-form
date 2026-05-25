import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import { createUseStyles } from 'react-jss';
import {AnimatePresence,motion} from "framer-motion";

import { user } from '../../initR2D';
import { selectUserProfileData } from '../../redux/features/user/userSlice';
import { selectActiveViewMode } from '../../redux/features/viewMode/viewModeSlice';
import { selectIsProjectBelongToLoggedUser, selectIsProjectOnlyView } from '../../redux/features/common/commonSlice';
import {selectTranslation} from "../../redux/features/language/languageSlice";
import {setActivePopup} from "../../redux/features/popups/popupsSlice";

import {LangButton, UndoRedoButtons, Projects, SaveButton, RealisticImageButton, SendARequestButton} from './buttons/Buttons';

const useStyles = createUseStyles({
    top:{
        display: 'flex'
    },
    upgrate_top_btn:{
        color: '#2A3435',
        fontSize: 12,
        background: '#FFB400',
        borderRadius: 3,
        marginRight: 2,
        boxShadow: '0px 0px 3px 0px rgba(0, 0, 0, 0.12)',
        padding: '0 7px',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
        '&:hover':{
            background: '#fdcb54'
        }
    },
    bar_btns_wr: {
        display:'flex',
        gridGap:21,
        height: 30,
        whiteSpace:'nowrap',
        marginLeft: 2,
        '@media screen and (max-width: 950px)':{
            gridGap: 8
        }
    },
    bar_btns_flex:{
        display: 'flex'
    },
    menuTop:{

    },
    barUndoRedoBtns:{
        display: 'flex',
        boxShadow: '0px 0px 3px 0px rgba(0, 0, 0, 0.12)',
        background: '#fff',
        borderRadius: 3,
        border: '1px solid #fff'
    }
});

export const TopPanel = props => {
    const classes = useStyles();

    let dispatch = useDispatch();
    let activeViewMode = useSelector(selectActiveViewMode);
    let userData = useSelector(selectUserProfileData);
    let translation = useSelector(selectTranslation);

    let configTopLanguage = R2D.config.data.ui.top_language;
    let configTopProject = R2D.config.data.ui.top_project;
    let configTopSave = R2D.config.data.ui.top_save;
    let configTopRender = R2D.config.data.ui.top_render;
    let configSendRequest = R2D.config.data.ui.send_a_request;

    let isProjectBelongToLoggedUser = useSelector(selectIsProjectBelongToLoggedUser);
    let isProjectOnlyView = useSelector(selectIsProjectOnlyView);

    let currOS = R2D.controller.getCurrentOS();
    let isCurrDeviceAPhone = currOS == "iOS" || currOS == "Android";
    let [isProOptionEnabled, setIsProOptionEnabled] = useState(R2D.OPTIONS.PRO_PLAN);

    useEffect(() => {
        setIsProOptionEnabled(R2D.OPTIONS.PRO_PLAN)
    }, [R2D.OPTIONS.PRO_PLAN]);

    return(
        <div className={classes.top}>
            <AnimatePresence>
                {
                    ((userData?.plan !== 'pro') && !isProOptionEnabled)  ?
                        <motion.div
                            initial={{ transform: 'translateY(-110%)'}}
                            animate={{ transform: 'translateY(0%)'}}
                            exit={{ transform: 'translateY(-110%)' }}
                            transition={{ duration: 0.3}}
                            key={'upgrate_top_btn'}
                            className={classes.upgrate_top_btn} onClick={e => dispatch(setActivePopup({name: "payPro", type: 'user'}))}>
                                { translation["FR_TOURS_TRANS_108"] }
                        </motion.div>
                    : null
                }
            </AnimatePresence>

            {
                !isProjectBelongToLoggedUser && isProjectOnlyView ? 
                    <div className={classes.bar_btns_wr}>
                        <div className={classes.bar_btns_flex + ' ' + classes.menuTop}>
                            {
                                configTopLanguage ? <LangButton /> : null
                            }
                            { 
                                configTopProject ? <Projects /> : null 
                            }
                        </div>
                    </div>
                :
                activeViewMode == "tileConfig" ?
                <div className={classes.bar_btns_wr}>
                    <div className={classes.barUndoRedoBtns}>
                        { <UndoRedoButtons /> }
                    </div>
                </div>
                :
                <div className={classes.bar_btns_wr}>
                    <div className={classes.bar_btns_flex + ' ' + classes.menuTop}>
                        {
                            configTopLanguage ? <LangButton /> : null
                        }
                        { 
                            configTopProject ? <Projects /> : null 
                        }
                        {  
                            configTopRender && !isCurrDeviceAPhone ? <RealisticImageButton /> : null
                        }
                        {
                            configTopSave && (!userData?.autoSave || (userData?.autoSave && (!R2D.controller.getProjectId() || R2D.controller.getProjectUserKey() != user.getKey()))) ? <SaveButton /> : null
                        }

                        <div className={classes.barUndoRedoBtns}>
                            <UndoRedoButtons />
                        </div>

                    </div>

                    {
                        configSendRequest ?
                        <div className={classes.bar_btns_flex}>
                            <SendARequestButton />
                        </div> :
                        null
                    }
                </div>
            }
            
        </div>
    )
}

export default TopPanel;