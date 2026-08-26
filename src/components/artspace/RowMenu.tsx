import { useEffect, useRef, useState } from 'react';
import { Icon, type IconName } from '../ui/Icon';
import styles from './RowMenu.module.css';

/** A section label. Once the menu carries the record's current availability
 *  and visibility as well as its actions, a flat list stops being readable. */
export type RowMenuHeading = { kind: 'heading'; id: string; label: string };

export type RowMenuAction = {
  kind?: 'item';
  id: string;
  label: string;
  icon: IconName;
  onSelect: () => void;
  /** Renders in the danger colour and sits below a divider. */
  destructive?: boolean;
  /** Set for options that show a current state, e.g. which availability is in
   *  force. Renders as a radio: the tick replaces the icon when selected. */
  checked?: boolean;
};

export type RowMenuItem = RowMenuHeading | RowMenuAction;

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
          {items.map((item) =>
            item.kind === 'heading' ? (
              <p className={styles.heading} key={item.id} role="presentation">
                {item.label}
              </p>
            ) : (
              <button
                key={item.id}
                type="button"
                role={item.checked === undefined ? 'menuitem' : 'menuitemradio'}
                aria-checked={item.checked}
                className={[
                  styles.item,
                  item.destructive && styles.destructive,
                  item.checked && styles.itemChecked,
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => {
                  setOpen(false);
                  item.onSelect();
                }}
              >
                <Icon name={item.checked ? 'check' : item.icon} size={15} />
                {item.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
