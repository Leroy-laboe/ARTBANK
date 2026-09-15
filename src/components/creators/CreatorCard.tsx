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

        {/* No follower count: these are example profiles, so the number was
            invented, and a public follower figure reads as the popularity
            ranking 17-do-not-build-guardrails.md rules out. */}
        <div className={styles.footerRow}>
          <span className={styles.country}>
            <img src={creator.countryFlag} alt="" className={styles.flag} />
            <span className={styles.countryText}>{creator.country}</span>
          </span>
        </div>
      </div>
    </article>
  );
}
