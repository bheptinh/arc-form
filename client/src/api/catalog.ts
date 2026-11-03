import { queryOptions, useQuery } from '@tanstack/react-query';

async function fetchMaterialsNav(): Promise<unknown[]> {
  const res = await fetch('/server-api/catalog/materials/nav');
  if (!res.ok) throw new Error(`fetchMaterialsNav ${res.status}`);
  const json = (await res.json()) as { materials: unknown[] };
  return json.materials;
}

export const materialsNavQueryOptions = queryOptions({
  queryKey: ['catalog', 'materials', 'nav'] as const,
  queryFn: fetchMaterialsNav,
  staleTime: Infinity,
});

export function useCatalogMaterials(): unknown[] {
  return useQuery(materialsNavQueryOptions).data ?? [];
}

/** Deletes one of the user's uploads, model or material. */
export async function deleteUserUpload(id: string): Promise<void> {
  const res = await fetch(`/server-api/catalog/private/uploads/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`deleteUserUpload ${res.status}`);
}
