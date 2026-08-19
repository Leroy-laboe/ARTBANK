import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { featuredArtist } from '../../data/homeSections';
import styles from './FeaturedArtistBand.module.css';

export function FeaturedArtistBand() {
  return (
    <section className={styles.band}>
      <div className={styles.media}>
        <img src={featuredArtist.imageUrl} alt="" loading="lazy" />
      </div>

      <div className={styles.copyCol}>
        <div className={styles.copy}>
          <p className={`eyebrow ${styles.eyebrow}`}>{featuredArtist.eyebrow}</p>
          <h2 className={styles.title}>{featuredArtist.title}</h2>
          <p className={styles.desc}>{featuredArtist.description}</p>

          <blockquote className={styles.quote}>“{featuredArtist.quote}”</blockquote>

          <p className={styles.meta}>{featuredArtist.meta}</p>

          <Link to="/artists" className={styles.cta}>
            {featuredArtist.cta}
            <Icon name="arrow-right" size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
