import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { exchangeCodeForToken } from '../../services/google-drive';
import styles from './google-oauth-callback.module.css';

export function GoogleOAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');

        if (!code) {
          throw new Error('No authorization code received');
        }

        // Exchange the code for access token
        await exchangeCodeForToken(code);

        // Clean up URL
        window.history.replaceState({}, document.title, '/extra-features');

        // Redirect to extra features page
        navigate('/extra-features');
      } catch (error) {
        console.error('OAuth callback failed:', error);
        // Redirect to extra features page with error
        navigate('/extra-features');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h2>Connecting to Google Drive...</h2>
        <p>Please wait while we complete the authentication process.</p>
      </div>
    </div>
  );
}
