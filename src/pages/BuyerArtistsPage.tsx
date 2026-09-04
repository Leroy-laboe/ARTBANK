import { useEffect, useMemo, useState } from 'react';
import { BuyerShell } from '../components/buyer/BuyerShell';
import { BuyerTopbar } from '../components/buyer/BuyerTopbar';
import { RealArtistCard } from '../components/creators/RealArtistCard';
import { ArtspacePageHeader } from '../components/artspace/ArtspacePageHeader';
import { Icon } from '../components/ui/Icon';
import {
  listPublicArtists,
  setFollowing,
  type PublicArtistSummary,
} from '../services/publicProfile';
import { listFollowedArtists } from '../services/buyer';
import { useSession } from '../lib/sessionContext';
import styles from './BuyerArtistsPage.module.css';

/** Artists — every account with a published public profile.
 *
 *  Alphabetical, never by followers or activity: the brief bans a public
 *  artist ranking, and ordering a directory by a popularity number is that
 *  ranking with the numbers hidden
 *  (docs/pivot-checklist/17-do-not-build-guardrails.md). `listPublicArtists`
 *  already sorts this way; the search box filters, it does not reorder. */
export function BuyerArtistsPage() {
  const { profile } = useSession();
  const [artists, setArtists] = useState<PublicArtistSummary[]>([]);
  const [followed, setFollowed] = useState<Set<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [term, setTerm] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([listPublicArtists(60), listFollowedArtists(profile)]).then(([rows, follows]) => {
      if (!active) return;
      setArtists(rows);
      setFollowed(new Set(follows.map((f) => f.id)));
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [profile]);

  /** Optimistic, then reconciled: the button flips immediately and rolls back
   *  if the write fails, rather than sitting inert while the round trip
   *  finishes. Following is visible to the artist, unlike saving. */
  async function toggleFollow(artist: PublicArtistSummary) {
    if (!profile) return;

    const wasFollowing = followed.has(artist.id);
    setBusyId(artist.id);
    setFollowed((prev) => {
      const next = new Set(prev);
      if (wasFollowing) next.delete(artist.id);
      else next.add(artist.id);
      return next;
    });

    try {
      await setFollowing(artist.id, profile, !wasFollowing);
    } catch {
      setFollowed((prev) => {
        const next = new Set(prev);
        if (wasFollowing) next.add(artist.id);
        else next.delete(artist.id);
        return next;
      });
      setNotice('That could not be saved. Please try again.');
      setTimeout(() => setNotice(null), 4000);
    } finally {
      setBusyId(null);
    }
  }

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

      {notice && (
        <p className={styles.notice} role="status">
          {notice}
        </p>
      )}

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
            <RealArtistCard
              key={artist.handle}
              artist={artist}
              following={followed.has(artist.id)}
              /* Signed out there is nobody to attribute the follow to, and
                 there is deliberately no anonymous follow. */
              onToggleFollow={profile ? toggleFollow : undefined}
              busy={busyId === artist.id}
            />
          ))}
        </div>
      )}
    </BuyerShell>
  );
}
