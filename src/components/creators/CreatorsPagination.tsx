import { useState } from 'react';
import { Icon } from '../ui/Icon';
import styles from './CreatorsPagination.module.css';

export function CreatorsPagination({ totalPages }: { totalPages: number }) {
  const [page, setPage] = useState(1);
  const pages = [1, 2, 3];

  return (
    <nav className={styles.pagination} aria-label="Creators pagination">
      <button
        type="button"
        className={styles.navBtn}
        disabled={page === 1}
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        aria-label="Previous page"
      >
        <Icon name="chevron-right" size={14} style={{ transform: 'rotate(180deg)' }} />
      </button>

      {pages.map((p) => (
        <button
          type="button"
          key={p}
          className={p === page ? styles.pageActive : styles.pageBtn}
          onClick={() => setPage(p)}
        >
          {p}
        </button>
      ))}

      <span className={styles.ellipsis}>…</span>

      <button
        type="button"
        className={page === totalPages ? styles.pageActive : styles.pageBtn}
        onClick={() => setPage(totalPages)}
      >
        {totalPages.toLocaleString()}
      </button>

      <button
        type="button"
        className={styles.navBtn}
        disabled={page === totalPages}
        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        aria-label="Next page"
      >
        <Icon name="chevron-right" size={14} />
      </button>
    </nav>
  );
}
