import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { useRef } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from '../../api/hooks/useTranslation';
import { projectsInfiniteQueryOptions, renameProject } from '../../api/projects';
import {
  closeActivePopup,
  selectPopups,
  setActivePopup,
} from '../../redux/features/popups/popupsSlice';
import DefaultModal from '../../shared-components/modals/default';
import TextInput from '../../shared-components/inputs/text-input';
import Button from '../../shared-components/inputs/button';

const useStyle = createUseStyles({
  planner_popup_wr: {
    maxWidth: 624,
    width: '100%',
  },
  planner_popup_cont: {
    color: '#000',
    backgroundColor: '#fff',
    borderRadius: 6,
    position: 'relative',
    height: '100%',
    padding: '64px 73px 71px',
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
});

const ChangeProjectNamePopup = (props) => {
  const classes = useStyle();
  const popups = useSelector(selectPopups);
  const translation = useTranslation();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const changeProjectForm = useRef(null);
  const popupData = popups.changeProjectName;
  const projectActiveName = popupData.data.name;
  const [animPopupClass, setAnimPopupClass] = useState(false);

  const renameMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => renameProject(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectsInfiniteQueryOptions.queryKey });
      dispatch(
        setActivePopup({
          name: 'completeMessage',
          positionX: 'left',
          data: 'NOTIFY_RENAME_PLAN_COMPLETE',
        })
      );
      setAnimPopupClass(false);
      setTimeout(() => dispatch(closeActivePopup({ name: 'changeProjectName' })), 500);
    },
    onError: () => {
      dispatch(setActivePopup({ name: 'alert', data: 'TEXT_ERROR_LOAD_DATA' }));
    },
  });

  const onClickClosePopUp = (e) => {
    e.preventDefault();
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'changeProjectName' })), 500);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const updatedName = e.target.elements.name.value;
    renameMutation.mutate({ id: popupData.data.id, name: updatedName });
  };

  useEffect(() => {
    const timer = setTimeout(() => setAnimPopupClass(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DefaultModal
      visible={animPopupClass}
      zIndex={popups.changeProjectName.zIndex}
      className={classes.planner_popup_wr}
      contentClassName={classes.planner_popup_cont}
      onClose={onClickClosePopUp}
    >
      <form ref={changeProjectForm} onSubmit={onSubmit}>
        <div className={classes.text}> {translation['TEXT_ENTER_NAME_SCENE']} </div>
        <TextInput name="name" defaultValue={projectActiveName} />
        <fieldset className={classes.planner_btn_done_wrap}>
          <Button variant="secondary" onClick={onClickClosePopUp}>
            {' '}
            {translation['BUTTON_CANCEL']}{' '}
          </Button>
          <Button type="submit" disabled={renameMutation.isPending}>
            {renameMutation.isPending ? '...' : translation['BUTTON_OK']}
          </Button>
        </fieldset>
      </form>
    </DefaultModal>
  );
};

export default ChangeProjectNamePopup;
