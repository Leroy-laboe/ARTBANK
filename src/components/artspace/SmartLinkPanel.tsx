import { useState } from 'react';
import { Icon } from '../ui/Icon';
import styles from './SmartLinkPanel.module.css';

/** The artwork's permanent shareable link, plus what it has brought in.
 *
 *  docs/pivot-checklist/19-feature-smart-artwork-link-qr.md asks for a public
 *  /a/{slug} page, a QR code and a social preview card. None of the three is
 *  built: the buyer-facing page is its own screen, a QR needs an encoder this
 *  project has no dependency for, and a preview card needs server-rendered
 *  meta tags a client-only SPA cannot produce.
 *
 *  So the link here is the record's own URL, which works — for the artist,
 *  signed in. That limit is stated on screen rather than left to be discovered
 *  by sending it to a gallery. */
export function SmartLinkPanel({
  url,
  totalVisits,
  bySource,
}: {
  url: string;
  totalVisits: number;
  bySource: { source: string; count: number }[];
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const top = bySource[0];

  return (
    <section className={styles.card}>
      <h2 className={styles.title}>Smart Link</h2>
      <p className={styles.note}>Opens this record. You need to be signed in.</p>

      <p className={styles.url} title={url}>
        {url}
      </p>

      <button type="button" className={styles.copyBtn} onClick={copy}>
        <Icon name={copied ? 'check' : 'copy'} size={14} />
        {copied ? 'Copied' : 'Copy link'}
      </button>

      <div className={styles.stats}>
        <p className={styles.statLine}>
          <strong>{totalVisits}</strong> visit{totalVisits === 1 ? '' : 's'}
        </p>
        {top && (
          <p className={styles.statNote}>
            Most from {top.source} ({top.count}).
          </p>
        )}
      </div>

      <p className={styles.pending}>
        The public buyer page — with Contact, Request Availability and Present Yourself — plus
        its QR code and preview card aren’t built yet. Don’t send this link outside ARTBANK.
      </p>
    </section>
  );
}
