import { Link } from 'react-router-dom';
import { flagUrl } from '../../data/countries';
import type { PublicArtistSummary } from '../../services/publicProfile';
import styles from './RealArtistCard.module.css';

/** One real, published ArtBank artist — the honest counterpart to the mock
 *  cards below it. Deliberately plainer than CreatorCard in one other way:
 *  no save/heart button, since saving an artist isn't wired to anything real
 *  yet, unlike this card's link.
 *
 *  The flag only renders when `countryCode` is set — i.e. only once the
 *  artist chose their country from the real list in Profile Details rather
 *  than an older free-text value. See migration 0022. */
export function RealArtistCard({ artist }: { artist: PublicArtistSummary }) {
  return (
    <Link to={`/artists/${artist.handle}`} className={styles.card}>
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
          <span className={styles.followers}>
            {artist.followers} follower{artist.followers === 1 ? '' : 's'}
          </span>
        </div>
      </div>
    </Link>
  );
}
