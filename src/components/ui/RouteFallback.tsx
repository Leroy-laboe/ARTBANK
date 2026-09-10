import styles from './RouteFallback.module.css';

/** Shown while a lazily-loaded route's chunk is in flight.
 *
 *  Deliberately almost nothing: a spinner that only appears after a beat, so
 *  a chunk that arrives in 80ms doesn't flash a loading state at someone.
 *  The reserved height stops the header from jumping while it waits. */
export function RouteFallback() {
  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <span className="visually-hidden">Loading</span>
    </div>
  );
}
