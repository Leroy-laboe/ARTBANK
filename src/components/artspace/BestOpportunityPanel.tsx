import { Icon } from '../ui/Icon';
import { Panel } from './Panel';
import { bestOpportunity } from '../../data/artspaceContent';
import styles from './BestOpportunityPanel.module.css';

/** Module 4 — one match, explained. Deliberately singular: the spec replaces
 *  a list of generic recommendations with the strongest current match. */
export function BestOpportunityPanel() {
  return (
    <Panel title="Best Opportunity" subtitle="Your strongest current match.">
      <div className={styles.body}>
        <img src={bestOpportunity.imageUrl} alt="" className={styles.image} loading="lazy" />

        <div className={styles.copy}>
          <span className={styles.badge}>{bestOpportunity.badge}</span>
          <h3 className={styles.title}>{bestOpportunity.title}</h3>
          <p className={styles.summary}>{bestOpportunity.summary}</p>

          <dl className={styles.facts}>
            {bestOpportunity.facts.map((fact) => (
              <div className={styles.fact} key={fact.label}>
                <Icon name={fact.icon} size={15} className={styles.factIcon} />
                <dt className={styles.factLabel}>{fact.label}</dt>
                <dd className={styles.factValue}>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <button type="button" className={styles.action}>
        {bestOpportunity.action}
      </button>
    </Panel>
  );
}
