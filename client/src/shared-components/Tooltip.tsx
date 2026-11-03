import * as RadixTooltip from '@radix-ui/react-tooltip';
import { ReactElement, ReactNode } from 'react';

import classes from './Tooltip.module.css';

type TooltipProps = {
  content: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  // a single element that accepts a ref, e.g. <button> or <span>
  children: ReactElement;
};

export default function Tooltip({ content, side = 'top', children }: TooltipProps) {
  return (
    <RadixTooltip.Provider delayDuration={0} disableHoverableContent>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content className={classes.tooltip} side={side} sideOffset={6}>
            {content}
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
