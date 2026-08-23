import { useState } from 'react';
import { Icon } from '../ui/Icon';
import { FormField } from './FormField';
import { useSession } from '../../lib/sessionContext';
import { NotConfiguredError, updateMyProfile } from '../../services/profile';
import { profileDetails } from '../../data/artspaceProfile';
import styles from './ProfileDetailsCard.module.css';

type SaveState = { kind: 'idle' | 'saving' | 'saved' } | { kind: 'error'; message: string };

/** Identity and contact details. Everything here is public by design, so the
 *  card says so above the fields rather than leaving the artist to guess.
 *
 *  This is the one editor that already saves for real — public.users has had
 *  an update policy since migration 0008, so it needed no new schema. */
export function ProfileDetailsCard() {
  const { profile, refresh } = useSession();
  const [save, setSave] = useState<SaveState>({ kind: 'idle' });

  // Signed in, the form shows the real profile — including blanks, so an
  // empty field stays empty. Only the signed-out demo view borrows the sample
  // values; pre-filling a real account with them would save someone else's
  // name the first time Save was pressed.
  const initial = profile
    ? {
        displayName: profile.displayName ?? '',
        location: profile.country ?? '',
        email: profile.email,
      }
    : {
        displayName: profileDetails.displayName,
        location: profileDetails.location,
        email: profileDetails.email,
      };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) {
      setSave({ kind: 'error', message: 'Sign in to save changes to your profile.' });
      return;
    }

    const form = new FormData(event.currentTarget);
    setSave({ kind: 'saving' });

    try {
      await updateMyProfile(profile, {
        displayName: String(form.get('displayName') ?? '').trim() || null,
        country: String(form.get('location') ?? '').trim() || null,
      });
      await refresh();
      setSave({ kind: 'saved' });
      setTimeout(() => setSave({ kind: 'idle' }), 2400);
    } catch (err) {
      setSave({
        kind: 'error',
        message:
          err instanceof NotConfiguredError
            ? err.message
            : 'Could not save your changes. Please try again.',
      });
    }
  }

  return (
    <section className={styles.card}>
      <header className={styles.head}>
        <div>
          <h2 className={styles.title}>Profile Details</h2>
          <p className={styles.subtitle}>This information will be visible on your public profile.</p>
        </div>
        <button type="button" className={styles.viewBtn}>
          View Public Profile
          <Icon name="external-link" size={14} />
        </button>
      </header>

      <form className={styles.body} onSubmit={handleSubmit}>
        <div className={styles.photoCol}>
          <p className={styles.photoLabel}>Profile Photo</p>

          <div className={styles.photoWrap}>
            <img
              src={profile?.avatarUrl ?? profileDetails.photoUrl}
              alt=""
              className={styles.photo}
            />
            <button type="button" className={styles.photoBtn} aria-label="Change profile photo">
              <Icon name="camera" size={14} />
            </button>
          </div>

          <p className={styles.photoHint}>{profileDetails.photoHint}</p>

          <button type="button" className={styles.uploadBtn}>
            Upload New Photo
          </button>
        </div>

        <div className={styles.formCol}>
          <div className={styles.grid}>
            <FormField label="Display Name" name="displayName" required value={initial.displayName} />
            <FormField label="Artist Name" name="artistName" value={profileDetails.artistName} />
            <FormField label="Location" name="location" required value={initial.location} />
            <FormField
              label="Nationality"
              name="nationality"
              as="select"
              value={profileDetails.nationality}
              options={profileDetails.nationalities}
            />
            <FormField label="Website" name="website" value={profileDetails.website} />
            <FormField label="Email (Public)" name="email" type="email" value={initial.email} />
            <FormField
              label="Short Bio"
              name="shortBio"
              required
              as="textarea"
              rows={2}
              value={profileDetails.shortBio}
              className={styles.wide}
            />
          </div>

          <div className={styles.actions}>
            {save.kind === 'error' && <p className={styles.error}>{save.message}</p>}
            {save.kind === 'saved' && (
              <p className={styles.saved}>
                <Icon name="check-circle" size={14} />
                Saved
              </p>
            )}
            <button type="submit" className={styles.save} disabled={save.kind === 'saving'}>
              {save.kind === 'saving' ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
