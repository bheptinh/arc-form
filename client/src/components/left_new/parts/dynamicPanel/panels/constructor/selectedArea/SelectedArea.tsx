import PanelStack from '../../common/PanelStack';
import Main from './Main';

const screens = { main: () => <Main /> };

const SelectedArea = () => <PanelStack screens={screens} />;

export default SelectedArea;
