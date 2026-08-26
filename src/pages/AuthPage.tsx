import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthSwitch, { type AuthMode } from '@/components/ui/auth-switch';
import panelVideo from '@/video.mp4';
import { Icon } from '../components/ui/Icon';
import { signIn, signUp } from '../services/auth';
import styles from './AuthPage.module.css';

export function AuthPage({ mode }: { mode: AuthMode }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  /** Where to land after signing in. RequireAuth passes the page the user was
   *  trying to reach; only same-site paths are honoured so the query string
   *  can't be used to bounce someone off to another host. */
  const next = searchParams.get('next');
  const destination = next && next.startsWith('/') && !next.startsWith('//') ? next : '/artspace';
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignIn(values: { email: string; password: string }) {
    if (!values.email || !values.password) {
      setInfo('');
      setError('Enter both your email and password.');
      return;
    }
    setError('');
    setInfo('');
    setLoading(true);
    try {
      await signIn(values.email, values.password);
      // ArtSpace is the signed-in home. Buyers have no dashboard yet, so this
      // will need to branch on role once sign-in returns one.
      navigate(destination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(values: {
    email: string;
    password: string;
    role: 'artist' | 'buyer';
  }) {
    if (!values.email || !values.password) {
      setInfo('');
      setError('Enter both your email and password.');
      return;
    }
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const { session } = await signUp(values.email, values.password, values.role);
      if (session) {
        navigate(values.role === 'artist' ? destination : '/');
      } else {
        // Email confirmation is required before a session is issued — stay on
        // the sign-up side and tell them what to do next.
        setInfo('Check your email to confirm your account, then sign in.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create your account. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      {/* Left in AuthPage rather than auth-switch.tsx — that component is a
          verbatim port of a supplied design, so anything not in the original
          bundle stays out of it. */}
      <Link to="/" className={styles.backLink}>
        <Icon name="chevron-left" size={15} />
        Back to ARTBANK
      </Link>

      <AuthSwitch
        defaultMode={mode}
        videoSrc={panelVideo}
        // Keep the URL in step with the panel, so a refresh reopens the same side.
        onModeChange={(next) => {
          setError('');
          setInfo('');
          navigate(next === 'signup' ? '/register' : '/login', { replace: true });
        }}
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        error={error}
        info={info}
        loading={loading}
      />
    </main>
  );
}
