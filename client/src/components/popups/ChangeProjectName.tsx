import { IconX } from '@tabler/icons-react';
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
    <div
      className={
        animPopupClass
          ? classes.planner_popup_wrap + ' ' + classes.planner_popup_wrap_show
          : classes.planner_popup_wrap
      }
      style={{ zIndex: popups.changeProjectName.zIndex }}
    >
      <div className={classes.planner_popup_wr}>
        <div className={classes.planner_popup_cont}>
          <div className={classes.planner_popup_close} onClick={onClickClosePopUp}>
            <IconX size={24} color="#2F2F2F" className={classes.planner_popup_close_icon} />
          </div>

          <form ref={changeProjectForm} onSubmit={onSubmit}>
            <div className={classes.text}> {translation['TEXT_ENTER_NAME_SCENE']} </div>
            <fieldset>
              <div className={classes.input_wr}>
                <input
                  className={classes.formInput}
                  type="text"
                  name="name"
                  defaultValue={projectActiveName}
                />
              </div>
            </fieldset>
            <fieldset className={classes.planner_btn_done_wrap}>
              <button className={classes.planner_btn} onClick={onClickClosePopUp}>
                {' '}
                {translation['BUTTON_CANCEL']}{' '}
              </button>
              <button
                className={classes.planner_btn_done}
                type="submit"
                disabled={renameMutation.isPending}
              >
                {renameMutation.isPending ? '...' : translation['BUTTON_OK']}
              </button>
            </fieldset>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangeProjectNamePopup;
