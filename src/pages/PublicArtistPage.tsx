import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Icon } from '../components/ui/Icon';
import { useSession } from '../lib/sessionContext';
import { getPublicProfile } from '../services/profile';
import {
  getFeaturedWorks,
  getFollowerCount,
  isFollowing,
  sendEnquiry,
  setFollowing,
  type FeaturedWork,
} from '../services/publicProfile';
import { socialPlatforms } from '../data/artspaceProfile';
import { flagUrl } from '../data/countries';
import type { Profile } from '../types/user';
import styles from './PublicArtistPage.module.css';

/** The artist's public profile — what a curator or buyer actually sees.
 *
 *  Spec 16 sets the order of actions: **Contact first, Follow second, social
 *  links third**, reversing a design where social icons dominated. It also
 *  deletes public earnings and statistics outright, so nothing here counts
 *  money, interest, enquiries or readiness. The only figures are the size of
 *  the body of work and the follower count. */

const purposes = [
  { id: 'purchase', label: 'I’d like to acquire a work' },
  { id: 'licence', label: 'I’d like to licence a work' },
  { id: 'exhibit', label: 'I’d like to exhibit your work' },
  { id: 'commission', label: 'I’d like to commission something' },
  { id: 'collaborate', label: 'I’d like to collaborate' },
] as const;

