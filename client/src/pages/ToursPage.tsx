import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { createUseStyles } from 'react-jss';

import { deleteTour, toursQueryOptions, type Tour } from '../api/tours';
import { ToursGrid } from '../components/tours/ToursGrid';

const useStyles = createUseStyles({
  page: {
    width: '100%',
    height: '100%',
    backgroundColor: '#EBEBEB',
    display: 'grid',
    gridTemplateRows: 'auto 1fr',
    overflow: 'hidden',
    padding: '38px 0 0',
  },
  top: {
    padding: '0 11%',
    paddingRight: 'calc(11% + 38px)',
    '@media screen and (max-width: 950px)': { padding: 0 },
  },
  title: {
    color: 'var(--color-text)',
    fontSize: 32,
    fontWeight: 300,
    marginBottom: 16,
    '@media screen and (max-width: 950px)': { fontSize: 20 },
  },
  scroll: { overflowY: 'auto', position: 'relative' },
  preloader: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(255,255,255,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
});

export default function ToursPage() {
  const classes = useStyles();
  const queryClient = useQueryClient();

  const { data: tours = [], isLoading } = useQuery(toursQueryOptions);

  useEffect(() => {
    const el = document.querySelector('.preloader_main') as HTMLElement | null;
    if (el) el.remove();
  }, []);

  const deleteMutation = useMutation({ mutationFn: deleteTour });

  useEffect(() => {
    if (deleteMutation.isSuccess) {
      queryClient.invalidateQueries({ queryKey: toursQueryOptions.queryKey });
    }
  }, [deleteMutation.status]);

  const handleOpen = (editUrl: string) => window.open(editUrl);
  const handleShare = (viewUrl: string) => window.open(viewUrl);
  const handleDelete = (item: Tour) => deleteMutation.mutate(item.h);

  return (
    <div className={classes.page}>
      <div className={classes.top}>
        <div className={classes.title}>My 360° Tours</div>
      </div>

      <div className={classes.scroll}>
        {isLoading && (
          <div className={classes.preloader}>
            <div className="preloader-cube" />
          </div>
        )}
        <ToursGrid tours={tours} onOpen={handleOpen} onShare={handleShare} onDelete={handleDelete} />
      </div>
    </div>
  );
}
