import Material from '../common/Material';
import PanelStack from '../common/PanelStack';
import Main from './Main';

const screens = { main: Main, material: Material };

const UserUpload = () => <PanelStack screens={screens} />;

export default UserUpload;
