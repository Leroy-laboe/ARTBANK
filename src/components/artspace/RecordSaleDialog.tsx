import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Icon } from '../ui/Icon';
import { useSession } from '../../lib/sessionContext';
import {
  dealStatusCopy,
  dealTypes,
  describeDealError,
  listEnquirers,
  paymentRoutes,
  recordSale,
  type DealType,
  type Enquirer,
  type PaymentRoute,
} from '../../services/deals';
import { currencies } from '../../data/artspaceAddArtwork';
import styles from './RecordSaleDialog.module.css';

/** Recording what was agreed, from wherever the agreement happened.
 *
 *  Opened from the message thread (where the price is usually settled) and
 *  from My Works. Both hand it the same three facts — which artwork, which
 *  buyer, and what they are called — so the artist retypes none of it.
 *
 *  The wording matters as much as the fields here. This writes down a figure;
 *  it does not take a payment, issue a contract or hold anything in escrow,
 *  and the note above the button says so. Overstating that would be the one
 *  claim this product cannot afford to make. */
export function RecordSaleDialog({
  artworkId,
  artworkTitle,
  buyerId,
  buyerName,
  onClose,
  onRecorded,
}: {
  artworkId: string;
  artworkTitle: string;
  /** Null when the agreement was reached with someone who has no ArtBank
   *  account — the deal is still recorded, just without a buyer attached. */
  buyerId: string | null;
  buyerName: string | null;
  onClose: () => void;
  onRecorded: (summary: string) => void;
}) {
  const { profile } = useSession();

  const [dealType, setDealType] = useState<DealType>('sale');
  const [paymentRoute, setPaymentRoute] = useState<PaymentRoute>('offline');

  /* Opened from My Works there is no buyer in hand, so one is chosen here from
     the people who enquired about this work. Without it the only option would
     be "not on ArtBank", which makes a payment request impossible — there
     would be nobody to request from. */
  const [enquirers, setEnquirers] = useState<Enquirer[]>([]);
  const [chosenBuyer, setChosenBuyer] = useState<string>(buyerId ?? '');
  const [currency, setCurrency] = useState('USD');
  const [amount, setAmount] = useState('');
  const [agreedAt, setAgreedAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (buyerId || !profile) return;
    let live = true;
    listEnquirers(profile, artworkId).then((rows) => {
      if (live) setEnquirers(rows);
    });
    return () => {
      live = false;
    };
  }, [buyerId, profile, artworkId]);

  useEffect(() => {
    amountRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!profile || saving) return;

    // The column refuses a negative figure and a zero is almost always a
    // mistyped field rather than a gift, so both are caught before the trip.
    const value = Number(amount);
    if (!amount.trim() || !Number.isFinite(value) || value <= 0) {
      setError('Enter the agreed amount.');
      return;
    }

    // A payment request has to reach somebody.
    if (paymentRoute === 'request' && !(buyerId ?? (chosenBuyer || null))) {
      setError('Choose a buyer to request payment from, or record it as already settled.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const result = await recordSale(profile, {
        artworkId,
        buyerId: buyerId ?? (chosenBuyer || null),
        dealType,
        amount: value,
        currency,
        agreedAt,
        paymentRoute,
      });

      const label = dealTypes.find((d) => d.id === dealType)?.label ?? 'Deal';
      const parts = [
        `${label} recorded — ${currency} ${value.toLocaleString('en-US')} · ${dealStatusCopy[result.status].artist}.`,
      ];
      if (result.availability === 'sold') parts.push(`“${artworkTitle}” is now marked sold.`);
      if (result.availability === 'reserved') {
        parts.push(`“${artworkTitle}” is reserved until the payment clears.`);
      }
      if (paymentRoute === 'request') {
        parts.push('They can see the amount and will tell you when they have sent it.');
      } else if (result.movedEnquiry) {
        parts.push('The buyer has been told.');
      }

      onRecorded(parts.join(' '));
    } catch (err) {
      setError(describeDealError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="record-sale-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.head}>
          <h2 className={styles.title} id="record-sale-title">
            Record a sale
          </h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            <Icon name="close" size={16} />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <dl className={styles.context}>
            <div className={styles.contextRow}>
              <dt>Artwork</dt>
              <dd>{artworkTitle}</dd>
            </div>
            {buyerId && (
              <div className={styles.contextRow}>
                <dt>Buyer</dt>
                <dd>{buyerName ?? <span className={styles.muted}>Not on ArtBank</span>}</dd>
              </div>
            )}
          </dl>

          {!buyerId && (
            <label className={styles.field}>
              <span className={styles.label}>Buyer</span>
              <select
                value={chosenBuyer}
                onChange={(e) => setChosenBuyer(e.target.value)}
                className={styles.input}
              >
                <option value="">Not on ArtBank</option>
                {enquirers.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
              {enquirers.length === 0 && (
                <span className={styles.hint}>
                  Nobody has enquired about this work yet, so there is nobody to request payment
                  from. You can still record a sale that is already settled.
                </span>
              )}
            </label>
          )}

          <fieldset className={styles.field}>
            <legend className={styles.label}>What was agreed</legend>
            <div className={styles.types}>
              {dealTypes.map((type) => (
                <label
                  key={type.id}
                  className={[styles.type, dealType === type.id && styles.typeOn]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <input
                    type="radio"
                    name="dealType"
                    value={type.id}
                    checked={dealType === type.id}
                    onChange={() => setDealType(type.id)}
                    className={styles.radio}
                  />
                  <span className={styles.typeLabel}>{type.label}</span>
                  <span className={styles.typeHint}>{type.hint}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className={styles.field}>
            <legend className={styles.label}>How is it being paid</legend>
            <div className={styles.types}>
              {paymentRoutes.map((route) => {
                // Only the card route is disabled: taking a card needs a server
                // to verify the provider's webhook, and offering it would
                // promise a checkout that cannot happen. "Request payment"
                // needs neither — the money moves directly between the two of
                // them and this tracks the handshake.
                const disabled = route.id === 'gateway';
                return (
                  <label
                    key={route.id}
                    className={[
                      styles.type,
                      paymentRoute === route.id && styles.typeOn,
                      disabled && styles.typeOff,
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <input
                      type="radio"
                      name="paymentRoute"
                      value={route.id}
                      checked={paymentRoute === route.id}
                      disabled={disabled}
                      onChange={() => setPaymentRoute(route.id)}
                      className={styles.radio}
                    />
                    <span className={styles.typeLabel}>{route.label}</span>
                    <span className={styles.typeHint}>{route.hint}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className={styles.row}>
            <label className={styles.field}>
              <span className={styles.label}>Amount</span>
              <span className={styles.amountRow}>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className={styles.currency}
                  aria-label="Currency"
                >
                  {currencies.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
                <input
                  ref={amountRef}
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={styles.input}
                  placeholder="0"
                />
              </span>
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Date agreed</span>
              <input
                type="date"
                value={agreedAt}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setAgreedAt(e.target.value)}
                className={styles.input}
              />
            </label>
          </div>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <p className={styles.note}>
            <Icon name="info" size={14} />
            This records what you agreed. ArtBank takes no payment and issues no contract — you
            and the buyer settle between yourselves.
          </p>

          <div className={styles.actions}>
            <button type="button" className={styles.cancel} onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className={styles.submit} disabled={saving}>
              {saving ? 'Recording…' : 'Record sale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
