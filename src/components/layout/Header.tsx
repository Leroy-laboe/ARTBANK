import { Link, NavLink } from 'react-router-dom';
import { navLinks } from '../../data/homeContent';
import { useSession } from '../../lib/sessionContext';
import { AnimatedNavFramer, type FloatingNavItem } from '../ui/animated-nav-framer';
import { ShinyButton } from '../ui/shiny-button';
import logo from '../../assets/images/artbank-logo-dark.png';
import styles from './Header.module.css';

/** The public site's header.
 *
 *  It has to serve two audiences at once. A visitor needs the way in; someone
 *  already signed in needs the way *back* — the public pages are reachable
 *  from inside both workspaces (an artist's profile at /artists/{handle} is
 *  linked from every buyer artwork card), and without this they were a dead
 *  end that also asked them to sign in again.
 *
 *  The destination is always /workspace rather than /artspace or /collect
 *  directly: that route already owns the role decision, and it waits for the
 *  profile before choosing. Only the label needs the role, and it falls back
 *  to a neutral word when the profile hasn't arrived. */
export function Header() {
  const { loading, isAuthenticated, profile } = useSession();

  // Nothing is rendered in this slot until the identity check settles.
  // Briefly telling a signed-in person to "Create JO1NID" is worse than a
  // brief gap where the button will be.
  const actions = loading ? null : isAuthenticated ? (
    <Link to="/workspace" className={styles.workspaceBtn}>
      {profile?.role === 'buyer'
        ? 'My Workspace'
        : profile?.role === 'guardian'
          ? 'Guardian Requests'
          : 'My ArtSpace'}
    </Link>
  ) : (
    <div className={styles.authGroup}>
      <Link to="/login" className={styles.enterBtn}>
        Enter ArtSpace
      </Link>
      <ShinyButton to="/apply" className={styles.createBtnShiny}>
        Create JO1NID
      </ShinyButton>
    </div>
  );

  /* The floating nav replaces this whole row on a phone, so it needs the same
     one action the row carries — whatever `actions` above resolves to,
     collapsed to a single label/destination since the pill has no room for a
     two-button group. "Enter ArtSpace" already doesn't survive to mobile
     today (hidden below 640px in the old row), so dropping it here isn't a
     new loss. Nothing rendered while `loading`, same reasoning as `actions`. */
  const floatingCta: FloatingNavItem | null = loading
    ? null
    : isAuthenticated
      ? {
          name:
            profile?.role === 'buyer'
              ? 'My Workspace'
              : profile?.role === 'guardian'
                ? 'Guardian Requests'
                : 'My ArtSpace',
          to: '/workspace',
          cta: true,
        }
      : { name: 'Create JO1NID', to: '/apply', cta: true };

  /* Home, Artists and For Buyers stay on the bar itself; How It Works and
     Pricing sit behind the "more" toggle instead — the row shows the three
     shortest destinations and the primary action at a glance, matching what
     was asked for rather than all five links at once. */
  const floatingItems: FloatingNavItem[] = [
    ...navLinks.map((link) => ({
      name: link.label,
      to: link.href,
      end: link.href === '/',
      secondary: link.href === '/how-it-works' || link.href === '/pricing',
    })),
    ...(floatingCta ? [floatingCta] : []),
  ];

  return (
    <>
      {/* Outside the header, not inside it: the header's own sticky/blur
          layer would otherwise become the containing block for this pill's
          `fixed` positioning, anchoring it to the header instead of the
          screen (the same issue the workspace bottom bar hit). Shown only
          where the row below is hidden, at the same width the desktop nav
          already collapses at. */}
      <AnimatedNavFramer items={floatingItems} className="hidden max-[1100px]:block" />

      <header className={`${styles.header} ${styles.desktopOnly}`}>
        <div className={`container ${styles.bar}`}>
          <Link to="/" className={styles.brand}>
            <img src={logo} alt="ARTBANK" className={styles.wordmark} />
          </Link>

          <nav className={styles.nav} aria-label="Primary">
            {navLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.href}
                end={link.href === '/'}
                className={({ isActive }) => (isActive ? styles.navActive : undefined)}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className={styles.actions}>{actions}</div>
        </div>
      </header>
    </>
  );
}
