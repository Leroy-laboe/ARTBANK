import { useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { FormField } from './FormField';
import { ImageCropModal } from './ImageCropModal';
import { profileDetails } from '../../data/artspaceProfile';
import { countries, countryName } from '../../data/countries';
import type { ProfilePatch } from '../../services/profile';
import {
  PROFILE_IMAGE_LIMITS,
  profileImageRejection,
  uploadProfileImage,
} from '../../services/profileImages';
import type { Profile } from '../../types/user';
import styles from './ProfileDetailsCard.module.css';

/** Output pixel size and crop-frame shape for each photo slot. The avatar is
 *  square (matches the circle every `<img>` of it renders with, via CSS
 *  border-radius); the cover is a wide banner — 3:1 is a conventional ratio
 *  that reads fine whichever width `object-fit: cover` ends up stretching it
 *  across (Profile Details' own narrow preview, the wider one on the public
 *  page). */
const CROP_CONFIG = {
  avatar: { aspect: 1, shape: 'circle' as const, outputSize: { width: 600, height: 600 } },
  cover: { aspect: 3, shape: 'rect' as const, outputSize: { width: 1500, height: 500 } },
};

/** Who the artist is, as the public profile shows them.
 *
 *  Every field here maps to a real column (migration 0021). Before that, five
 *  of the seven had nowhere to go: the form accepted them, reported "Saved",
 *  and discarded them.
 *
 *  Signed in, the form shows the real profile — including blanks, so an empty
 *  field stays empty. The sample values are only ever placeholders, never
 *  defaults: pre-filling a real account with them is how "Maya Tan" once got
 *  written into somebody's profile. */
export function ProfileDetailsCard({
  profile,
  saving,
  onSave,
}: {
  profile: Profile | null;
  saving: boolean;
  onSave: (patch: ProfilePatch) => Promise<boolean>;
}) {
  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const [uploadingKind, setUploadingKind] = useState<'avatar' | 'cover' | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  // Set once a file passes validation, cleared once the crop is confirmed or
  // cancelled — the modal renders only while this is non-null.
  const [cropTarget, setCropTarget] = useState<{ file: File; kind: 'avatar' | 'cover' } | null>(
    null,
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = (key: string) => String(form.get(key) ?? '').trim() || null;

    // The Country select's options are country names (FormField's select has
    // no separate value/label), so the code is looked up from what was
    // actually chosen — never carried over from a stale prop — which is what
    // makes the two consistent even if a browser autofills something odd.
    const countryValue = value('country');
    const selectedCountry = countries.find((c) => c.name === countryValue);

    const ok = await onSave({
      displayName: value('displayName'),
      artistName: value('artistName'),
      country: selectedCountry?.name ?? countryValue,
      countryCode: selectedCountry?.code ?? null,
      nationality: value('nationality'),
      website: value('website'),
      publicEmail: value('publicEmail'),
      shortBio: value('shortBio'),
    });

    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2400);
    }
  }

  /** Validates the chosen file, then opens the crop modal — nothing uploads
   *  yet. Rejecting an oversized or wrong-format file before the modal even
   *  opens saves the artist from cropping something that was never going to
   *  be accepted. */
  function handleFileChosen(file: File, kind: 'avatar' | 'cover') {
    if (!profile) return;
    const reason = profileImageRejection(file);
    if (reason) {
      setPhotoError(reason);
      return;
    }
    setPhotoError(null);
    setCropTarget({ file, kind });
  }

  async function handleCropConfirm(croppedFile: File) {
    if (!profile || !cropTarget) return;
    const { kind } = cropTarget;
    setCropTarget(null);
    setUploadingKind(kind);
    try {
      const url = await uploadProfileImage(profile, croppedFile, kind);
      await onSave(kind === 'avatar' ? { avatarUrl: url } : { coverUrl: url });
    } catch {
      setPhotoError('Could not upload that photo. Try again.');
    } finally {
      setUploadingKind(null);
    }
  }

  return (
    <section className={styles.card}>
      <header className={styles.head}>
        <div>
          <h2 className={styles.title}>Profile Details</h2>
          <p className={styles.subtitle}>This information will be visible on your public profile.</p>
        </div>

        {profile?.profileHandle ? (
          <Link
            to={`/artists/${profile.profileHandle}`}
            target="_blank"
            rel="noreferrer"
            className={styles.viewBtn}
          >
            View Public Profile
            <Icon name="external-link" size={14} />
          </Link>
        ) : (
          <span className={styles.viewBtn} aria-disabled="true" title="Choose a profile URL in Profile Settings first">
            No public URL yet
          </span>
        )}
      </header>

      <form onSubmit={handleSubmit}>
        <div className={styles.coverWrap}>
          {profile?.coverUrl ? (
            <img src={profile.coverUrl} alt="" className={styles.cover} />
          ) : (
            <span className={styles.cover} aria-hidden="true" />
          )}
          <button
            type="button"
            className={styles.coverBtn}
            onClick={() => coverRef.current?.click()}
            disabled={uploadingKind === 'cover' || !profile}
          >
            <Icon name="camera" size={13} />
            {uploadingKind === 'cover' ? 'Uploading…' : 'Change Cover Photo'}
          </button>
        </div>

        <input
          ref={coverRef}
          type="file"
          hidden
          accept={PROFILE_IMAGE_LIMITS.accept.join(',')}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileChosen(file, 'cover');
            e.target.value = '';
          }}
        />

        <div className={styles.body}>
          <div className={styles.photoCol}>
          <p className={styles.photoLabel}>Profile Photo</p>

          <div className={styles.photoWrap}>
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt="" className={styles.photo} />
            ) : (
              <span className={styles.photo} aria-hidden="true" />
            )}
            <button
              type="button"
              className={styles.photoBtn}
              aria-label="Change profile photo"
              onClick={() => avatarRef.current?.click()}
            >
              <Icon name="camera" size={14} />
            </button>
          </div>

          <input
            ref={avatarRef}
            type="file"
            hidden
            accept={PROFILE_IMAGE_LIMITS.accept.join(',')}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileChosen(file, 'avatar');
              e.target.value = '';
            }}
          />

          <p className={styles.photoHint}>{profileDetails.photoHint}</p>

          <button
            type="button"
            className={styles.uploadBtn}
            onClick={() => avatarRef.current?.click()}
            disabled={uploadingKind === 'avatar' || !profile}
          >
            {uploadingKind === 'avatar' ? 'Uploading…' : 'Upload New Photo'}
          </button>

          {photoError && <p className={styles.error}>{photoError}</p>}
        </div>

        <div className={styles.formCol}>
          <div className={styles.grid}>
            <FormField
              label="Display Name"
              name="displayName"
              required
              value={profile?.displayName ?? ''}
              placeholder="How your name appears across ARTBANK"
            />
            <FormField
              label="Artist Name"
              name="artistName"
              value={profile?.artistName ?? ''}
              placeholder="If you exhibit under a different name"
            />
            <FormField
              label="Country"
              name="country"
              as="select"
              required
              // A saved code always wins — it's the source of truth for the
              // flag. Free text from before this field existed falls back
              // here too, but won't match an option until re-saved.
              value={countryName(profile?.countryCode) ?? profile?.country ?? ''}
              options={countries.map((c) => c.name)}
              placeholder="Select your country"
              hint="This is what shows your flag on your public profile."
            />
            <FormField
              label="Nationality"
              name="nationality"
              as="select"
              value={profile?.nationality ?? ''}
              options={profileDetails.nationalities}
              placeholder="Select nationality"
            />
            <FormField
              label="Website"
              name="website"
              value={profile?.website ?? ''}
              placeholder="www.example.com"
            />
            <FormField
              label="Email (Public)"
              name="publicEmail"
              type="email"
              value={profile?.publicEmail ?? ''}
              // Deliberately not seeded from profile.email: the account address
              // is not automatically something to publish.
              hint="Shown only if Show Contact Information is on."
            />
            <FormField
              label="Short Bio"
              name="shortBio"
              required
              as="textarea"
              rows={2}
              value={profile?.shortBio ?? ''}
              className={styles.wide}
              placeholder="A sentence or two about your practice."
            />
          </div>

          <div className={styles.actions}>
            {saved && (
              <p className={styles.saved}>
                <Icon name="check-circle" size={14} />
                Saved
              </p>
            )}
            <button type="submit" className={styles.save} disabled={saving || !profile}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
          </div>
        </div>
      </form>

      {cropTarget && (
        <ImageCropModal
          file={cropTarget.file}
          aspect={CROP_CONFIG[cropTarget.kind].aspect}
          shape={CROP_CONFIG[cropTarget.kind].shape}
          outputSize={CROP_CONFIG[cropTarget.kind].outputSize}
          title={cropTarget.kind === 'avatar' ? 'Crop your profile photo' : 'Crop your cover photo'}
          onCancel={() => setCropTarget(null)}
          onConfirm={handleCropConfirm}
        />
      )}
    </section>
  );
}
