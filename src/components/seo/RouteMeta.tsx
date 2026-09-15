import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { applyPageMeta, type PageMeta } from '../../lib/usePageMeta';

/** Default metadata for every route, applied on each navigation.
 *
 *  Pages with something more specific to say call usePageMeta themselves;
 *  their effects run after this one, so they win. Signed-in areas, private
 *  links and placeholders are marked noindex here in one place rather than
 *  relying on each page to remember. */

const PRIVATE = 'noindex, nofollow';

const ROUTES: { test: (path: string) => boolean; meta: PageMeta }[] = [
  { test: (p) => p === '/', meta: {} },
  {
    test: (p) => p === '/artists',
    meta: {
      title: 'Artists',
      description: 'Browse artists on ARTBANK and follow the ones whose work you want to see more of.',
    },
  },
  { test: (p) => p.startsWith('/artists/'), meta: { title: 'Artist profile' } },
  {
    test: (p) => p === '/for-buyers',
    meta: {
      title: 'For Buyers',
      description:
        'Find original artwork with its provenance, rights and certificate status recorded, and contact the artist directly.',
    },
  },
  {
    test: (p) => p === '/pricing',
    meta: { title: 'Pricing', description: 'ARTBANK plans for artists and buyers.' },
  },
  { test: (p) => p === '/terms', meta: { title: 'Terms of Service' } },
  { test: (p) => p === '/privacy', meta: { title: 'Privacy Policy' } },
  { test: (p) => p === '/cookies', meta: { title: 'Cookie Policy' } },
  { test: (p) => p === '/login', meta: { title: 'Sign in' } },
  { test: (p) => p === '/register', meta: { title: 'Create your account' } },
  { test: (p) => p.startsWith('/a/'), meta: { title: 'Artwork' } },
  { test: (p) => p.startsWith('/rooms/'), meta: { title: 'Private viewing room', robots: PRIVATE } },
  {
    test: (p) => p === '/how-it-works',
    meta: {
      title: 'How It Works',
      description:
        'How ARTBANK turns an artwork into a complete professional record, puts it in front of identified buyers, and keeps the journey on the artwork’s history.',
    },
  },
  { test: (p) => /^\/(archive|articon|academy)\/?$/.test(p), meta: { robots: 'noindex' } },
  { test: (p) => /^\/artspace(\/|$)/.test(p), meta: { title: 'ArtSpace', robots: PRIVATE } },
  { test: (p) => /^\/collect(\/|$)/.test(p), meta: { title: 'Collect', robots: PRIVATE } },
  { test: (p) => /^\/admin(\/|$)/.test(p), meta: { title: 'Admin', robots: PRIVATE } },
  { test: (p) => /^\/(guardian|workspace)(\/|$)/.test(p), meta: { title: 'Account', robots: PRIVATE } },
];

export function RouteMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const match = ROUTES.find((route) => route.test(pathname));
    applyPageMeta(match?.meta ?? {});
  }, [pathname]);

  return null;
}
