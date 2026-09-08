import { useEffect, useState } from 'react';
import { Icon } from '../ui/Icon';
import { generateQrDataUrl, smartLinkUrl } from '../../services/smartLink';
import styles from './SmartLinkPanel.module.css';

/** The artwork's permanent shareable link, plus what it has brought in.
 *  docs/pivot-checklist/19-feature-smart-artwork-link-qr.md.
 *
 *  The public page (/a/:id — Contact, Request Availability, Request Private
 *  Viewing, Present Yourself) and the QR code are both real. What still
 *  isn't built is the social-media preview card: that needs server-rendered
 *  meta tags a crawler reads before any JavaScript runs, and this is a
 *  client-only SPA serving the same index.html to every route. Stated here
 *  rather than left to be discovered by posting the link and getting a blank
 *  preview back. */
export function SmartLinkPanel({
  artworkId,
  totalVisits,
  bySource,
}: {
  artworkId: string;
  totalVisits: number;
  bySource: { source: string; count: number }[];
}) {
  const [copied, setCopied] = useState(false);
  const [qr, setQr] = useState<string | null>(null);

  const url = smartLinkUrl(artworkId);
  const qrUrl = smartLinkUrl(artworkId, 'qr');

  useEffect(() => {
    let active = true;
    generateQrDataUrl(qrUrl).then((dataUrl) => {
      if (active) setQr(dataUrl);
    });
    return () => {
      active = false;
    };
  }, [qrUrl]);

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
      <p className={styles.note}>Anyone with this link can view and contact you about this work.</p>

      <p className={styles.url} title={url}>
        {url}
      </p>

      <div className={styles.row}>
        <button type="button" className={styles.copyBtn} onClick={copy}>
          <Icon name={copied ? 'check' : 'copy'} size={14} />
          {copied ? 'Copied' : 'Copy link'}
        </button>

        {qr && (
          <a href={qr} download={`artbank-${artworkId}-qr.png`} className={styles.copyBtn}>
            <Icon name="download" size={14} />
            Download QR
          </a>
        )}
      </div>

      {qr && <img src={qr} alt="QR code for this artwork's link" className={styles.qr} />}

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
        Scanning the QR or opening a source-tagged link (e.g. from Instagram) counts here by
        source. A social-media preview image isn’t built yet, so the link itself is what carries
        the artwork — it won’t show a thumbnail when pasted into a post.
      </p>
    </section>
  );
}
