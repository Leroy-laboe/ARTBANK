import { useEffect, useState, type FormEvent } from 'react';
import { ArtspaceSidebar } from '../components/artspace/ArtspaceSidebar';
import { ArtspaceTopbar } from '../components/artspace/ArtspaceTopbar';
import { ArtspacePageHeader } from '../components/artspace/ArtspacePageHeader';
import { Icon } from '../components/ui/Icon';
import { useSession } from '../lib/sessionContext';
import { getMyGuardianLink, requestGuardianLink, type MyGuardianLink } from '../services/guardian';
import styles from './GuardianSettingsPage.module.css';

/** Where an artist under 18 names the guardian who has to approve contact
 *  about their work before it can reach them. Naming one here is what marks
 *  the account as a minor's in the first place (0026) — before that, nothing
 *  here treats the account any differently.
 *  See docs/pivot-checklist/15-messages.md's guardian-routing hard rule. */
export function GuardianSettingsPage() {
  const { profile } = useSession();
  const [link, setLink] = useState<MyGuardianLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    getMyGuardianLink(profile).then((row) => {
      if (!active) return;
      setLink(row);
      setEditing(!row);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [profile]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!email.trim()) return;
    setError('');
    setSaving(true);
    try {
      await requestGuardianLink(email.trim());
      const row = await getMyGuardianLink(profile);
      setLink(row);
      setEditing(false);
      setEmail('');
      setNotice('Request sent. They will need to approve it before it takes effect.');
      setTimeout(() => setNotice(''), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.shell}>
      <ArtspaceSidebar />

      <main className={styles.body}>
        <ArtspaceTopbar showGreeting={false} />
        <ArtspacePageHeader
          title="Guardian"
          subtitle="Required if you're under 18 — a verified guardian has to approve contact before it reaches you."
        />

        {notice && (
          <p className={styles.notice} role="status">
            {notice}
          </p>
        )}

        {loading ? (
          <p className={styles.state}>Loading…</p>
        ) : (
          <div className={styles.card}>
            {link && !editing ? (
              <>
                <div className={styles.status}>
                  <Icon
                    name={link.verifiedAt ? 'badge-check' : link.hasAccount ? 'clock' : 'mail'}
                    size={18}
                    className={link.verifiedAt ? styles.verifiedIcon : styles.pendingIcon}
                  />
                  <div>
                    <p className={styles.name}>{link.guardianName ?? link.guardianEmail}</p>
                    {link.guardianName && <p className={styles.email}>{link.guardianEmail}</p>}
                  </div>
                </div>

                <p className={link.verifiedAt ? styles.verifiedLine : styles.pendingLine}>
                  {link.verifiedAt
                    ? `Verified guardian since ${new Date(link.verifiedAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}.`
                    : link.hasAccount
                      ? 'Waiting for them to approve. Contact involving you stays blocked until they do.'
                      : "They don't have an ArtBank account yet. Ask them to sign up with this exact email — the invite attaches automatically the moment they do, then they can approve it."}
                </p>

                <button type="button" className={styles.change} onClick={() => setEditing(true)}>
                  Change guardian
                </button>
              </>
            ) : (
              <form onSubmit={submit} className={styles.form}>
                <label className={styles.label} htmlFor="guardian-email">
                  Guardian&rsquo;s email
                </label>
                <p className={styles.hint}>
                  {link
                    ? 'Naming someone new resets approval — the current guardian stays in place until the new one accepts.'
                    : "They don't need an ArtBank account yet — if they don't have one, tell them to sign up with this email afterwards."}
                </p>
                <div className={styles.row}>
                  <input
                    id="guardian-email"
                    type="email"
                    required
                    placeholder="guardian@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                  />
                  <button type="submit" className={styles.submit} disabled={saving}>
                    {saving ? 'Sending…' : 'Send request'}
                  </button>
                </div>
                {error && <p className={styles.error}>{error}</p>}
                {link && (
                  <button type="button" className={styles.cancel} onClick={() => setEditing(false)}>
                    Cancel
                  </button>
                )}
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
