import { useState, type FormEvent } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from './Icon';
import { ShinyButton } from './shiny-button';
import styles from './auth-switch.module.css';

export type AuthMode = 'signin' | 'signup';
export type AccountRole = 'artist' | 'buyer' | 'guardian';

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
  // Separate per form: showing the sign-in field shouldn't reveal the
  // sign-up one too, and each stays password-masked again if the panel
  // switches sides.
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

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
            <div className={cn(styles.inputField, styles.passwordField)}>
              <i>🔒</i>
              <input
                type={showSignInPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.toggleVisibility}
                aria-label={showSignInPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showSignInPassword}
                onClick={() => setShowSignInPassword((v) => !v)}
              >
                <Icon name={showSignInPassword ? 'eye-off' : 'eye'} size={17} />
              </button>
            </div>
            {!isSignUp && error && <p className={styles.errorText}>{error}</p>}
            {!isSignUp && !error && info && <p className={styles.infoText}>{info}</p>}
            <ShinyButton type="submit" disabled={loading} className={styles.signInSubmit}>
              {loading && !isSignUp ? 'Signing in…' : 'Login'}
            </ShinyButton>
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
                  <label className={cn(styles.roleCard, role === 'guardian' && styles.roleCardActive)}>
                    <input
                      type="radio"
                      name="role"
                      value="guardian"
                      checked={role === 'guardian'}
                      onChange={() => setRole('guardian')}
                      className={styles.roleRadio}
                    />
                    <span className={styles.roleTitle}>Guardian</span>
                    <span className={styles.roleDesc}>Approve contact for a minor</span>
                  </label>
                </div>

                <div className={styles.inputField}>
                  <i>📧</i>
                  <input type="email" name="email" placeholder="Email address" autoComplete="email" />
                </div>
                <div className={cn(styles.inputField, styles.passwordField)}>
                  <i>🔒</i>
                  <input
                    type={showSignUpPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className={styles.toggleVisibility}
                    aria-label={showSignUpPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showSignUpPassword}
                    onClick={() => setShowSignUpPassword((v) => !v)}
                  >
                    <Icon name={showSignUpPassword ? 'eye-off' : 'eye'} size={17} />
                  </button>
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

export { AuthSwitch };
