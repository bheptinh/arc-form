import db from '../db.js';
import { DEV_USER_ID } from '../schema.js';

type UserRow = {
  id: string;
  email: string;
  name: string;
  plan: string;
  tips: string;
};

export function getUser() {
  const row = db.prepare('SELECT id, email, name, plan, tips FROM users WHERE id = ?').get(DEV_USER_ID) as UserRow;
  const { count: projectCount } = db.prepare('SELECT COUNT(*) as count FROM projects WHERE user_id = ?').get(DEV_USER_ID) as { count: number };

  return {
    id: row.id,
    key: row.id, // TODO: DELETE — check all FE/engine usages of user.data.key and replace with user.data.id, then remove this field
    email: row.email,
    name: row.name,
    plan: row.plan,
    tips: JSON.parse(row.tips),
    projectCount,

    // TODO: move to DB (users table or settings table)
    autoSave: true,
    maxProjects: 10,

    // TODO: stub until billing is implemented
    credits: 0,
    render: false,
    price: 0,
    userPlanExpire: '',
    userPlanRecurringId: null,
    userPlanPeriod: 0,
    subscriptionNews: false,
  };
}
