import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { createUseStyles } from 'react-jss';

import { deleteRender, rendersInfiniteQueryOptions } from '../api/renders';
import { RendersGrid } from '../components/renders/RendersGrid';

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

export default function RendersPage() {
  const classes = useStyles();
  const queryClient = useQueryClient();

  const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery(
    rendersInfiniteQueryOptions
  );
  const renders = data?.pages.flatMap((p) => p.items) ?? [];

  useEffect(() => {
    const el = document.querySelector('.preloader_main') as HTMLElement | null;
    if (el) el.remove();
  }, []);

  const deleteMutation = useMutation({ mutationFn: deleteRender });

  useEffect(() => {
    if (deleteMutation.isSuccess) {
      queryClient.invalidateQueries({ queryKey: rendersInfiniteQueryOptions.queryKey });
    }
  }, [deleteMutation.status]);

  const handleOpen = (_renderId: string, _type: string, actions?: { open: { link: string } }) => {
    if (actions?.open.link) window.open(`${R2D.URL.DOMAIN}${actions.open.link}`);
  };

  const handleDownload = async (renderId: string) => {
    const res = await fetch(`/server-api/render/${renderId}`);
    if (!res.ok) return;
    const { data: renderData } = await res.json();
    if (!renderData?.url) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = `${R2D.URL.DOMAIN}${renderData.url}`;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const link = document.createElement('a');
      link.href = canvas.toDataURL();
      link.download = `render_${renderId}`;
      link.click();
    };
  };

  const handleDelete = (renderId: string) => deleteMutation.mutate(renderId);

  const handleReload = async (renderId: string) => {
    await fetch(`/server-api/render/restart/${renderId}`, { method: 'PUT' });
    queryClient.invalidateQueries({ queryKey: rendersInfiniteQueryOptions.queryKey });
  };

  return (
    <div className={classes.page}>
      <div className={classes.top}>
        <div className={classes.title}>My Renders</div>
      </div>

      <div className={classes.scroll}>
        {isLoading && (
          <div className={classes.preloader}>
            <div className="preloader-cube" />
          </div>
        )}
        <RendersGrid
          renders={renders}
          onOpen={handleOpen}
          onDownload={handleDownload}
          onDelete={handleDelete}
          onReload={handleReload}
          hasMore={hasNextPage}
          onLoadMore={() => fetchNextPage()}
        />
      </div>
    </div>
  );
}
