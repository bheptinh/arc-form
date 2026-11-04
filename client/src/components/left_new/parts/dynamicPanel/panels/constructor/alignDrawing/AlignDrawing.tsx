import PanelStack from '../../common/PanelStack';
import Main from './Main';

const screens = { main: () => <Main /> };

const AlignDrawing = () => <PanelStack screens={screens} />;

export default AlignDrawing;
