import { useState } from 'react';
import { ArtspaceSidebar } from '../components/artspace/ArtspaceSidebar';
import { ArtspaceTopbar } from '../components/artspace/ArtspaceTopbar';
import { ArtspacePageHeader } from '../components/artspace/ArtspacePageHeader';
import { ArtspaceTabs } from '../components/artspace/ArtspaceTabs';
import { ProfileDetailsCard } from '../components/artspace/ProfileDetailsCard';
import { ProfessionalInfoCard } from '../components/artspace/ProfessionalInfoCard';
import { ProfileCompletionCard } from '../components/artspace/ProfileCompletionCard';
import { ProfilePreviewPanel } from '../components/artspace/ProfilePreviewPanel';
import { VisibilitySettingsPanel } from '../components/artspace/VisibilitySettingsPanel';
import { TipsPanel } from '../components/artspace/TipsPanel';
import { profileTabs, profileTips } from '../data/artspaceProfile';
import styles from './PublicProfilePage.module.css';

/** Public Profile — the single profile editor, reached from the account menu
 *  rather than mixed into the dashboard.
 *
 *  Nothing private is allowed to surface here: no readiness score, no
 *  earnings, no interest or enquiry data. The spec deletes public earnings and
 *  statistics outright (docs/pivot-checklist/16-public-profile-access.md). */
export function PublicProfilePage() {
  const [tab, setTab] = useState('details');

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

        <div className={styles.layout}>
          <div className={styles.mainCol}>
            {tab === 'details' ? (
              <>
                <ProfileDetailsCard />
                <ProfessionalInfoCard />
              </>
            ) : (
              <section className={styles.placeholder}>
                <h2 className={styles.placeholderTitle}>
                  {profileTabs.find((t) => t.id === tab)?.label}
                </h2>
                <p className={styles.placeholderNote}>
                  This section is part of the profile editor and hasn’t been built yet.
                </p>
              </section>
            )}

            <ProfileCompletionCard onGoToNext={setTab} />
          </div>

          <aside className={styles.rightCol}>
            <ProfilePreviewPanel />
            <VisibilitySettingsPanel />
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
