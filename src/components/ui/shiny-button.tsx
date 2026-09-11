import type { MouseEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import styles from './shiny-button.module.css';

type CommonProps = {
  children: ReactNode;
  className?: string;
  onClick?: (event: MouseEvent) => void;
};

type ShinyButtonAsButton = CommonProps & {
  to?: undefined;
  type?: 'button' | 'submit';
  disabled?: boolean;
};

type ShinyButtonAsLink = CommonProps & {
  to: string;
  type?: undefined;
  disabled?: undefined;
};

/** An animated pill button — a rotating conic-gradient border, a dot pattern
 *  masked to a moving wedge, an inner shimmer sweep, and a glow that breathes
 *  under the label on hover/focus.
 *
 *  The supplied design, unchanged: same colours*, same shape, same timings.
 *  Only the scoping mechanism moved — Next.js's styled-jsx isn't available in
 *  this Vite project, so the `<style jsx>` block became the CSS Module beside
 *  this file. (*One deliberate change, made on request: the highlight colour
 *  is this site's own gold rather than the supplied blue — see
 *  shiny-button.module.css.)
 *
 *  Three additions beyond the demo, which only ever rendered a `<button
 *  onClick>`:
 *  - `type`/`disabled`, for the sign-in form's real submit control, which has
 *    to go quiet while a sign-in is in flight.
 *  - Polymorphic `to`, matching this project's own `Button` component
 *    (Button.tsx) — some of the places this button replaces are navigation
 *    links, not click handlers, so this renders a router `Link` styled
 *    identically rather than a `<button>` faking navigation with an onClick.
 *  - `onClick` forwards the real MouseEvent rather than taking no arguments —
 *    the demo never needed to stop one from bubbling; inside the mobile
 *    header's floating nav, this button sits inside a larger element that
 *    has its own click handler, and a tap on the button would otherwise also
 *    trigger that. */
export function ShinyButton({ children, onClick, className, to, type = 'button', disabled }: ShinyButtonAsButton | ShinyButtonAsLink) {
  if (to !== undefined) {
    return (
      <Link to={to} onClick={onClick} className={cn(styles.shinyCta, className)}>
        <span>{children}</span>
      </Link>
    );
  }

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={cn(styles.shinyCta, className)}>
      <span>{children}</span>
    </button>
  );
}

export default ShinyButton;
