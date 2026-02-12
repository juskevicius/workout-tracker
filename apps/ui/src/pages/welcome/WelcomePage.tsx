import { useNavigate } from 'react-router-dom';
import styles from './welcome-page.module.css';

export function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {window.screen.width <= 768 && (
          <h1 className={styles.appTitle}>GRATIS TRAINING</h1>
        )}
      </div>

      <div className={styles.empty}>
        <p className={styles.emptyTitle}>
          Welcome to <span className={styles.appName}>GRATIS TRAINING</span> - a
          free, open-source workout tracker! 🎉
        </p>

        <br />
        <p className={styles.emptyText}>
          We <b>don't collect</b> any data. Everything is stored locally on your
          device. You can optionally{' '}
          <strong
            onClick={(e) => {
              e.stopPropagation();
              navigate('/extra-features');
            }}
            className={styles.planLink}
          >
            export
          </strong>{' '}
          your data to Google Drive if you want to use it on another device.
        </p>

        <br />
        <p className={styles.emptyText}>
          1. Start by creating some{' '}
          <strong
            onClick={(e) => {
              e.stopPropagation();
              navigate('/exercises');
            }}
            className={styles.planLink}
          >
            exercises
          </strong>
        </p>
        <p className={styles.emptyText}>
          2. Create a{' '}
          <strong
            onClick={(e) => {
              e.stopPropagation();
              navigate('/plan');
            }}
            className={styles.planLink}
          >
            workout plan
          </strong>{' '}
          by adding exercises to it
        </p>
        <p className={styles.emptyText}>
          3.{' '}
          <strong
            onClick={(e) => {
              e.stopPropagation();
              navigate('/schedule');
            }}
            className={styles.planLink}
          >
            Schedule
          </strong>{' '}
          and{' '}
          <strong
            onClick={(e) => {
              e.stopPropagation();
              navigate('/log');
            }}
            className={styles.planLink}
          >
            log
          </strong>{' '}
          your workouts
        </p>
      </div>
    </div>
  );
}

export default WelcomePage;
