import React from 'react';
import {createUseStyles} from "react-jss";

const useStyle = createUseStyles({
    editMatItemWr:{
        aspectRatio: "1 / 1",
        position: "relative",
    },
    editMatItem:{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all ease .2s',
        '&:hover':{
            '& $editMat':{
                transform: 'translateY(0%)'
            },
            '& $editMatItem_hover_left':{
                height: '100%'
            },
            '& $editMatItem_hover_top':{
                width: '100%'
            },
            '& $editMatItem_hover_right':{
                height: '100%'
            },
            '& $editMatItem_hover_bottom':{
                width: '100%'
            }
        }
    },
    editMatItem_hover_left:{
        width: 2,
        height: 0,
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 1,
        background: '#C6C4C4',
        transition: 'all .9s cubic-bezier(0.19, 1, 0.22, 1)',
        '&:before':{
            content: '" "',
            position: 'absolute',
            left: '100%',
            top: 2,
            height: 'calc(100% - 4px)',
            width: 1,
            background: '#fff',
        },
    },
    editMatItem_hover_top:{
        width: 0,
        height: 2,
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 1,
        background: '#C6C4C4',
        transition: 'all .9s cubic-bezier(0.19, 1, 0.22, 1)',
        '&:before':{
            content: '" "',
            position: 'absolute',
            top: '100%',
            left: 2,
            width: 'calc(100% - 4px)',
            height: 1,
            background: '#fff',
        },
    },
    editMatItem_hover_right:{
        width: 2,
        height: 0,
        position: 'absolute',
        bottom: 0,
        right: 0,
        pointerEvents: 'none',
        zIndex: 1,
        background: '#C6C4C4',
        transition: 'all .9s cubic-bezier(0.19, 1, 0.22, 1)',
        '&:before':{
            content: '" "',
            position: 'absolute',
            right: '100%',
            top: 2,
            height: 'calc(100% - 4px)',
            width: 1,
            background: '#fff',
        },
    },
    editMatItem_hover_bottom:{
        width: 0,
        height: 2,
        position: 'absolute',
        bottom: 0,
        right: 0,
        pointerEvents: 'none',
        zIndex: 1,
        background: '#C6C4C4',
        transition: 'all .9s cubic-bezier(0.19, 1, 0.22, 1)',
        '&:before':{
            content: '" "',
            position: 'absolute',
            bottom: '100%',
            left: 2,
            width: 'calc(100% - 4px)',
            height: 1,
            background: '#fff',
        },
    },
    editMat:{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: 30,
        transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
        background: 'rgba(68, 68, 68, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: 'translateY(100%)',

    },
    editMatImg:{
        width: '100%',
        height: '100%',
        cursor: 'pointer',
        backgroundSize: "contain"
    },
    editMatEditIcon:{
        width: 16,
        height: 16,
        cursor: 'pointer',
        marginRight: 10,
        '& rect':{
            transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
        },
        '&:hover':{
            '& rect':{
                fill: '#ffd119'
            }
        }
    }
});

const PlinthComponent = props => {
    const classes = useStyle();

    return (
        <div className={classes.editMatItemWr +' editMatItemWr'} onClick={props.onClick}>
            <div className={classes.editMatItem}>
                <div className={classes.editMatItem_hover_left}></div>
                <div className={classes.editMatItem_hover_top}></div>
                <div className={classes.editMatItem_hover_right}></div>
                <div className={classes.editMatItem_hover_bottom}></div>
                <div className={classes.editMatImg} style={{backgroundImage: `url(${props.src})`}}></div>
            </div>
        </div>
    );
};

export default PlinthComponent;