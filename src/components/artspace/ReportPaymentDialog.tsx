import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Icon } from '../ui/Icon';
import { useSession } from '../../lib/sessionContext';
import { describeDealError, reportMethods, reportPayment, type DealSummary } from '../../services/deals';
import styles from './RecordSaleDialog.module.css';

/** The buyer's half of the payment handshake.
 *
 *  Filing this changes nothing about the deal — it is a claim sitting beside
 *  it, and the artist confirming is what settles things. The wording says so
 *  plainly, because a buyer who thinks pressing this completed the purchase
 *  will stop watching for the confirmation that matters.
 *
 *  The reference field is the useful one: it is what the artist searches for
 *  on their bank statement. Optional, because cash has no reference. */
export function ReportPaymentDialog({
  deal,
  onClose,
  onReported,
}: {
  deal: DealSummary;
  onClose: () => void;
  onReported: (summary: string) => void;
}) {
  const { profile } = useSession();

  const [method, setMethod] = useState('bank_transfer');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const firstRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    firstRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!profile || saving) return;

    setSaving(true);
    setError(null);

    try {
      await reportPayment(profile, deal.id, {
        method,
        reference: reference.trim() || null,
        note: note.trim() || null,
      });
      onReported(
        `Reported. ${deal.counterpartName ?? 'The artist'} will confirm once the payment reaches them.`,
      );
    } catch (err) {
      setError(describeDealError(err));
    } finally {
      setSaving(false);
    }
  }

  const money = `${deal.currency} ${deal.amount.toLocaleString('en-US')}`;

  return (
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-payment-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.head}>
          <h2 className={styles.title} id="report-payment-title">
            Tell the artist you&rsquo;ve paid
          </h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            <Icon name="close" size={16} />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <dl className={styles.context}>
            <div className={styles.contextRow}>
              <dt>Artwork</dt>
              <dd>{deal.artworkTitle ?? 'Artwork'}</dd>
            </div>
            <div className={styles.contextRow}>
              <dt>Amount</dt>
              <dd>{money}</dd>
            </div>
          </dl>

          <label className={styles.field}>
            <span className={styles.label}>How did you pay</span>
            <select
              ref={firstRef}
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className={styles.input}
            >
              {reportMethods.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Reference (optional)</span>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className={styles.input}
              placeholder="The reference on the transfer"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Anything to add (optional)</span>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={styles.input}
              placeholder="e.g. sent this morning, may take a day"
            />
          </label>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <p className={styles.note}>
            <Icon name="info" size={14} />
            This tells the artist to look out for your payment. It does not complete the purchase
            on its own — they confirm once the money reaches them.
          </p>

          <div className={styles.actions}>
            <button type="button" className={styles.cancel} onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className={styles.submit} disabled={saving}>
              {saving ? 'Sending…' : 'I’ve sent it'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
