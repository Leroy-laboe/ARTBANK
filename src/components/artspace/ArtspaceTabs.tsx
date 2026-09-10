import { useEffect, useRef, useState } from 'react';
import styles from './ArtspaceTabs.module.css';

export type ArtspaceTab = { id: string; label: string; count?: number };

/** Filter tabs shared across ArtSpace screens.
 *
 *  `boxed` is the enclosed strip My Works sits above its table; `underline` is
 *  the flush rule Interest uses. Same markup and behaviour either way.
 *
 *  The strip scrolls horizontally on a narrow screen rather than wrapping —
 *  right, since these are mutually exclusive filters, not a set of facts to
 *  read together. But `overflow-x: auto` alone gives no hint that there's
 *  more to see: a tab list that runs past the edge just looks cut off, which
 *  is exactly what it looked like at 375px before this. The edge fades below
 *  are the fix — present only on the side there's actually more content,
 *  tracked from real scroll position rather than assumed from width. */
export function ArtspaceTabs({
  tabs,
  active,
  onChange,
  variant = 'boxed',
  label,
}: {
  tabs: ArtspaceTab[];
  active: string;
  onChange: (id: string) => void;
  variant?: 'boxed' | 'underline';
  label: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const update = () => {
      setCanScrollLeft(track.scrollLeft > 1);
      // -1 for sub-pixel rounding at the exact end.
      setCanScrollRight(track.scrollLeft < track.scrollWidth - track.clientWidth - 1);
    };

    update();
    track.addEventListener('scroll', update, { passive: true });
    // Also re-check on resize/content change — a tab count badge updating,
    // or the viewport itself changing, can flip whether this scrolls at all.
    const observer = new ResizeObserver(update);
    observer.observe(track);
    return () => {
      track.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [tabs]);

  return (
    <div
      className={[
        styles.wrap,
        canScrollLeft && styles.fadeLeft,
        canScrollRight && styles.fadeRight,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        ref={trackRef}
        className={[styles.tabs, variant === 'underline' ? styles.underline : styles.boxed].join(' ')}
        role="tablist"
        aria-label={label}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={[styles.tab, isActive && styles.tabActive].filter(Boolean).join(' ')}
              onClick={() => onChange(tab.id)}
            >
              {tab.label}
              {tab.count !== undefined && <span className={styles.count}>{tab.count}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
