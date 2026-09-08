import { Link } from 'react-router-dom';
import { Panel, PanelEmpty, PanelLink } from './Panel';
import type { ArtworkReadiness, ReadinessState } from '../../services/readiness';
import styles from './ArtworkActionPlanPanel.module.css';

/** "Artwork Action Plan" — every artwork gets one recommended next step
 *  instead of sitting in a portfolio with no clear direction. Shows the
 *  three furthest from Commercially Ready first — those are the ones a next
 *  action actually moves. */
const stateClass: Record<ReadinessState, string> = {
  Documented: styles.stateDocumented,
  Presentable: styles.statePresentable,
  'Trust-Ready': styles.stateTrustReady,
  'Commercially Ready': styles.stateReady,
};

const stateRank: Record<ReadinessState, number> = {
  Documented: 0,
  Presentable: 1,
  'Trust-Ready': 2,
  'Commercially Ready': 3,
};

export function ArtworkActionPlanPanel({ items }: { items: ArtworkReadiness[] }) {
  const pending = items
    .filter((i) => i.state !== 'Commercially Ready')
    .sort((a, b) => stateRank[a.state] - stateRank[b.state])
    .slice(0, 3);

  return (
    <Panel
      title="Artwork Action Plan"
      subtitle="One next step per artwork — not a score."
      action={<PanelLink to="/artspace/works">View all works</PanelLink>}
    >
      {items.length === 0 ? (
        <PanelEmpty>Add your first artwork to see what it needs next.</PanelEmpty>
      ) : pending.length === 0 ? (
        <PanelEmpty>Every artwork is Commercially Ready. Nothing is waiting on you here.</PanelEmpty>
      ) : (
        <ul className={styles.list}>
          {pending.map((item) => (
            <li className={styles.row} key={item.artworkId}>
              <span className={[styles.stateBadge, stateClass[item.state]].join(' ')}>
                {item.state}
              </span>
              <span className={styles.copy}>
                <span className={styles.title}>{item.title}</span>
                <span className={styles.action}>{item.recommendedAction}</span>
              </span>
              <Link to={`/artspace/works/${item.artworkId}`} className={styles.go}>
                Fix
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
