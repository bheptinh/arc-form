import db from '../db.js';
import { DEV_USER_ID } from '../schema.js';
import type { UserPatch } from '../../shared/schemas/user.js';
import type { User } from '../../shared/types/user.js';

type UserRow = {
  id: string;
  email: string;
  name: string;
  language_code: string;
  tips: string;
};

export function getUser(): User {
  const row = db
    .prepare('SELECT id, email, name, language_code, tips FROM users WHERE id = ?')
    .get(DEV_USER_ID) as UserRow;

  return {
    id: row.id,
    key: row.id, // TODO: DELETE — check all FE/engine usages of user.data.key and replace with user.data.id, then remove this field
    email: row.email,
    name: row.name,
    language_code: row.language_code,
    tips: JSON.parse(row.tips),

    // TODO: move to DB (users table or settings table)
    autoSave: true,

    render: false,
    subscriptionNews: false,
  };
}

export function updateUser(data: UserPatch): User {
  const fields = Object.keys(data) as (keyof UserPatch)[];
  for (const field of fields) {
    db.prepare(`UPDATE users SET ${field} = ? WHERE id = ?`).run(data[field], DEV_USER_ID);
  }
  return getUser();
}
