import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Icon } from '../components/ui/Icon';
import { useSession } from '../lib/sessionContext';
import { getArtworkRecord, type ArtworkRecord } from '../services/artworkRecord';
import { generateQrDataUrl, smartLinkUrl } from '../services/smartLink';
import { passportCopy, type BuyerPassport } from '../data/buyerContent';
import styles from './ProfessionalPackPage.module.css';

const coaLabel: Record<string, BuyerPassport> = {
  not_requested: 'None',
  pending_review: 'In Review',
  issued: 'Verified',
};

/** One-Click Professional Pack — a consistent one-page summary for a
 *  gallery, buyer or press enquiry that isn't a screenshot of the artist's
 *  own dashboard. "Output: mobile share page and downloadable PDF" — this is
 *  the share page; "downloadable" is the browser's own Print → Save as PDF,
 *  which needs no server and produces a real PDF rather than a promise of
 *  one this project has no way to render. */
export function ProfessionalPackPage() {
  const { id = '' } = useParams();
  const { profile } = useSession();
  const [record, setRecord] = useState<ArtworkRecord | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getArtworkRecord(id).then((result) => {
      if (active) {
        setRecord(result);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    let active = true;
    generateQrDataUrl(smartLinkUrl(id)).then((dataUrl) => {
      if (active) setQr(dataUrl);
    });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <p className={styles.state}>Loading…</p>;
  if (!record) return <p className={styles.state}>This record could not be found.</p>;

  const { artwork } = record;
  const passport = passportCopy[coaLabel[artwork.coaStatus] ?? 'None'];
  const primaryImage = record.images.find((i) => i.isPrimary)?.url ?? record.images[0]?.url ?? null;
  const artistName = profile?.artistName?.trim() || profile?.displayName?.trim() || artwork.artist;

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <p className={styles.toolbarNote}>
          This is the Professional Pack a gallery or buyer would receive. Use your browser's print
          dialog and choose "Save as PDF" for a downloadable copy.
        </p>
        <button type="button" className={styles.printBtn} onClick={() => window.print()}>
          <Icon name="download" size={15} />
          Print / Save as PDF
        </button>
      </div>

      <div className={styles.sheet}>
        <header className={styles.header}>
          <div>
            <p className={styles.brand}>ARTBANK</p>
            <p className={styles.by}>
              {artistName}
              {profile?.jo1nIdentityId && (
                <span className={styles.idNote}> · JO1N ID {profile.jo1nIdentityId}</span>
              )}
            </p>
          </div>
          {qr && <img src={qr} alt="Scan to view this artwork online" className={styles.qr} />}
        </header>

        <div className={styles.body}>
          <div className={styles.imageCol}>
            {primaryImage ? (
              <img src={primaryImage} alt={artwork.title} className={styles.image} />
            ) : (
              <div className={styles.imageEmpty} aria-hidden="true">
                <Icon name="image" size={26} />
              </div>
            )}
          </div>

          <div className={styles.infoCol}>
            <h1 className={styles.title}>{artwork.title}</h1>
            <p className={styles.meta}>
              {[artwork.medium, artwork.dimensions, artwork.year ? String(artwork.year) : null]
                .filter(Boolean)
                .join(' · ') || 'Details not stated'}
            </p>

            {artwork.description && <p className={styles.description}>{artwork.description}</p>}

            <dl className={styles.facts}>
              <div className={styles.fact}>
                <dt>Availability</dt>
                <dd>{artwork.availability.replace('_', ' ')}</dd>
              </div>
              <div className={styles.fact}>
                <dt>Rights</dt>
                <dd>
                  {artwork.permittedUses.length > 0
                    ? artwork.permittedUses.join(', ')
                    : artwork.rightsNote || 'On request'}
                </dd>
              </div>
              <div className={styles.fact}>
                <dt>Passport &amp; Certificate</dt>
                <dd>{passport.title}</dd>
              </div>
            </dl>

            <p className={styles.link}>{smartLinkUrl(id)}</p>
          </div>
        </div>

        <footer className={styles.footer}>
          Generated via ARTBANK — the artist's own record, not a third-party appraisal.
        </footer>
      </div>
    </div>
  );
}
