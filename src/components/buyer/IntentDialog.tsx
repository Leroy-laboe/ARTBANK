import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Icon } from '../ui/Icon';
import { useSession } from '../../lib/sessionContext';
import { sendIntent, type IntentInput } from '../../services/buyer';
import { updateMyProfile, describeProfileError } from '../../services/profile';
import { countries } from '../../data/countries';
import {
  budgetBands,
  decisionTimelines,
  intentPurposes,
  type IntentPurpose,
} from '../../data/buyerContent';
import styles from './IntentDialog.module.css';

/** The Buyer Intent Card — docs/pivot-checklist/20-feature-buyer-intent-card.md.
 *
 *  Required whenever a viewer asks for price, availability, licensing or
 *  private access, which is exactly the three buttons on the artwork page.
 *  The spec's field list is the contract: Name, Role, Country, Purpose,
 *  Artwork, Message and consent are required; Organization is conditional;
 *  Budget and Decision timeline are optional; Intended use becomes required
 *  the moment the purpose is licensing.
 *
 *  Name and Country come from the buyer's own account rather than being
 *  retyped, and when the account has neither yet, the two inputs here save
 *  onto the profile as well as travelling with the enquiry — an artist who
 *  receives one card should be able to look that person up and find the same
 *  facts. */

export type IntentMode = 'availability' | 'contact' | 'viewing-room';

const modeCopy: Record<IntentMode, { title: string; note: string; cta: string }> = {
  availability: {
    title: 'Request availability',
    note: 'The artist sees who you are and what you are asking for. Nothing here is anonymous.',
    cta: 'Send request',
  },
  contact: {
    title: 'Contact the artist',
    note: 'The artist sees who you are and what you are asking for. Nothing here is anonymous.',
    cta: 'Send message',
  },
  'viewing-room': {
    title: 'Request a private viewing room',
    note: 'The artist decides what a room contains and how long it stays open. Asking does not open one.',
    cta: 'Send request',
  },
};

