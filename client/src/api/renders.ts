import { infiniteQueryOptions } from '@tanstack/react-query';

export type Render = {
  id: string;
  renderId: string;
  type: string;
  status: string;
  preview: string | null;
  actions?: { open: { link: string } };
  created: number;
};

type RendersData = { items: Render[]; total: number };

const PAGE_SIZE = 20;

async function fetchRendersPage(offset: number): Promise<RendersData> {
  const res = await fetch(`/server-api/render?limit=${PAGE_SIZE}&offset=${offset}`);
  if (!res.ok) throw new Error(`fetchRenders ${res.status}`);
  return ((await res.json()) as { data: RendersData }).data;
}

export const rendersInfiniteQueryOptions = infiniteQueryOptions({
  queryKey: ['renders'] as const,
  queryFn: ({ pageParam }: { pageParam: number }) => fetchRendersPage(pageParam),
  initialPageParam: 0,
  getNextPageParam: (lastPage, allPages) => {
    const loaded = allPages.flatMap((p) => p.items).length;
    return loaded < lastPage.total ? loaded : undefined;
  },
});

export async function createRender(body: string): Promise<{ status: string; data?: { renderId: string } }> {
  const res = await fetch('/server-api/render', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  return res.json();
}

export async function deleteRender(id: string): Promise<void> {
  const res = await fetch(`/server-api/render/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`deleteRender ${res.status}`);
}
