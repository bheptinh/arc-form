export interface Language {
  id: string;
  code: string;
  name: string;
  default: number;
  current: number;
  icon: string;
  lang_public: string;
}

// FIXME: en.json and ua.json now have a nested "response" object, so this type is too narrow.
export type TranslationMap = Record<string, string>;
