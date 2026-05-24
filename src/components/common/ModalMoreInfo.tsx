import React, {useEffect, useState} from 'react';
import {createUseStyles} from "react-jss";
import ReactDOM from 'react-dom';
import { useSelector } from 'react-redux';
import {motion} from "framer-motion";

import {planner} from "../../initR2D";
import {
    selectDynamicPanelStatus
} from "../../redux/features/control/controlPanelSlice";
import {selectTranslation} from "../../redux/features/language/languageSlice";

const useStyle = createUseStyles({
    item_more_info_content_wrap:{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        top: 0,
        zIndex: 0,
        position: 'absolute',
        pointerEvents: 'none',
        transform: 'translateX(-110%)',
    },
    item_more_info_content:{
        boxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.25)",
        background: "#fff",
        overflow: "hidden",
        borderRadius: "3px",
        transition: "all .5s cubic-bezier(.19,1,.22,1)",
        zIndex: 2,
        width: 300,
        paddingBottom: 7,
        '& $item_info_content' :{
            padding: '0 13px 0px',
            '@media screen and (max-width: 950px)':{
                padding: "0 6px 0",
            }
        },
        '@media screen and (max-width: 950px)':{
            width: 150,
        }
    },
    item_more_info_img_wr:{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 300,
        height: 300,
        marginBottom: 7,
        '& img':{
            maxWidth: '100%',
            maxHeight: '100%',
            display: 'block',
            width: '100%',
            height: '100%'
        },
        '@media screen and (max-width: 950px)':{
            width: 150,
            height: 150,
        }
    },
    prod_item_title:{
        color: "#000",
        fontSize: 16,
        padding: "0 13px 0px",
        fontFamily: "RobotoCondensed-Regular",
        overflow: 'hidden',
        '&>div':{
            display: "-webkit-box",
            WebkitLineClamp: "2",
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis"
        },
        '@media screen and (max-width: 950px)':{
            fontSize: "10px",
            padding: "0 6px 0",
        }
    },
    item_info_color_wr:{
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        marginBottom: 15,
        '&:empty':{
            marginBottom: 0
        }
    },
    item_info_color:{
        width: "18px",
        height: "18px",
        borderRadius: "50%",
        margin: "0 1px",
        border: '1px solid #E9E9E9'
    },
    item_info_color_more:{
        width: "18px",
        height: "18px",
        margin: "0 1px",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    item_info_content:{
        color: "#7B7B7B",
        fontSize: "13px",
        padding: "0 13px 0",
        lineHeight: 1.4,
        '& span':{
            marginRight: 3
        },
        '& > div:not($item_info_not_essential_attribute)': {
            display: 'flex',
            alignItems: 'center'
        },
        '& > div > div:first-child': {
            marginBottom: '3px'
        },
        '&>div>div': {
            fontSize: "17px",
            color: "#000000",
            display: "inline-block",
            marginLeft: 4,
            '@media screen and (max-width: 950px)':{
                fontSize: "8px",
            }
        },
        '@media screen and (max-width: 950px)':{
            fontSize: "8px",
            padding: "0 6px 0"
        }
    },
    item_info_not_essential_attribute:{

    },
    item_info_content_span:{
        color: '#000'
    }
});

