import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import styles from './HowItWorksPage.module.css';

/** How It Works — replaces the "Coming Soon" placeholder that the main nav,
 *  the footer and the homepage all linked to.
 *
 *  Every step describes something the product actually does today, in the
 *  order of the demo sequence in docs/pivot-checklist/00-overview-and-
 *  timeline.md: the readiness scan (18), Smart Artwork Link + QR (19), the
 *  Professional Pack (23), the interest ledger's identified/anonymous split
 *  (12), Private Viewing Rooms (21), deals recorded to the artwork's history,
 *  admin-reviewed certificates (29) and guardian routing for minors (15).
 *  No statistics, rankings or earnings claims — 17-do-not-build-guardrails. */

type Step = { title: string; text: string };

const artistSteps: Step[] = [
  {
    title: 'Add an artwork',
    text: 'Create a record for a piece — images, medium, dimensions, year, and a price or price on request.',
  },
  {
    title: 'See what’s missing',
    text: 'ARTBANK checks the record against what a serious buyer or institution will expect, and lists the professional details still missing.',
  },
  {
    title: 'Complete the record',
    text: 'Add provenance, rights and supporting documents. With the evidence in place you can request a Certificate of Authenticity, issued only after review.',
  },
  {
    title: 'Share it professionally',
    text: 'Each work gets a Smart Artwork Link and QR code to share anywhere, and a print-ready Professional Pack for galleries and collectors.',
  },
  {
    title: 'Know who is interested',
    text: 'Visits and enquiries are recorded, with anonymous traffic kept apart from identified buyers — so you see who someone is and what they want before you reply.',
  },
  {
    title: 'Move to a deal',
    text: 'Invite a buyer into a Private Viewing Room, agree terms in Messages, and record the sale. Every step is added to the artwork’s history.',
  },
];

const buyerSteps: Step[] = [
  {
    title: 'Browse published work',
    text: 'Find original artwork with the details its artist has recorded — medium, dimensions, availability and certificate status.',
  },
  {
    title: 'Introduce yourself',
    text: 'An enquiry says who you are, your organisation and what you intend, so artists are answering a person rather than an anonymous click.',
  },
  {
    title: 'View privately and agree terms',
    text: 'An artist can open a Private Viewing Room for you, and the conversation carries through to an agreed deal.',
  },
];

function StepList({ steps, label }: { steps: Step[]; label: string }) {
  return (
    <ol className={styles.steps} aria-label={label}>
      {steps.map((step, index) => (
        <li key={step.title} className={styles.step}>
          <span className={styles.stepIndex} aria-hidden="true">
            {String(index + 1).padStart(2, '0')}
          </span>
          <h3 className={styles.stepTitle}>{step.title}</h3>
          <p className={styles.stepText}>{step.text}</p>
        </li>
      ))}
    </ol>
  );
}

export function HowItWorksPage() {
  return (
    <>
      <Header />
      <main>
        <section className={styles.intro}>
          <div className="container">
            <p className="eyebrow">How It Works</p>
            <h1 className={styles.title}>From an artwork to a documented, professional sale.</h1>
            <p className={styles.lede}>
              ARTBANK turns a single artwork into a complete professional record, puts it in front
              of identified buyers, and keeps the whole journey on the artwork’s history.
            </p>
          </div>
        </section>

        <section className={styles.band} aria-labelledby="for-artists">
          <div className="container">
            <p className={`eyebrow ${styles.bandEyebrow}`}>For artists</p>
            <h2 id="for-artists" className={styles.bandTitle}>
              Build the record once. Use it everywhere.
            </h2>
            <StepList steps={artistSteps} label="Steps for artists" />
            <div className={styles.actions}>
              <Button variant="primary" to="/register" icon={<Icon name="arrow-right" size={16} />}>
                Create your JO1N ID
              </Button>
            </div>
          </div>
        </section>

        <section className={`${styles.band} ${styles.bandAlt}`} aria-labelledby="for-buyers">
          <div className="container">
            <p className={`eyebrow ${styles.bandEyebrow}`}>For buyers and institutions</p>
            <h2 id="for-buyers" className={styles.bandTitle}>
              Buy with the facts in front of you.
            </h2>
            <StepList steps={buyerSteps} label="Steps for buyers" />
            <div className={styles.actions}>
              <Button variant="primary" to="/for-buyers" icon={<Icon name="arrow-right" size={16} />}>
                Explore artworks
              </Button>
            </div>
          </div>
        </section>

        <section className={styles.band} aria-labelledby="young-artists">
          <div className={`container ${styles.note}`}>
            <h2 id="young-artists" className={styles.noteTitle}>
              Young artists are protected by design
            </h2>
            <p className={styles.noteText}>
              Accounts for artists under 18 are linked to a verified guardian. Contact with a minor
              is routed through that guardian, and messages can’t be exchanged until they have
              approved it.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
