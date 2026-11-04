import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import cls from 'classnames';
import { PointerEvent, ReactElement, ReactNode, useEffect, useRef, useState } from 'react';

import classes from './Menu.module.css';

export type MenuItem = {
  icon?: ReactNode;
  label: ReactNode;
  onSelect: () => void;
  visible?: boolean;
};

type MenuProps = {
  // one element that accepts a ref and spreads extra props, e.g. <IconButton hideTooltip />
  trigger: ReactElement;
  items: MenuItem[];
  // non-clickable row above the items
  header?: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  className?: string;
};

// lets the pointer cross the gap between trigger and menu
const CLOSE_DELAY = 150;

const isMouse = (e: PointerEvent) => e.pointerType === 'mouse';

// Dropdown menu that opens on hover with a mouse and on tap or keyboard otherwise.
// It renders in place, not in a portal, so it stays in the caller's stacking context.
export default function Menu({
  trigger,
  items,
  header,
  side = 'right',
  align = 'center',
  className,
}: MenuProps) {
  const [open, setOpen] = useState(false);
  const openedByHover = useRef(false);
  const closeTimer = useRef<number>(undefined);

  const onHoverStart = (e: PointerEvent) => {
    if (!isMouse(e)) return;
    clearTimeout(closeTimer.current);
    if (open) return;
    openedByHover.current = true;
    setOpen(true);
  };

  const onHoverEnd = (e: PointerEvent) => {
    if (!isMouse(e)) return;
    closeTimer.current = window.setTimeout(() => setOpen(false), CLOSE_DELAY);
  };

  const onOpenChange = (next: boolean) => {
    clearTimeout(closeTimer.current);
    if (next) openedByHover.current = false;
    setOpen(next);
  };

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  // closing a hover-opened menu shouldn't focus the trigger
  const skipFocusOnHover = (e: Event) => openedByHover.current && e.preventDefault();

  return (
    <DropdownMenu.Root open={open} onOpenChange={onOpenChange} modal={false}>
      <DropdownMenu.Trigger
        asChild
        // a mouse opens it on hover, so a click shouldn't toggle it shut
        onPointerDown={(e) => isMouse(e) && e.preventDefault()}
        onPointerEnter={onHoverStart}
        onPointerLeave={onHoverEnd}
      >
        {trigger}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        className={cls(classes.menu, className)}
        side={side}
        align={align}
        sideOffset={1}
        onPointerEnter={onHoverStart}
        onPointerLeave={onHoverEnd}
        onCloseAutoFocus={skipFocusOnHover}
      >
        {header && <DropdownMenu.Label className={classes.header}>{header}</DropdownMenu.Label>}
        {items.map(
          ({ icon, label, onSelect, visible = true }, i) =>
            visible && (
              <DropdownMenu.Item key={i} className={classes.item} onSelect={onSelect}>
                {icon && <span className={classes.icon}>{icon}</span>}
                {label}
              </DropdownMenu.Item>
            )
        )}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
