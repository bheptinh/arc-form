import db from '../db.js';
import { DEV_USER_ID } from '../schema.js';
import type { UserPatch } from '../../shared/schemas/user.js';
import { PlanFeature } from '../../shared/types/plan-features.js';
import type { User } from '../../shared/types/user.js';

type UserRow = {
  id: string;
  email: string;
  name: string;
  plan: string;
  language_code: string;
  tips: string;
};

export function getUser(): User {
  const row = db
    .prepare('SELECT id, email, name, plan, language_code, tips FROM users WHERE id = ?')
    .get(DEV_USER_ID) as UserRow;
  const { count: projectCount } = db
    .prepare('SELECT COUNT(*) as count FROM projects WHERE user_id = ?')
    .get(DEV_USER_ID) as { count: number };

  return {
    id: row.id,
    key: row.id, // TODO: DELETE — check all FE/engine usages of user.data.key and replace with user.data.id, then remove this field
    email: row.email,
    name: row.name,
    plan: row.plan,
    language_code: row.language_code,
    tips: JSON.parse(row.tips),
    projectCount,

    // TODO: move to DB (users table or settings table)
    autoSave: true,
    maxProjects: 10,

    // TODO: stub until billing is implemented
    render: false,
    price: 0,
    userPlanExpire: '',
    userPlanRecurringId: null,
    userPlanPeriod: 0,
    subscriptionNews: false,
    userPlanFeatures: [PlanFeature.WallEditor, PlanFeature.Plinth, PlanFeature.PrivateMaterial],
  };
}

export function updateUser(data: UserPatch): User {
  const fields = Object.keys(data) as (keyof UserPatch)[];
  for (const field of fields) {
    db.prepare(`UPDATE users SET ${field} = ? WHERE id = ?`).run(data[field], DEV_USER_ID);
  }
  return getUser();
}
