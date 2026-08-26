import { Icon } from '../ui/Icon';
import type { ArtworkRecord } from '../../services/artworkRecord';
import styles from './recordTabs.module.css';

const dealLabel: Record<string, string> = {
  sale: 'Sale',
  licence: 'Licence',
  commission: 'Commission',
};

/** Earnings — recorded transactions only.
 *
 *  No valuation, no estimate, no "worth". The brief bans automatic valuation
 *  outright, and an empty list here means nothing has been recorded — which
 *  is not the same as the work being worth nothing, so the empty state says
 *  so rather than printing a zero. */
export function RecordEarningsTab({ record }: { record: ArtworkRecord }) {
  const { deals, artwork } = record;
  const total = deals.reduce((sum, d) => sum + d.amount, 0);
  const currency = deals[0]?.currency ?? artwork.currency;

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <div>
          <h2 className={styles.panelTitle}>Recorded earnings</h2>
          <p className={styles.panelNote}>
            Transactions recorded against this work. ARTBANK never estimates a value.
          </p>
        </div>
      </div>

      {deals.length > 0 ? (
        <>
          <div className={styles.total}>
            <span className={styles.totalValue}>
              {currency} {total.toLocaleString('en-US')}
            </span>
            <span className={styles.totalLabel}>
              from {deals.length} transaction{deals.length === 1 ? '' : 's'}
            </span>
          </div>

          <ul className={styles.list}>
            {deals.map((deal) => (
              <li className={styles.item} key={deal.id}>
                <div className={styles.itemHead}>
                  <p className={styles.itemTitle}>
                    {dealLabel[deal.dealType] ?? deal.dealType}
                    {deal.buyer ? ` · ${deal.buyer}` : ''}
                  </p>
                  <p className={styles.itemMeta}>
                    {deal.currency} {deal.amount.toLocaleString('en-US')}
                  </p>
                </div>
                <p className={styles.itemBody}>
                  {new Date(deal.agreedAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className={styles.empty}>
          <Icon name="bank" size={17} className={styles.emptyIcon} />
          <div>
            <p className={styles.emptyTitle}>No earnings recorded</p>
            <p className={styles.emptyBody}>
              That means nothing has been recorded — not that the work earned nothing. Marking a
              work sold does not create an earning; a transaction has to be recorded against it.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
