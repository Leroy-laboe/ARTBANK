import { Icon } from '../ui/Icon';
import { scoreDistribution } from '../../data/mriRankingsContent';
import styles from './ScoreDistributionPanel.module.css';

const gridlines = [30, 20, 10, 0];

export function ScoreDistributionPanel() {
  return (
    <div className={styles.panel}>
      <div className={styles.headRow}>
        <span className={styles.title}>MRI Score Distribution</span>
        <a href="#" className={styles.viewAll}>
          View insights
        </a>
      </div>

      <div className={styles.topRow}>
        <div className={styles.averageBlock}>
          <div className={styles.averageLabel}>Average MRI Score</div>
          <div className={styles.averageValue}>{scoreDistribution.average}</div>
          <div className={styles.averageChange}>
            <Icon name="trend-up" size={13} />
            {scoreDistribution.changePct}%
          </div>
          <div className={styles.averageSub}>vs last year</div>
        </div>

        <div className={styles.tierGrid}>
          {scoreDistribution.tiers.map((tier, index) => (
            <div
              key={tier.label}
              className={`${styles.tierBox} ${index === scoreDistribution.tiers.length - 1 ? styles.tierSpan : ''}`}
            >
              <div className={styles.tierLabel}>{tier.label}</div>
              <div className={styles.tierSub}>{tier.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.chart}>
        <div className={styles.gridlines}>
          {gridlines.map((line) => (
            <div className={styles.gridline} key={line}>
              <span>{line}%</span>
            </div>
          ))}
        </div>
        <div className={styles.bars}>
          {scoreDistribution.bars.map((bar) => (
            <div className={styles.barCol} key={bar.range}>
              <div className={styles.barTrack}>
                <div
                  className={styles.bar}
                  style={{ height: `${(bar.pct / scoreDistribution.scaleMax) * 100}%` }}
                />
              </div>
              <span className={styles.barLabel}>{bar.range}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.axisTitle}>MRI Score Range</div>
    </div>
  );
}
