import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';

// Компонент контейнер для акордеону (не обов'язково має бути змінений)
const Accordion = ({ customTitle, title, children, isOpened }) => {
  const [isOpen, setIsOpen] = useState(isOpened);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const useStyle = createUseStyles({
    '@font-face': [
      {
        fontFamily: 'Roboto-Regular',
        fontWeight: 400,
        fontDisplay: 'swap',
        src: 'url("/src_designer/Roboto-Regular.ttf") format("truetype")',
      },
      {
        fontFamily: 'RobotoCondensed-Regular',
        fontWeight: 300,
        fontDisplay: 'swap',
        src: 'url("/src_designer/fonts/RobotoCondensed-Regular.ttf") format("truetype")',
      },
    ],
    dropdown: {},
    dropdown_open: {
      '& $dropdown_arrow': {
        transform: 'rotate(180deg)',
      },
      '& .dropdown_arrow': {
        transform: 'rotate(180deg)',
      },
      '&>div>.tree_dropdown_title>div>.tree_dropdown_arrow': {
        transform: 'rotate(0deg)',
      },
      '&>$dropdown_option_wrap': {
        transition: 'max-height 1.5s ease-out',
      },
    },
    dropdown_title: {
      width: '100%',

      cursor: 'pointer',
      padding: '4px 13px',
      fontSize: '17px',
      transition: 'all .9s cubic-bezier(.19,1,.22,1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontFamily: 'RobotoCondensed-Regular',
      '&:hover': {
        background: '#D9D9D9',
      },
    },
    dropdown_arrow: {
      transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    },
    dropdown_option_wrap: {
      overflow: 'hidden',
      transition: 'max-height 0.5s ease-out',
      '& .tree_dropdown_title': {
        fontSize: '13px',
        color: '#000',
        marginBottom: '0px',
        whiteSpace: 'nowrap',
        padding: '4.5px 0',
        fontFamily: 'Roboto-Regular',
      },
    },
  });
  const classes = useStyle();

  useEffect(() => {
    setIsOpen(isOpened);
  }, [isOpened]);

  return (
    <div className={isOpen ? classes.dropdown + ' ' + classes.dropdown_open : classes.dropdown}>
      {customTitle ? (
        <div
          onClick={(e) => {
            if (e.target.dataset.toggle === 'true') {
              toggleOpen();
            }
            if (e.target.dataset.open === 'true') {
              setIsOpen(true);
            }
          }}
        >
          {customTitle}
        </div>
      ) : (
        <div className={classes.dropdown_title} onClick={toggleOpen}>
          {title}
          <svg
            width="15"
            height="8"
            viewBox="0 0 15 8"
            fill="none"
            className={classes.dropdown_arrow}
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M8.34954 6.68041L7.72708 7.30725L7.72269 7.30288L7.71927 7.30627L7.23596 6.81956L0.722721 0.351854L2.90449 0.351854L7.72269 5.18586L12.5419 0.350878L14.7236 0.350878L8.34954 6.68041Z"
              fill="black"
            ></path>
          </svg>
        </div>
      )}

      <div
        className={classes.dropdown_option_wrap}
        style={{
          maxHeight: isOpen ? '1000px' : '0',
        }}
      >
        {children} {/* Контент всередині AccordionItem */}
      </div>
    </div>
  );
};

export { Accordion };
