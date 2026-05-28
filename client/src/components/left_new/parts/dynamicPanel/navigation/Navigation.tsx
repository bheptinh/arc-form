import React, {useMemo} from 'react';
import {createUseStyles} from "react-jss";
import { useDispatch, useSelector } from 'react-redux';

import { controlPanelHistoryReplaceArray, controlPanelUpdateBreadCrumbs, selectActiveControlPanelModeData } from '../../../../../redux/features/control/controlPanelSlice';
import { selectTranslation } from '../../../../../redux/features/language/languageSlice';

import AdditionalSettings from './components/AdditionalSettings';
import Prev from './components/Prev';
import Breadcrumbs from './components/Breadcrumbs';

const useStyle = createUseStyles({
    '@font-face': [
        {
            fontFamily: "RobotoCondensed-Regular",
            fontWeight: 300,
            fontDisplay: 'swap',
            src: 'url("/src_designer/fonts/RobotoCondensed-Regular.ttf") format("truetype")'
        },
        {
            fontFamily: "Roboto-Regular",
            fontWeight: 300,
            fontDisplay: 'swap',
            src: 'url("/src_designer/Roboto-Light.ttf") format("truetype")'
        },
    ],
    catalog_top_wr:{
        padding: "10px 10px 10px 10px",
        display: 'grid',
        gridGap: 10,
        '&:has($catalog_navigation:empty)': {
            '& $catalog_navigation':{
                display: 'none'
            }
        },
        '@media screen and (max-width: 950px)':{
            padding: "5px",
            gridGap: 5,
        }
    },
    catalog_top_btns_wr:{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "relative",
    },
    catalog_navigation:{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        '&:empty': {
            marginTop: 0,
        },
    },
    catalog_navigation_prev_wr:{
        display: 'flex',
        alignItems: 'center',
    },
    catalog_top_title:{
        lineHeight: 0.8,
        fontSize: 17,
        fontFamily: "RobotoCondensed-Regular",
        '& span':{
            color: "#939393",
            fontSize: "12px",
            fontFamily: "Roboto-Regular",
        },
        '@media screen and (max-width: 950px)':{
            fontSize: 9,
        }
    },
    catalog_top_btns:{
        display: "flex",
        position: "relative",
        zIndex: 3,
        width: '100%'
    },
    navigation_close:{
        width: '15px',
        height: '15px',
        margin: '0 0 0 10px',
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
    navigation_close_icon:{
        width: '100%',
        height: '100%'
    }
});

const Navigation = props => {
    let dispatch = useDispatch();
    const classes = useStyle();
    let activeControlPanelData = useSelector(selectActiveControlPanelModeData);
    let controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
    let lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
    let firstElemHistory = controlPanelModeHistory[0];
    let lastHistoryElemType = lastHistoryElem?.type;
    let title = lastHistoryElem?.name;
    let translation = useSelector(selectTranslation);

    let currentStateBreadCrumbs = activeControlPanelData?.breadCrumbs;

    let currOS = R2D.controller.getCurrentOS();
    let isCurrDeviceAPhone = currOS == "iOS" || currOS == "Android";

    let isHomeDisabled = 
        (
            !controlPanelModeHistory || lastHistoryElem && firstElemHistory?.data && lastHistoryElem?.data == firstElemHistory?.data
        ) || 
        (
            lastHistoryElem && firstElemHistory?.type == "main" && lastHistoryElem?.type == "main"
        ) ||
        controlPanelModeHistory.length < 2 || 
        ( lastHistoryElem && firstElemHistory?.matId && lastHistoryElem?.matId == firstElemHistory?.matId) ||
        props.isHomeDisabled;

    let onClickCloseButton = e => {
        dispatch(controlPanelHistoryReplaceArray([]));
        dispatch(controlPanelUpdateBreadCrumbs({data: currentStateBreadCrumbs[0], updateType: "add"}));
    }

    return (
        <div className={classes.catalog_top_wr}>
            {
                isHomeDisabled && props.disableBreadcrumbs && lastHistoryElemType != 'products' ?
                    null :
                    props.disableBreadcrumbs ?
                    null :
                    <div className={classes.catalog_top_btns_wr}>
                        <div className={classes.catalog_top_btns}>
                            <Breadcrumbs hideBreadCrumbsHomePanel={props.hideBreadCrumbsHomePanel} panelPreviewIcon={props.panelPreviewIcon} breadcrumsTitle={props.breadcrumsTitle} onClickCloseButton={onClickCloseButton}/>
                        </div>
                        {
                            controlPanelModeHistory.length - 1 == 0 && !props.isAddSettingsDisabled && !isCurrDeviceAPhone ?
                                <AdditionalSettings hideCategoryTree={props.hideCategoryTree}/> : null
                        }
                        { props.closeButtonStatus &&
                            <div className={classes.navigation_close} onClick={onClickCloseButton}>
                                <svg className={classes.navigation_close_icon} viewBox="0 0 16.03 16.02" width="24px" height="24px">
                                    <path fill="#2A3435" d="M1,0a1,1,0,0,0-.7,1.72L6.6,8,.31,14.3a1,1,0,0,0,1.39,1.44l0,0L8,9.42l6.29,6.29a1,1,0,1,0,1.44-1.39l0,0L9.43,8l6.29-6.29A1,1,0,1,0,14.31.3L8,6.6,1.72.3A1,1,0,0,0,1,0Z"/>
                                </svg>
                            </div>
                        }
                    </div>
            }
            {
                controlPanelModeHistory.length - 1 != 0 ?
                    <div className={classes.catalog_navigation}>
                        <div className={classes.catalog_navigation_prev_wr}>
                            {
                                controlPanelModeHistory.length - 1 != 0 ? <Prev /> : null
                            }

                            { 
                                title || lastHistoryElem.data?.name ?
                                <div className={classes.catalog_top_title} dangerouslySetInnerHTML={{__html: title || lastHistoryElem.data.name}}></div>
                                : lastHistoryElem?.type != 'catalogSets' && <div className={classes.catalog_top_title} dangerouslySetInnerHTML={{__html: translation[props.breadcrumsTitle] || props.breadcrumsTitle}}></div>
                            }
                        </div>
                        {
                            controlPanelModeHistory.length - 1 != 0 && !props.isAddSettingsDisabled && !isCurrDeviceAPhone ? <AdditionalSettings hideCategoryTree={props.hideCategoryTree}/> : null
                        }
                    </div>
                    : null
            }
        </div>
    )
}

export default Navigation;