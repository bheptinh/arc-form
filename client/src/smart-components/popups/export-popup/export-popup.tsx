import { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from '../../../api/hooks/useTranslation';
import {
  closeActivePopup,
  selectPopups,
  setActivePopup,
} from '../../../redux/features/popups/popupsSlice';
import { setActiveViewMode } from '../../../redux/features/viewMode/viewModeSlice';
import Radio from '../../../shared-components/inputs/radio';
import DefaultModal from '../../../shared-components/modals/default';

const useStyle = createUseStyles({
  planner_popup_wr: {
    maxWidth: 540,
    width: '100%',
  },
  planner_popup_cont: {
    color: 'var(--color-black)',
    backgroundColor: 'var(--color-white)',
    borderRadius: 6,
    position: 'relative',
    height: '100%',
    overflow: 'hidden',
  },
  planner_popup_export: {},
  export_button_recomm: {},
  formatColumns: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    textAlign: 'center',
    flexWrap: 'wrap',
    padding: '0 10px 0',
    margin: '20px 0 30px',
    position: 'relative',
    '&::after': {
      content: "''",
      width: 1,
      height: '100%',
      background: '#4C5D67',
      position: 'absolute',
      left: '50%',
      top: '0',
      display: 'inline-block',
      opacity: '.3',
    },
    '@media screen and (max-width: 950px)': {
      margin: '10px 0 12px',
    },
  },
  formatColumn: {
    width: '50%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  formatColumn_top: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 20,
    '& h2': {
      fontSize: 25,
      fontFamily: 'Roboto-Light, sans-serif',
      color: 'var(--color-text)',
      fontWeight: 400,
    },
    '& img': {
      maxHeight: '100%',
    },
    '@media screen and (max-width: 950px)': {
      height: 50,
      marginBottom: 7,
    },
  },
  planner_popup_export_top: {
    height: 120,
    display: 'grid',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--color-info-light)',
    position: 'relative',
    alignContent: 'center',
    textAlign: 'center',
    '& h2': {
      color: 'var(--color-white)',
      fontSize: 32,
      fontFamily: 'Roboto-Light, sans-serif',
      fontWeight: 300,
      marginBottom: 10,
      '@media screen and (max-width: 950px)': {
        fontSize: 20,
        marginBottom: 5,
      },
    },
    '& h3': {
      color: 'var(--color-white)',
      fontSize: 14,
      fontWeight: 400,
      '@media screen and (max-width: 950px)': {
        fontSize: 11,
      },
    },
    '@media screen and (max-width: 950px)': {
      height: 60,
    },
  },
  formatColumn_bottom: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  formatColumn_bottom_title: {
    display: 'flex',
    minHeight: 14,
    '& h3': {
      fontSize: 12,
      color: 'var(--color-text)',
      textTransform: 'uppercase',
      '@media screen and (max-width: 950px)': {
        fontSize: 11,
      },
    },
    '& span': {
      fontSize: 12,
      color: '#73909F',
      marginLeft: 5,
      '@media screen and (max-width: 950px)': {
        fontSize: 11,
      },
    },
  },
  formatColumn_bottom_formats: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  planner_popup_export_bottom: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 0 30px',
    flexDirection: 'column',
  },
  planner_popup_export_button: {
    marginTop: 22,
    cursor: 'pointer',
    height: '35px',
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'var(--color-text-strong)',
    fontSize: 14,
    borderRadius: 3,
    padding: '0 20px',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    minWidth: 96,
    outline: 'none',
    background: 'var(--color-accent-bright)',
    border: '1px solid var(--color-accent-bright)',
    textTransform: 'uppercase',
    '& svg': {
      width: 11,
      height: 15,
      marginLeft: 7,
    },
    '&:hover': {
      background: 'var(--color-accent-hover)',
    },
    '@media screen and (max-width: 950px)': {
      marginTop: 0,
      height: 26,
      fontSize: 12,
      minWidth: 88,
    },
  },
});

