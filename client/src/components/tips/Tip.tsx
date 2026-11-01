import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';

import { useTranslation } from '../../api/hooks/useTranslation';
import { user } from '../../initR2D';
import { setActivePopup } from '../../redux/features/popups/popupsSlice';
import { hideTip } from '../../redux/features/tips/tipsSlice';
import { selectUserProfileData, setProfileData } from '../../redux/features/user/userSlice';
import Checkbox from '../../shared-components/inputs/checkbox';

const useStyle = createUseStyles({
  tip: {
    fontSize: 17,
    textAlign: 'left',
    border: '1px solid #469bf2',
    background: '#fff',
    padding: 20,
    borderRadius: 6,
    position: 'absolute',
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    opacity: 0,
    zIndex: 5,
    boxShadow: '0px 0px 3px 0px rgba(0, 0, 0, 0.12)',
    pointerEvents: 'none',
  },
  tip_text: {
    minWidth: 200,
    color: '#2A3435',
  },
  arrow: {
    position: 'absolute',
  },
  arrow_top_right: {
    bottom: '100%',
    left: 'calc(50% - 35px)',
    transform: 'translateX(5%)',
  },
  arrow_bottom_right: {
    left: 'calc(50% - 35px)',
    transform: 'rotateY(180deg) rotate(180deg) translateX(5%)',
    top: '100%',
  },

  arrow_top_left: {
    left: 0,
    bottom: '100%',
    transform: 'rotateY(180deg)',
  },
  arrow_bottom_left: {
    left: 0,
    transform: 'rotateY(0deg) rotate(180deg) translateX(5%)',
    top: '100%',
  },
  arrow_left_top: {
    right: 0,
    bottom: 'calc(100% - 25px)',
    transform: 'rotate(-90deg)',
  },
  arrow_left_bottom: {},
  arrow_right_top: {
    right: 0,
  },
  tips_checkbox: {
    pointerEvents: 'auto',
  },
});

const Tip = (props) => {
  const dispatch = useDispatch();

  const classes = useStyle();

  const tip = useRef(null);

  const [tipPosition, setTipPosition] = useState(props.position);
  const onTipsHideClick = (e) => {
    tip.current ? (tip.current.style.opacity = 0) : null;
    setTimeout(() => dispatch(hideTip({ name: props.name })), 1000);
    WC.wallsEditor.isTipOnScreen = false;
    document.removeEventListener('mouseup', onTipsHideClick);
    document.removeEventListener('keyup', onTipsHideButton);
  };

  const onTipsHideButton = (e) =>
    (e.key == 'Enter' || e.key == 'Tab' || e.key == 'Escape') && onTipsHideClick();

  useEffect(() => {
    setTimeout(() => {
      document.addEventListener('mouseup', onTipsHideClick);
      document.addEventListener('keyup', onTipsHideButton);
    }, 0);
    setTimeout(() => (tip.current ? (tip.current.style.opacity = 1) : null), props.showTime);
    return () => {
      document.removeEventListener('click', onTipsHideClick);
      document.removeEventListener('keyup', onTipsHideButton);
    };
  }, []);

  const tipBody = useMemo(
    () => <TipBody arrow={props.arrow} text={props.text} name={props.name} tipRef={tip} />,
    []
  );

  useEffect(() => {
    if (!tip.current) return;
    if (props.name == 'tipUseEnter')
      setTipPosition({
        x: props.position.x + document.querySelector('.' + classes.arrow)?.getBBox().width / 2,
        y:
          props.position.y -
          (tip.current.offsetHeight / 2 +
            document.querySelector('.' + classes.arrow)?.getBBox().height) -
          15,
      });
    else if (props.name == 'tipUseTab') {
      if (props.isEnterTipActive) {
        setTipPosition({
          x:
            props.position.x -
            tip.current?.offsetWidth -
            document.querySelector('.' + classes.arrow)?.getBBox().width / 2 -
            25,
          y: props.position.y + document.querySelector('.' + classes.arrow)?.getBBox().height / 2,
        });
      } else {
        setTipPosition({
          x: props.position.x + document.querySelector('.' + classes.arrow)?.getBBox().width / 2,
          y:
            props.position.y -
            (tip.current.offsetHeight / 2 +
              document.querySelector('.' + classes.arrow)?.getBBox().height +
              15),
        });
      }
    }
    // else if(props.name == "panorams") setTipPosition({x: tip.current?.offsetWidth / 2 < document.querySelector('.' + classes.arrow)?.getBBox().width ? `calc(100% + ${document.querySelector('.' + classes.arrow)?.getBBox().width - tip.current?.offsetWidth / 2}px)` : props.position.x, y: props.position.y - 60 - tip.current.offsetHeight / 2});
    else if (props.name == 'changeWallHeight')
      setTipPosition({ y: props.position.y, x: props.position.x });
    else setTipPosition(props.position);
  }, [props.position, tip.current]);

  const styles = {
    top: tipPosition.y,
    left: props.position.from == 'left' ? tipPosition.x : null,
    right: props.position.from == 'right' ? tipPosition.x : null,
  };

  return (
    <div className={classes.tip} style={styles} ref={tip}>
      {tipBody}
    </div>
  );
};

