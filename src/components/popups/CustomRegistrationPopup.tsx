import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeActivePopup, selectPopups, setActivePopup } from '../../redux/features/popups/popupsSlice';
import {createUseStyles} from "react-jss";
import parse from 'html-react-parser';

const useStyles = createUseStyles({
    planner_popup_wrap:{
        height: '100vh',
        width: '100%',
        position: 'absolute',
        top: '0%',
        transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
        opacity: '0',
        pointerEvents: 'none',
        zIndex: '101',
        WebkitPerspective: '800px',
        perspective: '800px',
        minHeight: '550px',
        overflow: 'auto',
        display: 'grid',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.2)'
    },
    planner_popup_wrap_show:{
        top: '0',
        opacity: '1',
        pointerEvents: 'auto',
        transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)'
    },
    planner_popup_wr:{
        color: '#000'
    },
    planner_popup_cont:{
        color: '#000',
        backgroundColor: '#f1f1f1',
        border: '1px solid #2f2f2f',
        overflow: 'hidden',
        padding: '30px 30px',
        position: 'relative'
    },
    planner_popup_close:{
        width: '20px',
        height: '20px',
        position: 'absolute',
        top: '10px',
        right: '10px',
        cursor: 'pointer',
        zIndex: '2',
        '& path': {
            transition: 'all 0.9s cubic-bezier(.19,1,.22,1)'
        },
        '&:hover':{
            '& path':{
                fill: '#BBE521'
            }
        }
    },
    planner_popup_close_icon:{
        width: '100%'
    },
    planner_popup_back:{
        top: 10,
        left: 10,
        width: 23,
        cursor: 'pointer',
        height: 22,
        zIndex: 2,
        position: 'absolute',
        transform: 'rotate(180deg)',
        '& path': {
            transition: 'all 0.9s cubic-bezier(.19,1,.22,1)'
        },
        '&:hover':{
            '& path':{
                fill: '#BBE521'
            }
        }
    },
    planner_popup_back_icon:{
        width: '100%',
        height: '100%',
    },
    shadow_planner_pop_top_left:{
        position: 'absolute',
        top: '0',
        left: '0',
        pointerEvents: 'none'
    },
    shadow_planner_pop_bot_right:{
        position: 'absolute',
        bottom: '0',
        right: '0',
        pointerEvents: 'none'
    },
    planner_popup_login_wrap:{

    },
    planner_popup_login_wr: {
        marginBottom: 20
    },
    title:{
        fontFamily: 'Roboto, sans-serif',
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: 'rgb(68, 68, 68)',
        whiteSpace: 'nowrap',
        textAlign: 'center',
        margin: '15px 10px 40px'
    },
    input_wrap:{
        padding: '0 65px',
        display: 'grid',
        gridGap: 20,
        border: 'none',
        gridTemplateColumns: 'auto auto',
        alignItems: 'center'
    },
    input_text:{
        fontFamily: 'Roboto, sans-serif',
        fontSize: 14,
        color: 'rgb(68, 68, 68)',
        whiteSpace: 'nowrap',
        textAlign: 'right'
    },
    input_wr:{
        color: '#fff',
        width: 250,
        '&:last-child': {
            marginBottom: '0'
        }
    },
    formInput:{
        paddingLeft: '5px',
        fontSize: '16px',
        color: '#000',
        width: '100%',
        border: '1px solid #e8dede',
        height: '30px',
        background: '#ffffff',
        outline: 'none',
        resize: 'none',
        transition: 'all 0.4s ease-out'
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
        background: '#828282',
        cursor: 'pointer',
        height: '25px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#fff',
        fontSize: '12px',
        padding: '0 20px',
        transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
        margin: '0 10px',
        minWidth: '94px',
        border: 'none',
        outline: 'rgb(217, 217, 217) solid 1px',
        '&:hover': {
            background: '#8fc32d'
        }
    },
    checkbox_wrap:{
        marginBottom: 15
    }
});

const CustomRegistrationPopup = props => {
    const classes = useStyles();
    let dispatch = useDispatch();

    let formDiv = useRef(null);

    let popups = useSelector(selectPopups);

    let [customRegistration, setCustomRegistration] = useState(parse(R2D.getCustomRegistration()));

    let sendRequest = async e => {
        e.preventDefault();
        
        let form = e.target;

        var inputs = form.querySelectorAll("input");
        var dataObj = {};
        var customObj = {};

        for (var i = 0; i < inputs.length; i++)
        {
            var inp = inputs[i];
            var name = inp.name;
            var val = inp.value;
            if (val.length < 1) return dispatch(setActivePopup({name: "alert", type: "error", data: "TEXT_FILL_ALL_FIELDS"}));

            if (name == 'name' || name == 'email' || name == 'password' || name == 'password_repeat' || name == 'subscription_news') dataObj[name] = val;
            customObj[name] = val;
        }

        if (dataObj.email && ! /^[^@]+@[^@]+$/.test(dataObj.email)) {
            dispatch(setActivePopup({name: "alert", type: "error_email", data: "TEXT_REG_INVALID_EMAIL"}));
            return;
        }
        if (dataObj.password && dataObj.password_repeat){
            if (dataObj.password.length < 6 || dataObj.password.length > 64)
            {
                dispatch(setActivePopup({name: "alert", data: "TEXT_PASSWORD_LENGTH_ERROR"}));
                return;
            }
            else if (dataObj.password != dataObj.password_repeat)
            {
                dispatch(setActivePopup({name: "alert", type: "error_password_not_match", data: "TEXT_PASSWORDS_NOT_MATCH"}));
                return;
            }
        } 

        await R2D.sendRequestToCalc(customObj);

        dispatch(setActivePopup({name: "completeMessage", positionX: "left", data: "SEND_REQUEST_CALC_COMPLETE"}));

        dispatch(closeActivePopup({name: 'customRegistrationPopup'}));
    }

    useEffect(() => {
        formDiv?.current?.querySelector('form')?.addEventListener('submit', sendRequest)
    }, []);

    return (
        <div className={classes.planner_popup_wrap +' ' + classes.planner_popup_wrap_show} style={{zIndex: popups.customRegistrationPopup.zIndex}}>
            <div className={classes.planner_popup_wr}>
                <div className={classes.planner_popup_cont} ref={formDiv}>
                    <div className={classes.planner_popup_close}  onClick={() => dispatch(closeActivePopup({name: "customRegistrationPopup"})) }>
                        <svg className={classes.planner_popup_close_icon} viewBox="0 0 16.03 16.02" width="24px" height="24px">
                            <path fill="#444444" d="M1,0a1,1,0,0,0-.7,1.72L6.6,8,.31,14.3a1,1,0,0,0,1.39,1.44l0,0L8,9.42l6.29,6.29a1,1,0,1,0,1.44-1.39l0,0L9.43,8l6.29-6.29A1,1,0,1,0,14.31.3L8,6.6,1.72.3A1,1,0,0,0,1,0Z"/>
                        </svg>
                    </div>
                    { customRegistration }
                </div>
            </div>
        </div>
    )
}

export default CustomRegistrationPopup;