import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import { useLanguages } from '../api/hooks/useLanguages';

export function MarkdownPage({ slug }: { slug: string }) {
  const languages = useLanguages();
  const lang = languages.find((l) => l.current == 1)?.code ?? 'en';
  const [md, setMd] = useState('');

  useEffect(() => {
    fetch(`/server-api/i18n/pages/${slug}`)
      .then((r) => (r.ok ? r.text() : ''))
      .then(setMd);
  }, [slug, lang]);

  return <ReactMarkdown>{md}</ReactMarkdown>;
}
