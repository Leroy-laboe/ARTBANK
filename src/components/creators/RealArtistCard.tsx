import { Link } from 'react-router-dom';
import { flagUrl } from '../../data/countries';
import type { PublicArtistSummary } from '../../services/publicProfile';
import styles from './RealArtistCard.module.css';

/** One real, published ArtBank artist — the honest counterpart to the mock
 *  cards below it.
 *
 *  No follower count. 03-homepage-stats-and-why-artbank.md deletes the public
 *  "24.8K followers" outright: following is how a buyer keeps up with an
 *  artist, not a number they compete on. The artist can see their own
 *  followers in ArtSpace, which is a different thing from publishing a score.
 *
 *  The flag only renders when `countryCode` is set — i.e. only once the
 *  artist chose their country from the real list in Profile Details rather
 *  than an older free-text value. See migration 0022. */
export function RealArtistCard({
  artist,
  following,
  onToggleFollow,
  busy = false,
}: {
  artist: PublicArtistSummary;
  following?: boolean;
  /** Omitted (signed out, or no buyer account) and no button renders — there
   *  is deliberately no anonymous follow. */
  onToggleFollow?: (artist: PublicArtistSummary) => void;
  busy?: boolean;
}) {
  return (
    <article className={styles.card}>
      <Link to={`/artists/${artist.handle}`} className={styles.link}>
        <div className={styles.imageWrap}>
          {artist.avatarUrl ? (
            <img src={artist.avatarUrl} alt="" className={styles.image} loading="lazy" />
          ) : (
            <div className={styles.imageEmpty} aria-hidden="true" />
          )}
        </div>

        <div className={styles.body}>
          <div className={styles.name}>{artist.name}</div>
          <div className={styles.title}>
            {artist.mediums.length > 0 ? artist.mediums.join(', ') : 'Artist'}
          </div>

          <div className={styles.footerRow}>
            <span className={styles.country}>
              {artist.countryCode && (
                <img src={flagUrl(artist.countryCode)} alt="" className={styles.flag} />
              )}
              <span className={styles.countryText}>{artist.country ?? ''}</span>
            </span>
          </div>
        </div>
      </Link>

      {onToggleFollow && (
        <button
          type="button"
          className={[styles.follow, following && styles.followOn].filter(Boolean).join(' ')}
          disabled={busy}
          aria-pressed={following}
          onClick={() => onToggleFollow(artist)}
        >
          {following ? 'Following' : 'Follow'}
        </button>
      )}
    </article>
  );
}
