import { IconFileSymlink, IconPlus, IconShare, IconTrash } from '@tabler/icons-react';
import { createUseStyles } from 'react-jss';

import { useLanguages } from '../../api/hooks/useLanguages';
import { useTranslation } from '../../api/hooks/useTranslation';
import type { Tour } from '../../api/tours';
import { Card } from '../../shared-components/Card';

type Props = {
  tours: Tour[];
  onOpen: (editUrl: string) => void;
  onShare: (viewUrl: string) => void;
  onDelete: (item: Tour) => void;
  onCreateNew?: () => void;
};

const useStyles = createUseStyles({
  wrap: { position: 'relative' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 11% 16px',
    '@media screen and (max-width: 950px)': { padding: '0 0 10px' },
  },
  info: {
    fontSize: 13,
    color: '#373737',
    '& a': {
      color: '#66ACF4',
      marginTop: 4,
      textDecoration: 'underline',
      display: 'block',
      '&:hover': { textDecoration: 'none' },
    },
  },
  createBtn: {
    flexShrink: 0,
    fontSize: 14,
    color: '#2B2B2B',
    textTransform: 'uppercase',
    background: '#BAE51F',
    borderRadius: 3,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    height: 36,
    padding: '0 14px',
    cursor: 'pointer',
    transition: 'all 0.9s cubic-bezier(0.19,1,0.22,1)',
    '&:hover': { background: '#8fc32d' },
    '@media screen and (max-width: 950px)': { fontSize: 10, height: 28, padding: '0 7px' },
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, calc(25% - 29px))',
    gridGap: 38,
    padding: '0 11% 70px',
    '@media screen and (max-width: 1250px)': { gridTemplateColumns: 'repeat(3, calc(33% - 22px))' },
    '@media screen and (max-width: 950px)': {
      padding: '0 0 14px',
      gridGap: 10,
      gridTemplateColumns: 'repeat(3, calc(33% - 5px))',
    },
  },
});

export function ToursGrid({ tours, onOpen, onShare, onDelete, onCreateNew }: Props) {
  const classes = useStyles();
  const translation = useTranslation();
  const languages = useLanguages();
  const currLang = languages.find((l) => l.current == 1)?.code ?? 'en';

  return (
    <div className={classes.wrap}>
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

      <div className={classes.grid}>
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
      </div>
    </div>
  );
}
