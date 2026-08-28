import { Icon } from '../ui/Icon';
import { dealStatusCopy, dealTypes, type DealSummary } from '../../services/deals';
import styles from './DealBanner.module.css';

/** The state of the deal, inside the conversation that produced it.
 *
 *  Before this existed, recording a sale changed nothing a person could see
 *  from the thread — the money was in the database and the conversation
 *  carried on as if still negotiating. This is the thread saying what
 *  happened.
 *
 *  One component, both sides. `side` only picks the wording: "Awaiting
 *  payment" is a thing the artist is waiting for and a thing the buyer has to
 *  act on, and using one phrase for both would misdescribe one of them. */
export function DealBanner({
  deal,
  side,
  onReport,
  onConfirm,
  busy = false,
}: {
  deal: DealSummary;
  side: 'artist' | 'buyer';
  /** Buyer, `request` route, unpaid: lets them say they have sent it. */
  onReport?: () => void;
  /** Artist, `request` route, unpaid: lets them confirm the money arrived,
   *  which is the act that settles the deal. */
  onConfirm?: () => void;
  busy?: boolean;
}) {
  const copy = dealStatusCopy[deal.status];
  const label = dealTypes.find((d) => d.id === deal.dealType)?.label ?? 'Deal';
  const money = `${deal.currency} ${deal.amount.toLocaleString('en-US')}`;

  const date = new Date(deal.settledAt ?? deal.agreedAt).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const awaiting = deal.status === 'awaiting_payment' && deal.paymentRoute === 'request';
  const reported = Boolean(deal.reportedAt);

  /** The line under the amount. On an outstanding request it carries the state
   *  of the handshake rather than the deal's own metadata, because that is the
   *  thing either side needs to act on. */
  const meta = awaiting
    ? reported
      ? side === 'artist'
        ? `Buyer reported paying${deal.reportReference ? ` · ref ${deal.reportReference}` : ''}`
        : 'Reported — waiting for the artist to confirm'
      : side === 'artist'
        ? 'Waiting for the buyer to pay'
        : 'Pay the artist directly, then tell them here'
    : `${label}${deal.artworkTitle ? ` · ${deal.artworkTitle}` : ''} · ${date}`;

  return (
    <aside
      className={[styles.banner, styles[copy.tone]].join(' ')}
      aria-label={`${label} status`}
    >
      <span className={styles.icon} aria-hidden="true">
        <Icon name={copy.tone === 'settled' ? 'check-circle' : copy.tone === 'ended' ? 'x-circle' : 'clock'} size={17} />
      </span>

      <div className={styles.body}>
        <p className={styles.line}>
          <strong className={styles.money}>{money}</strong>
          <span className={styles.sep} aria-hidden="true">
            ·
          </span>
          <span className={styles.status}>{side === 'artist' ? copy.artist : copy.buyer}</span>
        </p>
        <p className={styles.meta}>{meta}</p>
      </div>

      {/* The buyer's half: a claim that they have sent it. Hidden once made —
          reporting twice says nothing new. */}
      {awaiting && side === 'buyer' && !reported && onReport && (
        <button type="button" className={styles.pay} onClick={onReport} disabled={busy}>
          I’ve sent it
        </button>
      )}

      {/* The artist's half, and the act that actually settles the deal. Offered
          whether or not the buyer reported: money sometimes arrives before
          anyone says anything. */}
      {awaiting && side === 'artist' && onConfirm && (
        <button type="button" className={styles.pay} onClick={onConfirm} disabled={busy}>
          {busy ? 'Confirming…' : 'Confirm receipt'}
        </button>
      )}
    </aside>
  );
}
