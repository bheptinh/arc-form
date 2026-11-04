import { IconChevronDown } from '@tabler/icons-react';
import cls from 'classnames';
import { ReactNode, useEffect, useState } from 'react';

import classes from './Accordion.module.css';

type HeaderControls = { open: boolean; setOpen: (open: boolean) => void };

type AccordionProps = {
  children: ReactNode;
  // opens or closes it whenever it changes; the header can still toggle it in between
  open?: boolean;
} & (
  | { header: (controls: HeaderControls) => ReactNode; title?: never; subTitle?: never }
  | { title: ReactNode; subTitle?: ReactNode; header?: never }
);

/** Collapsible section: a header row that toggles the content below it. */
export default function Accordion({ header, title, subTitle, children, open }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(!!open);

  useEffect(() => setIsOpen(!!open), [open]);

  return (
    <div className={cls(isOpen && classes.open)}>
      {header ? (
        header({ open: isOpen, setOpen: setIsOpen })
      ) : (
        <div className={classes.header} onClick={() => setIsOpen(!isOpen)}>
          <div className={classes.title}>{title}</div>
          {subTitle ? <div className={classes.subTitle}>{subTitle}</div> : null}
          <IconChevronDown size={16} className={classes.arrow} />
        </div>
      )}
      <div className={classes.content} style={{ maxHeight: isOpen ? '1000px' : '0' }}>
        {children}
      </div>
    </div>
  );
}
