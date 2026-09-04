import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BuyerShell } from '../components/buyer/BuyerShell';
import { BuyerTopbar } from '../components/buyer/BuyerTopbar';
import { BuyerArtworkCard } from '../components/buyer/BuyerArtworkCard';
import { IntentDialog } from '../components/buyer/IntentDialog';
import { ArtspacePageHeader } from '../components/artspace/ArtspacePageHeader';
import { Icon } from '../components/ui/Icon';
import { useSession } from '../lib/sessionContext';
import { useSaveToggle } from '../lib/useSaveToggle';
import { listFollowedArtists, listNewFromFollowed, type FollowedArtist } from '../services/buyer';
import type { BuyerArtwork } from '../data/buyerContent';
import styles from './FollowingPage.module.css';

/** Following — new work from the artists this buyer follows.
 *
 *  An updates list, not a social feed. There are no likes, no comments and no
 *  engagement ranking: works are ordered by when the artist published them and
 *  nothing else (docs/pivot-checklist/17-do-not-build-guardrails.md). Follower
 *  counts stay off this screen for the same reason 03-homepage-stats deletes
 *  them from public view — following is a way to keep up with an artist, not a
 *  score anyone competes on. */
function publishedLabel(iso?: string): string | null {
  if (!iso) return null;
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return 'Published today';
  if (days === 1) return 'Published yesterday';
  if (days < 30) return `Published ${days} days ago`;
  return `Published ${new Date(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`;
}

export function FollowingPage() {
  const { profile } = useSession();

  const [artists, setArtists] = useState<FollowedArtist[]>([]);
  const [artworks, setArtworks] = useState<BuyerArtwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [asking, setAsking] = useState<BuyerArtwork | null>(null);
  const [sent, setSent] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([listFollowedArtists(profile), listNewFromFollowed(profile)]).then(
      ([followed, feed]) => {
        if (!active) return;
        setArtists(followed);
        setArtworks(feed.artworks);
        setLoading(false);
      },
    );
    return () => {
      active = false;
    };
  }, [profile]);

  const apply = useCallback((id: string, saved: boolean) => {
    setArtworks((rows) => rows.map((row) => (row.id === id ? { ...row, saved } : row)));
  }, []);

  const { toggle, busyId, notice } = useSaveToggle(apply);

  return (
    <BuyerShell topbar={<BuyerTopbar />}>
      <ArtspacePageHeader
        title="Following"
        subtitle="New work from the artists you follow."
      />

      {notice && (
        <p className={styles.notice} role="status">
          {notice}
        </p>
      )}

      {sent && (
        <p className={styles.sent} role="status">
          <Icon name="check-circle" size={15} />
          {sent}
        </p>
      )}

      {loading ? (
        <p className={styles.state}>Loading…</p>
      ) : artists.length === 0 ? (
        <div className={styles.empty}>
          <Icon name="users" size={26} className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>You’re not following anyone yet</p>
          <p className={styles.emptyNote}>
            Follow an artist and their new work appears here. They can see that you follow
            them — unlike saving, which stays private.
          </p>
          <Link to="/collect/artists" className={styles.emptyLink}>
            Browse artists
          </Link>
        </div>
      ) : (
        <>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              Artists you follow <span className={styles.count}>{artists.length}</span>
            </h2>

            <ul className={styles.artistRow}>
              {artists.map((artist) => {
                const inner = (
                  <>
                    {artist.avatarUrl ? (
                      <img src={artist.avatarUrl} alt="" className={styles.avatar} loading="lazy" />
                    ) : (
                      <span className={styles.avatarFallback} aria-hidden="true">
                        {artist.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                    <span className={styles.artistName}>{artist.name}</span>
                    {artist.country && <span className={styles.artistMeta}>{artist.country}</span>}
                  </>
                );

                return (
                  <li key={artist.id} className={styles.artistCard}>
                    {/* Only reachable when the artist chose a public handle —
                        without one there is no profile page to open. */}
                    {artist.handle ? (
                      <Link to={`/artists/${artist.handle}`} className={styles.artistLink}>
                        {inner}
                      </Link>
                    ) : (
                      <span className={styles.artistLink}>{inner}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>New work</h2>

            {artworks.length === 0 ? (
              <p className={styles.quietEmpty}>
                Nothing published yet by the artists you follow. This fills in as they publish.
              </p>
            ) : (
              <div className={styles.grid}>
                {artworks.map((artwork) => (
                  <BuyerArtworkCard
                    key={artwork.id}
                    artwork={artwork}
                    onToggleSave={toggle}
                    busy={busyId === artwork.id}
                    footnote={publishedLabel(artwork.publishedAt) ?? undefined}
                    action={
                      artwork.artistId
                        ? { label: 'Request Availability', onClick: setAsking }
                        : undefined
                    }
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {asking?.artistId && (
        <IntentDialog
          mode="availability"
          artistId={asking.artistId}
          artworkId={asking.id}
          artworkTitle={asking.title}
          artistName={asking.artistName}
          onClose={() => setAsking(null)}
          onSent={() => {
            setAsking(null);
            setSent('Your request reached the artist, with your name and what you asked for.');
          }}
        />
      )}
    </BuyerShell>
  );
}
