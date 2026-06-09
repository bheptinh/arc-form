import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useSelector } from 'react-redux';

import { planner } from '../../../../../../../initR2D';
import { selectActiveControlPanelModeData } from '../../../../../../../redux/features/control/controlPanelSlice';
import { selectTranslation } from '../../../../../../../redux/features/language/languageSlice';

const useStyle = createUseStyles({
  planerEditFloorWr: {
    padding: 20,
    transition: 'all .5s cubic-bezier(0.19, 1, 0.22, 1)',
    borderRight: '1px solid #cdcdcd',
    height: '100%',
    background: '#ffffff',
  },
  planerShowCeiling: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 15,
  },
  planerDeleteFloor: {
    height: 120,
    border: '1px solid #d9d9d9',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
      background: '#FFCC00',
    },
  },
  planerDeleteFloorIcon: {
    width: 26,
    height: 34,
  },
  planerEditFloorInfo: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 15,
    color: '#505050',
  },
  roll_out_right: {
    transform: 'translateX(100%)',
  },
  showItemWr: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 10,
  },
  showItemIconWr: {},
  showItemIcon: {
    width: 20,
    cursor: 'pointer',
  },
  showItemInput: {
    color: '#444444',
    border: 'none',
    margin: '0 8px 0 4px',
    outline: 'none',
    padding: '3px 5px',
    maxWidth: 'calc(100% - 12px)',
    fontSize: 13,
  },
  showItemText: {
    color: '#444444',
    border: 'none',
    margin: '0 8px 0 4px',
    outline: 'none',
    padding: '3px 5px',
    maxWidth: 'calc(100% - 12px)',
    fontSize: 13,
  },
});

