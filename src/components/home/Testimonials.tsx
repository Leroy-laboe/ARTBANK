import { Icon } from '../ui/Icon';
import { testimonialAvatars } from '../../data/homeContent';
import styles from './Testimonials.module.css';

export function Testimonials() {
  return (
    <section className={styles.section}>
      <div className="container">
        <span className={styles.quoteMark}>
          <Icon name="quote" size={30} />
        </span>
        <p className={styles.quote}>
          &ldquo;ARTBANK is building the infrastructure for the future of creative value.&rdquo;
        </p>
        <p className={styles.attribution}>— Collectors &amp; Creators Worldwide</p>

        <div className={styles.avatars}>
          {testimonialAvatars.slice(0, 3).map((gradient, i) => (
            <span key={i} style={{ background: gradient }} />
          ))}
          <span className={styles.more}>+</span>
          {testimonialAvatars.slice(3, 7).map((gradient, i) => (
            <span key={i} style={{ background: gradient }} />
          ))}
        </div>
      </div>
    </section>
  );
}
