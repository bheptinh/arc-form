export interface Language {
  id: string;
  code: string;
  name: string;
  default: number;
  current: number;
  icon: string;
  lang_public: string;
}

export type TranslationMap = Record<string, string>;
