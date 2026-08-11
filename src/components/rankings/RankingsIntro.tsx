import { Icon } from '../ui/Icon';
import { podiumTop3 } from '../../data/mriRankingsContent';
import styles from './RankingsIntro.module.css';

export function RankingsIntro() {
  return (
    <div className={styles.wrap}>
      <div className={styles.headline}>
        <h1 className={styles.title}>MRI Rankings</h1>
        <p className={styles.desc}>
          The Most Reputable Index in the Art World. Measuring influence, market performance, and
          cultural impact across the global art ecosystem.
        </p>
      </div>

      <div className={styles.podium}>
        <svg className={styles.arc} viewBox="0 0 520 150" width="520" height="150" aria-hidden="true">
          <path d="M8,146 A252,252 0 0 1 512,146" fill="none" stroke="var(--border)" strokeWidth="1" />
          <circle cx="8" cy="146" r="4" fill="none" stroke="var(--border)" strokeWidth="1" />
          <circle cx="512" cy="146" r="4" fill="none" stroke="var(--border)" strokeWidth="1" />
        </svg>

        {podiumTop3.map((creator) => (
          <div key={creator.rank} className={`${styles.slot} ${styles[`slot${creator.rank}`]}`}>
            <span className={styles.rankNumber}>{creator.rank}</span>
            <div className={styles.photoWrap}>
              <img
                src={creator.imageUrl}
                alt={creator.name}
                className={styles.photo}
                loading="lazy"
                decoding="async"
              />
              <span className={styles.scoreBadge}>
                <Icon name="crown" size={12} className={styles.badgeCrown} />
                <span className={styles.badgeScore}>{creator.mriScore}</span>
              </span>
            </div>
            <div className={styles.name}>{creator.name}</div>
            <div className={styles.country}>{creator.country}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
