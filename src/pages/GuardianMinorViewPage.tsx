import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Icon } from '../components/ui/Icon';
import { getGuardianView, type GuardianMinorView } from '../services/guardian';
import styles from './GuardianMinorViewPage.module.css';

/** A verified guardian's view of the minor's account. Read-only, and
 *  narrower than the minor's own dashboard on purpose — see guardian.ts.
 *  Requires migration 0031; reachable only from an already-approved row on
 *  /guardian, since guardian_view_minor() refuses anyone who isn't a
 *  verified guardian of this specific id. */
export function GuardianMinorViewPage() {
  const { minorId = '' } = useParams();
  const [view, setView] = useState<GuardianMinorView | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getGuardianView(minorId).then((result) => {
      if (active) {
        setView(result);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [minorId]);

  if (loading) {
    return (
      <>
        <Header />
        <main>
          <div className={`container ${styles.state}`}>Loading…</div>
        </main>
        <Footer />
      </>
    );
  }

  if (!view) {
    return (
      <>
        <Header />
        <main>
          <div className={`container ${styles.state}`}>
            <p className={styles.stateTitle}>This account isn’t visible to you</p>
            <p className={styles.stateNote}>
              Either the link is wrong, or you haven’t been approved as this person’s guardian.
            </p>
            <Link to="/guardian" className={styles.stateLink}>
              Back to Guardian Requests
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main>
        <div className={`container ${styles.wrap}`}>
          <Link to="/guardian" className={styles.back}>
            <Icon name="chevron-left" size={14} />
            Guardian Requests
          </Link>

          <p className="eyebrow">Guardian View</p>
          <h1 className={styles.title}>{view.minorName}</h1>
          <p className={styles.since}>
            On ArtBank since{' '}
            {new Date(view.memberSince).toLocaleDateString('en-GB', {
              month: 'long',
              year: 'numeric',
            })}
          </p>

          <div className={styles.statRow}>
            <div className={styles.stat}>
              <Icon name="image" size={16} />
              <span className={styles.statValue}>{view.artworks.length}</span>
              <span className={styles.statLabel}>Artworks</span>
            </div>
            <div className={styles.stat}>
              <Icon name="message" size={16} />
              <span className={styles.statValue}>{view.identifiedEnquiries}</span>
              <span className={styles.statLabel}>Identified Enquiries</span>
            </div>
            <div className={styles.stat}>
              <Icon name="eye" size={16} />
              <span className={styles.statValue}>{view.anonymousViews}</span>
              <span className={styles.statLabel}>Anonymous Views</span>
            </div>
            <div className={styles.stat}>
              <Icon name="briefcase" size={16} />
              <span className={styles.statValue}>{view.opportunityMatches}</span>
              <span className={styles.statLabel}>Opportunity Matches</span>
            </div>
          </div>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Earnings</h2>
            {view.earnings.length === 0 ? (
              <p className={styles.empty}>No settled earnings recorded yet.</p>
            ) : (
              <div className={styles.earningsRow}>
                {view.earnings.map((e) => (
                  <div className={styles.earningsCard} key={e.currency}>
                    <Icon name="bank" size={16} />
                    <span className={styles.earningsValue}>
                      {e.currency} {Math.round(e.total).toLocaleString('en-US')}
                    </span>
                    <span className={styles.earningsNote}>
                      From {e.count} settled transaction{e.count === 1 ? '' : 's'}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <p className={styles.hint}>
              Only money both sides confirmed changed hands. Nothing awaiting payment is counted.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Artworks ({view.artworks.length})</h2>
            {view.artworks.length === 0 ? (
              <p className={styles.empty}>No artworks added yet.</p>
            ) : (
              <div className={styles.grid}>
                {view.artworks.map((a) => (
                  <article className={styles.card} key={a.id}>
                    <div className={styles.imageWrap}>
                      {a.imageUrl ? (
                        <img src={a.imageUrl} alt={a.title} loading="lazy" />
                      ) : (
                        <Icon name="image" size={20} className={styles.imageEmpty} />
                      )}
                    </div>
                    <p className={styles.cardTitle}>{a.title}</p>
                    <p className={styles.cardMeta}>
                      {[a.medium, a.year ? String(a.year) : null].filter(Boolean).join(' · ') || '—'}
                    </p>
                    <div className={styles.cardChips}>
                      <span className={styles.chip}>{a.status}</span>
                      <span className={styles.chip}>{a.availability.replace('_', ' ')}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
