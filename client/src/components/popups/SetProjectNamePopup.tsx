import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { useRef } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { planner, user } from '../../initR2D';
import { copyProject, projectsInfiniteQueryOptions, renameProject } from '../../api/projects';
import { updateIsProjectBelongToLoggedUser } from '../../redux/features/common/commonSlice';
import { updatePreloaderStatus } from '../../redux/features/common/commonSlice';
import {
  closeActivePopup,
  selectPopups,
  setActivePopup,
} from '../../redux/features/popups/popupsSlice';
import {
  selectUserProfileData,
  selectUserProjectActive,
  setActiveProjectName,
  setProfileData,
  setProjectPlan,
} from '../../redux/features/user/userSlice';
import { createProjectUrl } from '../../utils/UrlHelper';
import { useTranslation } from '../../api/hooks/useTranslation';

const useStyle = createUseStyles({
  planner_popup_wrap: {
    height: '100%',
    width: '100%',
    position: 'absolute',
    top: '0%',
    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
    opacity: '0',
    pointerEvents: 'none',
    zIndex: '101',
    WebkitPerspective: '800px',
    perspective: '800px',
    overflow: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.2)',
  },
  planner_popup_wrap_show: {
    opacity: '1',
    pointerEvents: 'auto',
    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
    '& $planner_popup_wr': {
      transform: 'scale(1)',
    },
  },
  planner_popup_wr: {
    color: '#000',
    maxWidth: 624,
    width: '100%',
    maxHeight: '90%',
    transform: 'scale(0)',
    boxShadow: '0px 1px 10px 0px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
  },
  planner_popup_cont: {
    color: '#000',
    backgroundColor: '#fff',
    borderRadius: 6,
    position: 'relative',
    height: '100%',
    padding: '64px 73px 71px',
  },
  planner_popup_close: {
    width: 20,
    height: 20,
    position: 'absolute',
    top: 8,
    right: 8,
    cursor: 'pointer',
    zIndex: '2',
    '& path': {
      transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
    },
    '&:hover': {
      '& path': {
        fill: '#a0a0a0',
      },
    },
  },
  planner_popup_close_icon: {
    width: '100%',
  },
  text: {
    color: '#373737',
    fontSize: 16,
    textAlign: 'center',
    '@media screen and (max-width: 950px)': {
      fontSize: 14,
    },
  },
  planner_btn_done_wrap: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 17,
  },
  planner_btn: {
    cursor: 'pointer',
    height: '35px',
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#2B2B2B',
    fontSize: 14,
    borderRadius: 3,
    padding: '0 20px',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    minWidth: 120,
    outline: 'none',
    background: '#fff',
    textTransform: 'uppercase',
    border: '1px solid #000',
    margin: '0 3px',
    '&:hover': {
      background: '#E9E9E9',
    },
    '@media screen and (max-width: 950px)': {
      fontSize: 12,
      height: '26px',
      minWidth: 88,
    },
  },
  planner_btn_done: {
    cursor: 'pointer',
    height: '35px',
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#2B2B2B',
    fontSize: 14,
    borderRadius: 3,
    padding: '0 20px',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    minWidth: 120,
    border: 'none',
    outline: 'none',
    background: '#BBE521',
    textTransform: 'uppercase',
    margin: '0 3px',
    '&:hover': {
      background: '#8fc32d',
    },
    '@media screen and (max-width: 950px)': {
      fontSize: 12,
      height: '26px',
      minWidth: 88,
    },
  },
  input_wr: {
    color: '#fff',
    width: '100%',
    margin: 'auto',
    marginTop: 15,
  },
  formInput: {
    paddingLeft: '5px',
    fontSize: '14px',
    color: '#000',
    width: '100%',
    border: '1px solid #e8dede',
    height: '30px',
    background: '#ffffff',
    outline: 'none',
    resize: 'none',
    transition: 'all 0.4s ease-out',
    borderRadius: '3px',
    '@media screen and (max-width: 950px)': {
      height: 26,
      fontSize: 11,
    },
  },
});

