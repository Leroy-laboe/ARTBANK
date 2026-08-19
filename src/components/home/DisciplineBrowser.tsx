import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import {
  disciplineArtists,
  disciplineFilters,
  type DisciplineFilter,
} from '../../data/homeSections';
import styles from './DisciplineBrowser.module.css';

export function DisciplineBrowser() {
  const [filter, setFilter] = useState<DisciplineFilter>('All');
  const shown =
    filter === 'All'
      ? disciplineArtists
      : disciplineArtists.filter((artist) => artist.discipline === filter);

  return (
    <section className={styles.section}>
      <div className="container">
        <p className={`eyebrow ${styles.eyebrow}`}>Browse by discipline</p>

        <div className={styles.head}>
          <h2 className={styles.title}>
            Different disciplines.
            <br />
            One professional standard.
          </h2>
          <p className={styles.headNote}>
            Explore talent across every creative discipline.
            <br />
            All professionals are portfolio-verified.
          </p>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.filters} role="tablist" aria-label="Filter by discipline">
            {disciplineFilters.map((option) => (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={filter === option}
                className={[styles.pill, filter === option && styles.pillActive]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setFilter(option)}
              >
                {option}
              </button>
            ))}
          </div>

          <Link to="/artists" className={styles.viewAll}>
            View all disciplines
            <Icon name="arrow-right" size={14} />
          </Link>
        </div>

        <div className={styles.grid}>
          {shown.map((artist) => (
            <article className={styles.card} key={artist.name}>
              <img className={styles.photo} src={artist.imageUrl} alt="" loading="lazy" />
              <div className={styles.cardBody}>
                <div>
                  <div className={styles.nameRow}>
                    <h3 className={styles.name}>{artist.name}</h3>
                    <Icon name="chevron-right" size={14} />
                  </div>
                  <div className={styles.role}>{artist.role}</div>
                  <div className={styles.location}>{artist.location}</div>
                </div>
                <Link to="/artists" className={styles.profileBtn}>
                  View Profile
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
