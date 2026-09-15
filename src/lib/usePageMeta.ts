import { useEffect } from 'react';

/** Per-page title, description and robots directive for a client-rendered app.
 *
 *  index.html carries one static title and description, so without this every
 *  URL on the site reported the same page to a browser tab, a share preview
 *  and a search crawler. RouteMeta applies a sensible default per route;
 *  a page that knows something more specific (an artist's name, an artwork's
 *  title) calls usePageMeta itself, and its effect runs after RouteMeta's. */

export type PageMeta = {
  /** Shown as "{title} — ARTBANK". Omit for the homepage's full title. */
  title?: string;
  description?: string;
  /** e.g. 'noindex' for placeholders, private links and signed-in areas. */
  robots?: string;
};

const SITE_NAME = 'ARTBANK';
const HOME_TITLE = 'ARTBANK — The Global Creator Bank of Creative Value';

export const DEFAULT_DESCRIPTION =
  'ARTBANK gives artists a verified professional record for every work — provenance, rights and certificates in one place — and gives buyers and institutions a trustworthy way to find it.';

function setMeta(attribute: 'name' | 'property', key: string, value: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', value);
}

export function applyPageMeta({ title, description, robots }: PageMeta) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : HOME_TITLE;
  const fullDescription = description ?? DEFAULT_DESCRIPTION;

  document.title = fullTitle;
  setMeta('name', 'description', fullDescription);
  setMeta('property', 'og:title', fullTitle);
  setMeta('property', 'og:description', fullDescription);
  setMeta('name', 'robots', robots ?? 'index, follow');
}

export function usePageMeta(meta: PageMeta) {
  const { title, description, robots } = meta;
  useEffect(() => {
    applyPageMeta({ title, description, robots });
  }, [title, description, robots]);
}
