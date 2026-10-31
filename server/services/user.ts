import db from '../db.js';
import { DEV_USER_ID } from '../schema.js';
import type { UserPatch } from '../../shared/schemas/user.js';
import type { User } from '../../shared/types/user.js';

type UserRow = {
  id: string;
  email: string;
  name: string;
  language_code: string;
  show_tips: number;
  subscription_news: number;
  auto_save: number;
};

export function getUser(): User {
  const row = db
    .prepare('SELECT id, email, name, language_code, show_tips, subscription_news, auto_save FROM users WHERE id = ?')
    .get(DEV_USER_ID) as UserRow;

  return {
    id: row.id,
    key: row.id, // TODO: DELETE — check all FE/engine usages of user.data.key and replace with user.data.id, then remove this field
    email: row.email,
    name: row.name,
    language_code: row.language_code,
    tips: row.show_tips === 1,
    autoSave: row.auto_save === 1,
    subscriptionNews: row.subscription_news === 1,

    // TODO: move to DB (users table or settings table)
    render: false,
  };
}

export function updateUser(data: UserPatch): User {
  const fields = Object.keys(data) as (keyof UserPatch)[];
  for (const field of fields) {
    const value = data[field];
    db.prepare(`UPDATE users SET ${field} = ? WHERE id = ?`).run(typeof value === 'boolean' ? Number(value) : value, DEV_USER_ID);
  }
  return getUser();
}
