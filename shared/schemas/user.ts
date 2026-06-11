import { z } from 'zod';

export const UserPatchSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  language_code: z.string().min(2).max(10).optional(),
});

export type UserPatch = z.infer<typeof UserPatchSchema>;