export function PublicArtistPage() {
  const { handle = '' } = useParams();
  const { profile: viewer } = useSession();

  const [artist, setArtist] = useState<Profile | null>(null);
  const [works, setWorks] = useState<FeaturedWork[]>([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowingState] = useState(false);
  const [loading, setLoading] = useState(true);

  const [contactOpen, setContactOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const say = useCallback((message: string) => {
    setNotice(message);
    setTimeout(() => setNotice(null), 5000);
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);

    getPublicProfile(handle).then(async (found) => {
      if (!active) return;
      setArtist(found);
      setLoading(false);
      if (!found) return;

      const [featured, count] = await Promise.all([
        getFeaturedWorks(found.id),
        getFollowerCount(found.id),
      ]);
      if (!active) return;
      setWorks(featured);
      setFollowers(count);

      if (viewer) {
        const already = await isFollowing(found.id, viewer);
        if (active) setFollowingState(already);
      }
    });

    return () => {
      active = false;
    };
  }, [handle, viewer]);

  async function toggleFollow() {
    if (!artist || isOwnProfile) return;
    if (!viewer) {
      say('Sign in to follow this artist. Following is never anonymous.');
      return;
    }

    const next = !following;
    setFollowingState(next);
    setFollowers((n) => n + (next ? 1 : -1));
    try {
      await setFollowing(artist.id, viewer, next);
    } catch {
      setFollowingState(!next);
      setFollowers((n) => n + (next ? -1 : 1));
      say('Could not update that. Try again.');
    }
  }

  async function handleContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!artist || !viewer || isOwnProfile) return;

    const form = new FormData(event.currentTarget);
    setSending(true);
    try {
      await sendEnquiry(artist.id, viewer, {
        purpose: String(form.get('purpose')) as 'purchase',
        message: String(form.get('message') ?? '').trim(),
        organization: String(form.get('organization') ?? '').trim() || null,
        artworkId: String(form.get('artwork') ?? '') || null,
      });
      setContactOpen(false);
      say('Your enquiry was sent. The artist sees who you are and what you asked.');
    } catch {
      say('Could not send that enquiry. Try again.');
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="container">
          <p className={styles.state}>Loading…</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!artist) {
    return (
      <>
        <Header />
        <main className="container">
          <div className={styles.state}>
            <h1 className={styles.stateTitle}>No profile here</h1>
            <p className={styles.stateNote}>
              There is no public profile at <code>/artists/{handle}</code>. It may not exist, or
              the artist may have made it private.
            </p>
            <Link to="/artists" className={styles.stateLink}>
              Browse artists
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const name = artist.artistName?.trim() || artist.displayName?.trim() || 'Artist';
  const links = socialPlatforms.filter((p) => artist.socialLinks[p.id]?.trim());
  // Following and enquiring both assume artist and visitor are different
  // people — profile_follows even has a database constraint that follower_id
  // can't equal artist_id, which without this check just surfaces as a
  // generic "Could not update that" the first time an artist opens their own
  // public link.
  const isOwnProfile = viewer?.id === artist.id;

  return (
    <>
      <Header />

      <main>
        {artist.coverUrl ? (
          <img src={artist.coverUrl} alt="" className={styles.cover} />
        ) : (
          <div className={styles.cover} />
        )}

        <div className="container">
          <header className={styles.head}>
            {artist.avatarUrl ? (
              <img src={artist.avatarUrl} alt="" className={styles.avatar} />
            ) : (
              <div className={styles.avatar} />
            )}

            <div className={styles.headCopy}>
              <h1 className={styles.name}>{name}</h1>
              {artist.country && (
                <p className={styles.location}>
                  {artist.countryCode ? (
                    <img src={flagUrl(artist.countryCode)} alt="" className={styles.flag} />
                  ) : (
                    <Icon name="map-pin" size={14} />
                  )}
                  {artist.country}
                  {artist.nationality ? ` · ${artist.nationality}` : ''}
                </p>
              )}
              {artist.shortBio && <p className={styles.bio}>{artist.shortBio}</p>}

              <p className={styles.followers}>
                {followers} follower{followers === 1 ? '' : 's'}
              </p>
            </div>

            {/* Contact first, Follow second — spec 16's ordering. Neither makes
                sense directed at yourself. */}
            {isOwnProfile ? (
              <span className={styles.closed}>This is your public profile</span>
            ) : (
              <div className={styles.actions}>
                {artist.allowEnquiries ? (
                  <button
                    type="button"
                    className={styles.primary}
                    onClick={() => {
                      if (!viewer) {
                        say('Sign in to contact this artist — enquiries are never anonymous.');
                        return;
                      }
                      setContactOpen((v) => !v);
                    }}
                  >
                    <Icon name="mail" size={15} />
                    Contact
                  </button>
                ) : (
                  <span className={styles.closed}>Not taking enquiries</span>
                )}

                <button
                  type="button"
                  className={[styles.secondary, following && styles.followingBtn]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={toggleFollow}
                >
                  <Icon name={following ? 'check' : 'plus'} size={15} />
                  {following ? 'Following' : 'Follow'}
                </button>
              </div>
            )}
          </header>

          {notice && (
            <p className={styles.notice} role="status">
              {notice}
            </p>
          )}

          {contactOpen && viewer && (
            <form className={styles.contactForm} onSubmit={handleContact}>
              <h2 className={styles.formTitle}>Contact {name}</h2>
              <p className={styles.formNote}>
                {name} will see your name and what you write. That is the point — this platform has
                no anonymous enquiries.
              </p>

              <label className={styles.formLabel} htmlFor="purpose">
                What is this about?
              </label>
              <select id="purpose" name="purpose" className={styles.formInput} defaultValue="purchase">
                {purposes.map((purpose) => (
                  <option key={purpose.id} value={purpose.id}>
                    {purpose.label}
                  </option>
                ))}
              </select>

              {works.length > 0 && (
                <>
                  <label className={styles.formLabel} htmlFor="artwork">
                    About a particular work? <span className={styles.optional}>Optional</span>
                  </label>
                  <select id="artwork" name="artwork" className={styles.formInput} defaultValue="">
                    <option value="">No particular work</option>
                    {works.map((work) => (
                      <option key={work.id} value={work.id}>
                        {work.title}
                      </option>
                    ))}
                  </select>
                </>
              )}

              <label className={styles.formLabel} htmlFor="organization">
                Organisation <span className={styles.optional}>Optional</span>
              </label>
              <input
                id="organization"
                name="organization"
                className={styles.formInput}
                defaultValue={viewer.organization ?? ''}
              />

              <label className={styles.formLabel} htmlFor="message">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                className={styles.formInput}
                rows={4}
                required
                placeholder="Introduce yourself and say what you're interested in."
              />

              <div className={styles.formActions}>
                <button type="button" className={styles.secondary} onClick={() => setContactOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.primary} disabled={sending}>
                  {sending ? 'Sending…' : 'Send enquiry'}
                </button>
              </div>
            </form>
          )}

          <div className={styles.layout}>
            <div className={styles.mainCol}>
              {artist.artistStatement && (
                <section className={styles.section}>
                  <h2 className={styles.sectionTitle}>Artist Statement</h2>
                  <p className={styles.statement}>{artist.artistStatement}</p>
                </section>
              )}

              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Featured Work</h2>
                {works.length > 0 ? (
                  <ul className={styles.works}>
                    {works.map((work) => (
                      <li className={styles.work} key={work.id}>
                        {work.imageUrl ? (
                          <img src={work.imageUrl} alt="" className={styles.workImg} />
                        ) : (
                          <div className={styles.workImg} />
                        )}
                        <div className={styles.workBody}>
                          <p className={styles.workTitle}>{work.title}</p>
                          <p className={styles.workMeta}>
                            {[work.year, work.medium, work.dimensions].filter(Boolean).join(' • ')}
                          </p>
                          {/* Prices appear only when the artist opted in. */}
                          {artist.showArtworkPrices && work.price !== null && (
                            <p className={styles.workPrice}>
                              {work.currency} {work.price.toLocaleString('en-US')}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.empty}>No works featured yet.</p>
                )}
              </section>
            </div>

            <aside className={styles.rightCol}>
              <section className={styles.panel}>
                <h2 className={styles.panelTitle}>Credentials</h2>
                <dl className={styles.facts}>
                  {artist.mediums.length > 0 && (
                    <div>
                      <dt>Practice</dt>
                      <dd>{artist.mediums.join(', ')}</dd>
                    </div>
                  )}
                  {artist.yearsActive && (
                    <div>
                      <dt>Years active</dt>
                      <dd>{artist.yearsActive}</dd>
                    </div>
                  )}
                  {artist.education && (
                    <div>
                      <dt>Education</dt>
                      <dd className={styles.multiline}>{artist.education}</dd>
                    </div>
                  )}
                  {artist.awards && (
                    <div>
                      <dt>Awards</dt>
                      <dd className={styles.multiline}>{artist.awards}</dd>
                    </div>
                  )}
                </dl>

                {artist.mediums.length === 0 &&
                  !artist.yearsActive &&
                  !artist.education &&
                  !artist.awards && <p className={styles.empty}>Nothing listed yet.</p>}
              </section>

              {/* Contact details, only if the artist chose to publish them. */}
              {artist.showContactInformation && (artist.publicEmail || artist.website) && (
                <section className={styles.panel}>
                  <h2 className={styles.panelTitle}>Contact</h2>
                  <ul className={styles.linkList}>
                    {artist.publicEmail && (
                      <li>
                        <a href={`mailto:${artist.publicEmail}`}>
                          <Icon name="mail" size={14} />
                          {artist.publicEmail}
                        </a>
                      </li>
                    )}
                    {artist.website && (
                      <li>
                        <a href={hrefFor(artist.website)} target="_blank" rel="noreferrer">
                          <Icon name="globe" size={14} />
                          {artist.website}
                        </a>
                      </li>
                    )}
                  </ul>
                </section>
              )}

              {/* Third rank, per spec 16. */}
              {links.length > 0 && (
                <section className={styles.panel}>
                  <h2 className={styles.panelTitle}>Elsewhere</h2>
                  <ul className={styles.linkList}>
                    {links.map((platform) => (
                      <li key={platform.id}>
                        <a
                          href={hrefFor(artist.socialLinks[platform.id])}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Icon name={platform.icon} size={14} />
                          {platform.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

/** Artists type "www.example.com" far more often than a full URL, and a bare
 *  host in an href resolves as a relative path. */
function hrefFor(value: string): string {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}
