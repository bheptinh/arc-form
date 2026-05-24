import React, { useEffect, useRef, useState } from 'react';
import {createUseStyles} from "react-jss";
import { useSelector } from 'react-redux';

import { selectTranslation } from '../../redux/features/language/languageSlice';

const useStyle = createUseStyles({
    '@font-face': [
        {
            fontFamily: "RobotoCondensed-Regular",
            fontWeight: 300,
            fontDisplay: 'swap',
            src: 'url("/src_designer/fonts/RobotoCondensed-Regular.ttf") format("truetype")'
        },
    ],
    lock: {
        width: "auto",
        transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
        position: 'relative',
        cursor: 'pointer'
    },
    btn_hover:{
        position: "fixed",
        background: "#fff",
        fontSize: 12,
        width: "max-content",
        padding: "4px 7px",
        userSelect: "none",
        zIndex: 999,
        color: '#2A3435',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        borderRadius: 3,
        boxShadow: '0 0px 4px 0 rgba(0, 0, 0, 0.25)',
        whiteSpace: 'pre'
    },
    btn_hover_basic:{
        background: '#BADCFF',
        borderRadius: 3,
        fontFamily: "RobotoCondensed-Regular",
        fontSize: 13,
        color: '#292A27',
        padding: '2px 3px',
        marginLeft: 5,
    },
    btn_hover_pro:{
        background: '#FFB400',
        borderRadius: 3,
        fontFamily: "RobotoCondensed-Regular",
        fontSize: 13,
        color: '#292A27',
        padding: '2px 3px',
        marginLeft: 5
    }
});

