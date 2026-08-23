import { useEffect, useRef, useState } from 'react';
import { Icon, type IconName } from '../ui/Icon';
import styles from './RowMenu.module.css';

export type RowMenuItem = {
  id: string;
  label: string;
  icon: IconName;
  onSelect: () => void;
  /** Renders in the danger colour and sits below a divider. */
  destructive?: boolean;
};

/** The "⋮" overflow menu used on artwork rows and cards.
 *
 *  Closes on outside click and on Escape, and returns focus to the trigger so
 *  keyboard users don't get dropped at the top of the page. */
export function RowMenu({ label, items }: { label: string; items: RowMenuItem[] }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        ref={triggerRef}
        className={styles.trigger}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name="more-vertical" size={16} />
      </button>

      {open && (
        <div className={styles.menu} role="menu">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              className={[styles.item, item.destructive && styles.destructive]
                .filter(Boolean)
                .join(' ')}
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
            >
              <Icon name={item.icon} size={15} />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
