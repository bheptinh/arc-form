import { AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';

import { selectQuickPanels } from '../../redux/features/quickPanels/quickPanelsSlice';
import Delete from './Delete';
import Helper from './Helper';
import HelperCarpet from './HelperCarpet';
import HelperGroup from './HelperGroup';
import HelperLogoMesh from './HelperLogoMesh';
import HelperModel from './HelperModel';
import HelperPlinth from './HelperPlinth';
import HelperPortrets from './HelperPortrets';

const QuickPanels = () => {
  const quickPanels = useSelector(selectQuickPanels);

  return (
    <AnimatePresence mode="wait">
      {quickPanels.helper.status == true ? <Helper key={'helper'} /> : null}
      {quickPanels.delete.status == true ? <Delete key={'delete'} /> : null}
      {quickPanels.helper_model.status == true ? <HelperModel key={'helper_model'} /> : null}
      {quickPanels.helper_plinth.status == true ? <HelperPlinth key={'helperPlinth'} /> : null}
      {quickPanels.helper_carpet.status == true ? <HelperCarpet key={'helperCarpet'} /> : null}
      {quickPanels.helper_portrets.status == true ? (
        <HelperPortrets key={'helperPortrets'} />
      ) : null}
      {quickPanels.helper_group.status == true ? <HelperGroup key={'helperGroup'} /> : null}
      {quickPanels.helper_logo_mesh.status == true ? (
        <HelperLogoMesh key={'helper_logo_mesh'} />
      ) : null}
    </AnimatePresence>
  );
};

export default QuickPanels;
