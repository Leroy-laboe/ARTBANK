import { useState } from 'react';
import { Icon } from '../ui/Icon';
import { visibilityLevels } from '../../data/artspaceProfile';
import type { ProfilePatch } from '../../services/profile';
import type { Profile } from '../../types/user';
import styles from './profileTabs.module.css';

/** Your public URL, who may see the profile, and what it discloses.
 *
 *  Both this and the rail's VisibilitySettingsPanel read from `profile` and
 *  write through `onSave`, so there is one source of truth and the two can't
 *  drift apart — the same reason the My Works tabs write into the filter state
 *  rather than filtering separately. */

const HANDLE_PATTERN = /^[a-z0-9][a-z0-9-]{2,31}$/;

/** Suggests a handle from whatever name we already have, so the field isn't a
 *  blank the artist has to invent something for. Never saved on their behalf. */
function suggestHandle(profile: Profile | null): string {
  const source = profile?.artistName ?? profile?.displayName ?? profile?.email.split('@')[0] ?? '';
  return source
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
}

export function ProfileSettingsCard({
  profile,
  saving,
  onSave,
}: {
  profile: Profile | null;
  saving: boolean;
  onSave: (patch: ProfilePatch) => Promise<boolean>;
}) {
  const [handle, setHandle] = useState(profile?.profileHandle ?? '');
  const [handleError, setHandleError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const suggestion = suggestHandle(profile);

  async function saveHandle() {
    const value = handle.trim().toLowerCase();

    if (value && !HANDLE_PATTERN.test(value)) {
      setHandleError(
        'Use 3–32 characters: lowercase letters, numbers and hyphens, starting with a letter or number.',
      );
      return;
    }

    setHandleError(null);
    const ok = await onSave({ profileHandle: value || null });
    if (ok) {
      setHandle(value);
      setSaved(true);
      setTimeout(() => setSaved(false), 2400);
    }
  }

  const origin = typeof window === 'undefined' ? '' : window.location.origin;

  return (
    <>
      <section className={styles.card}>
        <header className={styles.head}>
          <div>
            <h2 className={styles.title}>Public Profile URL</h2>
            <p className={styles.subtitle}>
              Where your profile lives. Without one, your profile has no public address and
              “View Public Profile” has nowhere to go.
            </p>
          </div>
        </header>

        <label className={styles.label} htmlFor="profile-handle">
          Your address
        </label>
        <div className={styles.urlRow}>
          <span className={styles.urlPrefix}>{origin}/artists/</span>
          <input
            id="profile-handle"
            className={styles.urlInput}
            value={handle}
            placeholder={suggestion || 'your-name'}
            onChange={(e) => {
              setHandle(e.target.value);
              setHandleError(null);
            }}
          />
        </div>
        {handleError ? (
          <p className={styles.error}>{handleError}</p>
        ) : (
          <p className={styles.hint}>
            Lowercase letters, numbers and hyphens.
            {suggestion && !handle && (
              <>
                {' '}
                <button
                  type="button"
                  className={styles.rowLabel}
                  style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', color: 'var(--gold-dark)', textDecoration: 'underline' }}
                  onClick={() => setHandle(suggestion)}
                >
                  Use “{suggestion}”
                </button>
              </>
            )}
          </p>
        )}

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
            onClick={saveHandle}
            disabled={saving || !profile}
          >
            {saving ? 'Saving…' : 'Save URL'}
          </button>
        </div>
      </section>

      <section className={styles.card} style={{ marginTop: 14.5 }}>
        <header className={styles.head}>
          <div>
            <h2 className={styles.title}>Who can see your profile</h2>
            <p className={styles.subtitle}>
              Changes take effect immediately. This is the same setting as the one in the rail.
            </p>
          </div>
        </header>

        {visibilityLevels.map((level) => (
          <div className={styles.setting} key={level.id}>
            <div className={styles.settingCopy}>
              <p className={styles.settingLabel}>{level.label}</p>
              <p className={styles.settingDetail}>{level.detail}</p>
            </div>
            <button
              type="button"
              role="radio"
              aria-checked={profile?.profileVisibility === level.id}
              aria-label={level.label}
              className={[
                styles.switch,
                profile?.profileVisibility === level.id && styles.switchOn,
              ]
                .filter(Boolean)
                .join(' ')}
              disabled={saving || !profile}
              onClick={() => onSave({ profileVisibility: level.id })}
            >
              <span className={styles.knob} />
            </button>
          </div>
        ))}
      </section>

      <section className={styles.card} style={{ marginTop: 14.5 }}>
        <header className={styles.head}>
          <div>
            <h2 className={styles.title}>What your profile discloses</h2>
            <p className={styles.subtitle}>
              Each of these is off until you turn it on. Enquiries are the exception — they reach
              you through ARTBANK without exposing an address.
            </p>
          </div>
        </header>

        <Toggle
          label="Show Contact Information"
          detail="Publishes the address you set as Email (Public). Your account email is never shown."
          on={profile?.showContactInformation ?? false}
          disabled={saving || !profile}
          onToggle={(value) => onSave({ showContactInformation: value })}
        />
        <Toggle
          label="Allow Enquiries"
          detail="People can contact you through ARTBANK about your work."
          on={profile?.allowEnquiries ?? true}
          disabled={saving || !profile}
          onToggle={(value) => onSave({ allowEnquiries: value })}
        />
        <Toggle
          label="Show Artwork Prices"
          detail="Shows the prices you set on published works. Recorded earnings are never public."
          on={profile?.showArtworkPrices ?? false}
          disabled={saving || !profile}
          onToggle={(value) => onSave({ showArtworkPrices: value })}
        />
      </section>
    </>
  );
}

function Toggle({
  label,
  detail,
  on,
  disabled,
  onToggle,
}: {
  label: string;
  detail: string;
  on: boolean;
  disabled: boolean;
  onToggle: (value: boolean) => void;
}) {
  return (
    <div className={styles.setting}>
      <div className={styles.settingCopy}>
        <p className={styles.settingLabel}>{label}</p>
        <p className={styles.settingDetail}>{detail}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        className={[styles.switch, on && styles.switchOn].filter(Boolean).join(' ')}
        disabled={disabled}
        onClick={() => onToggle(!on)}
      >
        <span className={styles.knob} />
      </button>
    </div>
  );
}
