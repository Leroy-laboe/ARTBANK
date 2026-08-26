import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { enquiredOnLabel } from '../../services/buyer';
import type { BuyerEnquiry, EnquiryStatus } from '../../data/buyerContent';
import styles from './EnquiryList.module.css';

const statusClass: Record<EnquiryStatus, string> = {
  'Awaiting Response': styles.awaiting,
  'In Conversation': styles.talking,
  'Viewing Room': styles.room,
  Closed: styles.closed,
};

/** The buyer's side of the interest ledger: one row per enquiry filed, in the
 *  order they were filed.
 *
 *  A row opens the conversation it started when there is one, and the artwork
 *  record when there isn't — an enquiry with no thread yet is one the artist
 *  has not answered, and the record is the only thing there is to look at. */
export function EnquiryList({ enquiries }: { enquiries: BuyerEnquiry[] }) {
  return (
    <ul className={styles.list}>
      {enquiries.map((enquiry) => {
        const to = enquiry.conversationId
          ? `/collect/messages?c=${enquiry.conversationId}`
          : enquiry.artworkId
            ? `/collect/artworks/${enquiry.artworkId}`
            : '/collect';

        return (
          <li key={enquiry.id}>
            <Link to={to} className={styles.row}>
              {enquiry.imageUrl ? (
                <img src={enquiry.imageUrl} alt="" className={styles.thumb} loading="lazy" />
              ) : (
                <span className={styles.thumbEmpty} aria-hidden="true">
                  <Icon name="image" size={16} />
                </span>
              )}

              <span className={styles.copy}>
                <span className={styles.title}>{enquiry.artwork}</span>
                <span className={styles.artist}>{enquiry.artistName}</span>
                <span className={styles.meta}>
                  {enquiredOnLabel(enquiry.enquiredOn)} · {enquiry.purposeLabel}
                </span>
              </span>

              <span className={[styles.status, statusClass[enquiry.status]].join(' ')}>
                {enquiry.status}
              </span>

              <Icon name="chevron-right" size={16} className={styles.caret} />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
