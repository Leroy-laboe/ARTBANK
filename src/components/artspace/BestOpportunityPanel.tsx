import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { Panel, PanelEmpty } from './Panel';
import { bestOpportunity as demoOpportunity } from '../../data/artspaceContent';
import type { BestOpportunity } from '../../services/dashboard';
import styles from './BestOpportunityPanel.module.css';

const demo: BestOpportunity = { ...demoOpportunity, to: '/artspace/opportunities' };

/** Module 4 — one match, explained. Deliberately singular: the spec replaces
 *  a list of generic recommendations with the strongest current match. */
export function BestOpportunityPanel({ opportunity = demo }: { opportunity?: BestOpportunity | null }) {
  if (!opportunity) {
    return (
      <Panel title="Best Opportunity" subtitle="Your strongest current match.">
        <PanelEmpty>
          No matches yet. Completing your artwork records is what opportunities are matched
          against.
        </PanelEmpty>
      </Panel>
    );
  }

  return (
    <Panel title="Best Opportunity" subtitle="Your strongest current match.">
      <div className={styles.body}>
        <img src={opportunity.imageUrl} alt="" className={styles.image} loading="lazy" />

        <div className={styles.copy}>
          <span className={styles.badge}>{opportunity.badge}</span>
          <h3 className={styles.title}>{opportunity.title}</h3>
          <p className={styles.summary}>{opportunity.summary}</p>

          <dl className={styles.facts}>
            {opportunity.facts.map((fact) => (
              <div className={styles.fact} key={fact.label}>
                <Icon name={fact.icon} size={15} className={styles.factIcon} />
                <dt className={styles.factLabel}>{fact.label}</dt>
                <dd className={styles.factValue}>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <Link to={opportunity.to} className={styles.action}>
        {opportunity.action}
      </Link>
    </Panel>
  );
}
