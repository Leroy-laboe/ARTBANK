import { Icon } from '../ui/Icon';
import { Panel, PanelLink } from './Panel';
import {
  enquiries as demoEnquiries,
  type Enquiry,
  type EnquiryStatus,
  type MonogramTone,
} from '../../data/artspaceInterest';
import styles from './NewEnquiriesPanel.module.css';

const toneClass: Record<MonogramTone, string> = {
  forest: styles.toneForest,
  gold: styles.toneGold,
  ink: styles.toneInk,
};

const statusClass: Record<EnquiryStatus, string> = {
  New: styles.statusNew,
  Replied: styles.statusReplied,
  Awaiting: styles.statusAwaiting,
};

/** Questions and requests from identified people. Each row carries what they
 *  want and which artwork it's about, so the artist can act without opening
 *  the thread (docs/pivot-checklist/12-interest-ledger.md). */
export function NewEnquiriesPanel({ enquiries = demoEnquiries }: { enquiries?: Enquiry[] }) {
  return (
    <Panel
      title="New Enquiries"
      subtitle="Recent questions and requests about your artworks."
      action={
        <PanelLink to="/artspace/messages" arrow>
          View all enquiries
        </PanelLink>
      }
    >
      <ul className={styles.list}>
        {enquiries.map((enquiry) => (
          <li className={styles.row} key={enquiry.id}>
            <span className={[styles.monogram, toneClass[enquiry.tone]].join(' ')} aria-hidden="true">
              {enquiry.monogram}
            </span>

            <div className={styles.who}>
              <p className={styles.name}>
                {enquiry.name}
                {enquiry.verified && (
                  <Icon name="badge-check" size={13} className={styles.verified} aria-label="Identity verified" />
                )}
              </p>
              <p className={styles.location}>{enquiry.location}</p>
            </div>

            <div className={styles.field}>
              <p className={styles.fieldLabel}>Interested in</p>
              <p className={styles.artwork}>{enquiry.artwork}</p>
              <p className={styles.purpose}>{enquiry.purposeLabel}</p>
            </div>

            <div className={styles.field}>
              <p className={styles.fieldLabel}>Message preview</p>
              <p className={styles.preview}>{enquiry.preview}</p>
            </div>

            <span className={styles.time}>{enquiry.time}</span>

            <span className={[styles.status, statusClass[enquiry.status]].join(' ')}>{enquiry.status}</span>

            <button type="button" className={styles.menu} aria-label={`More actions for ${enquiry.name}`}>
              <Icon name="more-vertical" size={16} />
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
