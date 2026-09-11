import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValueEvent, useScroll, type Variants } from 'framer-motion';
import { Menu, X } from 'lucide-react';

import { cn } from '@/lib/utils';

const MotionLink = motion.create(Link);

export type FloatingNavItem = {
  name: string;
  to: string;
  /** Match the path exactly, so Home doesn't stay lit on every other page. */
  end?: boolean;
  /** Renders as the filled action (Create JO1NID / My ArtSpace) rather than a
   *  plain link — this nav replaces the header row on a phone, so whatever
   *  the row's own button was doing has to live somewhere in here. */
  cta?: boolean;
  /** Kept out of the bar itself and surfaced only through the "more" toggle —
   *  the row shows Home / Artists / For Buyers and the primary action at a
   *  glance; everything else opens on request, the way apple.com's own
   *  mobile store nav keeps a short row up front and puts the rest behind
   *  one icon. */
  secondary?: boolean;
};

const EXPAND_SCROLL_THRESHOLD = 80;

const containerVariants: Variants = {
  expanded: {
    y: 0,
    opacity: 1,
    width: 'auto',
    transition: {
      y: { type: 'spring', damping: 18, stiffness: 250 },
      opacity: { duration: 0.3 },
      type: 'spring',
      damping: 20,
      stiffness: 300,
      staggerChildren: 0.07,
      delayChildren: 0.2,
    },
  },
  collapsed: {
    y: 0,
    opacity: 1,
    width: '3rem',
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 300,
      when: 'afterChildren',
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

const itemVariants: Variants = {
  expanded: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring', damping: 15 } },
  collapsed: { opacity: 0, x: -20, scale: 0.95, transition: { duration: 0.2 } },
};

const collapsedIconVariants: Variants = {
  expanded: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
  collapsed: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', damping: 15, stiffness: 300, delay: 0.15 },
  },
};

/** The public site's phone header: a compact floating bar — the three
 *  shortest destinations, the primary action, and a toggle for the rest —
 *  that also shrinks to a tap-to-reopen circle once you start reading.
 *  Replaces the header row entirely below the width the desktop nav
 *  collapses at — see Header.tsx.
 *
 *  Adapted from the supplied component in three places, all forced by how
 *  this codebase is set up rather than by preference:
 *
 *  - **`next/link` → `react-router-dom`.** This is a Vite SPA with a
 *    `BrowserRouter`; there is no Next.js App Router here.
 *  - **No logo mark.** Tried first as a compact serif initial standing in for
 *    the wordmark, then dropped outright — the bar reads more like a nav and
 *    less like a mini header without one, and it wasn't asked for.
 *  - **A "more" toggle, apple.com-store style.** The supplied `navItems` are
 *    five identical plain links, sized for a row that had the width to show
 *    all of them at once. This row doesn't: it keeps Home, Artists, For
 *    Buyers and the primary action always visible, and anything marked
 *    `secondary` (How It Works, Pricing) sits behind a hamburger button that
 *    drops a short list open beneath the bar on tap — the same shape as
 *    Apple's own mobile store nav, not a dropdown component borrowed from
 *    somewhere else.
 *
 *  Everything else — the spring physics, the collapse-on-scroll-down /
 *  expand-on-scroll-up thresholds, the staggered children, tapping the
 *  collapsed circle to reopen — is unchanged. */
export function AnimatedNavFramer({ items, className }: { items: FloatingNavItem[]; className?: string }) {
  const [isExpanded, setExpanded] = useState(true);
  const [moreOpen, setMoreOpen] = useState(false);
  const { pathname } = useLocation();
  const wrapRef = useRef<HTMLDivElement>(null);

  /* This pill replaces the header row entirely at the width it's shown, so
     unlike the header it doesn't occupy any layout space — it floats over
     whatever's underneath. Every public page's content used to start below
     the header simply because the header was there, in flow; nothing gives
     it that clearance now except this. Same pattern as the workspace bottom
     bar's `has-bottom-nav`, mounted unconditionally and gated by the media
     query in globals.css rather than by this component's own visibility. */
  useEffect(() => {
    document.body.classList.add('has-floating-nav');
    return () => document.body.classList.remove('has-floating-nav');
  }, []);

  const { scrollY } = useScroll();
  const lastScrollY = useRef(0);
  const scrollPositionOnCollapse = useRef(0);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = lastScrollY.current;

    if (isExpanded && latest > previous && latest > 150) {
      setExpanded(false);
      setMoreOpen(false);
      scrollPositionOnCollapse.current = latest;
    } else if (
      !isExpanded &&
      latest < previous &&
      scrollPositionOnCollapse.current - latest > EXPAND_SCROLL_THRESHOLD
    ) {
      setExpanded(true);
    }

    lastScrollY.current = latest;
  });

  // The panel is a sibling of the bar, not a descendant of anything scrollable
  // inside it, so a plain outside-click check is enough to close it.
  useEffect(() => {
    if (!moreOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setMoreOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [moreOpen]);

  function handleNavClick(event: React.MouseEvent) {
    if (!isExpanded) {
      event.preventDefault();
      setExpanded(true);
    }
  }

  const isActive = (item: FloatingNavItem) =>
    item.end ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`);

  const primaryItems = items.filter((item) => !item.secondary && !item.cta);
  const moreItems = items.filter((item) => item.secondary);
  const cta = items.find((item) => item.cta);

  return (
    <div ref={wrapRef} className={cn('fixed top-4 left-1/2 -translate-x-1/2 z-50', className)}>
      <motion.nav
        aria-label="Primary"
        initial={{ y: -80, opacity: 0 }}
        animate={isExpanded ? 'expanded' : 'collapsed'}
        variants={containerVariants}
        whileHover={!isExpanded ? { scale: 1.1 } : {}}
        whileTap={!isExpanded ? { scale: 0.95 } : {}}
        onClick={handleNavClick}
        className={cn(
          'relative flex items-center overflow-hidden rounded-full border border-border bg-background/90 shadow-lg backdrop-blur-sm h-12 max-w-[92vw]',
          !isExpanded && 'cursor-pointer justify-center',
        )}
      >
        <motion.div
          className={cn(
            'flex items-center gap-0.5 pl-3 min-w-0 overflow-x-auto',
            '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
            !isExpanded && 'pointer-events-none',
          )}
        >
          {primaryItems.map((item) => (
            <MotionLink
              key={item.name}
              to={item.to}
              aria-current={isActive(item) ? 'page' : undefined}
              onClick={(e) => e.stopPropagation()}
              variants={itemVariants}
              className={cn(
                'shrink-0 px-1.5 py-1 text-[13px] font-medium no-underline whitespace-nowrap transition-colors',
                isActive(item) ? 'text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {item.name}
            </MotionLink>
          ))}
        </motion.div>

        <div className={cn('flex items-center gap-0.5 pr-1.5 shrink-0', !isExpanded && 'pointer-events-none')}>
          {cta && (
            <MotionLink
              to={cta.to}
              onClick={(e) => e.stopPropagation()}
              variants={itemVariants}
              className="ml-0.5 shrink-0 inline-flex items-center whitespace-nowrap rounded-full bg-[var(--ink)] px-3 py-1.5 text-xs font-semibold text-white no-underline transition-colors hover:bg-[var(--dark-2)]"
            >
              {cta.name}
            </MotionLink>
          )}

          {moreItems.length > 0 && (
            <motion.button
              type="button"
              variants={itemVariants}
              aria-label={moreOpen ? 'Close menu' : 'More links'}
              aria-expanded={moreOpen}
              onClick={(e) => {
                e.stopPropagation();
                setMoreOpen((v) => !v);
              }}
              className="ml-0.5 shrink-0 grid place-items-center w-7 h-7 rounded-full text-foreground hover:bg-muted transition-colors"
            >
              {moreOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </motion.button>
          )}
        </div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div variants={collapsedIconVariants} animate={isExpanded ? 'expanded' : 'collapsed'}>
            <Menu className="h-5 w-5 text-foreground" />
          </motion.div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {moreOpen && isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className="absolute right-0 top-full mt-2 min-w-[10rem] overflow-hidden rounded-2xl border border-border bg-background/95 shadow-lg backdrop-blur-sm"
          >
            {moreItems.map((item) => (
              <Link
                key={item.name}
                to={item.to}
                aria-current={isActive(item) ? 'page' : undefined}
                onClick={() => setMoreOpen(false)}
                className={cn(
                  'block px-4 py-3 text-sm font-medium no-underline transition-colors',
                  isActive(item) ? 'text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {item.name}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AnimatedNavFramer;
