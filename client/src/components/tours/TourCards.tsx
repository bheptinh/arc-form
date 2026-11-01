import { IconFileSymlink, IconPlus, IconShare, IconTrash } from '@tabler/icons-react';

import { useLanguages } from '../../api/hooks/useLanguages';
import { useTranslation } from '../../api/hooks/useTranslation';
import type { Tour } from '../../api/tours';
import { Card } from '../../shared-components/Card';
import classes from './TourCards.module.css';

type Props = {
  tours: Tour[];
  onOpen: (editUrl: string) => void;
  onShare: (viewUrl: string) => void;
  onDelete: (item: Tour) => void;
};

export function ToursIntro({ onCreateNew }: { onCreateNew?: () => void }) {
  const translation = useTranslation();
  const languages = useLanguages();
  const currLang = languages.find((l) => l.current == 1)?.code ?? 'en';

  return (
    <div className={classes.header}>
      <div className={classes.info}>
        <div>{translation['TOURS_MAKE_WARNING']}</div>
        <a href={`${R2D.URL.DOMAIN}/${currLang}/tour/aap/`} target="_blank" rel="noreferrer">
          {translation['TOURS_MAKE_EXAMPLE']}
        </a>
      </div>
      {onCreateNew && (
        <div className={classes.createBtn} onClick={onCreateNew}>
          <IconPlus size={18} color="#2B2B2B" />
          {translation['TOURS_MAKE_NEW']}
        </div>
      )}
    </div>
  );
}

export function TourCards({ tours, onOpen, onShare, onDelete }: Props) {
  const translation = useTranslation();

  return (
    <>
      {tours.map((item) => (
        <Card
          key={item.h}
          name={item.name}
          preview={item.preview ? `${R2D.URL.DOMAIN}${item.preview}` : undefined}
          modified={item.updatedAt}
          created={item.createdAt}
          actions={[
            {
              icon: <IconFileSymlink size={25} color="#fff" />,
              label: translation['BUTTON_OPEN_PLAN'] ?? 'Open',
              onClick: () => onOpen(item.edit),
            },
            {
              icon: <IconShare size={25} color="#fff" />,
              label: translation['BUTTON_SHARE_PLAN'] ?? 'Share',
              onClick: () => onShare(item.view),
            },
            {
              icon: <IconTrash size={25} color="#AF3131" />,
              label: translation['BUTTON_DELETE_PLAN'] ?? 'Delete',
              onClick: () => onDelete(item),
            },
          ]}
        />
      ))}
    </>
  );
}
