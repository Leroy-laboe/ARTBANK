import { Component, type ReactNode } from 'react';
import styles from './ErrorBoundary.module.css';

type State = { failed: boolean };

/** The last line of defence for a render error anywhere in the app.
 *
 *  Without one, a single thrown error unmounts the whole tree and leaves a
 *  blank white page with no way forward. The commonest real trigger is not a
 *  bug at all: after a new deploy, a tab opened before it still references
 *  lazy route chunks that no longer exist, and loading one throws. A reload
 *  fetches the new build, which is why that is the primary action here. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <main className={styles.wrap}>
        <div className={styles.inner} role="alert">
          <p className={`eyebrow ${styles.eyebrow}`}>Something went wrong</p>
          <h1 className={styles.title}>This page couldn’t load.</h1>
          <p className={styles.desc}>
            Reloading usually fixes it. If it keeps happening, head back to the homepage and try
            again from there.
          </p>
          <div className={styles.actions}>
            <button type="button" className={styles.primary} onClick={() => window.location.reload()}>
              Reload
            </button>
            <a className={styles.secondary} href="/">
              Go to homepage
            </a>
          </div>
        </div>
      </main>
    );
  }
}
