import cx from 'classnames';
import React, { useEffect, useState } from 'react';
import { useRef } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { user } from '../../initR2D';
import { selectLanguages, selectTranslation } from '../../redux/features/language/languageSlice';
import {
  closeActivePopup,
  selectPopups,
  setActivePopup,
  setPopupData,
} from '../../redux/features/popups/popupsSlice';
import {
  selectIsLogged,
  selectUserProfileData,
  setProfileData,
} from '../../redux/features/user/userSlice';
import Checkbox from '../common/Checkbox';

const useStyle = createUseStyles({
  done_popup_wrap: {
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
    background: 'rgba(0, 0, 0, 0.8)',
  },
  done_popup_wrap_show: {
    opacity: '1',
    pointerEvents: 'auto',
    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
    '& $done_popup_wr': {
      transform: 'scale(1)',
    },
  },
  done_popup_wr: {
    color: '#000',
    maxWidth: 882,
    width: '100%',
    maxHeight: '90%',
    borderRadius: 6,
    transform: 'scale(0)',
    boxShadow: '0px 1px 10px 0px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
  },
  done_popup_cont: {
    color: '#000',
    backgroundColor: '#f1f1f1',
    borderRadius: 6,
    position: 'relative',
    height: '100%',
    overflow: 'hidden',
  },
  done_popup_login_wrap: {
    width: '100%',
  },
  done_popup_close: {
    width: 20,
    height: 20,
    position: 'absolute',
    top: 8,
    right: 8,
    cursor: 'pointer',
    zIndex: '2',
    '& path': {
      transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
    },
    '&:hover': {
      '& path': {
        fill: '#BAE51F',
      },
    },
  },
  done_popup_close_icon: {
    width: '100%',
  },
  done_popup_top: {
    height: 210,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#72C4FF',
    position: 'relative',
    '& img': {
      maxWidth: '90%',
      maxHeight: '90%',
    },
    '@media screen and (max-width: 950px)': {
      height: 80,
    },
  },
  done_popup_top_icon: {},
  done_popup_bot: {
    padding: '24px 10px 37px',
    textAlign: 'center',
    background: '#fff',
    '@media screen and (max-width: 950px)': {
      padding: '14px 10px 30px',
    },
  },
  done_popup_title: {
    color: '#2F2F2F',
    fontSize: 32,
    fontWeight: 300,
    textAlign: 'center',
    marginBottom: 33,
    '@media screen and (max-width: 950px)': {
      fontSize: 20,
      marginBottom: 21,
    },
  },
  done_popup_items: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 111px)',
    gridGap: 11,
    justifyContent: 'center',
    marginBottom: 19,
    '@media screen and (max-width: 950px)': {
      gridTemplateColumns: 'repeat(6, 94px)',
      marginBottom: 14,
    },
  },
  done_popup_item: {
    background: '#fff',
    boxShadow: '0px 4px 4px rgba(255, 255, 255, 0.25)',
    width: 111,
    height: 194,
    display: 'grid',
    alignItems: 'center',
    borderRadius: 6,
    padding: '12px 12px',
    position: 'relative',
    border: '1px solid #D9D9D9',
    transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
    '&:hover': {
      border: '1px solid #9dd900',
    },
    '&:not(:last-child)': {
      cursor: 'pointer',
    },
    '@media screen and (max-width: 950px)': {
      height: 139,
      width: 'auto',
      padding: 6,
    },
  },
  done_popup_item_active: {
    '&:before': {
      content: '" "',
      position: 'absolute',
      top: '-2%',
      left: '-2%',
      width: '104%',
      height: '104%',
      border: '1px solid #fff',
      borderRadius: 6,
      boxShadow: 'inset 0px 0px 0px 5px #9dd900',
    },
  },

  done_popup_item_top: {},
  done_popup_item_credits: {
    color: '#515151',
    fontSize: 36,
    lineHeight: '0.9',
    marginBottom: 7,
    '@media screen and (max-width: 950px)': {
      fontSize: 31,
      marginBottom: 2,
    },
  },
  done_popup_item_input: {
    width: '100%',
    border: '1px solid #D2E5EF',
    height: 39,
    padding: '0 4px',
    textAlign: 'center',
    fontSize: 38,
    outline: 'none',
    color: '#515151',
    '-moz-appearance': 'textfield',
    '&::-webkit-input-placeholder': {
      color: '#D7D7D7',
    },
    '&::-webkit-outer-spin-button': {
      '-webkit-appearance': 'none',
      margin: 0,
    },
    '&::-webkit-inner-spin-button': {
      '-webkit-appearance': 'none',
      margin: 0,
    },
  },
  done_popup_item_input_text: {
    position: 'absolute',
    bottom: 'calc(100% + 8px)',
    left: 0,
    fontSize: 12,
    color: '#485258',
  },
  done_popup_item_credits_text: {
    color: '#373737',
    fontSize: 13,
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
    },
  },
  done_popup_item_line: {
    opacity: '0.1',
    background: '#000',
    height: 1,
  },
  done_popup_item_bot: {},
  done_popup_item_bot_contact: {
    fontSize: 13,
    fontWeight: 400,
    lineHeight: '15px',
    letterSpacing: '-0.03em',
    color: '#66ACF4',
    textDecoration: 'underline',
    '&:hover': {
      textDecoration: 'none',
    },
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
    },
  },
  done_popup_item_top_more: {
    fontSize: 18,
    fontWeight: 500,
    lineHeight: '21px',
    letterSpacing: '-0.03em',
    color: '#515151',
    '@media screen and (max-width: 950px)': {
      fontSize: 12,
    },
  },
  done_popup_item_price: {
    fontSize: 18,
    color: '#2D2D2D',
    marginBottom: 7,
    '& span': {
      fontSize: 29,
      transform: 'translateY(3px)',
      display: 'inline-block',
      '@media screen and (max-width: 950px)': {
        fontSize: 20,
      },
      '& sup': {
        fontSize: 11,
        transform: 'translateY(-4px)',
        display: 'inline-block',
        marginLeft: 3,
        '@media screen and (max-width: 950px)': {
          fontSize: 10,
        },
      },
    },
    '@media screen and (max-width: 950px)': {
      fontSize: 12,
    },
  },
  done_popup_item_price_text: {
    fontSize: 13,
    color: '#4F4F4F',
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
    },
  },

  done_popup_btn: {
    marginTop: 22,
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
    '&:hover': {
      background: '#8fc32d',
    },
    '@media screen and (max-width: 950px)': {
      fontSize: 12,
      height: '26px',
      minWidth: 88,
    },
  },
  done_popup_btn_terms: {
    display: 'flex',
    justifyContent: 'center',
    color: '#66ACF4',
    fontSize: 13,
    alignItems: 'center',
    '& a': {
      marginLeft: 3,
      textDecoration: 'underline',
      color: '#66ACF4',
      '&:hover': {
        textDecoration: 'none',
      },
    },
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
    },
  },
  done_iframe: {
    border: 'none',
    display: 'inherit',
  },
  terms_not_selected: {
    '& a': {
      color: 'red!important',
      transition: 'all .2s ease',
    },
    '& label': {
      color: 'red!important',
      transition: 'all .2s ease',
    },
  },
  iframe_wrap: {
    height: 640,
  },
});
const BuyCredits = (props) => {
  const classes = useStyle();
  const dispatch = useDispatch();

  const popups = useSelector(selectPopups);
  const userData = useSelector(selectUserProfileData);
  const languages = useSelector(selectLanguages);

  const isLogged = useSelector(selectIsLogged);

  const translation = useSelector(selectTranslation);

  const currLanguage = languages.find((i) => i.current == 1);

  const iframeSrc = popups.buyCredits.data?.iframe;

  const creditsNum = popups.buyCredits.data?.creditsNum;

  const popupType = popups.buyCredits.type;

  const [itemsArray, setItemsArray] = useState([]);
  const [itemsToShow, setItemsToShow] = useState([]);
  const [itemsToShowComponents, setItemsToShowComponents] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('3');
  const [termsCheckboxStatus, setTermsCheckboxStatus] = useState(false);
  const [animPopupClass, setAnimPopupClass] = useState(false);

  const [configEnableMerchantLogin, setConfigEnableMerchantLogin] = useState(
    R2D.config.data.enable_merchant_login
  );

  const [currentPage, setCurrentPage] = useState(null);

  const selectItem = (e) => {
    if (e.currentTarget.dataset.planId == selectedPlan) return;
    document
      .querySelector('.' + classes.done_popup_item_active)
      .classList.remove(classes.done_popup_item_active);
    setSelectedPlan(e.currentTarget.dataset.planId);
  };

  const onBuyCredits = (e) => {
    if (!termsCheckboxStatus) {
      document
        .querySelector(`.${classes.done_popup_btn_terms}`)
        .classList.add(classes.terms_not_selected);
      setTimeout(() => {
        document
          .querySelector(`.${classes.done_popup_btn_terms}`)
          .classList.remove(classes.terms_not_selected);
      }, 300);
      return;
    }

    const numberOfCredits = itemsArray?.find((i) => i?.id == selectedPlan)?.numOfCredits;

    if (!isLogged) {
      !configEnableMerchantLogin
        ? dispatch(setActivePopup({ name: 'login', type: 'buy_credits', data: numberOfCredits }))
        : R2D.postMessageToParent(JSON.stringify({ action: 'merchant_login' }));
      return;
    }

    if (!R2D.token)
      return dispatch(setActivePopup({ name: 'alert', data: 'TEXT_ERROR_LOAD_DATA' }));
    dispatch(
      setPopupData({
        name: 'buyCredits',
        data: {
          iframe: `${R2D.URL.DOMAIN}/api/credits/get_form?credits=${numberOfCredits}&lang=${currLanguage.code}&token=${R2D.token}`,
        },
      })
    );
    window.addEventListener('message', messageListener, false);

    setCurrentPage('order');

    // GTM
    window.dataLayer.push({ event: 'order_credit' });
  };

  function messageListener(event) {
    let dataObj;

    if (
      (event.data.source &&
        typeof event.data.source.startsWith == 'function' &&
        event.data.source.startsWith('react')) ||
      (event.data &&
        typeof event.data.startsWith == 'function' &&
        event.data.startsWith('/*framebus*/'))
    )
      return;

    try {
      dataObj = JSON.parse(event.data);
    } catch (error) {
      console.error('Error parse JSON string!');
      console.log(event.data);
      return;
    }
    if (dataObj.action == 'credits_buy_finish') {
      window.removeEventListener('message', messageListener);

      messageFinishListener();
    }
  }

  function messageFinishListener() {
    dispatch(
      setPopupData({
        name: 'buyCredits',
        data: { iframe: `/src_designer/html/pay_notification/wait_${currLanguage.code}.html` },
      })
    );

    window.addEventListener('message', receiveMessage);

    const checkInterval = setInterval(checkUserCredits, 2000);

    let checkNum = 0;

    async function checkUserCredits() {
      try {
        const response = await user.checkIsLogged();
        if (response.logged == true) {
          if (user.credits() != userData.credits) {
            // GTM
            window.dataLayer.push({ event: 'buy_credit' });

            clearInterval(checkInterval);
            dispatch(
              setPopupData({
                name: 'buyCredits',
                data: { iframe: `/src_designer/html/pay_notification/ok_${currLanguage.code}.php` },
              })
            );
            const response = await user.loadProfileData();
            if (response.type == 'error')
              dispatch(setActivePopup({ name: 'alert', data: response.data }));
            else dispatch(setProfileData(response));
          } else {
            checkNum += 1;
            if (checkNum > 5) {
              clearInterval(checkInterval);
              dispatch(
                setPopupData({
                  name: 'buyCredits',
                  data: {
                    iframe: `/src_designer/html/pay_notification/error_${currLanguage.code}.html`,
                  },
                })
              );
            }
          }
        }
      } catch (e) {
        console.log('Error while user data load: ', e);
        clearInterval(checkInterval);
        dispatch(
          setPopupData({
            name: 'buyCredits',
            data: { iframe: `/src_designer/html/pay_notification/error_${currLanguage.code}.html` },
          })
        );
      }
    }

    function receiveMessage(event) {
      let dataObj;

      if (
        event.data &&
        (event.data.source == 'react-devtools-bridge' ||
          (typeof event.data.startsWith == 'function' && event.data.startsWith('/*framebus*/')))
      )
        return;

      try {
        dataObj = JSON.parse(event.data);
      } catch (error) {
        console.error('Error parse JSON string!');
        console.log(event.data);
        return;
      }

      if (dataObj.action == 'close') {
        clearInterval(checkInterval);
        window.removeEventListener('message', receiveMessage, false);
        dispatch(closeActivePopup({ name: 'buyCredits' }));
      }
    }
  }

  const loadPricesEventHandler = (e) => {
    const prices = JSON.parse(e.data.data);
    const items = [];
    const itemsToShow = [];
    let idNum = 1;
    for (const i in prices) {
      let totalPrice = prices[i] * i + '';
      if (totalPrice.split('.')[1]) {
        if (totalPrice.split('.')[1].length > 2 || totalPrice.split('.')[1].length < 2)
          totalPrice = (+totalPrice).toFixed(2);
      }
      const newItem = {
        id: idNum,
        numOfCredits: i,
        priceTotal: totalPrice,
        pricePerCredit: prices[i],
      };
      items.push(newItem);
      if (
        newItem.numOfCredits == 5 ||
        newItem.numOfCredits == 10 ||
        newItem.numOfCredits == 20 ||
        newItem.numOfCredits == 50 ||
        newItem.numOfCredits == 100
      )
        itemsToShow.push(newItem);
      idNum++;
    }

    const itemsToShowArray = [];

    itemsToShow.forEach((i) => {
      itemsToShowArray.push(
        <div
          className={cx(classes.done_popup_item, { [classes.done_popup_item_active]: i.id == 3 })}
          data-plan-id={i.id}
          key={i.id}
          onClick={selectItem}
        >
          <div className={classes.done_popup_item_top}>
            <div className={classes.done_popup_item_credits}>{i.numOfCredits}</div>
            <div className={classes.done_popup_item_credits_text}>
              {translation['RENDER_BUY_CREDITS']}
            </div>
          </div>
          <div className={classes.done_popup_item_line}></div>
          <div className={classes.done_popup_item_bot}>
            <div className={classes.done_popup_item_price}>
              ${' '}
              <span>
                {i.priceTotal.split('.')[0]}
                <sup>{i.priceTotal.split('.')[1]}</sup>
              </span>
            </div>
            <div className={classes.done_popup_item_price_text}>
              ${i.pricePerCredit} / {translation['RENDER_CREDIT']}
            </div>
          </div>
        </div>
      );
    });

    setItemsArray(items);
    setItemsToShow(itemsToShow);
    setItemsToShowComponents(itemsToShowArray);
  };

  const onChangeCheckbox = (checked) => setTermsCheckboxStatus(checked);

  const returnToMainBuyCreditsPopup = (e) => {
    if (currentPage == 'order') {
      // GTM
      window.dataLayer.push({ event: 'cancel_order_credit' });
    }
    setCurrentPage('');
    dispatch(setPopupData({ name: 'buyCredits', data: { iframe: '' } }));
  };

  const onClickClosePopUp = (e) => {
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'buyCredits' })), 500);
  };

  useEffect(() => {
    setConfigEnableMerchantLogin(R2D.config.data.enable_merchant_login);
  }, [R2D.config.data.enable_merchant_login]);

  useEffect(() => {
    const itemsToShowArray = [];

    itemsToShow.length > 0 &&
      itemsToShow.forEach((i) => {
        itemsToShowArray.push(
          <div
            className={cx(classes.done_popup_item, {
              [classes.done_popup_item_active]: selectedPlan == i.id,
            })}
            data-plan-id={i.id}
            key={i.id}
            onClick={selectItem}
          >
            <div className={classes.done_popup_item_top}>
              <div className={classes.done_popup_item_credits}>{i.numOfCredits}</div>
              <div className={classes.done_popup_item_credits_text}>
                {translation['RENDER_BUY_CREDITS']}
              </div>
            </div>
            <div className={classes.done_popup_item_line}></div>
            <div className={classes.done_popup_item_bot}>
              <div className={classes.done_popup_item_price}>
                ${' '}
                <span>
                  {i.priceTotal.split('.')[0]}
                  <sup>{i.priceTotal.split('.')[1]}</sup>
                </span>
              </div>
              <div className={classes.done_popup_item_price_text}>
                ${i.pricePerCredit} / {translation['RENDER_CREDIT']}
              </div>
            </div>
          </div>
        );
      });

    setItemsToShowComponents(itemsToShowArray);
  }, [selectedPlan]);

  useEffect(() => {
    if (creditsNum) {
      if (!R2D.token)
        return dispatch(setActivePopup({ name: 'alert', data: 'TEXT_ERROR_LOAD_DATA' }));
      dispatch(
        setPopupData({
          name: 'buyCredits',
          data: {
            iframe: `${R2D.URL.DOMAIN}/api/credits/get_form?credits=${creditsNum}&lang=${currLanguage.code}&token=${R2D.token}`,
          },
        })
      );
      window.addEventListener('message', messageListener, false);
    }
  }, [creditsNum]);

  useEffect(() => {
    const url = R2D.makeURL(R2D.URL.DOMAIN, '/api/credits/packets');
    const loader = new R2D.XHRLoader();

    loader.addEventListener(Event.COMPLETE, loadPricesEventHandler);
    loader.load(url, null, 'POST', null, null, true);

    // GTM
    window.dataLayer.push({ event: 'choice_credit' });
  }, []);

  const buyCreditsRef = useRef(null);

  useEffect(() => {
    if (popupType == 'fromUrl') {
      window.addEventListener('message', messageListener, false);
      setCurrentPage('order');

      // GTM
      window.dataLayer.push({ event: 'order_credit' });
    }
  }, [popupType]);

  useEffect(() => {
    const timer = setTimeout(() => setAnimPopupClass(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return itemsToShowComponents ? (
    <div
      className={
        animPopupClass
          ? classes.done_popup_wrap + ' ' + classes.done_popup_wrap_show
          : classes.done_popup_wrap
      }
      style={{ zIndex: popups.buyCredits.zIndex }}
    >
      <div className={classes.done_popup_wr}>
        <div className={classes.done_popup_cont}>
          {iframeSrc ? (
            <div className={classes.iframe_wrap}>
              <div className={classes.done_popup_close} onClick={returnToMainBuyCreditsPopup}>
                <svg
                  width="25"
                  height="25"
                  fill="none"
                  viewBox="0 0 25 25"
                  className={classes.done_popup_close_icon}
                >
                  <path
                    fill="#2F2F2F"
                    fillRule="evenodd"
                    d="M.102 1.417 1.22.329l12.34 12.07-.007.006v.002l-.23.221-.88.858-.005-.005L1.172 24.329.064 23.233l11.259-10.842L.103 1.417Z"
                    clipRule="evenodd"
                  />
                  <path
                    fill="#2F2F2F"
                    fillRule="evenodd"
                    d="M.102 1.417 1.22.329l12.34 12.07-.007.006v.002l-.23.221-.88.858-.005-.005L1.172 24.329.064 23.233l11.259-10.842L.103 1.417Z"
                    clipRule="evenodd"
                  />
                  <path
                    fill="#2F2F2F"
                    fillRule="evenodd"
                    d="M24.73 1.417 23.613.329 11.273 12.4l.008.006-.002.002.23.221.881.858.005-.005L23.66 24.329l1.108-1.096L13.51 12.391 24.73 1.417Z"
                    clipRule="evenodd"
                  />
                  <path
                    fill="#2F2F2F"
                    fillRule="evenodd"
                    d="M24.73 1.417 23.613.329 11.273 12.4l.008.006-.002.002.23.221.881.858.005-.005L23.66 24.329l1.108-1.096L13.51 12.391 24.73 1.417Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              <iframe
                src={iframeSrc}
                className={classes.done_iframe}
                datatype="window-iframe"
                id="dialog-iframe"
                width={'100%'}
                height={'100%'}
              ></iframe>
            </div>
          ) : (
            <div ref={buyCreditsRef} className={classes.done_popup_login_wrap}>
              <div className={classes.done_popup_close} onClick={onClickClosePopUp}>
                <svg
                  width="25"
                  height="25"
                  fill="none"
                  viewBox="0 0 25 25"
                  className={classes.done_popup_close_icon}
                >
                  <path
                    fill="#2F2F2F"
                    fillRule="evenodd"
                    d="M.102 1.417 1.22.329l12.34 12.07-.007.006v.002l-.23.221-.88.858-.005-.005L1.172 24.329.064 23.233l11.259-10.842L.103 1.417Z"
                    clipRule="evenodd"
                  />
                  <path
                    fill="#2F2F2F"
                    fillRule="evenodd"
                    d="M.102 1.417 1.22.329l12.34 12.07-.007.006v.002l-.23.221-.88.858-.005-.005L1.172 24.329.064 23.233l11.259-10.842L.103 1.417Z"
                    clipRule="evenodd"
                  />
                  <path
                    fill="#2F2F2F"
                    fillRule="evenodd"
                    d="M24.73 1.417 23.613.329 11.273 12.4l.008.006-.002.002.23.221.881.858.005-.005L23.66 24.329l1.108-1.096L13.51 12.391 24.73 1.417Z"
                    clipRule="evenodd"
                  />
                  <path
                    fill="#2F2F2F"
                    fillRule="evenodd"
                    d="M24.73 1.417 23.613.329 11.273 12.4l.008.006-.002.002.23.221.881.858.005-.005L23.66 24.329l1.108-1.096L13.51 12.391 24.73 1.417Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className={classes.done_popup_login_wr}>
                <div className={classes.done_popup_top}>
                  <img
                    className={classes.done_popup_top_icon}
                    src="/src_designer/images/icon_buy_credits.svg"
                  />
                </div>
                <div className={classes.done_popup_bot}>
                  <div className={classes.done_popup_title}>{translation['RENDER_BUY_SELECT']}</div>

                  <div className={classes.done_popup_items}>
                    {itemsToShowComponents}

                    <div className={classes.done_popup_item} style={{ cursor: '' }}>
                      <div className={classes.done_popup_item_top}>
                        <p className={classes.done_popup_item_top_more}>
                          {translation['RENDER_BUY_MORE']}
                        </p>
                      </div>
                      <div className={classes.done_popup_item_line}></div>
                      <div className={classes.done_popup_item_bot}>
                        <a
                          className={classes.done_popup_item_bot_contact}
                          href="mailto:sales@roomtodo.com"
                        >
                          {translation['RENDER_BUY_CONTACT']}
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className={classes.done_popup_btn_terms}>
                    <Checkbox
                      label={translation['RENDER_BUY_TERMS_AGREE']}
                      onChange={onChangeCheckbox}
                      checked={termsCheckboxStatus}
                      name={'buyCreditsTerms'}
                    />
                    <a href="#" target="_blank">
                      {translation['RENDER_BUY_TERMS_OF_USE']}
                    </a>
                  </div>
                  <div className={classes.done_popup_btn} onClick={onBuyCredits}>
                    {translation['RENDER_BUY_BUY']}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  ) : null;
};

export default BuyCredits;