const Main = () => {
  const classes = useStyle();

  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const isAdded = lastHistoryElem?.isAdded;
  const translation = useSelector(selectTranslation);
  const currCover = planner.constr.selectedCovers()[0];

  const roomName = useRef();
  const areaText = useRef();
  const ceilingVisibleText = useRef();

  const [currentDataKey, setCurrentDataKey] = useState(null);
  const [currentCoverArea, setCurrentCoverArea] = useState(null);

  const [isRoomNameVisible, setRoomNameVisible] = useState();
  const [isAreaTextVisible, setAreaTextVisible] = useState();
  const [isCeilingVisible, setCeilingVisible] = useState();

  const [styleAnimation, setStyleAnimation] = useState(
    isAdded ? { transform: 'translateX(100%)' } : { transform: 'translateX(-100%)' }
  );

  const onSetCeilingVisible = (e) => {
    if (currCover) {
      currCover.data.ceiling.exists = !isCeilingVisible;
      currCover.data?.ceiling.dispatchUpdate && currCover.data.ceiling.dispatchUpdate();
      planner.mih()._currentViewer?.rendererUpdate();
      setCeilingVisible(!isCeilingVisible);
    }
  };

  const onSelectCover = (e) => setCurrentDataKey(e.data.key);

  const onChangeArea = (e) =>
    setCurrentCoverArea(
      planner.units.squareToString(planner.constr.selectedCovers()[0]?.getFillArea())
    );

  const onHideRoomName = (e) => {
    if (!currCover?.data.title) return;
    currCover.data.title.visible.viewConstructor = currCover.data.title.visible.view2d =
      !isRoomNameVisible;
    currCover.data.dispatchUpdate();
    WC.wallsEditor.titlesTool.updateValues(currCover.data.id);
    setRoomNameVisible(currCover.data.title.visible.viewConstructor);
  };

  const onHideAreaText = (e) => {
    if (!currCover?.data.title) return;
    currCover.data.title.areaVisible.viewConstructor = currCover.data.title.areaVisible.view2d =
      !isAreaTextVisible;
    currCover.data.dispatchUpdate();
    WC.wallsEditor.titlesTool.updateValues(currCover.data.id);
    setAreaTextVisible(currCover.data.title.areaVisible.viewConstructor);
  };

  useEffect(() => {
    const keyTimeout = setTimeout(() => setStyleAnimation({ transform: 'translateX(0%)' }), 50);
    planner.apiConstr.addEventListener(planner.apiConstr.SELECTED_COVER_AGAIN, onSelectCover);
    planner.apiConstr.addEventListener(planner.apiConstr.CHANGE_AREA_VALUE, onChangeArea);

    return () => {
      planner.apiConstr.removeEventListener(planner.apiConstr.SELECTED_COVER_AGAIN, onSelectCover);
      planner.apiConstr.removeEventListener(planner.apiConstr.CHANGE_AREA_VALUE, onChangeArea);
      clearTimeout(keyTimeout);
    };
  }, []);

  useEffect(() => {
    if (currCover) {
      setCurrentCoverArea(planner.units.squareToString(currCover.getFillArea()));
      setRoomNameVisible(currCover.data.title?.visible.viewConstructor);
      setAreaTextVisible(
        currCover.data.title ? currCover.data.title.areaVisible.viewConstructor : null
      );
      setCeilingVisible(currCover?.getCeilingVisible() ? true : false);
    }
  }, [currCover]);

  return (
    <div className={classes.planerEditFloorWr} key={currentDataKey} style={styleAnimation}>
      <div className={classes.showItemWr}>
        {
          <div className={classes.showItemIconWr} onClick={onHideRoomName}>
            {isRoomNameVisible ? (
              <svg
                className={classes.showItemIcon}
                width="17"
                height="11"
                viewBox="0 0 17 11"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="Group 858">
                  <path
                    id="Vector (Stroke)"
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M1.29185 5.40909C1.7668 6.04297 2.60517 7.03185 3.74832 7.8932C5.02799 8.85742 6.62925 9.61818 8.50001 9.61818C10.3708 9.61818 11.972 8.85742 13.2517 7.8932C14.3948 7.03186 15.2332 6.04298 15.7082 5.40909C15.2332 4.7752 14.3948 3.78632 13.2517 2.92498C11.972 1.96076 10.3708 1.2 8.50001 1.2C6.62925 1.2 5.02799 1.96076 3.74832 2.92498C2.60517 3.78633 1.7668 4.77521 1.29185 5.40909ZM0.157638 4.92719C1.10347 3.60183 4.08046 0 8.50001 0C12.9196 0 15.8965 3.60183 16.8424 4.92719C17.0525 5.22172 17.0525 5.59646 16.8424 5.89099C15.8965 7.21635 12.9196 10.8182 8.50001 10.8182C4.08046 10.8182 1.10347 7.21635 0.157638 5.89099C-0.0525461 5.59646 -0.0525461 5.22172 0.157638 4.92719Z"
                    fill="#444444"
                  />
                  <path
                    id="Vector"
                    d="M11.5881 5.40875C11.5881 7.11585 10.2042 8.49969 8.49714 8.49969C6.79015 8.49969 5.40625 7.11585 5.40625 5.40875C5.40625 4.94233 5.50959 4.4999 5.69463 4.10338C5.99312 3.46368 6.50421 2.94313 7.13695 2.63247C7.54738 2.431 8.00905 2.31787 8.49714 2.31787C10.2042 2.31787 11.5881 3.70175 11.5881 5.40875Z"
                    fill="#444444"
                  />
                </g>
              </svg>
            ) : (
              <svg className={classes.showItemIcon} viewBox="0 0 13 5" fill="none">
                <g opacity="0.99">
                  <path
                    d="M0.800515 0C1.57504 2.03156 3.78747 3.5 6.40052 3.5C9.01356 3.5 11.226 2.03156 12.0005 0H10.9077C10.1839 1.41856 8.48832 2.5 6.40052 2.5C4.31271 2.5 2.61709 1.41856 1.89336 0H0.800515Z"
                    fill="#444444"
                  />
                  <path
                    d="M2.00088 1.00026L2.79692 1.60551L1.56948 2.99657L0.773438 2.39132L2.00088 1.00026Z"
                    fill="#444444"
                  />
                  <path
                    d="M3.6706 2.55596L4.67465 2.84356L3.96832 4.79687L2.96426 4.50928L3.6706 2.55596Z"
                    fill="#444444"
                  />
                  <path
                    d="M8.49154 2.56038L7.47354 2.81562L8.1144 4.78832L9.13239 4.53308L8.49154 2.56038Z"
                    fill="#444444"
                  />
                  <path
                    d="M10.7964 1.00026L10.0004 1.60551L11.2716 3.05407L12.0676 2.44883L10.7964 1.00026Z"
                    fill="#444444"
                  />
                </g>
              </svg>
            )}
          </div>
        }
        <p className={classes.showItemInput} ref={roomName}>
          {translation['ROOM_TITLE_TEXT']}
        </p>
      </div>

      <div className={classes.showItemWr}>
        {
          <div className={classes.showItemIconWr} onClick={onHideAreaText}>
            {isAreaTextVisible ? (
              <svg
                className={classes.showItemIcon}
                width="17"
                height="11"
                viewBox="0 0 17 11"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="Group 858">
                  <path
                    id="Vector (Stroke)"
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M1.29185 5.40909C1.7668 6.04297 2.60517 7.03185 3.74832 7.8932C5.02799 8.85742 6.62925 9.61818 8.50001 9.61818C10.3708 9.61818 11.972 8.85742 13.2517 7.8932C14.3948 7.03186 15.2332 6.04298 15.7082 5.40909C15.2332 4.7752 14.3948 3.78632 13.2517 2.92498C11.972 1.96076 10.3708 1.2 8.50001 1.2C6.62925 1.2 5.02799 1.96076 3.74832 2.92498C2.60517 3.78633 1.7668 4.77521 1.29185 5.40909ZM0.157638 4.92719C1.10347 3.60183 4.08046 0 8.50001 0C12.9196 0 15.8965 3.60183 16.8424 4.92719C17.0525 5.22172 17.0525 5.59646 16.8424 5.89099C15.8965 7.21635 12.9196 10.8182 8.50001 10.8182C4.08046 10.8182 1.10347 7.21635 0.157638 5.89099C-0.0525461 5.59646 -0.0525461 5.22172 0.157638 4.92719Z"
                    fill="#444444"
                  />
                  <path
                    id="Vector"
                    d="M11.5881 5.40875C11.5881 7.11585 10.2042 8.49969 8.49714 8.49969C6.79015 8.49969 5.40625 7.11585 5.40625 5.40875C5.40625 4.94233 5.50959 4.4999 5.69463 4.10338C5.99312 3.46368 6.50421 2.94313 7.13695 2.63247C7.54738 2.431 8.00905 2.31787 8.49714 2.31787C10.2042 2.31787 11.5881 3.70175 11.5881 5.40875Z"
                    fill="#444444"
                  />
                </g>
              </svg>
            ) : (
              <svg className={classes.showItemIcon} viewBox="0 0 13 5" fill="none">
                <g opacity="0.99">
                  <path
                    d="M0.800515 0C1.57504 2.03156 3.78747 3.5 6.40052 3.5C9.01356 3.5 11.226 2.03156 12.0005 0H10.9077C10.1839 1.41856 8.48832 2.5 6.40052 2.5C4.31271 2.5 2.61709 1.41856 1.89336 0H0.800515Z"
                    fill="#444444"
                  />
                  <path
                    d="M2.00088 1.00026L2.79692 1.60551L1.56948 2.99657L0.773438 2.39132L2.00088 1.00026Z"
                    fill="#444444"
                  />
                  <path
                    d="M3.6706 2.55596L4.67465 2.84356L3.96832 4.79687L2.96426 4.50928L3.6706 2.55596Z"
                    fill="#444444"
                  />
                  <path
                    d="M8.49154 2.56038L7.47354 2.81562L8.1144 4.78832L9.13239 4.53308L8.49154 2.56038Z"
                    fill="#444444"
                  />
                  <path
                    d="M10.7964 1.00026L10.0004 1.60551L11.2716 3.05407L12.0676 2.44883L10.7964 1.00026Z"
                    fill="#444444"
                  />
                </g>
              </svg>
            )}
          </div>
        }
        <p className={classes.showItemText} ref={areaText}>
          {translation['TEXT_CONSTRUCTION_ELEMENT_AREA'] + ' ' + currentCoverArea}
        </p>
      </div>

      <div className={classes.showItemWr}>
        {
          <div className={classes.showItemIconWr} onClick={onSetCeilingVisible}>
            {isCeilingVisible ? (
              <svg
                className={classes.showItemIcon}
                width="17"
                height="11"
                viewBox="0 0 17 11"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="Group 858">
                  <path
                    id="Vector (Stroke)"
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M1.29185 5.40909C1.7668 6.04297 2.60517 7.03185 3.74832 7.8932C5.02799 8.85742 6.62925 9.61818 8.50001 9.61818C10.3708 9.61818 11.972 8.85742 13.2517 7.8932C14.3948 7.03186 15.2332 6.04298 15.7082 5.40909C15.2332 4.7752 14.3948 3.78632 13.2517 2.92498C11.972 1.96076 10.3708 1.2 8.50001 1.2C6.62925 1.2 5.02799 1.96076 3.74832 2.92498C2.60517 3.78633 1.7668 4.77521 1.29185 5.40909ZM0.157638 4.92719C1.10347 3.60183 4.08046 0 8.50001 0C12.9196 0 15.8965 3.60183 16.8424 4.92719C17.0525 5.22172 17.0525 5.59646 16.8424 5.89099C15.8965 7.21635 12.9196 10.8182 8.50001 10.8182C4.08046 10.8182 1.10347 7.21635 0.157638 5.89099C-0.0525461 5.59646 -0.0525461 5.22172 0.157638 4.92719Z"
                    fill="#444444"
                  />
                  <path
                    id="Vector"
                    d="M11.5881 5.40875C11.5881 7.11585 10.2042 8.49969 8.49714 8.49969C6.79015 8.49969 5.40625 7.11585 5.40625 5.40875C5.40625 4.94233 5.50959 4.4999 5.69463 4.10338C5.99312 3.46368 6.50421 2.94313 7.13695 2.63247C7.54738 2.431 8.00905 2.31787 8.49714 2.31787C10.2042 2.31787 11.5881 3.70175 11.5881 5.40875Z"
                    fill="#444444"
                  />
                </g>
              </svg>
            ) : (
              <svg className={classes.showItemIcon} viewBox="0 0 13 5" fill="none">
                <g opacity="0.99">
                  <path
                    d="M0.800515 0C1.57504 2.03156 3.78747 3.5 6.40052 3.5C9.01356 3.5 11.226 2.03156 12.0005 0H10.9077C10.1839 1.41856 8.48832 2.5 6.40052 2.5C4.31271 2.5 2.61709 1.41856 1.89336 0H0.800515Z"
                    fill="#444444"
                  />
                  <path
                    d="M2.00088 1.00026L2.79692 1.60551L1.56948 2.99657L0.773438 2.39132L2.00088 1.00026Z"
                    fill="#444444"
                  />
                  <path
                    d="M3.6706 2.55596L4.67465 2.84356L3.96832 4.79687L2.96426 4.50928L3.6706 2.55596Z"
                    fill="#444444"
                  />
                  <path
                    d="M8.49154 2.56038L7.47354 2.81562L8.1144 4.78832L9.13239 4.53308L8.49154 2.56038Z"
                    fill="#444444"
                  />
                  <path
                    d="M10.7964 1.00026L10.0004 1.60551L11.2716 3.05407L12.0676 2.44883L10.7964 1.00026Z"
                    fill="#444444"
                  />
                </g>
              </svg>
            )}
          </div>
        }
        <p className={classes.showItemText} ref={ceilingVisibleText}>
          {translation['TEXT_SHOW_CEIL']}
        </p>
      </div>
    </div>
  );
};

export default Main;
