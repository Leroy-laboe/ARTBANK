import { Icon } from '../ui/Icon';
import { Panel, PanelFooterLink, PanelLink } from './Panel';
import { moneyAndRights } from '../../data/artspaceContent';
import styles from './MoneyRightsPanel.module.css';

/** Module 5 — recorded earnings and live licences. Nothing here is an
 *  estimate or a projection; every figure is something that happened. */
export function MoneyRightsPanel() {
  return (
    <Panel
      title="Money and Rights"
      subtitle="Completed and pending earnings & licences."
      action={<PanelLink to="/artspace/billing" />}
    >
      <div className={styles.body}>
        <div className={styles.figures}>
          <div className={styles.earnings}>
            {moneyAndRights.earnings.map((item) => (
              <div className={styles.earningCard} key={item.id}>
                <div className={styles.earningTop}>
                  <span className={styles.earningLabel}>{item.label}</span>
                  <Icon name={item.icon} size={16} className={styles.earningIcon} />
                </div>
                <p className={styles.earningValue}>{item.value}</p>
                <p className={styles.earningNote}>{item.note}</p>
              </div>
            ))}
          </div>

          <div className={styles.rights}>
            {moneyAndRights.rights.map((item) => (
              <div key={item.id}>
                <p className={styles.rightLabel}>{item.label}</p>
                <p className={styles.rightValue}>{item.value}</p>
                <p className={styles.rightNote}>{item.note}</p>
              </div>
            ))}
          </div>
        </div>

        <img src={moneyAndRights.imageUrl} alt="" className={styles.image} loading="lazy" />
      </div>

      <PanelFooterLink to="/artspace/billing">View Details</PanelFooterLink>
    </Panel>
  );
}
