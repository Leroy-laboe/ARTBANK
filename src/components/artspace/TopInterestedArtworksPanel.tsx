import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { topInterestedArtworks } from '../../data/artspaceInterest';
import styles from './TopInterestedArtworksPanel.module.css';

/** The artist's own artworks ordered by how much interest each is drawing.
 *  Private to them — this is not the public artist leaderboard the guardrails
 *  forbid (docs/pivot-checklist/17-do-not-build-guardrails.md). */
export function TopInterestedArtworksPanel() {
  return (
    <section className={styles.card}>
      <h2 className={styles.title}>Top Interested Artworks</h2>

      <ul className={styles.list}>
        {topInterestedArtworks.map((artwork) => (
          <li className={styles.row} key={artwork.id}>
            <img src={artwork.imageUrl} alt="" className={styles.thumb} loading="lazy" />
            <div className={styles.copy}>
              <p className={styles.name}>{artwork.title}</p>
              <p className={styles.stats}>
                <span>{artwork.interested} interested</span>
                <span className={styles.enquiries}>
                  {artwork.enquiries} {artwork.enquiries === 1 ? 'enquiry' : 'enquiries'}
                </span>
              </p>
            </div>
          </li>
        ))}
      </ul>

      <Link to="/artspace/works" className={styles.link}>
        View full ranking
        <Icon name="arrow-right" size={13} />
      </Link>
    </section>
  );
}
