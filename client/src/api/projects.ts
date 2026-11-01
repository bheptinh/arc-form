import { infiniteQueryOptions } from '@tanstack/react-query';

export type Project = {
  id: string;
  hash: string;
  name: string;
  modified: string;
  opened: string;
  preview?: string;
};

type ProjectsPage = { items: Project[]; total: number };

const PAGE_SIZE = 20;

async function fetchProjectsPage(offset: number, archived: boolean): Promise<ProjectsPage> {
  const filter = archived ? '&archived=1' : '';
  const res = await fetch(`/server-api/projects?limit=${PAGE_SIZE}&offset=${offset}${filter}`);
  if (!res.ok) throw new Error(`fetchProjects ${res.status}`);
  return ((await res.json()) as { data: ProjectsPage }).data;
}

const getProjectsQueryOptions = (queryKey: string[], archived: boolean) =>
  infiniteQueryOptions({
    queryKey,
    queryFn: ({ pageParam }: { pageParam: number }) => fetchProjectsPage(pageParam, archived),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.flatMap((p) => p.items).length;
      return loaded < lastPage.total ? loaded : undefined;
    },
  });

// Invalidating ['projects'] also refreshes the archive, because its key starts with the same part.
export const projectsInfiniteQueryOptions = getProjectsQueryOptions(['projects'], false);
export const archivedProjectsInfiniteQueryOptions = getProjectsQueryOptions(
  ['projects', 'archived'],
  true
);

export async function setProjectArchived(id: string, archived: boolean): Promise<void> {
  const res = await fetch(`/server-api/projects/${id}/archive`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ archived }),
  });
  if (!res.ok) throw new Error(`setProjectArchived ${res.status}`);
}

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

export async function copyProject(id: string, name: string): Promise<{ hash: string }> {
  const res = await fetch(`/server-api/projects/${id}/copy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error(`copyProject ${res.status}`);
  return res.json();
}
