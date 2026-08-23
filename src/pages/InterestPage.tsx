import { useEffect, useState } from 'react';
import { ArtspaceSidebar } from '../components/artspace/ArtspaceSidebar';
import { ArtspaceTopbar } from '../components/artspace/ArtspaceTopbar';
import { ArtspacePageHeader } from '../components/artspace/ArtspacePageHeader';
import { ArtspaceTabs } from '../components/artspace/ArtspaceTabs';
import { NewEnquiriesPanel } from '../components/artspace/NewEnquiriesPanel';
import { FollowersPanel } from '../components/artspace/FollowersPanel';
import { RecentViewersPanel } from '../components/artspace/RecentViewersPanel';
import { StatsOverviewPanel } from '../components/artspace/StatsOverviewPanel';
import { TopInterestedArtworksPanel } from '../components/artspace/TopInterestedArtworksPanel';
import { TipsPanel } from '../components/artspace/TipsPanel';
import { Icon } from '../components/ui/Icon';
import { interestOverview, interestTabs, interestTips } from '../data/artspaceInterest';
import { useSession } from '../lib/sessionContext';
import { loadInterest, type InterestResult } from '../services/interest';
import styles from './InterestPage.module.css';

/** Interest — the interest ledger. Everyone named on this screen is an
 *  identified viewer who consented to be seen; anonymous traffic stays a bare
 *  count inside Recent Viewers and is never given a row.
 *  See docs/pivot-checklist/12-interest-ledger.md. */
export function InterestPage() {
  const { profile } = useSession();
  const [data, setData] = useState<InterestResult | null>(null);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    let active = true;
    loadInterest(profile).then((result) => {
      if (active) setData(result);
    });
    return () => {
      active = false;
    };
  }, [profile]);

  const showEnquiries = tab === 'all' || tab === 'enquiries' || tab === 'shortlisted';
  const showFollowers = tab === 'all' || tab === 'following';
  const showViewers = tab === 'all';

  return (
    <div className={styles.shell}>
      <ArtspaceSidebar />

      <main className={styles.body}>
        <ArtspaceTopbar showGreeting={false} />

        <ArtspacePageHeader
          title="Interest"
          subtitle="People showing genuine interest in your artworks."
        />

        <div className={styles.tabRow}>
          <ArtspaceTabs
            tabs={interestTabs}
            active={tab}
            onChange={setTab}
            variant="underline"
            label="Filter interest"
          />

          <button type="button" className={styles.export}>
            <Icon name="upload" size={15} />
            Export
          </button>
        </div>

        <div className={styles.layout}>
          <div className={styles.mainCol}>
            {showEnquiries && <NewEnquiriesPanel enquiries={data?.enquiries} />}
            {showFollowers && <FollowersPanel />}
            {showViewers && <RecentViewersPanel anonymousCount={data?.anonymousCount} />}
          </div>

          <aside className={styles.rightCol}>
            <StatsOverviewPanel
              title="Interest Overview"
              stats={interestOverview.stats}
              ranges={interestOverview.ranges}
              linkTo="/artspace/interest"
            />
            <TopInterestedArtworksPanel />
            <TipsPanel
              title="Tips to Increase Interest"
              tips={interestTips}
              linkTo="/artspace/help"
            />
          </aside>
        </div>
      </main>
    </div>
  );
}
