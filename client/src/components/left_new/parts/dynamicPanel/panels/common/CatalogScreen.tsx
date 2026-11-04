import 'simplebar-react/dist/simplebar.min.css';

import { ReactNode, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';

import { selectActiveControlPanelModeData } from '../../../../../../redux/features/control/controlPanelSlice';
import AdditionalSettings from '../../navigation/components/AdditionalSettings';
import classes from './CatalogScreen.module.css';

type Props = {
  // the top row, e.g. <CatalogScreen.Header />
  header: ReactNode;
  isLoading?: boolean;
  // the scrolled content, usually a TileGrid; without it the screen has no content area
  children?: ReactNode;
};

/** A PanelStack screen with a header, a scrolled content area and a loading overlay. */
export default function CatalogScreen({ header, isLoading, children }: Props) {
  const history = useSelector(selectActiveControlPanelModeData).history;
  // the history step's isAdded, read once, picks the side the screen slides in from
  const [isAdded] = useState<boolean>(() => history[history.length - 1]?.isAdded);
  const [slidIn, setSlidIn] = useState(false);

  useEffect(() => setSlidIn(true), []);

  return (
    <div
      className={classes.screen}
      style={{ transform: `translateX(${slidIn ? '0%' : isAdded ? '100%' : '-100%'})` }}
    >
      {header}
      {children != null && (
        <div className={classes.content}>
          <SimpleBar style={{ height: '100%' }} autoHide={false} forceVisible="y">
            {children}
          </SimpleBar>
        </div>
      )}
      <div
        className={classes.preloader}
        style={isLoading ? { opacity: 1 } : { opacity: 0, zIndex: -1 }}
      >
        <div className="preloader-cube"></div>
      </div>
    </div>
  );
}

/** Icon, title and the view settings. */
function CatalogScreenHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className={classes.header}>
      <div className={classes.headerRow}>
        <div className={classes.headerName}>
          <div className={classes.headerIcon}>
            <img src={icon} />
          </div>
          <div className={classes.headerText}>{title}</div>
        </div>
        <CatalogScreenSettings />
      </div>
    </div>
  );
}

/** The tile size and view settings, hidden on phones. */
function CatalogScreenSettings() {
  const currOS = R2D.controller.getCurrentOS();
  const isCurrDeviceAPhone = currOS == 'iOS' || currOS == 'Android';
  return isCurrDeviceAPhone ? null : <AdditionalSettings hideCategoryTree={true} />;
}

CatalogScreen.Header = CatalogScreenHeader;
CatalogScreen.Settings = CatalogScreenSettings;