const Lock = props => {
    const classes = useStyle();

    let translation = useSelector(selectTranslation);
    let timeoutId = null;
    let mouseDown = false;

    let [text, setText] = useState(props.textHover);
    let [basic, setBasic] = useState(props.upgradeBasic);
    let [pro, setPro] = useState(props.upgradePro);
    let [parentClass, setParentClass] = useState(props.parentClass);
    let [parentElem, setParentElem] = useState('');

    let imgLock = useRef(null);

    let mouseEnter = e => {
        if(props.dontShowText) return;
        if(!mouseDown) {
            let mainDiv = e.currentTarget.closest("." + props.parentClass);
            if(props.wrapClass) mainDiv.closest("." + props.wrapClass).style.overflow = 'inherit';
            let hoverDiv = document.createElement('div');
            hoverDiv.classList.add(classes.btn_hover);
            hoverDiv.textContent = translation[text];

            if(basic){
                let basicDiv = document.createElement('div');
                basicDiv.textContent = 'BASIC';
                basicDiv.classList.add(classes.btn_hover_basic);
                hoverDiv.append(basicDiv);
            }
            if(basic && pro){
                hoverDiv.append(' '+translation["TEXT_OR"]);
            }

            if(pro){
                let proDiv = document.createElement('div');
                proDiv.textContent = 'PRO';
                proDiv.classList.add(classes.btn_hover_pro);
                hoverDiv.append(proDiv);
            }
            document.querySelector('body').append(hoverDiv);
            if(!mainDiv) return;
            //mainDiv.style.zIndex = 9;
            if(props.tipPositionX == 'left') hoverDiv.style.left = e.clientX - hoverDiv.offsetWidth - 10 + "px";
            else hoverDiv.style.left = e.clientX + 20 + "px";
            if(props.tipPositionY == 'top') hoverDiv.style.top = e.clientY - hoverDiv.offsetHeight - 10 + "px";
            else hoverDiv.style.top = e.clientY + 10 + "px";
            timeoutId = setTimeout(() => hoverDiv.style.opacity = "1", 500);
        }
    }

    let mouseMove = e => {
        if(props.dontShowText) return;
        if(!mouseDown) {
            let mainDiv = e.currentTarget.closest("." + props.parentClass);
            let hoverDiv = document.querySelector("." + classes.btn_hover);
            if(!hoverDiv || !mainDiv) return;
            if(props.tipPositionX == 'left') hoverDiv.style.left = e.clientX - hoverDiv.offsetWidth - 10 + "px";
            else hoverDiv.style.left = e.clientX + 20 + "px";
            if(props.tipPositionY == 'top') hoverDiv.style.top = e.clientY - hoverDiv.offsetHeight - 10 + "px";
            else hoverDiv.style.top = e.clientY + 10 + "px";
        }
    }

    let mouseLeave = e => {
        clearTimeout(timeoutId);
        let mainDiv = e.currentTarget.closest("." + props.parentClass);
        if(mainDiv) {
            let hoverDiv = document.querySelector("." + classes.btn_hover);
            hoverDiv?.remove();
            mainDiv.removeAttribute("style");
            props.wrapClass && mainDiv.closest("." + props.wrapClass).removeAttribute('style');
        }
    }

    let mouseUpBtn = e => props.onClick && props.onClick();

    let onMouseUp = e => {
        mouseDown = false;
        document.removeEventListener("mouseup", onMouseUp);
    }

    let mouseDownBtn = e => {
        mouseDown = true;
        document.addEventListener("mouseup", onMouseUp);
        mouseLeave(e);
    }

    useEffect(() => setParentElem(imgLock.current.closest('.' + props.parentClass)), []);

    useEffect(() => {
        if(!parentElem) return;
        parentElem.addEventListener('mouseenter', mouseEnter);
        parentElem.addEventListener('mousemove', mouseMove);
        parentElem.addEventListener('mouseleave', mouseLeave);
        parentElem.addEventListener('mousedown', mouseDownBtn);
        parentElem.addEventListener('mouseup', mouseUpBtn);

        return () => {
            if(!parentElem) return;
            parentElem.removeEventListener('mouseenter', mouseEnter);
            parentElem.removeEventListener('mousemove', mouseMove);
            parentElem.removeEventListener('mouseleave', mouseLeave);
            parentElem.removeEventListener('mousedown', mouseDownBtn);
            parentElem.removeEventListener('mouseup', mouseUpBtn);
        }
    }, [parentElem])

    return (
        <div ref={imgLock} className={ props.additionalClass ? props.additionalClass + ' prod_item_zamok_btn ' +  classes.lock : classes.lock}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className={props.additionalImgClass}>
                <circle cx="7.5" cy="7.5" r="7.5" fill="white"/>
                <rect x="3" y="5.91406" width="8.85693" height="7.08554" rx="1" fill={basic ? '#C7DAED' : '#FFCB4E'}/>
                <path fill={basic ? '#C7DAED' : '#FFCB4E'} className={props.classNameToDisableHover ? props.classNameToDisableHover: ''} fillRule="evenodd" clipRule="evenodd" d="M5.3328 3.83181L5.3328 5.91377H4.17737V3.84113C4.17737 3.82565 4.17725 3.80805 4.17711 3.78853C4.17511 3.495 4.1701 2.76105 4.52244 2.08449C4.72085 1.7035 5.04197 1.31729 5.5512 1.03153C6.06065 0.745642 6.68837 0.599609 7.4243 0.599609C8.16024 0.599609 8.78795 0.745642 9.29741 1.03153C9.80663 1.31729 10.1277 1.70351 10.3262 2.0845C10.6784 2.76097 10.6735 3.49487 10.6715 3.7884C10.6714 3.80796 10.6712 3.82556 10.6712 3.84107V5.91377H9.51581V3.83164C9.51581 3.51576 9.54491 2.91861 9.37047 2.58364C9.2929 2.43468 9.15114 2.12911 8.89353 1.92088C8.52501 1.623 8.2989 1.48493 7.4243 1.48493C6.99137 1.48493 6.49024 1.54304 6.0071 1.92088C5.63355 2.21301 5.52102 2.43468 5.44344 2.58364C5.26896 2.91867 5.33277 3.51596 5.3328 3.83181Z" />
            </svg>
        </div>

    );
};

export default Lock;