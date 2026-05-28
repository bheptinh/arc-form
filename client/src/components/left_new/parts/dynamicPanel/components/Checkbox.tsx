import React from 'react';
import {createUseStyles} from "react-jss";

// import iconCheck from './images/icon_check_3.svg';

const useStyle = createUseStyles({
    checkboxInputWr:{
        display: 'flex'
    },
    checkboxInput:{
        position: 'absolute',
        zIndex: '-1',
        opacity: 0,
        '&+label ':{
            display: 'inline-flex',
            alignItems: 'center',
            userSelect: 'none',
            fontSize: 14,
            color: '#2F2F2F',
            cursor: 'pointer',
            position: 'relative',
            '@media screen and (max-width: 950px)':{
                fontSize: 11,
            }
        },
        '&+label::before':{
            content: "''",
            display: 'inline-block',
            width: 14,
            height: 14,
            border: '1px solid #adb5bd',
            marginRight: 6,
            borderRadius: 3,
            background: '#fff',
            transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
            '@media screen and (max-width: 950px)':{
                width: 12,
                height: 12,
            }
        },
        '&+label:hover::before':{
            background: '#E9E9E9'
        },
        '&+label::after':{
            width: 17,
            height: 13,
            content: "''",
            position: 'absolute',
            top: '35%',
            transform: 'translateY(-50%)',
            left: 2,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
            backgroundImage: 'url(/public/icon_check_3.svg)',
            opacity: 0,
            '@media screen and (max-width: 950px)':{
                width: 14,
                height: 13,
            }
        },
        '&:checked+label::after':{
           opacity: 1
        }
    },
    checkboxInput_disabled:{
        '&+label ':{
            cursor: 'default',
            opacity: .2
        },
        '&+label:hover::before':{
            background: 'transparent'
        },
    }
});

const Checkbox = props => {
    const classes = useStyle();

    let onClickInput = e => {
        if(props.disabled) {
            e.target.checked = false;
            e.preventDefault();
            e.stopPropagation();
        } 
    }

    let onChangedInput = e => {
        if(!props.disabled) props.onChange ? props.onChange(e.target.checked) : null;
    }
    
    return (
            <div className={classes.checkboxInputWr}>
                <input id={props.name} className={classes.checkboxInput + ' ' + (props.disabled ? classes.checkboxInput_disabled : '' )} type="checkbox" onClick={onClickInput} onChange={onChangedInput} checked={props.checked ? 'checked' : ''} name={props.name} />
                <label htmlFor={props.name}>{props.label}</label>
            </div>
    );
};

export default Checkbox;