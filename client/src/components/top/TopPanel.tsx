import { createUseStyles } from 'react-jss';
import { useSelector } from 'react-redux';

import { user } from '../../initR2D';
import {
  selectIsProjectBelongToLoggedUser,
  selectIsProjectOnlyView,
} from '../../redux/features/common/commonSlice';
import { selectUserProfileData } from '../../redux/features/user/userSlice';
import { selectActiveViewMode } from '../../redux/features/viewMode/viewModeSlice';
import {
  Projects,
  RealisticImageButton,
  SaveButton,
  SendARequestButton,
  UndoRedoButtons,
} from './buttons/Buttons';

const useStyles = createUseStyles({
  top: {
    display: 'flex',
  },
  bar_btns_wr: {
    display: 'flex',
    gridGap: 21,
    height: 30,
    whiteSpace: 'nowrap',
    marginLeft: 2,
    '@media screen and (max-width: 950px)': {
      gridGap: 8,
    },
  },
  bar_btns_flex: {
    display: 'flex',
  },
  menuTop: {},
  barUndoRedoBtns: {
    display: 'flex',
    boxShadow: '0px 0px 3px 0px rgba(0, 0, 0, 0.12)',
    background: 'var(--color-white)',
    borderRadius: 3,
    border: '1px solid var(--color-white)',
  },
});

const TopPanel = (props) => {
  const classes = useStyles();

  const activeViewMode = useSelector(selectActiveViewMode);
  const userData = useSelector(selectUserProfileData);

  const configTopProject = R2D.config.data.ui.top_project;
  const configTopSave = R2D.config.data.ui.top_save;
  const configTopRender = R2D.config.data.ui.top_render;
  const configSendRequest = R2D.config.data.ui.send_a_request;

  const isProjectBelongToLoggedUser = useSelector(selectIsProjectBelongToLoggedUser);
  const isProjectOnlyView = useSelector(selectIsProjectOnlyView);

  const currOS = R2D.controller.getCurrentOS();
  const isCurrDeviceAPhone = currOS == 'iOS' || currOS == 'Android';

  return (
    <div className={classes.top}>
      {!isProjectBelongToLoggedUser && isProjectOnlyView ? (
        <div className={classes.bar_btns_wr}>
          <div className={classes.bar_btns_flex + ' ' + classes.menuTop}>
            {configTopProject ? <Projects /> : null}
          </div>
        </div>
      ) : activeViewMode == 'tileConfig' ? (
        <div className={classes.bar_btns_wr}>
          <div className={classes.barUndoRedoBtns}>{<UndoRedoButtons />}</div>
        </div>
      ) : (
        <div className={classes.bar_btns_wr}>
          <div className={classes.bar_btns_flex + ' ' + classes.menuTop}>
            {configTopProject ? <Projects /> : null}
            {configTopRender && !isCurrDeviceAPhone ? <RealisticImageButton /> : null}
            {configTopSave &&
            (!userData?.autoSave ||
              (userData?.autoSave &&
                (!R2D.controller.getProjectId() ||
                  R2D.controller.getProjectUserKey() != user.getKey()))) ? (
              <SaveButton />
            ) : null}

            <div className={classes.barUndoRedoBtns}>
              <UndoRedoButtons />
            </div>
          </div>

          {configSendRequest ? (
            <div className={classes.bar_btns_flex}>
              <SendARequestButton />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default TopPanel;
