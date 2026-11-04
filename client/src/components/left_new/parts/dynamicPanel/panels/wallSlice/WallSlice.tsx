import { useEffect } from 'react';

import { planner } from '../../../../../../initR2D';
import PanelStack from '../common/PanelStack';
import Main from './Main';

const screens = { main: () => <Main /> };

const WallSlice = () => {
  useEffect(() => {
    planner.scene.getConfigurator().appendCanvas();
  }, []);

  return <PanelStack screens={screens} />;
};

export default WallSlice;
