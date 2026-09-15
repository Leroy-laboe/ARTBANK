import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { usePageMeta } from '../lib/usePageMeta';
import styles from './NotFoundPage.module.css';

/** The catch-all route. It used to render the "Coming Soon" placeholder, which
 *  told anyone following a mistyped or dead link that the page was on its way
 *  — and told crawlers it was a real page. A static host can't send a 404
 *  status for a client-side route, so noindex is what keeps these out of
 *  search results instead. */
export function NotFoundPage() {
  usePageMeta({ title: 'Page not found', robots: 'noindex' });

  return (
    <>
      <Header />
      <main>
        <section className={styles.section}>
          <div className={styles.inner}>
            <p className={`eyebrow ${styles.eyebrow}`}>Error 404</p>
            <h1 className={styles.title}>We couldn’t find that page.</h1>
            <p className={styles.desc}>
              The link may be out of date, or the page may have moved. These are good places to pick
              things up again.
            </p>
            <div className={styles.actions}>
              <Button variant="primary" to="/">
                Back to home
              </Button>
              <Button variant="ghost" to="/artists">
                Browse artists
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
