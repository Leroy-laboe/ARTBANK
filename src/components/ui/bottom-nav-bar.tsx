import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

import { Icon, type IconName } from './Icon';
import { cn } from '@/lib/utils';

export type BottomNavItem = {
  label: string;
  icon: IconName;
  to: string;
  /** Match the path exactly. Needed for index routes like /artspace, which
   *  would otherwise stay active on every child page under it. */
  end?: boolean;
  badge?: number | null;
};

const MOBILE_LABEL_WIDTH = 72;

const MotionLink = motion.create(Link);

/** The signed-in navigation on a phone: a floating pill above the thumb
 *  rather than an icon rail at the top of the page.
 *
 *  Adapted from the supplied design in three places, each forced by how this
 *  codebase is actually set up rather than by preference:
 *
 *  - **No `dark:` variants.** src/styles/tailwind.css maps shadcn's tokens
 *    onto ARTBANK's own palette and says so explicitly: "Light-only: the rest
 *    of the site has no dark mode, so neither does this." A `dark:` class here
 *    would never match, and `border-sidebar-border` isn't a token this project
 *    defines at all.
 *  - **Explicit button/anchor reset.** Preflight is deliberately not imported
 *    (it would restyle every CSS-Modules component on the site), so an
 *    unstyled anchor keeps its underline and inherited colour. The resets that
 *    Preflight would normally supply are spelled out below.
 *  - **Router-driven, not `useState`.** A bottom bar has to agree with the URL
 *    — deep links, the back button and in-page links all change route without
 *    touching this component, and a local index would drift out of step.
 *
 *  The design itself — the pill, the spring entrance, the tap response and the
 *  label that expands only under the active item — is unchanged. */
export function BottomNavBar({
  items,
  className,
  stickyBottom = true,
}: {
  items: BottomNavItem[];
  className?: string;
  stickyBottom?: boolean;
}) {
  const { pathname } = useLocation();

  /* A fixed pill sits over whatever is at the bottom of the page, and the
     content it covers lives in 16 different page modules. Rather than add the
     same padding to each — and have it drift the moment a seventeenth page
     appears — the bar announces itself and one rule in globals.css gives the
     clearance, only while it is actually mounted. */
  useEffect(() => {
    if (!stickyBottom) return;
    document.body.classList.add('has-bottom-nav');
    return () => document.body.classList.remove('has-bottom-nav');
  }, [stickyBottom]);

  const isActive = (item: BottomNavItem) =>
    item.end ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`);

  /* Account screens (Billing, Help Center and friends) are reached from the
     menu, not from this bar, so nothing in it is active there and the pill
     would shrink by the width of the missing label — a bar that moves as you
     browse. Hold that space open instead so it is the same size everywhere. */
  const anyActive = items.some(isActive);

  /* Half the missing label at each end, so the icons stay centred in the pill
     rather than leaving a hole on the right. The label costs its own width
     plus the 8px gap and 8px margin that come with it; each spacer then picks
     up 4px of its own from the row's spacing, hence the subtraction. Inline
     rather than a Tailwind class: an arbitrary value built at runtime never
     reaches the generated stylesheet. */
  const spacer = anyActive ? null : (
    <span aria-hidden className="shrink-0" style={{ width: (MOBILE_LABEL_WIDTH + 16) / 2 - 4 }} />
  );

  return (
    <motion.nav
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      role="navigation"
      aria-label="Primary"
      className={cn(
        'bg-card border border-border rounded-full flex items-center p-2 shadow-xl space-x-1 max-w-[95vw] h-[52px]',
        // Sits clear of the iPhone home indicator, which `bottom-4` alone
        // would tuck the pill underneath.
        stickyBottom &&
          'fixed inset-x-0 bottom-[calc(1rem+env(safe-area-inset-bottom))] mx-auto z-30 w-fit',
        className,
      )}
    >
      {spacer}

      {items.map((item) => {
        const active = isActive(item);

        return (
          <MotionLink
            key={item.to}
            to={item.to}
            whileTap={{ scale: 0.97 }}
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'relative flex items-center justify-center gap-0 px-3 py-2 rounded-full',
              'h-10 min-w-[44px] min-h-[40px] max-h-[44px] no-underline',
              'transition-colors duration-200 focus:outline-none focus-visible:ring-0',
              active
                ? 'bg-primary/10 text-primary gap-2'
                : 'bg-transparent text-muted-foreground hover:bg-muted',
            )}
          >
            <span className="relative flex shrink-0 items-center">
              <Icon name={item.icon} size={22} />
              {Boolean(item.badge) && (
                <span
                  className="absolute -right-1.5 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground"
                  aria-hidden
                >
                  {item.badge}
                </span>
              )}
            </span>

            <motion.span
              initial={false}
              animate={{
                width: active ? `${MOBILE_LABEL_WIDTH}px` : '0px',
                opacity: active ? 1 : 0,
                marginLeft: active ? '8px' : '0px',
              }}
              transition={{
                width: { type: 'spring', stiffness: 350, damping: 32 },
                opacity: { duration: 0.19 },
                marginLeft: { duration: 0.19 },
              }}
              className="flex max-w-[72px] items-center overflow-hidden"
            >
              <span
                className={cn(
                  'select-none overflow-hidden text-ellipsis whitespace-nowrap font-medium',
                  'text-[clamp(0.625rem,0.5263rem+0.5263vw,1rem)] leading-[1.9] transition-opacity duration-200',
                  active ? 'text-primary' : 'opacity-0',
                )}
                title={item.label}
              >
                {item.label}
              </span>
            </motion.span>
          </MotionLink>
        );
      })}

      {spacer}
    </motion.nav>
  );
}

export default BottomNavBar;
