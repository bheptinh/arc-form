import * as RadixTooltip from '@radix-ui/react-tooltip';
import {
  MouseEvent,
  PointerEvent,
  ReactElement,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

import classes from './Tooltip.module.css';

type TooltipProps = {
  content: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  // touch screens never hover, so a tap shows the tooltip for a few seconds instead
  openOnTap?: boolean;
  // a single element that accepts a ref, e.g. <button> or <span>
  children: ReactElement;
};

const TAP_DURATION = 3000;

export default function Tooltip({ content, side = 'top', openOnTap, children }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const pointerType = useRef('');
  const tapTimer = useRef<number>(undefined);

  useEffect(() => () => clearTimeout(tapTimer.current), []);

  if (content == null || content === '') return children;

  const onPointerDown = (e: PointerEvent) => {
    pointerType.current = e.pointerType;
  };

  const onClick = (e: MouseEvent) => {
    if (pointerType.current === 'mouse') return;
    // keeps Radix from closing it, as it does on click
    e.preventDefault();
    setOpen(true);
    clearTimeout(tapTimer.current);
    tapTimer.current = window.setTimeout(() => setOpen(false), TAP_DURATION);
  };

  return (
    <RadixTooltip.Provider delayDuration={0} disableHoverableContent>
      <RadixTooltip.Root open={open} onOpenChange={setOpen}>
        <RadixTooltip.Trigger
          asChild
          onPointerDown={openOnTap ? onPointerDown : undefined}
          onClick={openOnTap ? onClick : undefined}
        >
          {children}
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content className={classes.tooltip} side={side} sideOffset={6}>
            {content}
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
