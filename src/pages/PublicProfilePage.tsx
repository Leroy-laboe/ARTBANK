import { useCallback, useEffect, useState } from 'react';
import { ArtspaceSidebar } from '../components/artspace/ArtspaceSidebar';
import { ArtspaceTopbar } from '../components/artspace/ArtspaceTopbar';
import { ArtspacePageHeader } from '../components/artspace/ArtspacePageHeader';
import { ArtspaceTabs } from '../components/artspace/ArtspaceTabs';
import { ProfileDetailsCard } from '../components/artspace/ProfileDetailsCard';
import { ProfessionalInfoCard } from '../components/artspace/ProfessionalInfoCard';
import { ArtistStatementCard } from '../components/artspace/ArtistStatementCard';
import { FeaturedArtworksCard } from '../components/artspace/FeaturedArtworksCard';
import { SocialLinksCard } from '../components/artspace/SocialLinksCard';
import { ProfileSettingsCard } from '../components/artspace/ProfileSettingsCard';
import { ProfileCompletionCard } from '../components/artspace/ProfileCompletionCard';
import { ProfilePreviewPanel } from '../components/artspace/ProfilePreviewPanel';
import { VisibilitySettingsPanel } from '../components/artspace/VisibilitySettingsPanel';
import { TipsPanel } from '../components/artspace/TipsPanel';
import { useSession } from '../lib/sessionContext';
import {
  describeProfileError,
  getProfileCounts,
  updateMyProfile,
  type ProfileCounts,
  type ProfilePatch,
} from '../services/profile';
import { listFeaturableWorks } from '../services/artwork';
import { profileTabs, profileTips } from '../data/artspaceProfile';
import styles from './PublicProfilePage.module.css';

/** Public Profile — the single profile editor, reached from the account menu
 *  rather than mixed into the dashboard.
 *
 *  Every field maps to a real column (migration 0021) and every control saves.
 *  Nothing private is allowed to surface here: no readiness score, no
 *  earnings, no interest or enquiry data. The spec deletes public earnings and
 *  statistics outright (docs/pivot-checklist/16-public-profile-access.md).
 *
 *  Saving is owned by this page rather than by each card, so the profile is
 *  one source of truth — which is what keeps the Profile Settings tab and the
 *  rail's Visibility panel showing the same thing. */
export function PublicProfilePage() {
  const { profile, refresh } = useSession();
  const [tab, setTab] = useState('details');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [counts, setCounts] = useState<ProfileCounts>({
    artworks: 0,
    exhibitions: 0,
    opportunities: 0,
  });
  const [featuredCount, setFeaturedCount] = useState(0);

  const say = useCallback((message: string) => {
    setNotice(message);
    setTimeout(() => setNotice(null), 4000);
  }, []);

  useEffect(() => {
    let active = true;
    if (!profile) return;

    void getProfileCounts(profile).then((result) => {
      if (active) setCounts(result);
    });
    void listFeaturableWorks(profile).then((works) => {
      if (active) setFeaturedCount(works.filter((w) => w.featuredPosition !== null).length);
    });

    return () => {
      active = false;
    };
  }, [profile]);

  /** Every card saves through here. Returns whether it worked, so a card can
   *  show its own "Saved" without duplicating the error handling. */
  const save = useCallback(
    async (patch: ProfilePatch): Promise<boolean> => {
      if (!profile) {
        say('Sign in to save changes to your profile.');
        return false;
      }

      setSaving(true);
      try {
        await updateMyProfile(profile, patch);
        // Re-read so every card and the preview see the same saved values.
        await refresh();
        return true;
      } catch (err) {
        say(describeProfileError(err));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [profile, refresh, say],
  );

  return (
    <div className={styles.shell}>
      <ArtspaceSidebar />

      <main className={styles.body}>
        <ArtspaceTopbar showGreeting={false} />

        <ArtspacePageHeader
          title="Public Profile"
          subtitle="Manage how you present yourself and your artworks to the world."
        />

        <div className={styles.tabRow}>
          <ArtspaceTabs
            tabs={profileTabs}
            active={tab}
            onChange={setTab}
            variant="underline"
            label="Profile sections"
          />
        </div>

        {notice && (
          <p className={styles.notice} role="status">
            {notice}
          </p>
        )}

        <div className={styles.layout}>
          <div className={styles.mainCol}>
            {tab === 'details' && (
              <>
                <ProfileDetailsCard profile={profile} saving={saving} onSave={save} />
                <ProfessionalInfoCard
                  key={profile?.mediums.join('|') ?? 'none'}
                  profile={profile}
                  saving={saving}
                  onSave={save}
                />
              </>
            )}

            {tab === 'statement' && (
              <ArtistStatementCard
                key={profile?.artistStatement ?? 'empty'}
                profile={profile}
                saving={saving}
                onSave={save}
              />
            )}

            {tab === 'featured' && (
              <FeaturedArtworksCard
                profile={profile}
                onNotice={(message) => {
                  say(message);
                  if (profile) {
                    void listFeaturableWorks(profile).then((works) =>
                      setFeaturedCount(works.filter((w) => w.featuredPosition !== null).length),
                    );
                  }
                }}
              />
            )}

            {tab === 'settings' && (
              <ProfileSettingsCard
                key={profile?.profileHandle ?? 'no-handle'}
                profile={profile}
                saving={saving}
                onSave={save}
              />
            )}

            {tab === 'social' && (
              <SocialLinksCard
                key={Object.keys(profile?.socialLinks ?? {}).join('|')}
                profile={profile}
                saving={saving}
                onSave={save}
              />
            )}

            <ProfileCompletionCard
              profile={profile}
              featuredCount={featuredCount}
              onGoToNext={setTab}
            />
          </div>

          <aside className={styles.rightCol}>
            <ProfilePreviewPanel profile={profile} counts={counts} />
            <VisibilitySettingsPanel profile={profile} saving={saving} onSave={save} />
            <TipsPanel
              title="Profile Tips"
              tips={profileTips}
              headerIcon="lightbulb"
              variant="plain"
              linkTo="/artspace/help"
              linkLabel="Read full guide"
            />
          </aside>
        </div>
      </main>
    </div>
  );
}
