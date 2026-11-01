import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { deleteRender, rendersInfiniteQueryOptions } from '../api/renders';
import { RenderCards } from '../components/renders/RenderCards';
import { GridPage } from '../shared-components/GridPage';

export default function RendersPage() {
  const queryClient = useQueryClient();

  const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery(
    rendersInfiniteQueryOptions
  );
  const renders = data?.pages.flatMap((p) => p.items) ?? [];

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
    <GridPage
      title="My Renders"
      isLoading={isLoading}
      onLoadMore={hasNextPage ? () => fetchNextPage() : undefined}
    >
      <RenderCards
        renders={renders}
        onOpen={handleOpen}
        onDownload={handleDownload}
        onDelete={handleDelete}
        onReload={handleReload}
      />
    </GridPage>
  );
}