export function IntentDialog({
  mode,
  artistId,
  artworkId,
  artworkTitle,
  artistName,
  onClose,
  onSent,
}: {
  mode: IntentMode;
  artistId: string;
  artworkId: string | null;
  artworkTitle: string;
  artistName: string;
  onClose: () => void;
  /** Given the conversation the enquiry opened, when one could be opened. */
  onSent: (conversationId: string | null) => void;
}) {
  const { profile, refresh } = useSession();
  const copy = modeCopy[mode];

  const [purpose, setPurpose] = useState<IntentPurpose>('purchase');
  const [name, setName] = useState(profile?.displayName?.trim() ?? '');
  const [countryCode, setCountryCode] = useState(profile?.countryCode ?? '');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    firstFieldRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const needsCountry = (profile?.country?.trim() ?? '') === '';
  const needsName = (profile?.displayName?.trim() ?? '') === '';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile || sending) return;

    const form = new FormData(event.currentTarget);
    const message = String(form.get('message') ?? '').trim();
    const role = String(form.get('role') ?? '').trim();

    if (!message || !role) {
      setError('A role and a message are both required.');
      return;
    }

    setSending(true);
    setError(null);

    try {
      // Save the two identity fields onto the account first. If that fails the
      // enquiry is not sent: an artist receiving a card with no name on it is
      // the one outcome this form exists to prevent.
      if (needsName || needsCountry) {
        const chosen = countries.find((c) => c.code === countryCode);
        await updateMyProfile(profile, {
          ...(needsName ? { displayName: name.trim() } : {}),
          ...(needsCountry && chosen ? { country: chosen.name, countryCode: chosen.code } : {}),
        });
        await refresh();
      }

      const input: IntentInput = {
        artistId,
        artworkId,
        purpose,
        message,
        role,
        organization: String(form.get('organization') ?? '').trim() || null,
        budgetRange: String(form.get('budget') ?? '') || null,
        intendedUse: String(form.get('intendedUse') ?? '').trim() || null,
        decisionTimeline: String(form.get('timeline') ?? '') || null,
        stage: mode === 'viewing-room' ? 'viewing_room' : 'enquiry',
        source: mode,
      };

      const { conversationId } = await sendIntent(profile, input);
      onSent(conversationId);
    } catch (err) {
      setError(describeProfileError(err));
      setSending(false);
    }
  }

  return (
    <div
      className={styles.backdrop}
      onMouseDown={(event) => {
        if (!dialogRef.current?.contains(event.target as Node)) onClose();
      }}
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="intent-title"
        ref={dialogRef}
      >
        <header className={styles.head}>
          <div>
            <h2 className={styles.title} id="intent-title">
              {copy.title}
            </h2>
            <p className={styles.subject}>
              {artworkTitle} · {artistName}
            </p>
          </div>
          <button type="button" className={styles.close} aria-label="Close" onClick={onClose}>
            <Icon name="close" size={16} />
          </button>
        </header>

        <p className={styles.note}>{copy.note}</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label} htmlFor="intent-purpose">
            What are you asking for?
          </label>
          <select
            id="intent-purpose"
            className={styles.input}
            ref={firstFieldRef}
            value={purpose}
            onChange={(e) => setPurpose(e.target.value as IntentPurpose)}
          >
            {intentPurposes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>

          {needsName && (
            <>
              <label className={styles.label} htmlFor="intent-name">
                Your name
              </label>
              <input
                id="intent-name"
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </>
          )}

          {needsCountry && (
            <>
              <label className={styles.label} htmlFor="intent-country">
                Country
              </label>
              <select
                id="intent-country"
                className={styles.input}
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                required
              >
                <option value="">Select a country</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </>
          )}

          <label className={styles.label} htmlFor="intent-role">
            Your role
          </label>
          <input
            id="intent-role"
            name="role"
            className={styles.input}
            placeholder="Independent collector, curator, gallery director…"
            required
          />

          <label className={styles.label} htmlFor="intent-organization">
            Organisation <span className={styles.optional}>If you write on behalf of one</span>
          </label>
          <input id="intent-organization" name="organization" className={styles.input} />

          {purpose === 'licence' && (
            <>
              <label className={styles.label} htmlFor="intent-use">
                Intended use
              </label>
              <input
                id="intent-use"
                name="intendedUse"
                className={styles.input}
                placeholder="Where the work would appear, and for how long"
                required
              />
            </>
          )}

          <div className={styles.row}>
            <div>
              <label className={styles.label} htmlFor="intent-budget">
                Budget <span className={styles.optional}>Optional</span>
              </label>
              <select id="intent-budget" name="budget" className={styles.input} defaultValue="">
                <option value="">Not stated</option>
                {budgetBands.map((band) => (
                  <option key={band} value={band}>
                    {band}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={styles.label} htmlFor="intent-timeline">
                Timeline <span className={styles.optional}>Optional</span>
              </label>
              <select id="intent-timeline" name="timeline" className={styles.input} defaultValue="">
                <option value="">Not stated</option>
                {decisionTimelines.map((timeline) => (
                  <option key={timeline} value={timeline}>
                    {timeline}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className={styles.label} htmlFor="intent-message">
            Message
          </label>
          <textarea
            id="intent-message"
            name="message"
            className={[styles.input, styles.textarea].join(' ')}
            rows={4}
            placeholder="What you would like to know, and why you are asking."
            required
          />

          <p className={styles.consent}>
            <Icon name="shield-check" size={15} className={styles.consentIcon} />
            Sending this shares your name, country, role and everything above with {artistName}.
            That disclosure is what makes an enquiry count here.
          </p>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <div className={styles.actions}>
            <button type="button" className={styles.cancel} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submit} disabled={sending}>
              {sending ? 'Sending…' : copy.cta}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
