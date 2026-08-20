import { useState, type FormEvent } from 'react';
import { cn } from '@/lib/utils';
import styles from './auth-switch.module.css';

export type AuthMode = 'signin' | 'signup';
export type AccountRole = 'artist' | 'buyer';

export type AuthSwitchProps = {
  /** Which side the card opens on. Added so /login and /register can share it. */
  defaultMode?: AuthMode;
  /** Optional footage to fill the sliding panel. Falls back to its gradient. */
  videoSrc?: string;
  onSignIn?: (values: { email: string; password: string }) => void;
  onSignUp?: (values: { email: string; password: string; role: AccountRole }) => void;
  onModeChange?: (mode: AuthMode) => void;
  /** Shown under whichever form is currently active. */
  error?: string;
  /** Shown under whichever form is currently active, e.g. "check your email." Ignored while `error` is set. */
  info?: string;
  /** Disables the active form's submit button while an auth call is in flight. */
  loading?: boolean;
  className?: string;
};

export default function AuthSwitch({
  defaultMode = 'signin',
  videoSrc,
  onSignIn,
  onSignUp,
  onModeChange,
  error,
  info,
  loading,
  className,
}: AuthSwitchProps) {
  const [isSignUp, setIsSignUp] = useState(defaultMode === 'signup');
  const [role, setRole] = useState<AccountRole>('artist');
  const [signedUpEmail, setSignedUpEmail] = useState('');

  // The original toggled a class via document.querySelector('.container') in
  // an effect. Driving it from state instead avoids a global DOM query that
  // would match the app's own `.container` wrapper in the Header first.
  function switchMode(next: boolean) {
    setIsSignUp(next);
    onModeChange?.(next ? 'signup' : 'signin');
  }

  function handleSignIn(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    onSignIn?.({
      email: String(data.get('email') ?? ''),
      password: String(data.get('password') ?? ''),
    });
  }

  function handleSignUp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const submittedEmail = String(data.get('email') ?? '');
    setSignedUpEmail(submittedEmail);
    onSignUp?.({
      email: submittedEmail,
      password: String(data.get('password') ?? ''),
      role: (String(data.get('role') ?? 'artist') as AccountRole),
    });
  }

  // Once signup succeeds but needs confirmation, `info` is set and stays set
  // (AuthPage only clears it on mode change) — so this alone is enough to
  // swap the form for a clear "check your email" state instead of leaving
  // the same fields on screen with a small line of text under them.
  const awaitingConfirmation = isSignUp && !error && Boolean(info);

  return (
    <div className={cn(styles.container, isSignUp && styles.signUpMode, className)}>
      {/* Clipped to the same circle as the gradient panel, and placed before
          the panels so their copy stays on top of it. */}
      {videoSrc && (
        <div className={styles.media} aria-hidden="true">
          <video
            className={styles.mediaVideo}
            src={videoSrc}
            autoPlay
            muted
            loop
            playsInline
            tabIndex={-1}
          />
          <div className={styles.mediaTint} />
        </div>
      )}

      <div className={styles.formsContainer}>
        <div className={styles.signinSignup}>
          {/* Sign In Form */}
          <form className={styles.signInForm} onSubmit={handleSignIn}>
            <h2 className={styles.title}>Sign in</h2>
            <div className={styles.inputField}>
              <i>📧</i>
              <input type="email" name="email" placeholder="Email" autoComplete="email" />
            </div>
            <div className={styles.inputField}>
              <i>🔒</i>
              <input
                type="password"
                name="password"
                placeholder="Password"
                autoComplete="current-password"
              />
            </div>
            {!isSignUp && error && <p className={styles.errorText}>{error}</p>}
            {!isSignUp && !error && info && <p className={styles.infoText}>{info}</p>}
            <input
              type="submit"
              value={loading && !isSignUp ? 'Signing in…' : 'Login'}
              disabled={loading}
              className={cn(styles.btn, styles.solid)}
            />
            <p className={styles.socialText}>Or sign in with social platforms</p>
            <div className={styles.socialMedia}>
              <SocialIcons />
            </div>
          </form>

          {/* Sign Up Form */}
          <form className={styles.signUpForm} onSubmit={handleSignUp}>
            {awaitingConfirmation ? (
              <div className={styles.confirmPanel}>
                <span className={styles.confirmIcon} aria-hidden="true">
                  📬
                </span>
                <h2 className={styles.title}>Check your email</h2>
                <p className={styles.confirmText}>
                  We’ve sent a confirmation link to
                  {signedUpEmail && <strong className={styles.confirmEmail}> {signedUpEmail}</strong>}.
                  Click it to activate your account, then come back and sign in.
                </p>
              </div>
            ) : (
              <>
                <h2 className={styles.title}>Create your JO1N ID</h2>
                <p className={styles.subtitle}>Start with identity. Build value as you grow.</p>
                <p className={styles.blurb}>
                  The free foundation includes your JO1N ID, profile, three work records and public
                  contact route. Paid tools unlock expanded records, deeper intelligence,
                  professional packs and deal support.
                </p>

                <div className={styles.roleGroup} role="radiogroup" aria-label="Account type">
                  <label className={cn(styles.roleCard, role === 'artist' && styles.roleCardActive)}>
                    <input
                      type="radio"
                      name="role"
                      value="artist"
                      checked={role === 'artist'}
                      onChange={() => setRole('artist')}
                      className={styles.roleRadio}
                    />
                    <span className={styles.roleTitle}>Artist / Creator</span>
                    <span className={styles.roleDesc}>Build ArtSpace and import work</span>
                  </label>
                  <label className={cn(styles.roleCard, role === 'buyer' && styles.roleCardActive)}>
                    <input
                      type="radio"
                      name="role"
                      value="buyer"
                      checked={role === 'buyer'}
                      onChange={() => setRole('buyer')}
                      className={styles.roleRadio}
                    />
                    <span className={styles.roleTitle}>Buyer / Organization</span>
                    <span className={styles.roleDesc}>Source professional creative talent</span>
                  </label>
                </div>

                <div className={styles.inputField}>
                  <i>📧</i>
                  <input type="email" name="email" placeholder="Email address" autoComplete="email" />
                </div>
                <div className={styles.inputField}>
                  <i>🔒</i>
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    autoComplete="new-password"
                  />
                </div>
                {isSignUp && error && <p className={styles.errorText}>{error}</p>}
                <input
                  type="submit"
                  value={loading && isSignUp ? 'Creating your JO1N ID…' : 'Continue free'}
                  disabled={loading}
                  className={styles.btn}
                />
              </>
            )}
          </form>
        </div>
      </div>

      <div className={styles.panelsContainer}>
        <div className={cn(styles.panel, styles.leftPanel)}>
          <div className={styles.content}>
            <h3>New here?</h3>
            <p>
              Join us today and discover a world of possibilities. Create your account in seconds!
            </p>
            <button
              type="button"
              className={cn(styles.btn, styles.transparent)}
              onClick={() => switchMode(true)}
            >
              Sign up
            </button>
          </div>
        </div>

        <div className={cn(styles.panel, styles.rightPanel)}>
          <div className={styles.content}>
            <h3>One of us?</h3>
            <p>Welcome back! Sign in to continue your journey with us.</p>
            <button
              type="button"
              className={cn(styles.btn, styles.transparent)}
              onClick={() => switchMode(false)}
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ Separated for cleaner JSX
function SocialIcons() {
  return (
    <>
      <a href="#" className={styles.socialIcon}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
      </a>
      <a href="#" className={styles.socialIcon}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </a>
      <a href="#" className={styles.socialIcon}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#1DA1F2">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
        </svg>
      </a>
      <a href="#" className={styles.socialIcon}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      </a>
    </>
  );
}

export { AuthSwitch };