const SetProjectNamePopup = (props) => {
  const popups = useSelector(selectPopups);
  const translation = useTranslation();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const userProfileData = useSelector(selectUserProfileData);
  let projectActiveName = useSelector(selectUserProjectActive);
  const popupType = popups.setProjectName.type;
  const projectToOpen = popups.setProjectName.data;
  const addType = popups.setProjectName.addType;
  const changeProjectForm = useRef(null);
  const [animPopupClass, setAnimPopupClass] = useState(false);

  const renameMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => renameProject(id, name),
  });

  const copyMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => copyProject(id, name),
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: projectsInfiniteQueryOptions.queryKey });
      dispatch(updatePreloaderStatus(false));
      dispatch(
        setActivePopup({
          name: 'confirm',
          type: 'project_copied_open',
          data: { id: newProject.id, name: newProject.name, hash: newProject.hash },
        })
      );
      dispatch(closeActivePopup({ name: 'setProjectName' }));
    },
    onError: () => {
      dispatch(updatePreloaderStatus(false));
      dispatch(setActivePopup({ name: 'alert', data: 'TEXT_ERROR_LOAD_DATA' }));
    },
  });

  if (popupType == 'copy') projectActiveName = projectToOpen;

  const onSubmit = async (e) => {
    e.preventDefault();
    dispatch(updatePreloaderStatus(true));
    const projectName = e.target.elements.name.value;

    if (popupType == 'saveAs' && projectName == projectActiveName.name) {
      const project = { name: projectName, createNew: false };
      const result = await planner.scene.saveProject(project);
      if (result?.type == 'error') {
        dispatch(updatePreloaderStatus(false));
        return dispatch(
          setActivePopup({ name: 'alert', data: result?.data || 'TEXT_ERROR_LOAD_DATA' })
        );
      }
    }
    if (
      popupType == 'create' ||
      popupType == 'createBeforeOpen' ||
      popupType == 'saveBeforeCreate' ||
      (popupType == 'saveAs' && projectName != projectActiveName.name)
    ) {
      const project = { name: projectName, createNew: false };
      if (popupType == 'saveAs' || R2D.controller.getProjectUserKey() != user.getKey()) {
        project.createNew = true;
      }
      const result = await planner.scene.saveProject(project);
      if (result?.type == 'error') {
        dispatch(updatePreloaderStatus(false));
        return dispatch(
          setActivePopup({ name: 'alert', data: result?.data || 'TEXT_ERROR_LOAD_DATA' })
        );
      }

      const response = await user.loadProfileData();
      if (response.type == 'error')
        dispatch(setActivePopup({ name: 'alert', data: response.data }));
      else dispatch(setProfileData(response));
    }
    if (popupType == 'rename') {
      renameMutation.mutate({ id: R2D.scene.getProjectId(), name: projectName });
      return;
    }
    if (popupType == 'copy') {
      copyMutation.mutate({ id: projectToOpen.id, name: projectName });
      return;
    }
    if (popupType == 'create' || popupType == 'saveAs') {
      dispatch(
        setActivePopup({ name: 'completeMessage', positionX: 'left', data: 'NOTIFY_SAVE_COMPLETE' })
      );
      R2D.scene.updateProjectUserPlan('free');
      dispatch(setProjectPlan('free'));
      planner.scene.setIsProjectBelongToLoggedUserStatus(
        R2D.scene.getProjectUserKey() == user.getKey()
      );
      dispatch(updateIsProjectBelongToLoggedUser(R2D.scene.getProjectUserKey() == user.getKey()));

      if (addType == 'configCreate') {
        R2D.postMessageToParent(
          JSON.stringify({
            action: 'project_saved',
            data: {
              id: R2D.scene.getProjectId(),
              name: R2D.scene.getProjectName(),
              hash: R2D.scene.getProjectHash(),
            },
          })
        );
      } else {
        window.history.replaceState(null, null, createProjectUrl(R2D.scene.getProjectHash()));
        dispatch(setActiveProjectName(projectName));
        user.data.autoSave == null && dispatch(setActivePopup({ name: 'autoSaveEnable' }));
      }

      planner.scene.clearSceneAutoSaveServer();
      userProfileData?.autoSave && planner.scene.sceneAutoSaveServer(user.getKey());
    }
    if (popupType == 'saveBeforeCreate') {
      dispatch(
        setActivePopup({ name: 'completeMessage', positionX: 'left', data: 'NOTIFY_SAVE_COMPLETE' })
      );

      setTimeout(() => {
        planner.scene.clearSceneAutoSaveStorage();
        window.history.replaceState(null, null, createProjectUrl(''));
        window.location.reload();
      }, 1000);
    }
    if (popupType == 'createBeforeOpen') {
      planner.scene.clearSceneAutoSaveStorage();
      window.history.replaceState(null, null, createProjectUrl(projectToOpen.hash));
      window.location.reload();
    }

    popups.projectsPopup.status &&
      planner.apiScene.dispatchEvent(new Event(planner.apiScene.PROJECTS_UPDATE, {}));

    dispatch(updatePreloaderStatus(false));
    dispatch(closeActivePopup({ name: 'setProjectName' }));
  };

  const onClickClosePopUp = (e) => {
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'setProjectName' })), 500);
  };

  useEffect(() => {
    if (renameMutation.isSuccess) {
      const { name } = renameMutation.variables!;
      queryClient.invalidateQueries({ queryKey: projectsInfiniteQueryOptions.queryKey });
      dispatch(updatePreloaderStatus(false));
      dispatch(setActivePopup({ name: 'completeMessage', positionX: 'left', data: 'NOTIFY_RENAME_PLAN_COMPLETE' }));
      if (addType == 'configRename') {
        R2D.postMessageToParent(
          JSON.stringify({
            action: 'project_renamed',
            data: { id: R2D.scene.getProjectId(), name, hash: R2D.scene.getProjectHash() },
          })
        );
      }
      dispatch(setActiveProjectName(name));
      setAnimPopupClass(false);
      setTimeout(() => dispatch(closeActivePopup({ name: 'setProjectName' })), 500);
    }
    if (renameMutation.isError) {
      dispatch(updatePreloaderStatus(false));
      dispatch(setActivePopup({ name: 'alert', data: 'NOTIFY_RENAME_PLAN_ERROR' }));
    }
  }, [renameMutation.status]);

  const classes = useStyle();

  useEffect(() => {
    const timer = setTimeout(() => setAnimPopupClass(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={
        animPopupClass
          ? classes.planner_popup_wrap + ' ' + classes.planner_popup_wrap_show
          : classes.planner_popup_wrap
      }
      style={{ zIndex: popups.setProjectName.zIndex }}
    >
      <div className={classes.planner_popup_wr}>
        <div className={classes.planner_popup_cont}>
          <div className={classes.planner_popup_close} onClick={onClickClosePopUp}>
            <svg
              width="25"
              height="25"
              fill="none"
              viewBox="0 0 25 25"
              className={classes.planner_popup_close_icon}
            >
              <path
                fill="#2F2F2F"
                fillRule="evenodd"
                d="M.102 1.417 1.22.329l12.34 12.07-.007.006v.002l-.23.221-.88.858-.005-.005L1.172 24.329.064 23.233l11.259-10.842L.103 1.417Z"
                clipRule="evenodd"
              />
              <path
                fill="#2F2F2F"
                fillRule="evenodd"
                d="M.102 1.417 1.22.329l12.34 12.07-.007.006v.002l-.23.221-.88.858-.005-.005L1.172 24.329.064 23.233l11.259-10.842L.103 1.417Z"
                clipRule="evenodd"
              />
              <path
                fill="#2F2F2F"
                fillRule="evenodd"
                d="M24.73 1.417 23.613.329 11.273 12.4l.008.006-.002.002.23.221.881.858.005-.005L23.66 24.329l1.108-1.096L13.51 12.391 24.73 1.417Z"
                clipRule="evenodd"
              />
              <path
                fill="#2F2F2F"
                fillRule="evenodd"
                d="M24.73 1.417 23.613.329 11.273 12.4l.008.006-.002.002.23.221.881.858.005-.005L23.66 24.329l1.108-1.096L13.51 12.391 24.73 1.417Z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <form ref={changeProjectForm} onSubmit={onSubmit}>
            <div className={classes.text}> {translation['TEXT_ENTER_NAME_SCENE']} </div>
            <fieldset>
              <div className={classes.input_wr}>
                <input
                  className={classes.formInput}
                  type="text"
                  name="name"
                  defaultValue={projectActiveName.name || translation['DEFAULT_SCENE_NAME']}
                />
              </div>
            </fieldset>
            <fieldset className={classes.planner_btn_done_wrap}>
              <button className={classes.planner_btn} onClick={onClickClosePopUp} type="button">
                {' '}
                {translation['BUTTON_CANCEL']}{' '}
              </button>
              <button className={classes.planner_btn_done} type="submit">
                {' '}
                {translation['BUTTON_OK']}{' '}
              </button>
            </fieldset>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetProjectNamePopup;
