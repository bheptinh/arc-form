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
    '&:hover $dropdownActive': { background: '#E9E9E9' },
    '&:hover $dropdownOptions': { transform: 'translateY(0)', pointerEvents: 'all' },
    '&:hover $dropdownActive svg': { transform: 'rotate(180deg)' },
  },
  dropdownActive: {
    boxShadow: '0px 0px 3px 0px rgba(0,0,0,0.12)',
    background: '#fff',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    borderRadius: '3px 0 0 3px',
    border: '1px solid #fff',
    height: '100%',
    display: 'grid',
    gridTemplateColumns: 'auto auto',
    gridGap: '20px',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#2A3435',
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
    background: '#fff',
    cursor: 'pointer',
    height: 30,
    display: 'flex',
    alignItems: 'center',
    fontSize: 12,
    whiteSpace: 'nowrap',
    color: '#2A3435',
    padding: '0 10px',
    transition: 'all 0.9s cubic-bezier(0.19,1,0.22,1)',
    '&:hover': { background: '#E9E9E9' },
  },
  dirBtn: {
    boxShadow: '0px 0px 3px 0px rgba(0,0,0,0.12)',
    background: '#fff',
    cursor: 'pointer',
    borderRadius: '0 3px 3px 0',
    border: '1px solid #fff',
    height: '100%',
    width: 26,
    display: 'grid',
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    transition: 'all 0.9s cubic-bezier(0.19,1,0.22,1)',
    '&:hover': { background: '#E9E9E9' },
  },
});

export function SortBar({ options, activeLabel, direction, onOptionSelect, onDirectionToggle }: Props) {
  const classes = useStyles();
  return (
    <div className={classes.wrap}>
      <div className={classes.dropdown}>
        <div className={classes.dropdownActive}>
          {activeLabel}
          <svg width="11" height="7" fill="none" viewBox="0 0 11 7">
            <path
              fill="#555"
              fillRule="evenodd"
              d="m9.514 1.18.408.414-4.526 4.57-.408-.413.003-.003L.92 1.575l.412-.41L5.4 5.335l4.114-4.154Z"
              clipRule="evenodd"
            />
          </svg>
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
          <svg width="15" height="11" fill="none" viewBox="0 0 15 11">
            <path
              fill="#555"
              d="M1.01 7.737a.48.48 0 0 0-.011.68l2.004 2.012c-.06-.026.044.046 0 0 .059.025.128.115.192.115.065 0 .123-.09.182-.115-.044.046.06-.026 0 0l2.005-2.013a.48.48 0 1 0-.69-.668L3.67 8.802V1.126a.48.48 0 1 0-.96 0v7.675L1.629 7.708c-.089-.091-.15-.104-.278-.106a.48.48 0 0 0-.342.135Zm11.8-3.658a.48.48 0 0 0-.48-.48H7.12a.48.48 0 0 0 0 .96h5.21a.48.48 0 0 0 .48-.48Zm-1.498 2.954a.48.48 0 0 0-.48-.48H7.119a.48.48 0 0 0 0 .96h3.713a.48.48 0 0 0 .48-.48ZM7.12 9.507a.48.48 0 1 0 0 .96h2.215a.48.48 0 0 0 0-.96H7.119ZM13.83.646H7.12a.48.48 0 0 0 0 .96h6.71a.48.48 0 1 1 0-.96Z"
            />
          </svg>
        ) : (
          <svg width="15" height="11" fill="none" viewBox="0 0 15 11">
            <path
              fill="#555"
              d="M1.009 3.764a.48.48 0 0 1 .341-.136c.128.002.19.015.278.107l1.081 1.093V1.126a.48.48 0 1 1 .96 0v7.676l1.022-1.064a.48.48 0 1 1 .69.668L3.376 10.42c-.059.026-.118.115-.182.115-.065 0-.134-.09-.193-.115-.044.046.06-.026 0 0L.998 8.406a.48.48 0 0 1 .011-.68v.038Zm11.8 3.658a.48.48 0 0 1-.48.48H7.12a.48.48 0 0 1 0-.96h5.21a.48.48 0 0 1 .48.48Zm-1.498-2.954a.48.48 0 0 1-.48.48H7.119a.48.48 0 0 1 0-.96h3.713a.48.48 0 0 1 .48.48ZM7.12 1.606a.48.48 0 1 1 0-.96h2.215a.48.48 0 0 1 0 .96H7.119ZM13.83 4.56H7.12a.48.48 0 0 1 0-.96h6.71a.48.48 0 1 1 0 .96Z"
            />
          </svg>
        )}
      </div>
    </div>
  );
}
