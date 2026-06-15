import { queryOptions } from '@tanstack/react-query';
import type { UserPatch } from '../../../shared/schemas/user';
import type { User } from '../../../shared/types/user';

export type { UserPatch };

async function fetchUser(): Promise<User> {
  const res = await fetch('/server-api/user');
  if (!res.ok) throw new Error(`fetchUser ${res.status}`);
  return ((await res.json()) as { data: User }).data;
}

export const userQueryOptions = queryOptions({
  queryKey: ['user'],
  queryFn: fetchUser,
});

export async function patchUser(data: UserPatch): Promise<User> {
  const res = await fetch('/server-api/user', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`patchUser ${res.status}`);
  const json = await res.json() as { data: User };
  return json.data;
}
