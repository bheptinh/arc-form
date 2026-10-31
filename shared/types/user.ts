export interface User {
  id: string;
  key: string; // TODO: DELETE — alias for id, kept for legacy R2D engine compatibility
  email: string;
  name: string;
  language_code: string;
  tips: Record<string, unknown>;
  autoSave: boolean;
  render: boolean;
  subscriptionNews: boolean;
}
