import { useCallback, useEffect, useMemo, useState } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/ui/Button';
import { BuyerTrustTiles } from '../components/buyer/BuyerTrustTiles';
import { IntentFlowPanel } from '../components/buyer/IntentFlowPanel';
import { BuyerTrustBand } from '../components/buyer/BuyerTrustBand';
import { ForBuyersHero } from '../components/buyers/ForBuyersHero';
import { ForBuyersArtworkCard } from '../components/buyers/ForBuyersArtworkCard';
import {
  ForBuyersFilterSidebar,
  type AvailabilityFacet,
  type MediumFacet,
  type PriceFacet,
} from '../components/buyers/ForBuyersFilterSidebar';
import { ForBuyersToolbar, type QuickPill, type SortOption } from '../components/buyers/ForBuyersToolbar';
import { ForBuyersMediumShowcase, type MediumTile } from '../components/buyers/ForBuyersMediumShowcase';
import { useSession } from '../lib/sessionContext';
import { useSaveToggle } from '../lib/useSaveToggle';
import { listDiscoverArtworks } from '../services/buyer';
import {
  discoverArtworks as demoArtworks,
  type BuyerArtwork,
  type BuyerAvailability,
} from '../data/buyerContent';
import styles from './ForBuyersPage.module.css';

/** Reads the leading number out of a priceLabel ("USD 1,800" -> 1800).
 *  Ranges take the lower bound. "Price on request" has none. */
function parsePrice(label: string): number | null {
  const match = label.match(/[\d,]+/);
  if (!match) return null;
  return Number(match[0].replace(/,/g, ''));
}

const PRICE_BUCKETS: { key: string; label: string; test: (n: number) => boolean }[] = [
  { key: 'under-1k', label: 'Under $1,000', test: (n) => n < 1000 },
  { key: '1k-5k', label: '$1,000 – $5,000', test: (n) => n >= 1000 && n < 5000 },
  { key: '5k-plus', label: '$5,000+', test: (n) => n >= 5000 },
];

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/** For Buyers — the public landing page the nav has pointed at a
 *  ComingSoonPage since docs/pivot-checklist/02-navigation.md added it, now
 *  carrying the full browsable-marketplace layout the client asked for
 *  (search hero, quick-filter pills, filter sidebar, sort + view toggle,
 *  a "browse by medium" showcase) — rebuilt on real data throughout rather
 *  than the old MarketplacePage/marketplaceContent.ts, which was full of
 *  exactly what the staff brief says to remove: MRI score, auction bidding,
 *  "VERIS verified", fabricated stats, and "Buyer Protection" / "Secure
 *  Payments" copy implying a payment system that doesn't exist.
 *
 *  Every filter here is real: Medium and Availability come straight off the
 *  loaded rows, Price Range is parsed from the same priceLabel the card
 *  shows (there's no separate numeric field to query), and the "newest
 *  addition" banner is literally the most recently published artwork, not a
 *  hand-curated collection. There's no Size, Style, Artist or Location
 *  filter — none of those are real, queryable fields yet — and no "Apply
 *  Filters" button, since every control re-filters live.
 *
 *  Save prompts sign-in inline (useSaveToggle already handles no session);
 *  opening an artwork's full record — where Contact Artist / Request
 *  Availability live — still requires signing in, since that route sits
 *  inside the private /collect area. */
