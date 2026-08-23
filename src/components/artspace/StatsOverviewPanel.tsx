import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import styles from './StatsOverviewPanel.module.css';

export type OverviewStat = { id: string; value: string; label: string };

/** The rail's summary card: a title, an optional range selector, a grid of
 *  figures and a link out. My Works, Interest and Opportunities each pass
 *  their own numbers — the shape is identical, so the card is shared. */
export function StatsOverviewPanel({
  title,
  stats,
  ranges,
  columns = 2,
  linkTo,
  linkLabel = 'View full insights',
}: {
  title: string;
  stats: OverviewStat[];
  ranges?: string[];
  columns?: 2 | 3;
  linkTo: string;
  linkLabel?: string;
}) {
  return (
    <section className={styles.card}>
      <div className={styles.head}>
        <h2 className={styles.title}>{title}</h2>
        {ranges && (
          <label className={styles.range}>
            <span className="visually-hidden">Date range</span>
            <select defaultValue={ranges[0]}>
              {ranges.map((range) => (
                <option key={range}>{range}</option>
              ))}
            </select>
            <Icon name="chevron-down" size={13} />
          </label>
        )}
      </div>

      <dl className={[styles.stats, columns === 3 ? styles.cols3 : styles.cols2].join(' ')}>
        {stats.map((stat) => (
          <div key={stat.id}>
            <dd className={styles.value}>{stat.value}</dd>
            <dt className={styles.label}>{stat.label}</dt>
          </div>
        ))}
      </dl>

      <Link to={linkTo} className={styles.link}>
        {linkLabel}
        <Icon name="arrow-right" size={13} />
      </Link>
    </section>
  );
}
