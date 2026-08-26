import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BuyerShell } from '../components/buyer/BuyerShell';
import { BuyerTopbar } from '../components/buyer/BuyerTopbar';
import { DiscoverHero } from '../components/buyer/DiscoverHero';
import { BuyerTrustTiles } from '../components/buyer/BuyerTrustTiles';
import { BuyerArtworkCard } from '../components/buyer/BuyerArtworkCard';
import { IntentFlowPanel } from '../components/buyer/IntentFlowPanel';
import { BuyerTrustBand } from '../components/buyer/BuyerTrustBand';
import { Icon } from '../components/ui/Icon';
import { useSession } from '../lib/sessionContext';
import { useSaveToggle } from '../lib/useSaveToggle';
import { listDiscoverArtworks } from '../services/buyer';
import { discoverArtworks as demoArtworks, type BuyerArtwork } from '../data/buyerContent';
import styles from './DiscoverPage.module.css';

/** Discover — where a buyer lands after signing in.
 *
 *  Every artwork here is published and public, in the order the artists
 *  published them. There is no ranking, no "trending" and no popularity sort:
 *  docs/pivot-checklist/17-do-not-build-guardrails.md deletes all three, and a
 *  feed ordered by likes would be the same leaderboard under another name. */
export function DiscoverPage() {
  const { profile } = useSession();
  const [params] = useSearchParams();

  const [artworks, setArtworks] = useState<BuyerArtwork[]>(demoArtworks);
  const [isDemo, setIsDemo] = useState(true);
  const [loading, setLoading] = useState(true);
  const [term, setTerm] = useState(params.get('q') ?? '');

  const gridRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    listDiscoverArtworks(profile).then((result) => {
      if (!active) return;
      setArtworks(result.artworks);
      setIsDemo(result.isDemo);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [profile]);

  const apply = useCallback((id: string, saved: boolean) => {
    setArtworks((rows) => rows.map((row) => (row.id === id ? { ...row, saved } : row)));
  }, []);

  const { toggle, busyId, notice } = useSaveToggle(apply);

  const visible = useMemo(() => {
    const q = term.trim().toLowerCase();
    if (!q) return artworks;
    return artworks.filter((a) =>
      [a.title, a.artistName, a.medium ?? '', a.dimensions ?? '']
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [artworks, term]);

  return (
    <BuyerShell topbar={<BuyerTopbar search value={term} onChange={setTerm} />}>
      <DiscoverHero
        onExplore={() => gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
      />

      <div className={styles.tiles}>
        <BuyerTrustTiles />
      </div>

      {notice && (
        <p className={styles.notice} role="status">
          {notice}
        </p>
      )}

      <section className={styles.section} ref={gridRef}>
        <header className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>
            {term.trim() ? 'Matching Artworks' : 'Featured Artworks'}
          </h2>
          <Link to="/collect/saved" className={styles.sectionLink}>
            Saved Works
            <Icon name="arrow-right" size={13} />
          </Link>
        </header>

        {isDemo && !loading && (
          <p className={styles.demoNote}>
            <Icon name="info" size={14} />
            Sample works. Nothing has been published to ArtBank yet, so these stand in for the
            real feed.
          </p>
        )}

        {loading ? (
          <p className={styles.state}>Loading artworks…</p>
        ) : visible.length === 0 ? (
          <p className={styles.state}>
            Nothing matches “{term.trim()}”. Try a different title, artist or medium.
          </p>
        ) : (
          <div className={styles.grid}>
            {visible.map((artwork) => (
              <BuyerArtworkCard
                key={artwork.id}
                artwork={artwork}
                onToggleSave={isDemo ? undefined : toggle}
                busy={busyId === artwork.id}
              />
            ))}
          </div>
        )}
      </section>

      <div className={styles.flow}>
        <IntentFlowPanel />
      </div>

      <BuyerTrustBand />
    </BuyerShell>
  );
}
