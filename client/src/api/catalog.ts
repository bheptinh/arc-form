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
