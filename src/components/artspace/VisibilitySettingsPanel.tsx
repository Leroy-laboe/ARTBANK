import { Icon } from '../ui/Icon';
import { visibilityLevels } from '../../data/artspaceProfile';
import type { ProfilePatch } from '../../services/profile';
import type { Profile } from '../../types/user';
import styles from './VisibilitySettingsPanel.module.css';

/** The rail's quick control over disclosure.
 *
 *  Previously the select had no onChange and the toggles were local state, so
 *  nothing here survived a reload. Every control now writes to the profile.
 *
 *  This and the Profile Settings tab both read `profile` and write through
 *  `onSave`, so they show the same thing by construction rather than being two
 *  copies that can disagree. */
export function VisibilitySettingsPanel({
  profile,
  saving,
  onSave,
}: {
  profile: Profile | null;
  saving: boolean;
  onSave: (patch: ProfilePatch) => Promise<boolean>;
}) {
  const toggles = [
    {
      id: 'contact',
      icon: 'mail' as const,
      label: 'Show Contact Information',
      on: profile?.showContactInformation ?? false,
      apply: (value: boolean) => onSave({ showContactInformation: value }),
    },
    {
      id: 'enquiries',
      icon: 'message' as const,
      label: 'Allow Enquiries',
      on: profile?.allowEnquiries ?? true,
      apply: (value: boolean) => onSave({ allowEnquiries: value }),
    },
    {
      id: 'prices',
      icon: 'tag' as const,
      label: 'Show Artwork Prices',
      on: profile?.showArtworkPrices ?? false,
      apply: (value: boolean) => onSave({ showArtworkPrices: value }),
    },
  ];

  return (
    <section className={styles.card}>
      <h2 className={styles.title}>Visibility Settings</h2>
      <p className={styles.subtitle}>Control who can see your profile and artworks.</p>

      <ul className={styles.list}>
        <li className={styles.row}>
          <Icon name="eye" size={15} className={styles.icon} />
          <span className={styles.label}>Profile Visibility</span>
          <span className={styles.selectWrap}>
            <select
              className={styles.select}
              value={profile?.profileVisibility ?? 'public'}
              disabled={saving || !profile}
              onChange={(e) =>
                onSave({ profileVisibility: e.target.value as Profile['profileVisibility'] })
              }
            >
              {visibilityLevels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </select>
            <Icon name="chevron-down" size={13} className={styles.caret} />
          </span>
        </li>

        {toggles.map((toggle) => (
          <li className={styles.row} key={toggle.id}>
            <Icon name={toggle.icon} size={15} className={styles.icon} />
            <span className={styles.label}>{toggle.label}</span>
            <button
              type="button"
              role="switch"
              aria-checked={toggle.on}
              aria-label={toggle.label}
              disabled={saving || !profile}
              className={[styles.switch, toggle.on && styles.switchOn].filter(Boolean).join(' ')}
              onClick={() => void toggle.apply(!toggle.on)}
            >
              <span className={styles.knob} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
