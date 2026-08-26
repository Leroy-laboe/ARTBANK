import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BuyerShell } from '../components/buyer/BuyerShell';
import { BuyerTopbar } from '../components/buyer/BuyerTopbar';
import { BuyerArtworkCard } from '../components/buyer/BuyerArtworkCard';
import { IntentDialog } from '../components/buyer/IntentDialog';
/* ArtspacePageHeader and ArtspaceTabs are the shared masthead and filter
   strip, not artist-specific chrome — reused here so both workspaces keep one
   page header rather than growing a second that drifts from it. */
import { ArtspacePageHeader } from '../components/artspace/ArtspacePageHeader';
import { ArtspaceTabs } from '../components/artspace/ArtspaceTabs';
import { Icon } from '../components/ui/Icon';
import { useSession } from '../lib/sessionContext';
import { useSaveToggle } from '../lib/useSaveToggle';
import { listSavedArtworks } from '../services/buyer';
import { savedArtworks as demoSaved, type BuyerArtwork } from '../data/buyerContent';
import styles from './SavedWorksPage.module.css';

/** Saved Works — the buyer's own shelf.
 *
 *  Saving is private: it writes a saved_artworks row that only this account
 *  can read, and the artist is told nothing. Asking about a work is the act
 *  that discloses, which is why every card here carries Request Availability
 *  rather than saving being treated as interest on its own. */

const sorts = [
  { id: 'recent', label: 'Recently Added' },
  { id: 'title', label: 'Title A–Z' },
  { id: 'artist', label: 'Artist A–Z' },
] as const;

type SortId = (typeof sorts)[number]['id'];

/** "Recently Added" means the last 30 days. Stated here rather than left for
 *  a reader to guess from a tab label. */
const RECENT_DAYS = 30;

function isRecent(artwork: BuyerArtwork): boolean {
  if (!artwork.savedAt) return false;
  const days = (Date.now() - new Date(artwork.savedAt).getTime()) / 86_400_000;
  return days <= RECENT_DAYS;
}

export function SavedWorksPage() {
  const { profile } = useSession();

  const [artworks, setArtworks] = useState<BuyerArtwork[]>(demoSaved);
  const [isDemo, setIsDemo] = useState(true);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [sort, setSort] = useState<SortId>('recent');
  const [asking, setAsking] = useState<BuyerArtwork | null>(null);
  const [sent, setSent] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    listSavedArtworks(profile).then((result) => {
      if (!active) return;
      setArtworks(result.artworks);
      setIsDemo(result.isDemo);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [profile]);

  // Unsaving here removes the card, rather than leaving an empty heart on a
  // shelf the work is no longer on.
  const apply = useCallback((id: string, saved: boolean) => {
    setArtworks((rows) => (saved ? rows : rows.filter((row) => row.id !== id)));
  }, []);

  const { toggle, busyId, notice } = useSaveToggle(apply);

  const visible = useMemo(() => {
    const rows = tab === 'recent' ? artworks.filter(isRecent) : artworks;
    const sorted = [...rows];
    if (sort === 'title') sorted.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === 'artist') sorted.sort((a, b) => a.artistName.localeCompare(b.artistName));
    else
      sorted.sort(
        (a, b) => new Date(b.savedAt ?? 0).getTime() - new Date(a.savedAt ?? 0).getTime(),
      );
    return sorted;
  }, [artworks, tab, sort]);

  const tabs = [
    { id: 'all', label: 'All Saved', count: artworks.length },
    { id: 'recent', label: 'Recently Added', count: artworks.filter(isRecent).length },
  ];

  return (
    <BuyerShell topbar={<BuyerTopbar />}>
      <ArtspacePageHeader title="Saved Works" subtitle="Artworks you’ve saved for later." />

      <div className={styles.toolbar}>
        <ArtspaceTabs
          tabs={tabs}
          active={tab}
          onChange={setTab}
          variant="underline"
          label="Filter saved works"
        />

        <label className={styles.sort}>
          <span className={styles.sortLabel}>Sort by</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortId)}
            aria-label="Sort saved works"
          >
            {sorts.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <Icon name="chevron-down" size={14} className={styles.sortCaret} />
        </label>
      </div>

      {notice && (
        <p className={styles.notice} role="status">
          {notice}
        </p>
      )}

      {sent && (
        <p className={styles.sent} role="status">
          <Icon name="check-circle" size={15} />
          {sent}
        </p>
      )}

      {isDemo && !loading && (
        <p className={styles.demoNote}>
          <Icon name="info" size={14} />
          Sample shelf. Sign in with a buyer account to keep a save list of your own.
        </p>
      )}

      {loading ? (
        <p className={styles.state}>Loading your saved works…</p>
      ) : visible.length === 0 ? (
        <div className={styles.empty}>
          <Icon name="bookmark" size={26} className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>
            {tab === 'recent' ? 'Nothing saved in the last 30 days' : 'Nothing saved yet'}
          </p>
          <p className={styles.emptyNote}>
            Save a work from Discover and it waits here. Nobody is told you saved it.
          </p>
          <Link to="/collect" className={styles.emptyLink}>
            Browse artworks
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {visible.map((artwork) => (
            <BuyerArtworkCard
              key={artwork.id}
              artwork={artwork}
              variant="remove"
              onToggleSave={isDemo ? undefined : toggle}
              busy={busyId === artwork.id}
              action={
                artwork.artistId
                  ? { label: 'Request Availability', onClick: setAsking }
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {asking?.artistId && (
        <IntentDialog
          mode="availability"
          artistId={asking.artistId}
          artworkId={asking.id}
          artworkTitle={asking.title}
          artistName={asking.artistName}
          onClose={() => setAsking(null)}
          onSent={() => {
            setAsking(null);
            setSent('Your request reached the artist, with your name and what you asked for.');
          }}
        />
      )}
    </BuyerShell>
  );
}
