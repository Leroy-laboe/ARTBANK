import { Icon } from '../ui/Icon';
import {
  type InterestLevel,
  type PassportState,
  type Work,
  type WorkAvailability,
  type WorkStatus,
} from '../../data/artspaceWorks';
import styles from './WorksTable.module.css';

const statusDot: Record<WorkStatus, string> = {
  Published: styles.dotGreen,
  'In Progress': styles.dotGold,
  Draft: styles.dotGold,
  Private: styles.dotMuted,
  Archived: styles.dotMuted,
};

const availabilityDot: Record<WorkAvailability, string> = {
  Available: styles.dotGreen,
  'On View': styles.dotGold,
  Reserved: styles.dotGold,
  Sold: styles.dotMuted,
  Unavailable: styles.dotMuted,
};

const interestClass: Record<InterestLevel, string> = {
  High: styles.levelHigh,
  Medium: styles.levelMedium,
  Low: styles.levelLow,
  None: styles.levelNone,
};

/** Passport rows carry their own follow-up action: a verified record is worth
 *  viewing, an unfinished one is worth completing. */
function PassportCell({ state }: { state: PassportState }) {
  if (state === 'Verified') {
    return (
      <div className={styles.stack}>
        <span className={styles.passportTop}>
          <Icon name="check-circle" size={15} className={styles.verifiedIcon} />
          Verified
        </span>
        <button type="button" className={styles.cellLink}>
          View
        </button>
      </div>
    );
  }

  return (
    <div className={styles.stack}>
      <span className={styles.passportTop}>
        <Icon name="circle-dashed" size={15} className={styles.draftIcon} />
        {state}
      </span>
      <button type="button" className={styles.cellLink}>
        Continue
      </button>
    </div>
  );
}

export function WorksTable({
  works,
  selected,
  onToggle,
  onToggleAll,
}: {
  works: Work[];
  selected: string[];
  onToggle: (id: string) => void;
  onToggleAll: () => void;
}) {
  const allSelected = works.length > 0 && selected.length === works.length;

  return (
    <div className={styles.scroller}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.checkCol}>
              <input
                type="checkbox"
                className={styles.check}
                checked={allSelected}
                onChange={onToggleAll}
                aria-label="Select all artworks"
              />
            </th>
            <th>Artwork</th>
            <th>Status</th>
            <th>Availability</th>
            <th>Passport / COA</th>
            <th>Interest</th>
            <th>Opportunities</th>
            <th>Earnings to Date</th>
            <th>
              <span className={styles.sorted}>
                Updated
                <Icon name="arrow-down" size={13} />
              </span>
            </th>
            <th className={styles.menuCol}>
              <span className="visually-hidden">Actions</span>
            </th>
          </tr>
        </thead>

        <tbody>
          {works.map((work) => (
            <tr key={work.id} className={selected.includes(work.id) ? styles.rowSelected : undefined}>
              <td className={styles.checkCol}>
                <input
                  type="checkbox"
                  className={styles.check}
                  checked={selected.includes(work.id)}
                  onChange={() => onToggle(work.id)}
                  aria-label={`Select ${work.title}`}
                />
              </td>

              <td>
                <div className={styles.work}>
                  <img src={work.imageUrl} alt="" className={styles.thumb} loading="lazy" />
                  <div className={styles.workCopy}>
                    <p className={styles.workTitle}>{work.title}</p>
                    <p className={styles.workMeta}>
                      {work.year} • {work.medium}
                    </p>
                    <p className={styles.workDims}>{work.dimensions}</p>
                  </div>
                </div>
              </td>

              <td>
                <span className={styles.labelled}>
                  <span className={[styles.dot, statusDot[work.status]].join(' ')} />
                  {work.status}
                </span>
              </td>

              <td>
                <div className={styles.stack}>
                  <span className={styles.labelled}>
                    <span className={[styles.dot, availabilityDot[work.availability]].join(' ')} />
                    {work.availability}
                  </span>
                  {work.availabilityNote && <span className={styles.subNote}>{work.availabilityNote}</span>}
                </div>
              </td>

              <td>
                <PassportCell state={work.passport} />
              </td>

              <td>
                <span className={[styles.level, interestClass[work.interestLevel]].join(' ')}>
                  <span className={styles.levelCount}>{work.interestCount}</span>
                  <span className={styles.levelLabel}>{work.interestLevel}</span>
                </span>
              </td>

              <td className={styles.numeric}>
                <p className={styles.figure}>{work.opportunities}</p>
                <p className={styles.subNote}>{work.opportunities > 0 ? 'Active' : '—'}</p>
              </td>

              <td className={styles.numeric}>
                <p className={styles.figure}>{work.earnings === null ? '—' : `USD ${work.earnings.toLocaleString('en-US')}`}</p>
                <p className={styles.subNote}>{work.earningsNote}</p>
              </td>

              <td className={styles.updated}>{work.updated}</td>

              <td className={styles.menuCol}>
                <button type="button" className={styles.menuBtn} aria-label={`More actions for ${work.title}`}>
                  <Icon name="more-vertical" size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
