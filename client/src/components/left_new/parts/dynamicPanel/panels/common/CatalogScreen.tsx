import 'simplebar-react/dist/simplebar.min.css';

import { ComponentProps, ReactNode, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';

import { selectActiveControlPanelModeData } from '../../../../../../redux/features/control/controlPanelSlice';
import AdditionalSettings from '../../navigation/components/AdditionalSettings';
import classes from './CatalogScreen.module.css';

type Props = {
  // the top row, e.g. <CatalogScreen.Header />
  header: ReactNode;
  // dims the content area, leaving the header usable
  isLoading?: boolean;
  // the scrolled content, usually a TileGrid; without it, and not loading, there is no content area
  children?: ReactNode;
  // the SimpleBar, e.g. to save and restore the scroll position
  scrollRef?: ComponentProps<typeof SimpleBar>['ref'];
};

/** A PanelStack screen with a header, a scrolled content area and a loading overlay. */
export default function CatalogScreen({ header, isLoading, children, scrollRef }: Props) {
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
      {(children != null || isLoading) && (
        <div className={classes.content}>
          <SimpleBar style={{ height: '100%' }} ref={scrollRef} autoHide={false} forceVisible="y">
            {children}
          </SimpleBar>
          <div
            className={classes.preloader}
            style={isLoading ? { opacity: 1 } : { opacity: 0, zIndex: -1 }}
          >
            <div className="preloader-cube"></div>
          </div>
        </div>
      )}
    </div>
  );
}

type HeaderProps = {
  icon: string;
  title: ReactNode;
  // the view settings button; off for screens that aren't a catalog
  settings?: boolean;
};

/** Icon, title and the view settings. */
function CatalogScreenHeader({ icon, title, settings = true }: HeaderProps) {
  return (
    <div className={classes.header}>
      <div className={classes.headerRow}>
        <div className={classes.headerName}>
          <div className={classes.headerIcon}>
            <img src={icon} />
          </div>
          <div className={classes.headerText}>{title}</div>
        </div>
        {settings && <CatalogScreenSettings />}
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
