import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BuyerShell } from '../components/buyer/BuyerShell';
import { BuyerTopbar } from '../components/buyer/BuyerTopbar';
import { ArtspacePageHeader } from '../components/artspace/ArtspacePageHeader';
import { Icon } from '../components/ui/Icon';
import { useSession } from '../lib/sessionContext';
import { dealStatusCopy, dealTypes, isSettled, listMyPurchases, type DealSummary } from '../services/deals';
import { ReportPaymentDialog } from '../components/artspace/ReportPaymentDialog';
import styles from './PurchasesPage.module.css';

/** What the buyer has actually bought.
 *
 *  This screen exists because the ledger could not answer it. A recorded sale
 *  moved the buyer's enquiry to "Closed" — the same label a declined enquiry
 *  gets — so the one place a purchase appeared told the buyer it had ended.
 *
 *  Nothing here is a buyer-side copy of artist data: it is the same
 *  `artwork_deals` rows the artist recorded, read from the other end. 0012's
 *  policy grants read to both parties, which is what makes one row serve two
 *  screens that cannot disagree.
 *
 *  There is deliberately no total. A running "amount spent" figure is the
 *  kind of number the brief refuses to invent, and it would be wrong the
 *  moment two currencies appear. */
export function PurchasesPage() {
  const { profile } = useSession();
  const [deals, setDeals] = useState<DealSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [reporting, setReporting] = useState<DealSummary | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    listMyPurchases(profile).then((rows) => {
      if (!active) return;
      setDeals(rows);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [profile]);

  return (
    <BuyerShell topbar={<BuyerTopbar />}>
      <ArtspacePageHeader
        title="Purchases"
        subtitle="Works you have acquired, licensed or commissioned."
      />

      {loading ? (
        <p className={styles.state}>Loading…</p>
      ) : deals.length === 0 ? (
        <div className={styles.empty}>
          <Icon name="handshake" size={26} className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>Nothing bought yet</p>
          <p className={styles.emptyNote}>
            When an artist records a sale, licence or commission with you, it appears here with
            what was agreed.
          </p>
          <Link to="/collect" className={styles.emptyLink}>
            Browse artworks
          </Link>
        </div>
      ) : (
        <ul className={styles.list}>
          {deals.map((deal) => {
            const copy = dealStatusCopy[deal.status];
            const type = dealTypes.find((d) => d.id === deal.dealType)?.label ?? 'Deal';

            return (
              <li className={styles.row} key={deal.id}>
                {deal.artworkImageUrl ? (
                  <img src={deal.artworkImageUrl} alt="" className={styles.thumb} loading="lazy" />
                ) : (
                  <span className={styles.thumbEmpty} aria-hidden="true">
                    <Icon name="image" size={18} />
                  </span>
                )}

                <div className={styles.body}>
                  {/* The artwork record is still readable while it is public;
                      once the artist takes it private the link would 404, so
                      it is only offered when there is an id to point at. */}
                  {deal.artworkId ? (
                    <Link to={`/collect/artworks/${deal.artworkId}`} className={styles.title}>
                      {deal.artworkTitle ?? 'Artwork'}
                    </Link>
                  ) : (
                    <p className={styles.title}>{deal.artworkTitle ?? 'Artwork'}</p>
                  )}

                  <p className={styles.meta}>
                    {type}
                    {deal.counterpartName ? ` · ${deal.counterpartName}` : ''} ·{' '}
                    {new Date(deal.settledAt ?? deal.agreedAt).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>

                  {deal.paymentRoute === 'offline' && isSettled(deal.status) && (
                    <p className={styles.note}>Settled directly with the artist.</p>
                  )}

                  {/* An outstanding request is the one row on this page with
                      something to do, so it says what that is. */}
                  {deal.status === 'awaiting_payment' && deal.paymentRoute === 'request' && (
                    <p className={styles.note}>
                      {deal.reportedAt
                        ? 'You reported paying. Waiting for the artist to confirm.'
                        : 'Pay the artist directly, then tell them here.'}
                    </p>
                  )}
                </div>

                <div className={styles.right}>
                  <p className={styles.amount}>
                    {deal.currency} {deal.amount.toLocaleString('en-US')}
                  </p>
                  <span className={[styles.status, styles[copy.tone]].join(' ')}>{copy.buyer}</span>

                  {deal.status === 'awaiting_payment' &&
                    deal.paymentRoute === 'request' &&
                    !deal.reportedAt && (
                      <button
                        type="button"
                        className={styles.report}
                        onClick={() => setReporting(deal)}
                      >
                        I’ve sent it
                      </button>
                    )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {notice && (
        <p className={styles.notice} role="status">
          {notice}
        </p>
      )}

      {reporting && (
        <ReportPaymentDialog
          deal={reporting}
          onClose={() => setReporting(null)}
          onReported={async (summary) => {
            setReporting(null);
            setNotice(summary);
            setDeals(await listMyPurchases(profile));
          }}
        />
      )}

      <p className={styles.footnote}>
        <Icon name="info" size={14} />
        ArtBank records what you and the artist agreed. It does not take payment or hold funds —
        settlement is between the two of you.
      </p>
    </BuyerShell>
  );
}
