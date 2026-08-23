import { Link } from 'react-router-dom';
import { Icon, type IconName } from '../ui/Icon';
import styles from './TipsPanel.module.css';

export type Tip = { id: string; icon: IconName; title: string; detail?: string };

/** Short actionable cards telling the artist what to do next. Deliberately
 *  not charts — the brief keeps data visualisation to cards like these. */
export function TipsPanel({
  title,
  tips,
  linkTo,
  linkLabel = 'View tips',
  headerIcon,
  variant = 'boxed',
}: {
  title: string;
  tips: Tip[];
  linkTo: string;
  linkLabel?: string;
  /** Optional glyph beside the heading, e.g. a lightbulb. */
  headerIcon?: IconName;
  /** `boxed` gives each tip a filled icon tile; `plain` leaves the glyph bare. */
  variant?: 'boxed' | 'plain';
}) {
  return (
    <section className={styles.card}>
      <h2 className={styles.title}>
        {headerIcon && <Icon name={headerIcon} size={15} className={styles.headerIcon} />}
        {title}
      </h2>

      <ul className={styles.list}>
        {tips.map((tip) => (
          <li className={styles.row} key={tip.id}>
            <span className={variant === 'plain' ? styles.iconPlain : styles.icon}>
              <Icon name={tip.icon} size={variant === 'plain' ? 17 : 15} />
            </span>
            <div className={styles.copy}>
              <p className={styles.tipTitle}>{tip.title}</p>
              {tip.detail && <p className={styles.detail}>{tip.detail}</p>}
            </div>
          </li>
        ))}
      </ul>

      <Link to={linkTo} className={styles.link}>
        {linkLabel}
        <Icon name="arrow-right" size={13} />
      </Link>
    </section>
  );
}
