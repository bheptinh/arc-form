import { IconChevronDown, IconSortAscending, IconSortDescending } from '@tabler/icons-react';
import { createUseStyles } from 'react-jss';

type Option = { value: string; label: string };

type Props = {
  options: Option[];
  activeLabel: string;
  direction: 'asc' | 'desc';
  onOptionSelect: (opt: Option) => void;
  onDirectionToggle: () => void;
};

const useStyles = createUseStyles({
  wrap: {
    position: 'relative',
    zIndex: 1,
    height: 26,
    display: 'flex',
    marginLeft: 40,
  },
  dropdown: {
    borderRight: '1px solid #C4C4C4',
    position: 'relative',
    height: '100%',
    minWidth: 30,
    '&:hover $dropdownActive': { background: 'var(--color-surface-muted)' },
    '&:hover $dropdownOptions': { transform: 'translateY(0)', pointerEvents: 'all' },
    '&:hover $dropdownActive svg': { transform: 'rotateX(180deg)' },
  },
  dropdownActive: {
    boxShadow: '0px 0px 3px 0px rgba(0,0,0,0.12)',
    background: 'var(--color-white)',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    borderRadius: '3px 0 0 3px',
    border: '1px solid var(--color-white)',
    height: '100%',
    display: 'grid',
    gridTemplateColumns: 'auto auto',
    gridGap: '20px',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-text-slate)',
    fontSize: 12,
    padding: '0 7px',
    transition: 'all 0.9s cubic-bezier(0.19,1,0.22,1)',
    '& svg': { transition: 'all 0.9s cubic-bezier(0.19,1,0.22,1)' },
  },
  dropdownOptionWrap: {
    position: 'absolute',
    right: -4,
    width: 'calc(100% + 8px)',
    overflow: 'hidden',
    minWidth: 'fit-content',
    pointerEvents: 'none',
    zIndex: -1,
    padding: 4,
    top: 'calc(100% - 4px)',
  },
  dropdownOptions: {
    paddingTop: 2,
    pointerEvents: 'auto',
    transform: 'translateY(calc(-100% - 15px))',
    transition: 'all 0.9s cubic-bezier(0.19,1,0.22,1)',
    borderRadius: 3,
    overflow: 'hidden',
    boxShadow: '0px 0px 7px 0px rgba(0,0,0,0.15)',
  },
  option: {
    background: 'var(--color-white)',
    cursor: 'pointer',
    height: 30,
    display: 'flex',
    alignItems: 'center',
    fontSize: 12,
    whiteSpace: 'nowrap',
    color: 'var(--color-text-slate)',
    padding: '0 10px',
    transition: 'all 0.9s cubic-bezier(0.19,1,0.22,1)',
    '&:hover': { background: 'var(--color-surface-muted)' },
  },
  dirBtn: {
    boxShadow: '0px 0px 3px 0px rgba(0,0,0,0.12)',
    background: 'var(--color-white)',
    cursor: 'pointer',
    borderRadius: '0 3px 3px 0',
    border: '1px solid var(--color-white)',
    height: '100%',
    width: 26,
    display: 'grid',
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    transition: 'all 0.9s cubic-bezier(0.19,1,0.22,1)',
    '&:hover': { background: 'var(--color-surface-muted)' },
  },
});

export function SortBar({
  options,
  activeLabel,
  direction,
  onOptionSelect,
  onDirectionToggle,
}: Props) {
  const classes = useStyles();
  return (
    <div className={classes.wrap}>
      <div className={classes.dropdown}>
        <div className={classes.dropdownActive}>
          {activeLabel}
          <IconChevronDown size={12} color="#555555" />
        </div>
        <div className={classes.dropdownOptionWrap}>
          <div className={classes.dropdownOptions}>
            {options.map((opt) => (
              <div key={opt.value} className={classes.option} onClick={() => onOptionSelect(opt)}>
                {opt.label}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={classes.dirBtn} onClick={onDirectionToggle}>
        {direction === 'desc' ? (
          <IconSortDescending size={12} color="#555555" />
        ) : (
          <IconSortAscending size={12} color="#555555" />
        )}
      </div>
    </div>
  );
}
