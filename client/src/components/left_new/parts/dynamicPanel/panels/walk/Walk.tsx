import PanelStack from '../common/PanelStack';
import Panorams from './components/Panorams';

const screens = { panorams: Panorams };

const Walk = () => <PanelStack screens={screens} />;

export default Walk;
