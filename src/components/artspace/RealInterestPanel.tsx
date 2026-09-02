import { Panel, PanelEmpty, PanelFooterLink, PanelLink } from './Panel';
import { realInterest as demoInterest, type InterestItem, type InterestLevel } from '../../data/artspaceContent';
import type { MonogramTone } from '../../data/artspaceInterest';
import styles from './RealInterestPanel.module.css';

const levelClass: Record<InterestLevel, string> = {
  High: styles.high,
  Medium: styles.medium,
  Low: styles.low,
};

const toneClass: Record<MonogramTone, string> = {
  forest: styles.toneForest,
  gold: styles.toneGold,
  ink: styles.toneInk,
};

/** Module 2 — identified viewers and enquiries only. Anonymous traffic is
 *  counted elsewhere; this panel is about people, not page views. */
export function RealInterestPanel({ items = demoInterest }: { items?: InterestItem[] }) {
  return (
    <Panel
      title="Real Interest"
      subtitle="People who are genuinely interested in your work."
      action={<PanelLink to="/artspace/interest" />}
    >
      {items.length === 0 ? (
        <PanelEmpty>
          No identified interest yet. Publishing a work and sharing its link is how the first
          enquiry usually arrives.
        </PanelEmpty>
      ) : (
        <ul className={styles.list}>
          {items.map((item) => (
            <li className={styles.row} key={item.id}>
              {item.avatarUrl ? (
                <img src={item.avatarUrl} alt="" className={styles.avatar} loading="lazy" />
              ) : (
                <span
                  className={[styles.monogram, toneClass[item.tone ?? 'ink']].join(' ')}
                  aria-hidden="true"
                >
                  {item.monogram ?? item.name.slice(0, 2).toUpperCase()}
                </span>
              )}
              <div className={styles.copy}>
                <p className={styles.name}>{item.name}</p>
                <p className={styles.detail}>{item.detail}</p>
              </div>
              <span className={[styles.level, levelClass[item.level]].join(' ')}>{item.level}</span>
              <span className={styles.time}>{item.time}</span>
            </li>
          ))}
        </ul>
      )}

      <PanelFooterLink to="/artspace/interest">Go to Interest</PanelFooterLink>
    </Panel>
  );
}
