import { useState } from 'react';
import { Icon } from '../ui/Icon';
import { useSession } from '../../lib/sessionContext';
import { confirmPayment, dealStatusCopy, describeDealError, isSettled, type DealStatus } from '../../services/deals';
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
export function RecordEarningsTab({
  record,
  onChanged,
}: {
  record: ArtworkRecord;
  /** Called after a confirmation, so the page can re-read the record. */
  onChanged?: () => void;
}) {
  const { deals, artwork } = record;
  const { profile } = useSession();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Settled only. A deal awaiting payment is listed — the artist needs to see
  // it and act on it — but it is not money, and adding it to the total would
  // be the invented figure this screen exists to avoid.
  const settled = deals.filter((d) => isSettled(d.status));
  const total = settled.reduce((sum, d) => sum + d.amount, 0);
  const currency = deals[0]?.currency ?? artwork.currency;

  async function handleConfirm(deal: (typeof deals)[number]) {
    if (!profile) return;
    setBusyId(deal.id);
    setNotice(null);
    try {
      const result = await confirmPayment(profile, {
        id: deal.id,
        artworkId: artwork.id,
        dealType: deal.dealType,
        amount: deal.amount,
        currency: deal.currency,
      });
      setNotice(
        `Payment confirmed.${result.markedSold ? ' This work is now marked sold.' : ''}`,
      );
      onChanged?.();
    } catch (err) {
      setNotice(describeDealError(err));
    } finally {
      setBusyId(null);
    }
  }

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

      {notice && (
        <p className={styles.notice} role="status">
          {notice}
        </p>
      )}

      {deals.length > 0 ? (
        <>
          <div className={styles.total}>
            <span className={styles.totalValue}>
              {currency} {total.toLocaleString('en-US')}
            </span>
            <span className={styles.totalLabel}>
              from {settled.length} settled transaction{settled.length === 1 ? '' : 's'}
              {settled.length !== deals.length &&
                ` · ${deals.length - settled.length} awaiting payment`}
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
                  {' · '}
                  {dealStatusCopy[deal.status as DealStatus]?.artist ?? deal.status}
                </p>

                {/* Only a `request` deal can be confirmed here. An `offline`
                    one is already settled, and a `gateway` one is settled by a
                    verified webhook — 0025's policy refuses either from a
                    browser, so offering a button would offer a refusal. */}
                {deal.status === 'awaiting_payment' && deal.paymentRoute === 'request' && (
                  <button
                    type="button"
                    className={styles.confirmBtn}
                    disabled={busyId === deal.id}
                    onClick={() => handleConfirm(deal)}
                  >
                    {busyId === deal.id ? 'Confirming…' : 'Confirm receipt'}
                  </button>
                )}
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
