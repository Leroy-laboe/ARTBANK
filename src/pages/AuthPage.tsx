import { useNavigate } from 'react-router-dom';
import AuthSwitch, { type AuthMode } from '@/components/ui/auth-switch';
import panelVideo from '@/video.mp4';
import styles from './AuthPage.module.css';

export function AuthPage({ mode }: { mode: AuthMode }) {
  const navigate = useNavigate();

  return (
    <main className={styles.page}>
      <AuthSwitch
        defaultMode={mode}
        videoSrc={panelVideo}
        // Keep the URL in step with the panel, so a refresh reopens the same side.
        onModeChange={(next) =>
          navigate(next === 'signup' ? '/register' : '/login', { replace: true })
        }
        // No auth backend is wired up yet.
        onSignIn={() => navigate('/')}
        onSignUp={() => navigate('/')}
      />
    </main>
  );
}
