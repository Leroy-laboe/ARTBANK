import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArtspaceSidebar } from '../components/artspace/ArtspaceSidebar';
import { ArtspaceTopbar } from '../components/artspace/ArtspaceTopbar';
import { ArtspacePageHeader } from '../components/artspace/ArtspacePageHeader';
import { Icon } from '../components/ui/Icon';
import { useSession } from '../lib/sessionContext';
import { listMyWorks } from '../services/artwork';
import type { Work } from '../data/artspaceWorks';
import {
  closeViewingRoomNow,
  createViewingRoom,
  deleteViewingRoom,
  getViewingRoom,
  updateViewingRoom,
  type ViewingRoomVisit,
} from '../services/viewingRooms';
import styles from './RoomBuilderPage.module.css';

type ToggleId = 'price' | 'download' | 'identity';

/** Create or manage one viewing room — the artist's whole job per
 *  docs/pivot-checklist/21-feature-private-viewing-room.md: "the artist
 *  selects artworks and creates one controlled link." Same component for
 *  both /artspace/rooms/new and /artspace/rooms/:id — creating just means
 *  there's no id yet, and saving for the first time gives it one. */
export function RoomBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const { profile } = useSession();
  const navigate = useNavigate();

  const [ready, setReady] = useState(!isEditing);
  const [notFound, setNotFound] = useState(false);
  const [works, setWorks] = useState<Work[]>([]);
  const [visits, setVisits] = useState<ViewingRoomVisit[]>([]);

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priceVisible, setPriceVisible] = useState(false);
  const [downloadAllowed, setDownloadAllowed] = useState(false);
  const [identityRequired, setIdentityRequired] = useState(true);
  const [expiresAt, setExpiresAt] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    // Waits for the real profile rather than treating the brief window where
    // it's still null as "this room doesn't exist" — RequireAuth confirms
    // there is a session before this page can even mount, but the profile
    // row itself is a second round trip.
    if (!profile) return;

    listMyWorks(profile).then((result) => {
      if (active) setWorks(result.works);
    });

    if (isEditing && id) {
      getViewingRoom(profile, id).then((room) => {
        if (!active) return;
        if (!room) {
          setNotFound(true);
          setReady(true);
          return;
        }
        setTitle(room.title);
        setNotes(room.privateNotes);
        setPriceVisible(room.priceVisible);
        setDownloadAllowed(room.downloadAllowed);
        setIdentityRequired(room.buyerIdentityRequired);
        setExpiresAt(room.expiresAt ? room.expiresAt.slice(0, 10) : '');
        setSelected(new Set(room.artworkIds));
        setVisits(room.visits);
        setReady(true);
      });
    } else {
      setReady(true);
    }

    return () => {
      active = false;
    };
  }, [profile, id, isEditing]);

  function toggle(field: ToggleId) {
    if (field === 'price') setPriceVisible((v) => !v);
    if (field === 'download') setDownloadAllowed((v) => !v);
    if (field === 'identity') setIdentityRequired((v) => !v);
  }

  function toggleWork(workId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(workId)) next.delete(workId);
      else next.add(workId);
      return next;
    });
  }

  function flash(message: string) {
    setNotice(message);
    setTimeout(() => setNotice(''), 4000);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!profile) {
      setError('Still loading your account — try again in a moment.');
      return;
    }
    if (!title.trim()) {
      setError('Give the room a title.');
      return;
    }
    if (selected.size === 0) {
      setError('Select at least one artwork.');
      return;
    }

    setError('');
    setSaving(true);

    const settings = {
      title: title.trim(),
      privateNotes: notes.trim(),
      priceVisible,
      downloadAllowed,
      buyerIdentityRequired: identityRequired,
      expiresAt: expiresAt ? new Date(`${expiresAt}T23:59:59`).toISOString() : null,
    };

    try {
      if (isEditing && id) {
        await updateViewingRoom(id, settings, Array.from(selected));
        flash('Saved.');
      } else {
        const newId = await createViewingRoom(profile, settings, Array.from(selected));
        navigate(`/artspace/rooms/${newId}`, { replace: true });
        flash('Room created. Share the link below.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function copyLink() {
    if (!id) return;
    const link = `${window.location.origin}/rooms/${id}`;
    try {
      await navigator.clipboard.writeText(link);
      flash('Link copied.');
    } catch {
      flash(link);
    }
  }

  async function closeNow() {
    if (!id) return;
    try {
      await closeViewingRoomNow(id);
      setExpiresAt(new Date().toISOString().slice(0, 10));
      flash('The link no longer opens the room.');
    } catch {
      flash('That could not be saved. Please try again.');
    }
  }

  async function remove() {
    if (!id) return;
    if (!window.confirm('Delete this room? The link will stop working and this cannot be undone.')) {
      return;
    }
    try {
      await deleteViewingRoom(id);
      navigate('/artspace/rooms', { replace: true });
    } catch {
      flash('That could not be deleted. Please try again.');
    }
  }

  const toggles: { id: ToggleId; icon: 'eye' | 'download' | 'lock'; label: string; note: string; on: boolean }[] = [
    {
      id: 'price',
      icon: 'eye',
      label: 'Show Prices',
      note: 'Off shows "Price on request" for everything in this room.',
      on: priceVisible,
    },
    {
      id: 'download',
      icon: 'download',
      label: 'Allow Download',
      note: 'Lets the viewer save the images shown here.',
      on: downloadAllowed,
    },
    {
      id: 'identity',
      icon: 'lock',
      label: 'Require Sign-In',
      note: 'Off lets anyone with the link view without an account.',
      on: identityRequired,
    },
  ];

  if (isEditing && !ready) {
    return (
      <div className={styles.shell}>
        <ArtspaceSidebar />
        <main className={styles.body}>
          <ArtspaceTopbar showGreeting={false} />
          <p className={styles.state}>Loading…</p>
        </main>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className={styles.shell}>
        <ArtspaceSidebar />
        <main className={styles.body}>
          <ArtspaceTopbar showGreeting={false} />
          <p className={styles.state}>This room could not be found.</p>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <ArtspaceSidebar />

      <main className={styles.body}>
        <ArtspaceTopbar showGreeting={false} />
        <ArtspacePageHeader
          title={isEditing ? 'Edit Room' : 'New Viewing Room'}
          subtitle={isEditing ? title : 'Select works and decide what to share — one link, fully your call.'}
        />

        {notice && (
          <p className={styles.notice} role="status">
            {notice}
          </p>
        )}

        {isEditing && (
          <div className={styles.linkCard}>
            <Icon name="lock" size={15} />
            <code className={styles.linkText}>{`${window.location.origin}/rooms/${id}`}</code>
            <button type="button" className={styles.linkCopy} onClick={copyLink}>
              <Icon name="copy" size={13} />
              Copy
            </button>
          </div>
        )}

        <form className={styles.layout} onSubmit={handleSubmit}>
          <div className={styles.mainCol}>
            <div className={styles.card}>
              <label className={styles.label} htmlFor="room-title">
                Title
              </label>
              <input
                id="room-title"
                className={styles.input}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. New Works — Autumn 2026"
              />

              <label className={styles.label} htmlFor="room-notes">
                Private Notes
              </label>
              <textarea
                id="room-notes"
                className={styles.textarea}
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Context for the viewer — what this selection is, why you're sharing it."
              />

              <label className={styles.label} htmlFor="room-expiry">
                Expiry Date
              </label>
              <input
                id="room-expiry"
                type="date"
                className={styles.input}
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
              <p className={styles.hint}>Leave blank for a link that stays open indefinitely.</p>
            </div>

            <div className={styles.card}>
              <p className={styles.cardTitle}>Selected Artworks ({selected.size})</p>
              {works.length === 0 ? (
                <p className={styles.hint}>You need at least one artwork before you can build a room.</p>
              ) : (
                <ul className={styles.picker}>
                  {works.map((work) => (
                    <li key={work.id}>
                      <button
                        type="button"
                        className={[styles.pickerRow, selected.has(work.id) && styles.pickerRowOn]
                          .filter(Boolean)
                          .join(' ')}
                        onClick={() => toggleWork(work.id)}
                      >
                        <span
                          className={[styles.checkbox, selected.has(work.id) && styles.checkboxOn]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          {selected.has(work.id) && <Icon name="check-circle" size={13} />}
                        </span>
                        {work.imageUrl ? (
                          <img src={work.imageUrl} alt="" className={styles.thumb} loading="lazy" />
                        ) : (
                          <span className={styles.thumbEmpty} />
                        )}
                        <span className={styles.pickerCopy}>
                          <span className={styles.pickerTitle}>{work.title}</span>
                          <span className={styles.pickerMeta}>
                            {work.medium} · {work.year}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <aside className={styles.rightCol}>
            <div className={styles.card}>
              <p className={styles.cardTitle}>Access</p>
              <ul className={styles.toggleList}>
                {toggles.map((t) => (
                  <li className={styles.toggleRow} key={t.id}>
                    <Icon name={t.icon} size={15} className={styles.toggleIcon} />
                    <span className={styles.toggleCopy}>
                      <span className={styles.toggleLabel}>{t.label}</span>
                      <span className={styles.toggleNote}>{t.note}</span>
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={t.on}
                      aria-label={t.label}
                      className={[styles.switch, t.on && styles.switchOn].filter(Boolean).join(' ')}
                      onClick={() => toggle(t.id)}
                    >
                      <span className={styles.knob} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.save} disabled={saving}>
              {saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Room'}
            </button>

            {isEditing && (
              <div className={styles.dangerRow}>
                <button type="button" className={styles.textButton} onClick={closeNow}>
                  Close room now
                </button>
                <button type="button" className={styles.textButtonDanger} onClick={remove}>
                  Delete room
                </button>
              </div>
            )}

            {isEditing && (
              <div className={styles.card}>
                <p className={styles.cardTitle}>Activity ({visits.length})</p>
                {visits.length === 0 ? (
                  <p className={styles.hint}>Nobody has opened this link yet.</p>
                ) : (
                  <ul className={styles.visitList}>
                    {visits.map((v) => (
                      <li className={styles.visitRow} key={v.id}>
                        <span>{v.viewerName ?? 'Anonymous view'}</span>
                        <span className={styles.visitTime}>
                          {new Date(v.viewedAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </aside>
        </form>
      </main>
    </div>
  );
}
