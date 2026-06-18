import { IconX } from '@tabler/icons-react';
import ReactDOM from 'react-dom';
import { createUseStyles } from 'react-jss';

const useStyle = createUseStyles({
  planner_popup_close: {
    width: 20,
    height: 20,
    position: 'fixed',
    top: 8,
    right: 8,
    cursor: 'pointer',
    zIndex: 8,
    '& path': {
      transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
    },
    '&:hover': {
      '& path': {
        fill: '#BAE51F',
      },
    },
  },
  planner_popup_close_icon: {
    width: '100%',
  },
});

const CloseModeBtn = ({ onCloseMode, statusVisible, customStyles = {} }) => {
  const classes = useStyle();

  return ReactDOM.createPortal(
    <div
      className={classes.planner_popup_close}
      onClick={onCloseMode}
      style={{
        opacity: statusVisible ? 1 : 0,
        ...customStyles,
      }}
    >
      <IconX size={24} color="#2F2F2F" className={classes.planner_popup_close_icon} />
    </div>,
    document.body
  );
};

export default CloseModeBtn;
