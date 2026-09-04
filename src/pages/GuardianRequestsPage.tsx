import { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Icon } from '../components/ui/Icon';
import { useSession } from '../lib/sessionContext';
import {
  approveGuardianLink,
  getGuardianRequests,
  type GuardianRequest,
} from '../services/guardian';
import styles from './GuardianRequestsPage.module.css';

/** Reached from the account menu in either workspace — a guardian can just as
 *  easily be an existing artist or buyer as a dedicated account, so this
 *  lives outside both shells rather than duplicated inside each.
 *  See docs/pivot-checklist/15-messages.md's guardian-routing hard rule and
 *  migration 0026. */
export function GuardianRequestsPage() {
  const { profile } = useSession();
  const [requests, setRequests] = useState<GuardianRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getGuardianRequests(profile).then((rows) => {
      if (!active) return;
      setRequests(rows);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [profile]);

  async function approve(minorId: string) {
    setBusyId(minorId);
    try {
      await approveGuardianLink(minorId);
      setRequests((prev) =>
        prev.map((r) => (r.minorId === minorId ? { ...r, verifiedAt: new Date().toISOString() } : r)),
      );
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'That could not be saved. Please try again.');
      setTimeout(() => setNotice(null), 4000);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <Header />
      <main>
        <section className={`container ${styles.section}`}>
          <p className="eyebrow">Guardian</p>
          <h1 className={styles.title}>Guardian Requests</h1>
          <p className={styles.subtitle}>
            People on ARTBank who have named you as their guardian. Approving one lets contact
            about their work reach you as well as them — nothing is visible to anyone else until
            you do.
          </p>

          {notice && (
            <p className={styles.notice} role="status">
              {notice}
            </p>
          )}

          {loading ? (
            <p className={styles.state}>Loading…</p>
          ) : requests.length === 0 ? (
            <div className={styles.empty}>
              <Icon name="shield-check" size={26} className={styles.emptyIcon} />
              <p className={styles.emptyTitle}>Nobody has named you as a guardian yet</p>
              <p className={styles.emptyNote}>
                This page fills in the moment an artist under 18 adds your email as their
                guardian in ArtSpace.
              </p>
            </div>
          ) : (
            <ul className={styles.list}>
              {requests.map((r) => (
                <li className={styles.card} key={r.minorId}>
                  <div className={styles.copy}>
                    <p className={styles.name}>{r.minorName}</p>
                    <p className={styles.email}>{r.minorEmail}</p>
                  </div>

                  {r.verifiedAt ? (
                    <span className={styles.approved}>
                      <Icon name="badge-check" size={14} />
                      Approved {new Date(r.verifiedAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  ) : (
                    <button
                      type="button"
                      className={styles.approve}
                      onClick={() => approve(r.minorId)}
                      disabled={busyId === r.minorId}
                    >
                      {busyId === r.minorId ? 'Approving…' : 'Approve'}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
