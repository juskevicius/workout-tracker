import { Suspense } from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../components/loading-spinner/loading-spinner';
import { ExerciseAnalyticsPage } from '../pages/exercises/ExerciseAnalyticsPage';
import { ExercisesPage } from '../pages/exercises/ExercisesPage';
import { GoogleOAuthCallback } from '../pages/extra-features/GoogleOAuthCallback';
import { LogPage } from '../pages/log/LogPage';
import { PlanPage } from '../pages/plan/PlanPage';
import { SchedulePage } from '../pages/plan/SchedulePage';
import { ExtraFeaturesPage } from '../pages/extra-features/ExtraFeaturesPage';
import { TimerPage } from '../pages/log/TimerPage';
import styles from './app.module.css';
import WelcomePage from '../pages/welcome/WelcomePage';
import HomePage from '../pages/home/HomePage';

const NavBar = () => {
  return (
    <nav className={styles.appNav}>
      <Link to="/log" className={styles.navLink}>
        <div className={styles.navLinkText}>
          <span className="material-symbols-outlined">checklist</span>
          <span>Log</span>
        </div>
      </Link>
      <Link to="/plan" className={styles.navLink}>
        <div className={styles.navLinkText}>
          <span className="material-symbols-outlined">calendar_month</span>
          <span>Plan</span>
        </div>
      </Link>
      <Link to="/exercises" className={styles.navLink}>
        <div className={styles.navLinkText}>
          <span className="material-symbols-outlined">exercise</span>
          <span>Exercises</span>
        </div>
      </Link>
    </nav>
  );
};

export function App() {
  const navigate = useNavigate();

  return (
    <div className={styles.app}>
      <header className={styles.appHeader}>
        <div className={styles.headerContent}>
          {window.screen.width > 768 && (
            <>
              <Link to="/welcome" className={styles.appTitleNavLink}>
                <h1 className={styles.appTitle}>GRATIS TRAINING</h1>
              </Link>
              <NavBar />
            </>
          )}
          <button
            className={styles.settingsBtn}
            onClick={() => navigate('/extra-features')}
            title="Extra Features"
            aria-label="Open extra features"
          >
            ⚙
          </button>
        </div>
      </header>

      <main className={styles.appMain}>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/welcome" element={<WelcomePage />} />
            <Route path="/log" element={<LogPage />} />
            <Route path="/timer/:exerciseId" element={<TimerPage />} />
            <Route path="/plan" element={<PlanPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/exercises" element={<ExercisesPage />} />
            <Route
              path="/exercises/:exerciseId/analytics"
              element={<ExerciseAnalyticsPage />}
            />
            <Route path="/extra-features" element={<ExtraFeaturesPage />} />
            <Route
              path="/auth/google/callback"
              element={<GoogleOAuthCallback />}
            />
          </Routes>
        </Suspense>
      </main>

      <footer className={styles.appFooter}>
        {window.screen.width <= 768 && <NavBar />}
      </footer>
    </div>
  );
}

export default App;
