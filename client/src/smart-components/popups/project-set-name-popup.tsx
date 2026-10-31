// FIXME: refactor this component

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useRef } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from '../../api/hooks/useTranslation';
import { copyProject, projectsInfiniteQueryOptions, renameProject } from '../../api/projects';
import { planner, user } from '../../initR2D';
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
import { confirm } from '../../shared-components/ConfirmDialog';
import TextInput from '../../shared-components/inputs/text-input';
import DefaultModal from '../../shared-components/modals/default';
import { createProjectUrl } from '../../utils/UrlHelper';
import Button from '../../shared-components/inputs/button';

const useStyle = createUseStyles({
  formContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    maxWidth: 400,
    margin: '0 auto',
  },
});

export default function ProjectSetNamePopup() {
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

  const renameMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => renameProject(id, name),
  });

  const copyMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => copyProject(id, name),
  });

  if (popupType == 'copy') {
    projectActiveName = projectToOpen;
  }

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
        if (user.data.autoSave == null) {
          dispatch(setActivePopup({ name: 'autoSaveEnable' }));
        }
      }

      planner.scene.clearSceneAutoSaveServer();
      if (userProfileData?.autoSave) {
        planner.scene.sceneAutoSaveServer(user.getKey());
      }
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

    planner.apiScene.dispatchEvent(new Event(planner.apiScene.PROJECTS_UPDATE, {}));

    dispatch(updatePreloaderStatus(false));
    dispatch(closeActivePopup({ name: 'setProjectName' }));
  };

  const onClickClosePopUp = () => {
    setTimeout(() => dispatch(closeActivePopup({ name: 'setProjectName' })), 500);
  };

  useEffect(() => {
    if (renameMutation.isSuccess) {
      const { name } = renameMutation.variables!;
      queryClient.invalidateQueries({ queryKey: projectsInfiniteQueryOptions.queryKey });
      dispatch(updatePreloaderStatus(false));
      dispatch(
        setActivePopup({
          name: 'completeMessage',
          positionX: 'left',
          data: 'NOTIFY_RENAME_PLAN_COMPLETE',
        })
      );
      if (addType == 'configRename') {
        R2D.postMessageToParent(
          JSON.stringify({
            action: 'project_renamed',
            data: { id: R2D.scene.getProjectId(), name, hash: R2D.scene.getProjectHash() },
          })
        );
      }
      dispatch(setActiveProjectName(name));
      setTimeout(() => dispatch(closeActivePopup({ name: 'setProjectName' })), 500);
    }
    if (renameMutation.isError) {
      dispatch(updatePreloaderStatus(false));
      dispatch(setActivePopup({ name: 'alert', data: 'NOTIFY_RENAME_PLAN_ERROR' }));
    }
  }, [renameMutation.status]);

  useEffect(() => {
    if (copyMutation.isSuccess) {
      const newProject = copyMutation.data!;
      queryClient.invalidateQueries({ queryKey: projectsInfiniteQueryOptions.queryKey });
      dispatch(updatePreloaderStatus(false));
      setTimeout(() => dispatch(closeActivePopup({ name: 'setProjectName' })), 500);
      (async () => {
        const ok = await confirm('Open the copied project?');
        if (ok) {
          window.history.replaceState(null, '', createProjectUrl(newProject.hash));
          window.location.reload();
        }
      })();
    }
    if (copyMutation.isError) {
      dispatch(updatePreloaderStatus(false));
      dispatch(setActivePopup({ name: 'alert', data: 'TEXT_ERROR_LOAD_DATA' }));
    }
  }, [copyMutation.status]);

  const classes = useStyle();

  return (
    <DefaultModal
      title={translation['PROJECT_EDIT_NAME_DESC']}
      onClose={() => dispatch(closeActivePopup({ name: 'setProjectName' }))}
    >
      <form ref={changeProjectForm} onSubmit={onSubmit} className={classes.formContent}>
        <TextInput
          inset
          name="name"
          type="text"
          defaultValue={projectActiveName.name}
          label={translation['TEXT_ENTER_NAME_SCENE']}
          required
          placeholder={translation['DEFAULT_SCENE_NAME']}
        />

        <DefaultModal.Actions>
          <Button variant="secondary" onClick={onClickClosePopUp} type="button">
            {translation['BUTTON_CANCEL']}
          </Button>
          <Button type="submit">{translation['BUTTON_OK']}</Button>
        </DefaultModal.Actions>
      </form>
    </DefaultModal>
  );
}
