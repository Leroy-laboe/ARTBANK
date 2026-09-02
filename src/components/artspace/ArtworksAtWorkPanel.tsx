import { Panel, PanelEmpty, PanelFooterLink, PanelLink } from './Panel';
import { artworksAtWork as demoWorks, type ArtworkAtWork, type WorkStatus } from '../../data/artspaceContent';
import styles from './ArtworksAtWorkPanel.module.css';

const statusClass: Record<WorkStatus, string> = {
  'On View': styles.onView,
  'In Progress': styles.inProgress,
  Negotiation: styles.negotiation,
};

/** Module 3 — where each artwork currently is: on view, being made, or being
 *  negotiated. Movement and status, not a portfolio grid. */
export function ArtworksAtWorkPanel({ works = demoWorks }: { works?: ArtworkAtWork[] }) {
  return (
    <Panel
      title="Artworks at Work"
      subtitle="Recent movement and status of your artworks."
      action={<PanelLink to="/artspace/works" />}
    >
      {works.length === 0 ? (
        <PanelEmpty>No artworks yet. Adding your first one starts its record.</PanelEmpty>
      ) : (
        <ul className={styles.list}>
          {works.map((work) => (
            <li className={styles.row} key={work.id}>
              <img src={work.imageUrl} alt="" className={styles.thumb} loading="lazy" />
              <div className={styles.copy}>
                <p className={styles.title}>{work.title}</p>
                <p className={styles.detail}>{work.detail}</p>
              </div>
              <span className={[styles.status, statusClass[work.status]].join(' ')}>{work.status}</span>
              <span className={styles.date}>{work.date}</span>
            </li>
          ))}
        </ul>
      )}

      <PanelFooterLink to="/artspace/works">Go to My Works</PanelFooterLink>
    </Panel>
  );
}
