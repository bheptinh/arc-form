import PanelStack from '../../common/PanelStack';
import Main from './Main';

const screens = { main: () => <Main /> };

const SelectedCover_constr = () => <PanelStack screens={screens} />;

export default SelectedCover_constr;
