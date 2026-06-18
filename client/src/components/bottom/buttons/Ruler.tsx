import { IconRuler2 } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch } from 'react-redux';

import { useTranslation } from '../../../api/hooks/useTranslation';
import { planner } from '../../../initR2D';
import { removeQuickPanelAll } from '../../../redux/features/quickPanels/quickPanelsSlice';
import HoverComponent from '../../left_new/parts/controlPanel/components/HoverComponent';

const useStyles = createUseStyles({
  btn_ruler: {
    cursor: 'pointer',
    background: '#fff',
    borderRadius: 3,
    border: '1px solid #fff',
    display: 'flex',
    justifyContent: 'center',
    height: '100%',
    alignItems: 'center',
    position: 'relative',
    width: 30,
    marginRight: '1px',
    transition: 'background 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    '&:hover': {
      background: '#E9E9E9',
    },
  },
  btn_ruler_active: {
    background: '#B8E11F',
  },
});

const Ruler = (props) => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const translation = useTranslation();
  const [plannerConstrEvent, setPlannerConstrEvent] = useState(null);
  const [activeRuller, setActiveRuller] = useState(false);

  const onRulerClick = (e) => {
    dispatch(removeQuickPanelAll());
    planner.addRuler();
  };

  const onRullerActive = (e) => setPlannerConstrEvent(e.data.status);

  useEffect(() => {
    setActiveRuller(plannerConstrEvent);
  }, [plannerConstrEvent]);

  useEffect(() => {
    planner.apiConstr.addEventListener(planner.apiConstr.RULLER_ACTIVE, onRullerActive);
    planner.scene.addEventListener(planner.scene.RULLER_ACTIVE, onRullerActive);
    return () => {
      planner.apiConstr.removeEventListener(planner.apiConstr.RULLER_ACTIVE, onRullerActive);
      planner.scene.removeEventListener(planner.scene.RULLER_ACTIVE, onRullerActive);
    };
  }, []);

  return (
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: 30 }}
      exit={{ width: 0 }}
      transition={{ duration: 0.3 }}
      className={
        activeRuller ? classes.btn_ruler + ' ' + classes.btn_ruler_active : classes.btn_ruler
      }
      onClick={onRulerClick}
    >
      <HoverComponent
        hoverText={translation['HINT_BUTTON_ADD_RULER']}
        hoverTextPositionX={'left'}
        hoverTextPositionY={'top'}
      >
        <IconRuler2 size={20} color="#2A3435" />
      </HoverComponent>
    </motion.div>
  );
};

export default Ruler;
