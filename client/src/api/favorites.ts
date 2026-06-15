import { queryOptions } from '@tanstack/react-query';

type FavoritesData = { total: string; items: unknown[] };

async function fetchFavorites(): Promise<FavoritesData> {
  const res = await fetch('/server-api/catalog/favorites');
  if (!res.ok) throw new Error(`fetchFavorites ${res.status}`);
  return ((await res.json()) as { data: FavoritesData }).data;
}

export const favoritesQueryOptions = queryOptions({
  queryKey: ['favorites'],
  queryFn: fetchFavorites,
  staleTime: Infinity,
});
