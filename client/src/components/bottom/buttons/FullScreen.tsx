import React, { useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useSelector } from 'react-redux';

import { planner } from '../../../initR2D';
import { selectTranslation } from '../../../redux/features/language/languageSlice';
import HoverComponent from '../../left_new/parts/controlPanel/components/HoverComponent';

const useStyle = createUseStyles({
  fullScreen_main: {
    cursor: 'pointer',
    background: '#fff',
    borderRadius: 3,
    border: '1px solid #fff',
    display: 'flex',
    justifyContent: 'center',
    height: '100%',
    alignItems: 'center',
    position: 'relative',
    minWidth: 30,
    marginRight: '1px',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    '&:hover': {
      background: '#E9E9E9',
    },
  },
});
const FullScreen = (props) => {
  const classes = useStyle();

  const [isFullScreen, setIsFullScreen] = useState(false);

  const onClickFullScreen = (e) => {
    isFullScreen ? planner.fullscreenOff() : planner.fullscreen(false);
    setIsFullScreen(!isFullScreen);
  };
  const translation = useSelector(selectTranslation);
  const hoverButton = useRef(null);
  return (
    <div className={classes.fullScreen_main} onClick={onClickFullScreen} ref={hoverButton}>
      {isFullScreen ? (
        <HoverComponent
          hoverText={translation['HINT_FULLSCREEN']}
          parentRef={hoverButton}
          hoverTextPositionX={'left'}
          hoverTextPositionY={'top'}
        >
          <svg width="17" height="17" viewBox="0 0 23 23" fill="none">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M20.526 3.10408L19.8188 2.39697L15.2776 6.93818L15.2704 3.71242L14.2586 3.71016L14.2697 8.65133L15.2815 8.65359L15.2815 8.65112L19.2083 8.65991L19.2061 7.64808L15.9892 7.64088L20.526 3.10408Z"
              fill="#2A3435"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M2.91985 19.747L3.62695 20.4541L8.18281 15.8982L8.19003 19.123L9.20186 19.1253L9.1908 14.1841L8.17897 14.1819L8.17898 14.1843L4.2521 14.1755L4.25437 15.1874L7.47227 15.1946L2.91985 19.747Z"
              fill="#2A3435"
            />
          </svg>
        </HoverComponent>
      ) : (
        <HoverComponent
          hoverText={translation['HINT_FULLSCREEN']}
          parentRef={hoverButton}
          hoverTextPositionX={'left'}
          hoverTextPositionY={'top'}
        >
          <svg width="17" height="17" viewBox="0 0 23 23" fill="none">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M13.9194 8.29436L14.6265 9.00146L19.1677 4.46025L19.1749 7.68601L20.1867 7.68828L20.1757 2.74711L19.1638 2.74484L19.1638 2.74732L15.237 2.73853L15.2392 3.75035L18.4562 3.75755L13.9194 8.29436Z"
              fill="#2A3435"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M9.54109 14.5411L8.83398 13.834L4.27813 18.3898L4.27091 15.1651L3.25908 15.1628L3.27014 20.104L4.28197 20.1062L4.28196 20.1038L8.20883 20.1125L8.20657 19.1007L4.98867 19.0935L9.54109 14.5411Z"
              fill="#2A3435"
            />
          </svg>
        </HoverComponent>
      )}
    </div>
  );
};

export default FullScreen;
