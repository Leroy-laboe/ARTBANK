import { useEffect, useMemo, useState } from 'react';
import { BuyerShell } from '../components/buyer/BuyerShell';
import { BuyerTopbar } from '../components/buyer/BuyerTopbar';
import { RealArtistCard } from '../components/creators/RealArtistCard';
import { ArtspacePageHeader } from '../components/artspace/ArtspacePageHeader';
import { Icon } from '../components/ui/Icon';
import { listPublicArtists, type PublicArtistSummary } from '../services/publicProfile';
import styles from './BuyerArtistsPage.module.css';

/** Artists — every account with a published public profile.
 *
 *  Alphabetical, never by followers or activity: the brief bans a public
 *  artist ranking, and ordering a directory by a popularity number is that
 *  ranking with the numbers hidden
 *  (docs/pivot-checklist/17-do-not-build-guardrails.md). `listPublicArtists`
 *  already sorts this way; the search box filters, it does not reorder. */
export function BuyerArtistsPage() {
  const [artists, setArtists] = useState<PublicArtistSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [term, setTerm] = useState('');

  useEffect(() => {
    let active = true;
    listPublicArtists(60).then((rows) => {
      if (!active) return;
      setArtists(rows);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const visible = useMemo(() => {
    const q = term.trim().toLowerCase();
    if (!q) return artists;
    return artists.filter((a) =>
      [a.name, a.country ?? '', a.mediums.join(' ')].join(' ').toLowerCase().includes(q),
    );
  }, [artists, term]);

  return (
    <BuyerShell
      topbar={
        <BuyerTopbar
          search
          value={term}
          onChange={setTerm}
          placeholder="Search artists by name, country or medium..."
        />
      }
    >
      <ArtspacePageHeader
        title="Artists"
        subtitle="Everyone who has published a profile on ArtBank."
      />

      {loading ? (
        <p className={styles.state}>Loading artists…</p>
      ) : visible.length === 0 ? (
        <div className={styles.empty}>
          <Icon name="users" size={26} className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>
            {artists.length === 0 ? 'No published profiles yet' : 'No artists match that'}
          </p>
          <p className={styles.emptyNote}>
            {artists.length === 0
              ? 'Artists appear here once they choose a handle and make their profile public.'
              : 'Try a different name, country or medium.'}
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {visible.map((artist) => (
            <RealArtistCard key={artist.handle} artist={artist} />
          ))}
        </div>
      )}
    </BuyerShell>
  );
}
