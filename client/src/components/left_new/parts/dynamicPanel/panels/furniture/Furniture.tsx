import Catalog from '../common/Catalog';
import PanelStack from '../common/PanelStack';
import Products from '../common/Products';

const title = 'HINT_PRODUCTS_CATALOG';
const icon = '/src_designer/images/icon_mebli.svg';

const screens = {
  catalog: () => <Catalog breadcrumsTitle={title} panelPreviewIcon={icon} />,
  products: () => (
    <Products breadcrumsTitle={title} panelPreviewIcon={icon} showUploadNewPlashka={true} />
  ),
};

const Furniture = () => <PanelStack screens={screens} changesOn="id" />;

export default Furniture;
