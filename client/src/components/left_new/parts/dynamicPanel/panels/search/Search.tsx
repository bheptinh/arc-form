import Material from '../common/Material';
import PanelStack from '../common/PanelStack';
import Main from './Main';

const screens = { main: () => <Main />, material: () => <Material /> };

const Search = () => <PanelStack screens={screens} />;

export default Search;