const ExportPopup = (props) => {
  const dispatch = useDispatch();
  const translation = useTranslation();
  const popups = useSelector(selectPopups);
  const [currentFormat, setCurrentFormat] = useState(null);
  const formats = [
    { format: 'ifc', recommended: ['Revit', 'Archicad'] },
    { format: 'blend', recommended: ['Blender'] },
    { format: 'fbx', recommended: ['3ds Max'] },
    { format: 'glb', recommended: ['Web'] },
    { format: 'dxf', recommended: ['AutoCAD'] },
    { format: 'obj', recommended: [] },
    { format: 'dae', recommended: [] },
  ];
  const formats2D = [
    { format: 'pdf' },
    // { format: 'jpg'}
  ];
  const [currentFormat2D, setCurrentFormat2D] = useState(null);

  const classes = useStyle();
  const [animPopupClass, setAnimPopupClass] = useState(false);

  const onContinue = async (e) => {
    if (currentFormat2D !== null) {
      dispatch(setActiveViewMode('view2d'));
      dispatch(setActivePopup({ name: 'export2DProjectPopup' }));
    } else if (currentFormat !== null)
      dispatch(
        setActivePopup({
          name: 'export3DProjectPopup',
          type: R2D.Storage.load('r2d_exportDownloadDetails') ? 'download' : 'predownload',
          data: formats[currentFormat]?.format,
        })
      );
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'exportPopup' })), 500);
  };

  const handleOptionChange = (index) => {
    setCurrentFormat(index);
    setCurrentFormat2D(null);
  };
  const handleOptionChange2D = (index) => {
    setCurrentFormat2D(index);
    setCurrentFormat(null);
  };

  const closeExportPopup = (e) => {
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'exportPopup' })), 500);
  };

  useEffect(() => {
    const timer = setTimeout(() => setAnimPopupClass(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DefaultModal
      visible={animPopupClass}
      zIndex={popups.exportPopup.zIndex}
      className={classes.planner_popup_wr}
      contentClassName={classes.planner_popup_cont}
      onClose={closeExportPopup}
    >
      <div className={classes.planner_popup_export}>
        <div className={classes.planner_popup_export_top}>
          <h2>{translation['EXPORT_PROJECT_TITLE']}</h2>
          <h3>{translation['EXPORT_PROJECT_CHOOSE']}</h3>
        </div>

        <div className={classes.formatColumns}>
          <div className={classes.formatColumn}>
            <div className={classes.formatColumn_top}>
              <h2>2D</h2>
              <img src="/src_designer/images/export_img_2d.png" />
            </div>
            <div className={classes.formatColumn_bottom}>
              <div className={classes.formatColumn_bottom_title}></div>
              <div className={classes.formatColumn_bottom_formats}>
                {formats2D.map((item, index) => (
                  <Radio
                    key={index}
                    name="react-tips"
                    id={'format2d_' + index}
                    value={item.format}
                    checked={formats2D[currentFormat2D]?.format === item.format}
                    onChange={() => handleOptionChange2D(index)}
                  >
                    {item.format.toUpperCase()}
                  </Radio>
                ))}
              </div>
            </div>
          </div>
          <div className={classes.formatColumn}>
            <div className={classes.formatColumn_top}>
              <h2>3D</h2>
              <img src="/src_designer/images/export_img_3d.png" />
            </div>
            <div className={classes.formatColumn_bottom}>
              <div className={classes.formatColumn_bottom_title}>
                <h3>{translation['EXPORT_PROJECT_FORMATS_TITLE']} - </h3>
                <span>{translation['EXPORT_PROJECT_FORMATS_RECOMMEND']}</span>
              </div>
              <div className={classes.formatColumn_bottom_formats}>
                {formats.map((item, index) => (
                  <Radio
                    key={index}
                    name="react-tips"
                    id={'format_' + index}
                    value={item.format}
                    checked={formats[currentFormat]?.format === item.format}
                    onChange={() => handleOptionChange(index)}
                  >
                    {item.format.toUpperCase()}
                    {item.recommended.length > 0 ? (
                      <span>
                        <span> - </span>
                        <span className={classes.export_button_recomm}>
                          {item.recommended.map(
                            (recommended) =>
                              recommended +
                              (recommended == item.recommended[item.recommended.length - 1]
                                ? ''
                                : ', ')
                          )}
                        </span>
                      </span>
                    ) : null}
                  </Radio>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className={classes.planner_popup_export_bottom}>
          <button
            className={classes.planner_popup_export_button}
            style={currentFormat == null && currentFormat2D == null ? { visibility: 'hidden' } : {}}
            onClick={onContinue}
          >
            {translation['BUTTON_OK']}
          </button>
        </div>
      </div>
    </DefaultModal>
  );
};

export default ExportPopup;
