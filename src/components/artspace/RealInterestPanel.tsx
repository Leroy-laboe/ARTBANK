import { Panel, PanelFooterLink, PanelLink } from './Panel';
import { realInterest, type InterestLevel } from '../../data/artspaceContent';
import styles from './RealInterestPanel.module.css';

const levelClass: Record<InterestLevel, string> = {
  High: styles.high,
  Medium: styles.medium,
  Low: styles.low,
};

/** Module 2 — identified viewers and enquiries only. Anonymous traffic is
 *  counted elsewhere; this panel is about people, not page views. */
export function RealInterestPanel() {
  return (
    <Panel
      title="Real Interest"
      subtitle="People who are genuinely interested in your work."
      action={<PanelLink to="/artspace/interest" />}
    >
      <ul className={styles.list}>
        {realInterest.map((item) => (
          <li className={styles.row} key={item.id}>
            <img src={item.avatarUrl} alt="" className={styles.avatar} loading="lazy" />
            <div className={styles.copy}>
              <p className={styles.name}>{item.name}</p>
              <p className={styles.detail}>{item.detail}</p>
            </div>
            <span className={[styles.level, levelClass[item.level]].join(' ')}>{item.level}</span>
            <span className={styles.time}>{item.time}</span>
          </li>
        ))}
      </ul>

      <PanelFooterLink to="/artspace/interest">Go to Interest</PanelFooterLink>
    </Panel>
  );
}
