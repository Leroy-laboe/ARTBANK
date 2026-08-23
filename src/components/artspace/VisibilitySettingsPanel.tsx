import { useState } from 'react';
import { Icon } from '../ui/Icon';
import { profileVisibility, visibilityToggles } from '../../data/artspaceProfile';
import styles from './VisibilitySettingsPanel.module.css';

/** Who can see what. Note "Show Artwork Prices" defaults off — prices are
 *  opt-in, in keeping with keeping money private by default. */
export function VisibilitySettingsPanel() {
  const [toggles, setToggles] = useState(() =>
    Object.fromEntries(visibilityToggles.map((t) => [t.id, t.enabled])),
  );

  return (
    <section className={styles.card}>
      <h2 className={styles.title}>Visibility Settings</h2>
      <p className={styles.subtitle}>Control who can see your profile and artworks.</p>

      <ul className={styles.list}>
        <li className={styles.row}>
          <Icon name="eye" size={15} className={styles.icon} />
          <span className={styles.label}>Profile Visibility</span>
          <span className={styles.selectWrap}>
            <select className={styles.select} defaultValue={profileVisibility.current}>
              {profileVisibility.levels.map((level) => (
                <option key={level}>{level}</option>
              ))}
            </select>
            <Icon name="chevron-down" size={13} className={styles.caret} />
          </span>
        </li>

        {visibilityToggles.map((toggle) => (
          <li className={styles.row} key={toggle.id}>
            <Icon name={toggle.icon} size={15} className={styles.icon} />
            <span className={styles.label}>{toggle.label}</span>
            <button
              type="button"
              role="switch"
              aria-checked={toggles[toggle.id]}
              aria-label={toggle.label}
              className={[styles.switch, toggles[toggle.id] && styles.switchOn].filter(Boolean).join(' ')}
              onClick={() => setToggles((prev) => ({ ...prev, [toggle.id]: !prev[toggle.id] }))}
            >
              <span className={styles.knob} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
