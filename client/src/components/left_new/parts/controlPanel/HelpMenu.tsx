import { IconQuestionMark } from '@tabler/icons-react';
import { useDispatch } from 'react-redux';

import { useLanguages } from '../../../../api/hooks/useLanguages';
import { useTranslation } from '../../../../api/hooks/useTranslation';
import { setActivePopup } from '../../../../redux/features/popups/popupsSlice';
import IconButton from '../../../../shared-components/inputs/icon-button';
import Menu from '../../../../shared-components/Menu';
import classes from './control-panel.module.css';

const youTubeLinks: Record<string, string> = {
  en: 'https://www.youtube.com/playlist?list=PLpksFTMOBAbtlpPja4fqttp-Qu2rE8hz9',
  ru: 'https://www.youtube.com/playlist?list=PLpksFTMOBAbtlpPja4fqttp-Qu2rE8hz9',
  ua: 'https://www.youtube.com/playlist?list=PLpksFTMOBAbsw6r7Jod8faobeiCj73tF4',
};

const HelpMenu = () => {
  const dispatch = useDispatch();
  const translation = useTranslation();
  const languages = useLanguages();
  const currentLanguage = languages?.find((i) => i?.current == 1)?.code;

  const currOS = R2D.controller.getCurrentOS();
  const isCurrDeviceAPhone = currOS == 'iOS' || currOS == 'Android';

  const onClickVideos = () => {
    window.open(youTubeLinks[currentLanguage ?? 'en'] || youTubeLinks['en'], '_blank');
  };

  const onClickTips = () => {
    dispatch(setActivePopup({ name: 'tipsPopup' }));
  };

  const onClickSupport = () => {
    throw new Error('Support email is currently unavailable');
    // window.location.href = 'mailto:support@roomtodo.com?subject=support:%20';
  };

  return (
    <Menu
      className={classes.menu}
      trigger={
        <IconButton
          variant="dark"
          hideTooltip
          className={classes.help}
          icon={<IconQuestionMark size={20} />}
          label={translation['FR_SUPPORT']}
        />
      }
      items={[
        {
          icon: <img src="/src_designer/images/menu_help_videos.svg" />,
          label: translation['TEXT_HELP_VIDEOS'],
          onSelect: onClickVideos,
        },
        {
          icon: <img src="/src_designer/images/menu_help_hotkeys.svg" />,
          label: translation['TEXT_HELP_HOT_KEYS'],
          onSelect: onClickTips,
          visible: !isCurrDeviceAPhone,
        },
        {
          icon: <img src="/src_designer/images/menu_help_contactsus.svg" />,
          label: translation['TEXT_HELP_SUPPORT'],
          onSelect: onClickSupport,
        },
      ]}
    />
  );
};

export default HelpMenu;
