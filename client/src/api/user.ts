import type { UserPatch } from '../../../shared/schemas/user';
import type { User } from '../../../shared/types/user';

export type { UserPatch };

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
