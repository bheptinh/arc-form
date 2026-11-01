import { IconChevronDown } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';

const useStyle = createUseStyles({
  dropdown: {},
  dropdown_open: {
    '& $dropdown_arrow': {
      transform: 'rotateX(180deg)',
    },
    '& .dropdown_arrow': {
      transform: 'rotateX(180deg)',
    },
    '&>div>.tree_dropdown_title>div>.tree_dropdown_arrow': {
      transform: 'rotate(0deg)',
    },
    '&>$dropdown_option_wrap': {
      transition: 'max-height 1.5s ease-out',
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
      color: 'var(--color-black)',
      marginBottom: '0px',
      whiteSpace: 'nowrap',
      padding: '4.5px 0',
    },
  },

  accordionHeader: {
    display: 'flex',
    justifyContent: 'start',
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    padding: '4px 13px',
    fontSize: '17px',
    cursor: 'pointer',
    width: '100%',
    gap: '8px',

    '&:hover': {
      background: 'var(--color-surface-grey)',
    },
  },
  accordionHeaderTitle: {
    marginRight: 'auto',
  },
  accordionHeaderSubTitle: {
    color: '#73909F',
    fontSize: '12px',
    fontWeight: 400,
  },
});

type AccordionProps = {
  children: React.ReactNode;
  isOpened?: boolean;
} & (
  | { customTitle: React.ReactNode; title?: never }
  | { title: string; subTitle?: string; customTitle?: never }
);

const Accordion = ({ customTitle, title, subTitle, children, isOpened }: AccordionProps) => {
  const [isOpen, setIsOpen] = useState(isOpened);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };
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
        <div className={classes.accordionHeader} onClick={toggleOpen}>
          <div className={classes.accordionHeaderTitle}>{title}</div>
          {subTitle && <div className={classes.accordionHeaderSubTitle}>{subTitle}</div>}
          <IconChevronDown size={16} className={classes.dropdown_arrow} />
        </div>
      )}

      <div
        className={classes.dropdown_option_wrap}
        style={{
          maxHeight: isOpen ? '1000px' : '0',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export { Accordion };
