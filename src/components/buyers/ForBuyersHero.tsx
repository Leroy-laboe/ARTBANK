import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { useSession } from '../../lib/sessionContext';
import type { BuyerArtwork } from '../../data/buyerContent';
import styles from './ForBuyersHero.module.css';

/** The banner half is the most recently published real artwork, not a
 *  hand-curated "Featured Collection" — there's no curation flag in the
 *  schema to back one, so "Newest Addition" is the honest version of the
 *  same visual idea. */
export function ForBuyersHero({
  term,
  onTermChange,
  onSubmit,
  featured,
}: {
  term: string;
  onTermChange: (value: string) => void;
  onSubmit: () => void;
  featured: BuyerArtwork | null;
}) {
  // Same rule as ForBuyersArtworkCard: the signed-in artwork page is behind a
  // login, so signed-out visitors get the public artwork link instead.
  const { isAuthenticated } = useSession();

  return (
    <section className={styles.hero}>
      <div className={styles.left}>
        <h1 className={styles.title}>Collect original artworks.</h1>
        <p className={styles.subtitle}>Discover and browse real, published work from artists on ArtBank.</p>

        <form
          className={styles.searchForm}
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          role="search"
        >
          <Icon name="search" size={16} className={styles.searchIcon} />
          <input
            type="search"
            placeholder="Search artworks, artists, or mediums..."
            aria-label="Search artworks"
            value={term}
            onChange={(e) => onTermChange(e.target.value)}
          />
          <button type="submit" className={styles.searchBtn}>
            Search
          </button>
        </form>
      </div>

      {featured && (
        <Link
          to={isAuthenticated ? `/collect/artworks/${featured.id}` : `/a/${featured.id}`}
          className={styles.banner}
        >
          {featured.imageUrl && <img src={featured.imageUrl} alt="" className={styles.bannerImage} />}
          <div className={styles.scrim} />
          <div className={styles.bannerContent}>
            <p className={styles.eyebrow}>Newest Addition</p>
            <h2 className={styles.bannerTitle}>{featured.title}</h2>
            <p className={styles.bannerArtist}>by {featured.artistName}</p>
            <span className={styles.bannerLink}>
              View Artwork
              <Icon name="arrow-right" size={13} />
            </span>
          </div>
        </Link>
      )}
    </section>
  );
}
