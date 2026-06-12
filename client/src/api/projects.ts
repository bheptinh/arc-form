import { infiniteQueryOptions } from '@tanstack/react-query';

export type Project = {
  id: string;
  hash: string;
  name: string;
  modified: string;
  opened: string;
  userPlan: string;
};

type ProjectsPage = { items: Project[]; total: number };

const PAGE_SIZE = 20;

async function fetchProjectsPage(offset: number): Promise<ProjectsPage> {
  const res = await fetch(`/server-api/projects?limit=${PAGE_SIZE}&offset=${offset}`);
  if (!res.ok) throw new Error(`fetchProjects ${res.status}`);
  return ((await res.json()) as { data: ProjectsPage }).data;
}

export const projectsInfiniteQueryOptions = infiniteQueryOptions({
  queryKey: ['projects'] as const,
  queryFn: ({ pageParam }: { pageParam: number }) => fetchProjectsPage(pageParam),
  initialPageParam: 0,
  getNextPageParam: (lastPage, allPages) => {
    const loaded = allPages.flatMap((p) => p.items).length;
    return loaded < lastPage.total ? loaded : undefined;
  },
});

export async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`/server-api/projects/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`deleteProject ${res.status}`);
}

export async function renameProject(id: string, name: string): Promise<void> {
  const res = await fetch(`/server-api/projects/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error(`renameProject ${res.status}`);
}
