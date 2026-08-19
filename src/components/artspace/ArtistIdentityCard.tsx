import { useState } from 'react';
import { Icon } from '../ui/Icon';
import { artspaceArtist } from '../../data/artspaceContent';
import styles from './ArtistIdentityCard.module.css';

/** Who the artist is on Artbank, including the JO1N ID they quote when a
 *  gallery or buyer asks to verify them — hence the copy button. */
export function ArtistIdentityCard() {
  const [copied, setCopied] = useState(false);

  const copyJoinId = () => {
    void navigator.clipboard?.writeText(artspaceArtist.joinId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };

  return (
    <section className={styles.card}>
      <img src={artspaceArtist.avatarUrl} alt="" className={styles.avatar} />
      <h2 className={styles.name}>{artspaceArtist.name}</h2>
      <p className={styles.discipline}>{artspaceArtist.discipline}</p>
      <p className={styles.location}>{artspaceArtist.location}</p>

      <div className={styles.meta}>
        <div>
          <p className={styles.metaLabel}>JO1N ID</p>
          <p className={styles.metaValue}>
            {artspaceArtist.joinId}
            <button
              type="button"
              className={styles.copyBtn}
              onClick={copyJoinId}
              aria-label={copied ? 'JO1N ID copied' : 'Copy JO1N ID'}
            >
              <Icon name={copied ? 'check-circle' : 'copy'} size={14} />
            </button>
          </p>
        </div>
        <div className={styles.metaRight}>
          <p className={styles.metaLabel}>Member Since</p>
          <p className={styles.metaValue}>{artspaceArtist.memberSince}</p>
        </div>
      </div>
    </section>
  );
}
