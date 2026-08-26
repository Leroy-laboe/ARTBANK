import { Icon } from '../ui/Icon';
import { intentFlow } from '../../data/buyerContent';
import styles from './IntentFlowPanel.module.css';

/** "Connected & Synchronized" — what happens on the artist's side when a
 *  buyer acts on this one.
 *
 *  It is here because the whole product rests on a promise that is invisible
 *  from the buyer's screen: saving and enquiring are not private gestures,
 *  they are disclosures. Showing the artist's column beside the buyer's makes
 *  that plain before anyone presses a button, not after. */
export function IntentFlowPanel() {
  return (
    <section className={styles.panel}>
      <p className={styles.eyebrow}>{intentFlow.eyebrow}</p>
      <p className={styles.blurb}>{intentFlow.blurb}</p>

      <div className={styles.columns}>
        <div className={styles.column}>
          <p className={styles.columnHead}>{intentFlow.buyerHeading}</p>
          {intentFlow.buyerSteps.map((step, i) => (
            <div key={step.label}>
              <div className={[styles.step, styles.buyerStep].join(' ')}>
                <Icon name={step.icon} size={15} className={styles.stepIcon} />
                <span>{step.label}</span>
              </div>
              {i < intentFlow.buyerSteps.length - 1 && (
                <Icon name="arrow-down" size={14} className={styles.arrow} aria-hidden="true" />
              )}
            </div>
          ))}
        </div>

        <div className={styles.link} aria-hidden="true">
          <span className={styles.linkLine} />
          <Icon name="arrow-right" size={14} />
          <span className={styles.linkLine} />
        </div>

        <div className={styles.column}>
          <p className={[styles.columnHead, styles.columnHeadArtist].join(' ')}>
            {intentFlow.artistHeading}
          </p>
          {intentFlow.artistSteps.map((step, i) => (
            <div key={step.label}>
              <div className={[styles.step, styles.artistStep].join(' ')}>
                <Icon name={step.icon} size={15} className={styles.stepIconGold} />
                <span>{step.label}</span>
              </div>
              {i < intentFlow.artistSteps.length - 1 && (
                <Icon name="arrow-down" size={14} className={styles.arrow} aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      </div>

      <p className={styles.footer}>
        <Icon name="shield-check" size={15} className={styles.footerIcon} />
        {intentFlow.footer}
      </p>
    </section>
  );
}
