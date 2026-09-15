import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/ui/Button';
import styles from './ComingSoonPage.module.css';

export function ComingSoonPage({ title }: { title: string }) {
  return (
    <>
      <Header />
      <main>
        <section className={styles.section}>
          <div className={styles.inner}>
            <span className={styles.badge}>
              <Icon name="clock" size={24} />
            </span>
            <p className={`eyebrow ${styles.eyebrow}`}>{title}</p>
            <h1 className={styles.title}>Coming Soon</h1>
            <p className={styles.desc}>
              We&rsquo;re putting the finishing touches on {title}. In the meantime, browse the
              artists already on ARTBANK or see how the platform works for buyers.
            </p>
            <div className={styles.actions}>
              <Button variant="primary" to="/artists" icon={<Icon name="arrow-right" size={16} />}>
                Browse artists
              </Button>
              <Button variant="ghost" to="/for-buyers">
                For buyers
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
