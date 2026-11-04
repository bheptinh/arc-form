import Catalog from '../common/Catalog';
import ColorPicker from '../common/ColorPicker';
import PanelStack from '../common/PanelStack';
import Products from '../common/Products';

const title = 'MENU_BTN_TEXT_DECOR';
const icon = '/src_designer/images/icon_decor.svg';

const screens = {
  catalog: () => <Catalog breadcrumsTitle={title} panelPreviewIcon={icon} />,
  products: () => <Products breadcrumsTitle={title} panelPreviewIcon={icon} />,
  colorpicker: () => (
    <ColorPicker
      breadcrumsTitle={title}
      panelPreviewIcon={icon}
      isAddSettingsDisabled={true}
      onDragColor={true}
    />
  ),
};

const Decor = () => <PanelStack screens={screens} changesOn="id" />;

export default Decor;
