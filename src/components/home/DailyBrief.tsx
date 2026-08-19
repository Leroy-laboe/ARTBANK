import { Icon } from '../ui/Icon';
import { dailyBriefFeature, dailyBriefItems } from '../../data/homeSections';
import styles from './DailyBrief.module.css';

export function DailyBrief() {
  return (
    <section className={styles.section}>
      <div className="container">
        <p className={`eyebrow ${styles.eyebrow}`}>Daily brief</p>

        <div className={styles.head}>
          <h2 className={styles.title}>
            Know what is changing.
            <br />
            Know what it means for your work.
          </h2>
          <span className={styles.headLink}>
            View all daily brief
            <Icon name="arrow-right" size={13} />
          </span>
        </div>

        <div className={styles.row}>
          <article className={styles.feature}>
            <img className={styles.featureImg} src={dailyBriefFeature.imageUrl} alt="" loading="lazy" />
            <div className={styles.featureBody}>
              <span className={styles.tag}>{dailyBriefFeature.tag}</span>
              <h3 className={styles.featureTitle}>{dailyBriefFeature.title}</h3>
              <p className={styles.featureDesc}>{dailyBriefFeature.description}</p>
              <span className={styles.readMore}>
                Read more
                <Icon name="arrow-right" size={12} />
              </span>
            </div>
          </article>

          <ol className={styles.list}>
            {dailyBriefItems.map((item, i) => (
              <li className={styles.listItem} key={item}>
                <span className={styles.listIndex}>{String(i + 1).padStart(2, '0')}</span>
                <span className={styles.listText}>{item}</span>
                <Icon name="chevron-right" size={14} />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