const ModalMoreInfo = props => {
    const classes = useStyle();
    let dynamicPanelStatus = useSelector(selectDynamicPanelStatus);
    let translation = useSelector(selectTranslation);

    const [leftOffset, setLeftOffset] = useState(0);
    let [elemInfo, setElemInfo] = useState(null);
    let [elemImg, setElemImg] = useState(null);

    let currOS = R2D.controller.getCurrentOS();
    let isCurrDeviceAPhone = currOS == "iOS" || currOS == "Android";

    useEffect(async () => {
        let htmlElem;
        let attributesArray = props.productElemHover.attributes && Object.values(props.productElemHover.attributes);
        let elemColors, attributesBrand, elemWidth, elemDepth, elemHeight, attributesStartingFrom, attributesSeatingHeight, attributesCurrency, othersAttributes;
        if(attributesArray?.length > 0) {
            attributesBrand = attributesArray.find(i => i.systemName == 'brand');
            attributesSeatingHeight = attributesArray.find(i => i.systemName == 'seating_height');
            attributesStartingFrom = attributesArray.find(i => i.systemName == 'starting_from');
            attributesCurrency = attributesArray.find(i => i.systemName == 'currency');
            othersAttributes = attributesArray.filter(i => i.systemName != 'currency' && i.systemName != 'starting_from' && i.systemName != 'seating_height' && i.systemName != 'brand');
        }
        elemWidth = props.productElemHover.property?.sizes?.width;
        elemDepth = props.productElemHover.property?.sizes?.depth;
        elemHeight = props.productElemHover.property?.sizes?.height;

        if(props.productElemHover?.source?.body?.colors) elemColors = props.productElemHover.source.body?.colors;

        htmlElem =
            <div className={classes.prod_item} key={props.productElemHover.id} >
                {
                    elemColors ?
                        <div className={classes.item_info_color_wr}>
                            {
                                elemColors.slice(0, 10).map(i =>
                                    <div className={classes.item_info_color} key={Math.random()} style={{backgroundImage: `url(${R2D.URL.DOMAIN + i.url})`}}></div>
                                )
                            }
                            {
                                elemColors.length > 10 ?
                                    <div className={classes.item_info_color_more}>
                                        <img src="/src_designer/images/icon_dots.svg"/>
                                    </div>
                                : null
                            }
                        </div> : null
                }
                <div className={classes.prod_item_title}><div>{props.productElemHover.name}</div></div>

                <div className={classes.item_info_content}>
                    { attributesStartingFrom && attributesCurrency ? <div>{attributesStartingFrom.name}: <div>{attributesCurrency.value || ''} {attributesStartingFrom.value || ''}</div></div>: null }
                    { attributesBrand ? <div><span style={{marginRight: 3}}>{attributesBrand.name}:</span> <span className={classes.item_info_content_span}>{ attributesBrand.value.value || '' }</span></div>: null }
                    {
                        props.productElemHover.type == R2D.ProductType.MATERIAL || (!elemWidth && !elemDepth && !elemHeight) ?
                            null :
                            <div className={classes.item_info_content_sizes}>
                                { elemWidth ? <>{ translation['TEXT_WIDTH_SHORT'] }:<span className={classes.item_info_content_span}>{planner.units.valueToString(elemWidth)}</span><span>x</span></> : null }
                                { elemDepth ? <>{ translation['TEXT_DEPTH_SHORT'] }:<span className={classes.item_info_content_span}>{planner.units.valueToString(elemDepth)}</span><span>x</span> </>: null }
                                { elemHeight ? <>{ translation['TEXT_HEIGHT_SHORT'] }:<span className={classes.item_info_content_span}>{planner.units.valueToString(elemHeight)} </span> { planner.units.getName() }</> : null }
                            </div>
                    }

                    { attributesSeatingHeight ? <div><span style={{marginRight: 3}}>{ attributesSeatingHeight.name }: </span><span className={classes.item_info_content_span}>{ planner.units.valueToString(attributesSeatingHeight.value) }</span> { planner.units.getName() }</div>: null }

                    {
                        othersAttributes?.length > 0 ?
                            othersAttributes.map(i => {
                                if (typeof i.value === 'object') {
                                    return (
                                        <div className={classes.item_info_not_essential_attribute} key={Math.random()}>
                                            <span>{i.name}: </span>
                                            <span>
                                                {
                                                    i.value.map ?
                                                    i.value.map(y => {
                                                        return (
                                                            <span className={classes.item_info_content_span}>{(y.value || '') + (y == i.value[i.value.length - 1] ? '' : ', ')}</span>
                                                        )
                                                    }) : 
                                                    <span className={classes.item_info_content_span}>{ i.value?.value || '' }</span>
                                                }
                                            </span>
                                        </div>
                                    );
                                }
                                return (
                                    <div className={classes.item_info_not_essential_attribute} key={Math.random()}>
                                        <span>{i.name}: </span>
                                        <span className={classes.item_info_content_span}>{i.value || ''}</span>
                                    </div>
                                )
                            })
                            : null
                    }


                </div>
            </div>;

        setElemInfo(htmlElem);
        setLeftOffset(dynamicPanelStatus ? !isCurrDeviceAPhone ? 311 : 191  : 0);

        let previewImg;
        if(props.productElemHover.addData && props.productElemHover.id) {
            let matPrev = await R2D.Tool.getMatPrevFromMatIdAndColor(props.productElemHover.id, props.productElemHover.addData);
            previewImg = matPrev.toDataURL();
        } else previewImg = props.productElemHover.imgSrc || R2D.URL.DOMAIN + props.productElemHover.source?.images.preview;
        setElemImg(previewImg);
    }, []);

    const container = document.querySelector('.dynamicPanel') || document.body;

    return ReactDOM.createPortal(
            <motion.div
                initial={{ transform: 'translateX(-110%)'}}
                animate={{ transform: 'translateX(0%)'}}
                exit={{ transform: 'translateX(-110%)' }}
                transition={{ duration: 0.3}}
                className={classes.item_more_info_content_wrap}
                style={{ left: `${leftOffset}px` }}
            >
            <div className={classes.item_more_info_content}>
                <div className={classes.item_more_info_img_wr}>
                    <img src={elemImg} className="lazyload"/>
                </div>

                {elemInfo}

            </div>
            </motion.div>,
        container
    );
};

export default ModalMoreInfo;

