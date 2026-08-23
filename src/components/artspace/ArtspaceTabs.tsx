import styles from './ArtspaceTabs.module.css';

export type ArtspaceTab = { id: string; label: string; count?: number };

/** Filter tabs shared across ArtSpace screens.
 *
 *  `boxed` is the enclosed strip My Works sits above its table; `underline` is
 *  the flush rule Interest uses. Same markup and behaviour either way. */
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
  return (
    <div
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
  );
}
