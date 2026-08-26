import { useState } from 'react';
import { Icon } from '../ui/Icon';
import { socialPlatforms } from '../../data/artspaceProfile';
import type { ProfilePatch } from '../../services/profile';
import type { Profile } from '../../types/user';
import styles from './profileTabs.module.css';

/** Where else the artist can be found.
 *
 *  Spec 16 demotes these: the public profile puts Contact first, Follow
 *  second, and social links third, because social icons used to dominate the
 *  page. */
export function SocialLinksCard({
  profile,
  saving,
  onSave,
}: {
  profile: Profile | null;
  saving: boolean;
  onSave: (patch: ProfilePatch) => Promise<boolean>;
}) {
  const [links, setLinks] = useState<Record<string, string>>(profile?.socialLinks ?? {});
  const [saved, setSaved] = useState(false);

  const filled = socialPlatforms.filter((p) => links[p.id]?.trim()).length;

  async function handleSave() {
    // Empty fields are dropped rather than stored as "", so a link is either
    // present or absent with nothing in between for the public page to check.
    const cleaned: Record<string, string> = {};
    for (const platform of socialPlatforms) {
      const value = links[platform.id]?.trim();
      if (value) cleaned[platform.id] = value;
    }

    const ok = await onSave({ socialLinks: cleaned });
    if (ok) {
      setLinks(cleaned);
      setSaved(true);
      setTimeout(() => setSaved(false), 2400);
    }
  }

  return (
    <section className={styles.card}>
      <header className={styles.head}>
        <div>
          <h2 className={styles.title}>Social Links</h2>
          <p className={styles.subtitle}>
            Optional. These sit below Contact and Follow on your public profile, not above them.
          </p>
        </div>
        <span className={styles.count}>
          {filled}/{socialPlatforms.length}
        </span>
      </header>

      <div className={styles.rows}>
        {socialPlatforms.map((platform) => (
          <div className={styles.row} key={platform.id}>
            <span className={styles.rowIcon}>
              <Icon name={platform.icon} size={15} />
            </span>
            <label className={styles.rowLabel} htmlFor={`social-${platform.id}`}>
              {platform.label}
            </label>
            <input
              id={`social-${platform.id}`}
              className={styles.input}
              type="url"
              inputMode="url"
              placeholder={platform.placeholder}
              value={links[platform.id] ?? ''}
              onChange={(e) => setLinks((prev) => ({ ...prev, [platform.id]: e.target.value }))}
            />
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        {saved && (
          <p className={styles.saved}>
            <Icon name="check-circle" size={14} />
            Saved
          </p>
        )}
        <button
          type="button"
          className={styles.save}
          onClick={handleSave}
          disabled={saving || !profile}
        >
          {saving ? 'Saving…' : 'Save Links'}
        </button>
      </div>
    </section>
  );
}
