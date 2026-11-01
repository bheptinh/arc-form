import { IconChevronDown, IconSortAscending, IconSortDescending } from '@tabler/icons-react';
import { useState } from 'react';

import IconButton from './inputs/icon-button';
import classes from './SortBar.module.css';

type Option = { value: string; label: string };

type Props = {
  options: Option[];
  activeLabel: string;
  direction: 'asc' | 'desc';
  onOptionSelect: (opt: Option) => void;
  onDirectionToggle: () => void;
};

export function SortBar({
  options,
  activeLabel,
  direction,
  onOptionSelect,
  onDirectionToggle,
}: Props) {
  // The list opens on hover, so after a selection it has to stay shut until the mouse leaves.
  const [dismissed, setDismissed] = useState(false);

  const handleSelect = (opt: Option) => {
    onOptionSelect(opt);
    setDismissed(true);
  };

  return (
    <div className={classes.wrap}>
      <div
        className={`${classes.dropdown} ${dismissed ? '' : classes.dropdownOpenable}`}
        onMouseLeave={() => setDismissed(false)}
      >
        <div className={classes.dropdownActive} onClick={() => setDismissed(false)}>
          <span className={classes.label}>
            <span>{activeLabel}</span>
            {options.map((opt) => (
              <span key={opt.value} className={classes.labelSizer} aria-hidden>
                {opt.label}
              </span>
            ))}
          </span>
          <IconChevronDown size={12} color="#555555" />
        </div>
        <div className={classes.dropdownOptionWrap}>
          <div className={classes.dropdownOptions}>
            {options.map((opt) => (
              <div key={opt.value} className={classes.option} onClick={() => handleSelect(opt)}>
                {opt.label}
              </div>
            ))}
          </div>
        </div>
      </div>
      <IconButton
        icon={
          direction === 'desc' ? (
            <IconSortDescending size={12} color="#555555" />
          ) : (
            <IconSortAscending size={12} color="#555555" />
          )
        }
        label={direction === 'desc' ? 'Sort descending' : 'Sort ascending'}
        onClick={onDirectionToggle}
        className={classes.dirBtn}
      />
    </div>
  );
}