export function ForBuyersPage() {
  const { profile } = useSession();
  const [artworks, setArtworks] = useState<BuyerArtwork[]>(demoArtworks);
  const [isDemo, setIsDemo] = useState(true);
  const [loading, setLoading] = useState(true);

  const [term, setTerm] = useState('');
  const [medium, setMedium] = useState<string | null>(null);
  const [newOnly, setNewOnly] = useState(false);
  const [availabilityFilter, setAvailabilityFilter] = useState<Set<BuyerAvailability>>(new Set());
  const [priceBucket, setPriceBucket] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>('newest');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    let active = true;
    setLoading(true);
    // listDiscoverArtworks defaults to 24 — right for the private Discover
    // screen's curated first look, too low for a full public catalogue page
    // whose entire point is browsing everything. 100 is a generous one-time
    // ceiling rather than real pagination; worth revisiting with a "Load
    // more" once the real catalogue grows past it.
    listDiscoverArtworks(profile, 100).then((result) => {
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

  const mediumFacets = useMemo<MediumFacet[]>(() => {
    const counts = new Map<string, number>();
    for (const artwork of artworks) {
      const label = artwork.medium?.trim();
      if (!label) continue;
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }, [artworks]);

  const availabilityFacets = useMemo<AvailabilityFacet[]>(() => {
    const counts = new Map<BuyerAvailability, number>();
    for (const artwork of artworks) {
      counts.set(artwork.availability, (counts.get(artwork.availability) ?? 0) + 1);
    }
    return [...counts.entries()].map(([key, count]) => ({ key, count }));
  }, [artworks]);

  const priceFacets = useMemo<PriceFacet[]>(() => {
    return PRICE_BUCKETS.map((bucket) => ({
      key: bucket.key,
      label: bucket.label,
      count: artworks.filter((a) => {
        const price = parsePrice(a.priceLabel);
        return price !== null && bucket.test(price);
      }).length,
    })).filter((bucket) => bucket.count > 0);
  }, [artworks]);

  const hasNewArrivals = useMemo(
    () => artworks.some((a) => a.publishedAt && Date.now() - new Date(a.publishedAt).getTime() < THIRTY_DAYS_MS),
    [artworks],
  );

  const pills = useMemo<QuickPill[]>(() => {
    const list: QuickPill[] = [{ id: 'all', label: 'All' }];
    if (hasNewArrivals) list.push({ id: 'new', label: 'New Arrivals' });
    for (const facet of mediumFacets.slice(0, 6)) list.push({ id: facet.label, label: facet.label });
    return list;
  }, [hasNewArrivals, mediumFacets]);

  const activePill = newOnly ? 'new' : medium ?? 'all';

  const selectPill = (id: string) => {
    if (id === 'all') {
      setMedium(null);
      setNewOnly(false);
    } else if (id === 'new') {
      setNewOnly(true);
      setMedium(null);
    } else {
      setMedium(id);
      setNewOnly(false);
    }
  };

  const selectMedium = (label: string | null) => {
    setMedium(label);
    setNewOnly(false);
  };

  const toggleAvailability = (key: BuyerAvailability) => {
    setAvailabilityFilter((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const clearFilters = () => {
    setTerm('');
    setMedium(null);
    setNewOnly(false);
    setAvailabilityFilter(new Set());
    setPriceBucket(null);
  };

  const hasActiveFilters =
    Boolean(term.trim()) || medium !== null || newOnly || availabilityFilter.size > 0 || priceBucket !== null;

  const visible = useMemo(() => {
    const q = term.trim().toLowerCase();
    let rows = artworks;

    if (q) {
      rows = rows.filter((a) => [a.title, a.artistName].join(' ').toLowerCase().includes(q));
    }
    if (medium) {
      rows = rows.filter((a) => a.medium === medium);
    }
    if (newOnly) {
      rows = rows.filter((a) => a.publishedAt && Date.now() - new Date(a.publishedAt).getTime() < THIRTY_DAYS_MS);
    }
    if (availabilityFilter.size > 0) {
      rows = rows.filter((a) => availabilityFilter.has(a.availability));
    }
    if (priceBucket) {
      const bucket = PRICE_BUCKETS.find((b) => b.key === priceBucket);
      if (bucket) {
        rows = rows.filter((a) => {
          const price = parsePrice(a.priceLabel);
          return price !== null && bucket.test(price);
        });
      }
    }

    const sorted = [...rows];
    if (sort === 'title') sorted.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === 'artist') sorted.sort((a, b) => a.artistName.localeCompare(b.artistName));
    // 'newest' is already the order listDiscoverArtworks returns (published_at desc).
    return sorted;
  }, [artworks, term, medium, newOnly, availabilityFilter, priceBucket, sort]);

  const mediumTiles = useMemo<MediumTile[]>(() => {
    return mediumFacets
      .slice(0, 4)
      .map((facet) => {
        const example = artworks.find((a) => a.medium === facet.label && a.imageUrl);
        return example ? { label: facet.label, count: facet.count, imageUrl: example.imageUrl } : null;
      })
      .filter((tile): tile is MediumTile => tile !== null);
  }, [mediumFacets, artworks]);

  const featured = artworks[0] ?? null;

  return (
    <>
      <Header />
      <main>
        <div className={`container ${styles.heroWrap}`}>
          <ForBuyersHero term={term} onTermChange={setTerm} onSubmit={() => {}} featured={featured} />
        </div>

        <div className={`container ${styles.tilesWrap}`}>
          <BuyerTrustTiles />
        </div>

        <div className={`container-wide ${styles.layout}`}>
          <ForBuyersFilterSidebar
            term={term}
            onTermChange={setTerm}
            mediums={mediumFacets}
            activeMedium={medium}
            onSelectMedium={selectMedium}
            availabilityFacets={availabilityFacets}
            activeAvailability={availabilityFilter}
            onToggleAvailability={toggleAvailability}
            priceFacets={priceFacets}
            activePriceBucket={priceBucket}
            onSelectPriceBucket={setPriceBucket}
            onClear={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />

          <div className={styles.mainCol}>
            {notice && (
              <p className={styles.notice} role="status">
                {notice}
              </p>
            )}

            {isDemo && !loading && (
              <p className={styles.demoNote}>
                <Icon name="info" size={14} />
                Sample works. Nothing has been published to ArtBank yet, so these stand in for the
                real feed.
              </p>
            )}

            <ForBuyersToolbar
              count={visible.length}
              sort={sort}
              onSortChange={setSort}
              pills={pills}
              activePill={activePill}
              onPillChange={selectPill}
              view={view}
              onViewChange={setView}
            />

            {loading ? (
              <p className={styles.state}>Loading artworks…</p>
            ) : visible.length === 0 ? (
              <p className={styles.state}>
                {hasActiveFilters
                  ? 'Nothing matches these filters. Try clearing one.'
                  : 'No artworks published yet.'}
              </p>
            ) : (
              <div className={view === 'grid' ? styles.grid : styles.gridList}>
                {visible.map((artwork) => (
                  <ForBuyersArtworkCard
                    key={artwork.id}
                    artwork={artwork}
                    onToggleSave={isDemo ? undefined : toggle}
                    busy={busyId === artwork.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {mediumTiles.length > 0 && (
          <div className="container">
            <ForBuyersMediumShowcase tiles={mediumTiles} onSelect={selectMedium} />
          </div>
        )}

        <div className={`container ${styles.flow}`}>
          <IntentFlowPanel />
        </div>

        <BuyerTrustBand />

        <div className="container">
          <section className={styles.closingCta}>
            <h2>Ready to start collecting with real context?</h2>
            <p>Create your ArtBank ID to save works, contact artists and request private viewings.</p>
            <Button variant="gold" to="/register" icon={<Icon name="arrow-right" size={15} />}>
              Create Your ArtBank ID
            </Button>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
