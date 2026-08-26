import { useEffect, useState } from 'react';
import { Icon } from '../ui/Icon';
import { listFeaturableWorks, setFeaturedArtworks, type FeaturableWork } from '../../services/artwork';
import type { Profile } from '../../types/user';
import styles from './profileTabs.module.css';

const MAX_FEATURED = 6;

/** Which works lead the public profile, and in what order.
 *
 *  Only published works are offered. Featuring a draft would publish it by the
 *  back door, which is exactly the kind of thing the brief's "nothing
 *  publishes itself" rule exists to prevent. */
export function FeaturedArtworksCard({
  profile,
  onNotice,
}: {
  profile: Profile | null;
  onNotice: (message: string) => void;
}) {
  const [works, setWorks] = useState<FeaturableWork[]>([]);
  const [featured, setFeatured] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    if (!profile) {
      setLoading(false);
      return;
    }
    listFeaturableWorks(profile).then((rows) => {
      if (!active) return;
      setWorks(rows);
      setFeatured(
        rows
          .filter((w) => w.featuredPosition !== null)
          .sort((a, b) => (a.featuredPosition ?? 0) - (b.featuredPosition ?? 0))
          .map((w) => w.id),
      );
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [profile]);

  const toggle = (id: string) => {
    setFeatured((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_FEATURED) {
        onNotice(`You can feature up to ${MAX_FEATURED} works. Remove one first.`);
        return prev;
      }
      return [...prev, id];
    });
  };

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    try {
      await setFeaturedArtworks(profile, featured);
      setSaved(true);
      setTimeout(() => setSaved(false), 2400);
    } catch (err) {
      const message = (err as { message?: string } | null)?.message ?? '';
      onNotice(message ? `Could not save. ${message}` : 'Could not save your featured works.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={styles.card}>
      <header className={styles.head}>
        <div>
          <h2 className={styles.title}>Featured Artworks</h2>
          <p className={styles.subtitle}>
            Choose up to {MAX_FEATURED} published works to lead your public profile. The number on
            each tile is the order they appear in.
          </p>
        </div>
        <span className={styles.count}>
          {featured.length}/{MAX_FEATURED}
        </span>
      </header>

      {loading ? (
        <p className={styles.hint}>Loading your works…</p>
      ) : works.length === 0 ? (
        <div className={styles.empty}>
          <Icon name="image" size={17} className={styles.emptyIcon} />
          <div>
            <p className={styles.emptyTitle}>No published works yet</p>
            <p className={styles.emptyBody}>
              Only published works can be featured. Publish something from My Works and it will
              appear here.
            </p>
          </div>
        </div>
      ) : (
        <ul className={styles.grid}>
          {works.map((work) => {
            const index = featured.indexOf(work.id);
            const on = index >= 0;
            return (
              <li key={work.id}>
                <button
                  type="button"
                  aria-pressed={on}
                  className={[styles.tile, on && styles.tileOn].filter(Boolean).join(' ')}
                  onClick={() => toggle(work.id)}
                >
                  {on && <span className={styles.badge}>{index + 1}</span>}
                  {work.imageUrl ? (
                    <img src={work.imageUrl} alt="" className={styles.tileImg} />
                  ) : (
                    <span className={styles.tileImg} />
                  )}
                  <span className={styles.tileBody}>
                    <span className={styles.tileTitle}>{work.title}</span>
                    <span className={styles.tileMeta}>{work.year ?? '—'}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className={styles.actions}>
        {saved && (
          <p className={styles.saved}>
            <Icon name="check-circle" size={14} />
            Saved
          </p>
        )}
        <button
          type="button"
          className={styles.save}
          onClick={handleSave}
          disabled={saving || !profile || works.length === 0}
        >
          {saving ? 'Saving…' : 'Save Selection'}
        </button>
      </div>
    </section>
  );
}
