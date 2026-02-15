import { useState } from 'react';
import { useSyncManager } from '../../hooks/useSyncManager';
import { getGoogleAuthUrl } from '../../services/google-drive';
import styles from './extra-features.module.css';

export function ExtraFeaturesPage() {
  const { status, syncToGoogleDrive, syncFromGoogleDrive, hasGoogleToken } =
    useSyncManager();

  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsAuthenticating(true);
      const authUrl = await getGoogleAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Failed to get auth URL:', error);
      setIsAuthenticating(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Extra Features</h2>
      </div>

      {/* Error Message */}
      {status.error && (
        <div className={styles.errorMessage}>
          <strong>Error:</strong> {status.error}
        </div>
      )}

      {/* Last Sync */}
      {status.lastSync && (
        <div className={styles.infoMessage}>
          <strong>Last sync:</strong>{' '}
          {new Date(status.lastSync).toLocaleString()}
        </div>
      )}

      {/* Offline Notice */}
      {!status.isOnline && (
        <div className={styles.warningMessage}>
          <strong>Offline:</strong> Cloud sync features are unavailable. You can
          still use local export/import.
        </div>
      )}

      {/* Google Drive Section */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Google Drive Sync</h3>
        <p className={styles.sectionDescription}>
          Sync your data to Google Drive to access it from any device.
        </p>

        {!hasGoogleToken ? (
          <div className={styles.googleAuthContainer}>
            <button
              className={`${styles.button} ${styles.buttonPrimary}`}
              onClick={handleGoogleLogin}
              disabled={isAuthenticating}
            >
              {isAuthenticating
                ? 'Authenticating...'
                : '🔐 Connect to Google Drive'}
            </button>
            <p className={styles.googleAuthNote}>
              You will be redirected to Google to authorize access to your
              Drive.
            </p>
          </div>
        ) : (
          <div className={styles.googleAuthSection}>
            <div className={styles.authStatus}>
              <span className={styles.statusIndicator}>✓</span>
              <span>Connected to Google Drive</span>
            </div>

            <div className={styles.buttonGroup}>
              <button
                className={`${styles.button} ${styles.buttonPrimary}`}
                onClick={() => syncToGoogleDrive()}
                disabled={status.isLoading || !status.isOnline}
              >
                {status.isLoading
                  ? 'Uploading...'
                  : '☁️ Upload to Google Drive'}
              </button>

              <button
                className={`${styles.button} ${styles.buttonSecondary}`}
                onClick={() => syncFromGoogleDrive()}
                disabled={status.isLoading || !status.isOnline}
              >
                {status.isLoading
                  ? 'Downloading...'
                  : '⬇️ Download from Google Drive'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
