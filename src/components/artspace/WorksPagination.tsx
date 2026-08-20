import { Icon } from '../ui/Icon';
import { worksPaging } from '../../data/artspaceWorks';
import styles from './WorksPagination.module.css';

/** Builds the page list with an ellipsis once there are more pages than fit,
 *  e.g. 1 2 3 … 7. Always keeps the first pages and the last one reachable. */
function pageList(page: number, totalPages: number): (number | 'gap')[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: (number | 'gap')[] = [];
  const window = [page - 1, page, page + 1].filter((p) => p > 1 && p < totalPages);
  pages.push(1, ...window);
  if ((window[window.length - 1] ?? 1) < totalPages - 1) pages.push('gap');
  pages.push(totalPages);
  return pages;
}

export function WorksPagination({
  page,
  onPageChange,
}: {
  page: number;
  onPageChange: (page: number) => void;
}) {
  const { from, to, total, totalPages } = worksPaging;

  return (
    <div className={styles.footer}>
      <p className={styles.summary}>
        Showing {from} to {to} of {total} artworks
      </p>

      <nav className={styles.pager} aria-label="Artwork pages">
        <button
          type="button"
          className={styles.step}
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
        >
          <Icon name="chevron-left" size={15} />
        </button>

        {pageList(page, totalPages).map((entry, i) =>
          entry === 'gap' ? (
            <span className={styles.gap} key={`gap-${i}`}>
              …
            </span>
          ) : (
            <button
              key={entry}
              type="button"
              className={[styles.page, entry === page && styles.pageActive].filter(Boolean).join(' ')}
              onClick={() => onPageChange(entry)}
              aria-current={entry === page ? 'page' : undefined}
            >
              {entry}
            </button>
          ),
        )}

        <button
          type="button"
          className={styles.step}
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
        >
          <Icon name="chevron-right" size={15} />
        </button>
      </nav>
    </div>
  );
}
