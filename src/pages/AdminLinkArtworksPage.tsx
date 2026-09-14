import { useEffect, useMemo, useState } from 'react';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminTopbar } from '../components/admin/AdminTopbar';
import { AdminPageHeader } from '../components/admin/AdminPageHeader';
import { AdminUserSearchPopover } from '../components/admin/AdminUserSearchPopover';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/ui/Button';
import { listUnclaimedArtworks, linkArtworkToUser, describeAdminError } from '../services/admin';
import type { AdminRegisteredUser, AdminUnclaimedArtwork } from '../types/admin';
import styles from './AdminLinkArtworksPage.module.css';

type Filter = 'all' | 'suggested' | 'none' | 'linked';

const filters: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All artwork' },
  { id: 'suggested', label: 'Suggested match' },
  { id: 'none', label: 'No match' },
  { id: 'linked', label: 'Linked' },
];

/** Admin → Link Artworks — docs/pivot-checklist/29-feature-admin-functions.md's
 *  function #2: matching an unclaimed artwork (artist_id null) to the
 *  registered user it belongs to, once the entrant from Upload Artwork signs
 *  up for real. Requires migration 0035; with no backend configured this
 *  falls back to the same demo rows the page shipped with. */
export function AdminLinkArtworksPage() {
  const [artworks, setArtworks] = useState<AdminUnclaimedArtwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [openSearchFor, setOpenSearchFor] = useState<string | null>(null);
  const [linkedEmail, setLinkedEmail] = useState<Record<string, string>>({});
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linkingId, setLinkingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    listUnclaimedArtworks().then((result) => {
      if (!active) return;
      setArtworks(result.items);
      setIsDemo(result.isDemo);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return artworks.filter((artwork) => {
      if (filter !== 'all' && artwork.matchState !== filter) return false;
      if (!q) return true;
      return (
        artwork.entrantName.toLowerCase().includes(q) ||
        artwork.title.toLowerCase().includes(q) ||
        (artwork.suggestedEmail ?? '').toLowerCase().includes(q)
      );
    });
  }, [artworks, query, filter]);

  async function link(artwork: AdminUnclaimedArtwork, user: { id: string; email: string }) {
    setLinkError(null);

    if (isDemo) {
      setArtworks((prev) =>
        prev.map((item) => (item.id === artwork.id ? { ...item, matchState: 'linked' } : item)),
      );
      setLinkedEmail((prev) => ({ ...prev, [artwork.id]: user.email }));
      setOpenSearchFor(null);
      return;
    }

    setLinkingId(artwork.id);
    try {
      await linkArtworkToUser(artwork.id, user.id);
      setArtworks((prev) =>
        prev.map((item) => (item.id === artwork.id ? { ...item, matchState: 'linked' } : item)),
      );
      setLinkedEmail((prev) => ({ ...prev, [artwork.id]: user.email }));
      setOpenSearchFor(null);
    } catch (err) {
      setLinkError(describeAdminError(err));
    } finally {
      setLinkingId(null);
    }
  }

  return (
    <div className={styles.shell}>
      <AdminSidebar />

      <main className={styles.body}>
        <AdminTopbar />
        <AdminPageHeader
          title="Link Artworks"
          subtitle="Match unclaimed artworks to registered users."
        />

        {isDemo && !loading && (
          <p className={styles.demoNotice} role="status">
            Showing sample artworks — these aren't real unclaimed records yet.
          </p>
        )}
        {linkError && (
          <p className={styles.linkError} role="alert">
            <Icon name="x-circle" size={14} />
            {linkError}
          </p>
        )}

        <div className={styles.toolbar}>
          <div className={styles.search}>
            <Icon name="search" size={15} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by entrant name or email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <span className={styles.selectWrap}>
            <select value={filter} onChange={(e) => setFilter(e.target.value as Filter)}>
              {filters.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <Icon name="chevron-down" size={14} className={styles.selectCaret} />
          </span>
        </div>

        <div className={styles.tableCard}>
          {loading ? (
            <p className={styles.empty}>Loading unclaimed artworks…</p>
          ) : (
            <div className={styles.scroller}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Artwork</th>
                    <th>Entrant Name</th>
                    <th>Uploaded</th>
                    <th>Match</th>
                    <th className={styles.actionCol}>
                      <span className="visually-hidden">Action</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((artwork) => (
                    <tr key={artwork.id}>
                      <td>
                        <div className={styles.work}>
                          {artwork.imageUrl ? (
                            <img src={artwork.imageUrl} alt="" className={styles.thumb} loading="lazy" />
                          ) : (
                            <span className={styles.thumbPlaceholder} aria-hidden="true">
                              <Icon name="image" size={16} />
                            </span>
                          )}
                          <span className={styles.workTitle}>{artwork.title}</span>
                        </div>
                      </td>
                      <td className={styles.entrant}>{artwork.entrantName}</td>
                      <td className={styles.date}>{artwork.uploadedDate}</td>
                      <td>
                        {artwork.matchState === 'linked' ? (
                          <span className={[styles.pill, styles.pillLinked].join(' ')}>
                            <Icon name="check" size={12} />
                            Linked
                            {linkedEmail[artwork.id] && (
                              <span className={styles.matchEmail}> · {linkedEmail[artwork.id]}</span>
                            )}
                          </span>
                        ) : artwork.matchState === 'suggested' ? (
                          <div className={styles.stack}>
                            <span className={[styles.pill, styles.pillSuggested].join(' ')}>Suggested</span>
                            <span className={styles.matchEmail}>{artwork.suggestedEmail}</span>
                          </div>
                        ) : (
                          <span className={styles.noMatch}>No match</span>
                        )}
                      </td>
                      <td className={styles.actionCol}>
                        {artwork.matchState === 'linked' ? null : artwork.matchState === 'suggested' ? (
                          // 'suggested' only ever comes from the demo data —
                          // listUnclaimedArtworks() never sets it, since the
                          // schema captures no entrant email to suggest from.
                          // This click always takes the isDemo branch in
                          // link(), so the placeholder id is never used as a
                          // real artist_id.
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={linkingId === artwork.id}
                            onClick={() =>
                              link(artwork, {
                                id: artwork.suggestedEmail ?? '',
                                email: artwork.suggestedEmail ?? '',
                              })
                            }
                          >
                            Link
                          </Button>
                        ) : (
                          <div className={styles.popoverWrap}>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={linkingId === artwork.id}
                              onClick={() => setOpenSearchFor(openSearchFor === artwork.id ? null : artwork.id)}
                            >
                              {linkingId === artwork.id ? 'Linking…' : 'Search users'}
                            </Button>
                            {openSearchFor === artwork.id && (
                              <AdminUserSearchPopover
                                onClose={() => setOpenSearchFor(null)}
                                onPick={(user: AdminRegisteredUser) => link(artwork, user)}
                              />
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && visible.length === 0 && (
            <p className={styles.empty}>No artworks match this search.</p>
          )}
        </div>
      </main>
    </div>
  );
}
