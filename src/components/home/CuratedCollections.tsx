import { useRef } from 'react';
import { Icon } from '../ui/Icon';
import { collections } from '../../data/homeContent';
import styles from './CuratedCollections.module.css';

export function CuratedCollections() {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollNext = () => {
    trackRef.current?.scrollBy({ left: 260, behavior: 'smooth' });
  };

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.headRow}>
          <div>
            <p className="eyebrow">Explore Curated Collections</p>
          </div>
          <a href="#" className={styles.viewAll}>
            View all collections
            <Icon name="arrow-right" size={14} />
          </a>
        </div>

        <div className={styles.trackWrap}>
          <div className={styles.track} ref={trackRef}>
            {collections.map((c) => (
              <article key={c.id} className={styles.card} style={{ background: c.gradient }}>
                {c.imageUrl && (
                  <img src={c.imageUrl} alt="" className={styles.image} loading="lazy" decoding="async" />
                )}
                <div className={styles.cardBody}>
                  <div className={styles.cardTitle}>{c.title}</div>
                  <div className={styles.cardCount}>{c.count}</div>
                </div>
              </article>
            ))}
          </div>
          <button type="button" className={styles.nextBtn} onClick={scrollNext} aria-label="Next collections">
            <Icon name="chevron-right" size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
