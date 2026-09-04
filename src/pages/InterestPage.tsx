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
import { loadFollowers, loadInterest, type InterestResult } from '../services/interest';
import type { Follower } from '../data/artspaceInterest';
import { exportInterestCsv } from '../lib/exportCsv';
import { followers as demoFollowers } from '../data/artspaceInterest';
import styles from './InterestPage.module.css';

/** Interest — the interest ledger. Everyone named on this screen is an
 *  identified viewer who consented to be seen; anonymous traffic stays a bare
 *  count inside Recent Viewers and is never given a row.
 *  See docs/pivot-checklist/12-interest-ledger.md. */
export function InterestPage() {
  const { profile } = useSession();
  const [data, setData] = useState<InterestResult | null>(null);
  /** null until read, and stays null if the read failed — the panel keeps its
   *  sample set in that case rather than claiming nobody follows them. */
  const [followers, setFollowers] = useState<Follower[] | null>(null);
  const [tab, setTab] = useState('all');
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadInterest(profile).then((result) => {
      if (active) setData(result);
    });
    loadFollowers(profile).then((rows) => {
      if (active) setFollowers(rows);
    });
    return () => {
      active = false;
    };
  }, [profile]);

  function handleExport() {
    const enquiries = tab === 'following' ? [] : (data?.enquiries ?? []);
    // Export what the panel is actually showing — the real list once it has
    // been read, the sample set only while it hasn't.
    const people = tab === 'enquiries' ? [] : (followers ?? demoFollowers);
    const viewers = tab === 'all' ? (data?.viewers ?? []) : [];

    const count = exportInterestCsv({ enquiries, followers: people, viewers });
    setNotice(
      count === 0
        ? 'Nothing to export in this view.'
        : `Exported ${count} identified ${count === 1 ? 'entry' : 'entries'}. Anonymous visitors are never included.`,
    );
    setTimeout(() => setNotice(null), 4000);
  }

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

          <button type="button" className={styles.export} onClick={handleExport}>
            <Icon name="upload" size={15} />
            Export
          </button>
        </div>

        {notice && (
          <p className={styles.notice} role="status">
            {notice}
          </p>
        )}

        <div className={styles.layout}>
          <div className={styles.mainCol}>
            {showEnquiries && <NewEnquiriesPanel enquiries={data?.enquiries} />}
            {showFollowers && <FollowersPanel followers={followers ?? undefined} />}
            {showViewers && <RecentViewersPanel anonymousCount={data?.anonymousCount} />}
          </div>

          <aside className={styles.rightCol}>
            {/* No range selector: these are all-time counts, and a picker that
                leaves the numbers unchanged when you choose "Last 90 days"
                states something about them that isn't true. */}
            <StatsOverviewPanel
              title="Interest Overview"
              stats={data?.stats ?? interestOverview.stats}
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
