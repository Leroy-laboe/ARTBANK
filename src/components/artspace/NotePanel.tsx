import { Link } from 'react-router-dom';
import { Icon, type IconName } from '../ui/Icon';
import styles from './NotePanel.module.css';

/** A single standing note in the rail: a heading, a short paragraph and a way
 *  out. Used where the content is one statement rather than a list. */
export function NotePanel({
  title,
  body,
  linkLabel,
  linkTo,
  icon,
}: {
  title: string;
  body: string;
  linkLabel: string;
  linkTo: string;
  icon?: IconName;
}) {
  return (
    <section className={styles.card}>
      <p className={styles.head}>
        {icon && <Icon name={icon} size={16} className={styles.icon} />}
        <span className={styles.title}>{title}</span>
      </p>

      <p className={styles.body}>{body}</p>

      <Link to={linkTo} className={styles.link}>
        {linkLabel}
        <Icon name="arrow-right" size={13} />
      </Link>
    </section>
  );
}
