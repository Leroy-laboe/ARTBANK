import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { portfolioOverview } from '../../data/artspaceWorks';
import styles from './PortfolioOverviewPanel.module.css';

/** Portfolio totals for the whole library, not just the visible page. The
 *  range selector is presentational until there's a backend to re-query. */
export function PortfolioOverviewPanel() {
  return (
    <section className={styles.card}>
      <div className={styles.head}>
        <h2 className={styles.title}>Portfolio Overview</h2>
        <label className={styles.range}>
          <span className="visually-hidden">Date range</span>
          <select defaultValue={portfolioOverview.ranges[0]}>
            {portfolioOverview.ranges.map((range) => (
              <option key={range}>{range}</option>
            ))}
          </select>
          <Icon name="chevron-down" size={13} />
        </label>
      </div>

      <dl className={styles.stats}>
        {portfolioOverview.stats.map((stat) => (
          <div key={stat.id}>
            <dd className={styles.value}>{stat.value}</dd>
            <dt className={styles.label}>{stat.label}</dt>
          </div>
        ))}
      </dl>

      <Link to="/artspace/profile" className={styles.link}>
        View full insights
        <Icon name="arrow-right" size={13} />
      </Link>
    </section>
  );
}
