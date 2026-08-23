import { useState } from 'react';
import { Icon } from '../ui/Icon';
import type { CreatorProfile } from '../../types/creator';
import styles from './CreatorCard.module.css';

export function CreatorCard({ creator }: { creator: CreatorProfile }) {
  const [saved, setSaved] = useState(false);

  return (
    <article className={styles.card}>
      <div className={styles.imageWrap}>
        <img
          src={creator.imageUrl}
          alt={creator.name}
          className={styles.image}
          loading="lazy"
          decoding="async"
        />

        <button
          type="button"
          className={[styles.likeBtn, saved && styles.likeBtnSaved].filter(Boolean).join(' ')}
          aria-label={saved ? 'Remove from saved' : 'Save creator'}
          aria-pressed={saved}
          onClick={() => setSaved((v) => !v)}
        >
          <Icon name={saved ? 'heart-filled' : 'heart'} size={14} />
        </button>
      </div>

      <div className={styles.body}>
        <div className={styles.name}>{creator.name}</div>
        <div className={styles.title}>{creator.title}</div>

        <div className={styles.footerRow}>
          <span className={styles.country}>
            <img src={creator.countryFlag} alt="" className={styles.flag} />
            {creator.country}
          </span>
          <span className={styles.followers}>{creator.followers} Followers</span>
        </div>
      </div>
    </article>
  );
}
