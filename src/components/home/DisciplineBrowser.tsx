import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import {
  disciplineArtists,
  disciplineFilters,
  disciplineStats,
  type DisciplineFilter,
} from '../../data/homeSections';
import styles from './DisciplineBrowser.module.css';

export function DisciplineBrowser() {
  const [filter, setFilter] = useState<DisciplineFilter>('All');
  const [query, setQuery] = useState('');

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return disciplineArtists.filter((artist) => {
      if (filter !== 'All' && artist.discipline !== filter) return false;
      if (!needle) return true;
      // The placeholder promises name, skill or location, so all three have
      // to actually be searched.
      return [artist.name, artist.role, artist.tag, artist.location].some((field) =>
        field.toLowerCase().includes(needle),
      );
    });
  }, [filter, query]);

  return (
    <section className={styles.section}>
      <span className={styles.orb} aria-hidden="true" />

      <div className={`container ${styles.inner}`}>
        <div className={styles.head}>
          <div className={styles.headCopy}>
            <p className={`eyebrow ${styles.eyebrow}`}>Browse by discipline</p>
            <h2 className={styles.title}>
              Different disciplines.
              <br />
              One professional standard.
            </h2>
            <p className={styles.intro}>
              Explore talent across every creative discipline. All professionals are portfolio
              verified.
            </p>
          </div>

          <dl className={styles.stats}>
            {disciplineStats.map((stat) => (
              <div className={styles.stat} key={stat.label}>
                <dt className={styles.statValue}>{stat.value}</dt>
                <dd className={styles.statLabel}>{stat.label}</dd>
              </div>
            ))}
          </dl>
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

          <div className={styles.search}>
            <Icon name="search" size={16} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, skill or location..."
              aria-label="Search creatives by name, skill or location"
            />
          </div>

          <Link to="/artists" className={styles.viewAll}>
            View all disciplines
            <Icon name="arrow-right" size={14} />
          </Link>
        </div>

        {shown.length > 0 ? (
          <div className={styles.grid}>
            {shown.map((artist) => (
              <article className={styles.card} key={artist.name}>
                <div className={styles.media}>
                  <img className={styles.photo} src={artist.imageUrl} alt="" loading="lazy" />
                  <span className={styles.tag}>{artist.tag}</span>
                  <span className={styles.place}>
                    <Icon name="map-pin" size={13} />
                    {artist.location}
                  </span>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.who}>
                    <h3 className={styles.name}>{artist.name}</h3>
                    <p className={styles.role}>{artist.role}</p>
                  </div>
                  <Link to="/artists" className={styles.profileBtn}>
                    View Profile
                    <Icon name="arrow-right" size={13} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          /* Without this the grid would simply vanish and read as a broken
             section rather than an empty result. */
          <p className={styles.empty}>
            No creatives match that search yet. Try a different name, skill or city — or{' '}
            <Link to="/artists">browse everyone</Link>.
          </p>
        )}
      </div>
    </section>
  );
}