const TipBody = (props) => {
  const dispatch = useDispatch();

  const translation = useTranslation();
  const userProfileData = useSelector(selectUserProfileData);

  const classes = useStyle();

  const changeTipsStatus = async (tipsCheckboxStatus) => {
    const dataObj = {
      name: userProfileData?.name,
      subscription_news: userProfileData?.subscriptionNews,
      show_tips: tipsCheckboxStatus,
    };
    await user.setProfileData(dataObj);
    const response = await user.loadProfileData();
    if (response.type == 'error') dispatch(setActivePopup({ name: 'alert', data: response.data }));
    else dispatch(setProfileData(response));
    dispatch(
      setActivePopup({ name: 'completeMessage', data: 'NOTIFY_TIPS_IN_PROFILE', positionX: 'left' })
    );
  };

  const tip = useRef(null);
  const arrowTip = useRef(null);
  const tipText = useRef(null);

  /*    let onTipsHide = e => {
        tip.current ? tip.current.style.opacity = 0 : null;
        setTimeout(() => dispatch(hideTip({name: props.name})), 1000);
        document.removeEventListener("mouseup", onTipsHide);
    }*/

  useEffect(() => {
    if (props.name == 'saveProject') tipText.current.style.whiteSpace = 'break-spaces';
    if (props.arrow.position == 'left' && props.arrow.direction == 'bottom') {
      if (props.arrow?.size && props.arrow?.size == 'small') {
        arrowTip.current.style.top = `calc(100% - ${props?.tipRef?.current.offsetHeight / 2 + 'px'})`;
        arrowTip.current.style.right = 'calc(100%)';
      } else {
        arrowTip.current.style.top = `calc(100% - ${props?.tipRef?.current.offsetHeight / 2 + 'px'} + 30px)`;
        arrowTip.current.style.transform = 'rotateY(180deg) rotate(90deg) translateY(calc(-50%))';
        arrowTip.current.style.right = 'calc(100% - 90px)';
      }
    }
    if (props.arrow.position == 'right' && props.arrow.direction == 'top') {
      if (props.arrow?.size && props.arrow?.size == 'small') {
        arrowTip.current.style.bottom = 'calc(50%)';
        arrowTip.current.style.left = 'calc(100%)';
        arrowTip.current.style.transform = 'rotate(180deg)';
      } else {
        arrowTip.current.style.bottom = 'calc(90px - 20px)';
        arrowTip.current.style.right = 'calc(100% - 90px)';
        arrowTip.current.style.transform = 'rotateX(180deg) rotate(90deg)';
      }
    }
    return () => {
      tipText.current ? tipText.current.removeAttribute('style') : null;
    };
  }, []);

  return (
    <div>
      {props.arrow && props.arrow.position && props.arrow.direction ? (
        props.arrow.size && props.arrow.size == 'small' ? (
          // TODO: Replace long arrow icon
          <svg
            width="40"
            height="59"
            viewBox="0 0 40 59"
            fill="none"
            ref={arrowTip}
            className={
              classes.arrow +
              ' ' +
              classes['arrow_' + props.arrow.position + '_' + props.arrow.direction]
            }
          >
            <path d="M1 47L7 57L12.5 47" stroke="#469bf2" />
            <path
              d="M39.0073 0.999999C32.247 2.26129 16.4141 6.87784 11 26C7.21883 39.3548 7.11458 50.2871 7 56"
              stroke="#469bf2"
            />
          </svg>
        ) : (
          // TODO: Replace long arrow icon
          <svg
            width="180"
            height="65"
            ref={arrowTip}
            className={
              classes.arrow +
              ' ' +
              classes['arrow_' + props.arrow.position + '_' + props.arrow.direction]
            }
          >
            <path d="M 20 80 Q 20 20, 179 20" stroke="#469bf2" fill="transparent"></path>
            <path
              d="M 179 20 L 169 25 M 179 20 L 169 15"
              stroke="#469bf2"
              fill="transparent"
            ></path>
          </svg>
        )
      ) : null}

      <div
        className={classes.tip_text}
        ref={tipText}
        style={
          props.name == 'tipUseTab' || props.name == 'tipUseEnter' ? null : { marginBottom: 20 }
        }
        dangerouslySetInnerHTML={{ __html: translation[props.text] }}
      ></div>

      {props.name == 'tipUseTab' || props.name == 'tipUseEnter' ? null : (
        <div className={classes.tips_checkbox}>
          <Checkbox
            name={'tips'}
            onChange={changeTipsStatus}
            label={translation['TEXT_SHOW_TIPS']}
            checked={userProfileData?.tips ? 'checked' : null}
          />
        </div>
      )}
    </div>
  );
};

export default Tip;
