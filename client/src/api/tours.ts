import { queryOptions } from '@tanstack/react-query';

export type Tour = {
  h: string;
  name: string;
  status: string;
  preview: string | null;
  edit: string;
  view: string;
  delete: string;
  createdAt: string;
  updatedAt: string;
};

async function fetchTours(): Promise<Tour[]> {
  const res = await fetch('/server-api/tours');
  if (!res.ok) throw new Error(`fetchTours ${res.status}`);
  return ((await res.json()) as { data: Tour[] }).data;
}

export const toursQueryOptions = queryOptions({
  queryKey: ['tours'] as const,
  queryFn: fetchTours,
});

export async function deleteTour(id: string): Promise<void> {
  const res = await fetch(`/server-api/tours/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`deleteTour ${res.status}`);
}
