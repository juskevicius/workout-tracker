import { useNavigate, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { useExercises, useExerciseLogs } from '../../hooks/useDatabase';
import { ExerciseProgressChart } from '../../components/exercise-progress-chart/exercise-progress-chart';
import { LoadingSpinner } from '../../components/loading-spinner/loading-spinner';
import styles from './exercise-analytics-page.module.css';

export function ExerciseAnalyticsPage() {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const navigate = useNavigate();
  const { exercises, loading: exercisesLoading } = useExercises();
  const { exerciseLogs } = useExerciseLogs();

  const exercise = exercises.find((e) => e.id === Number(exerciseId));

  // Get logs for selected exercise, sorted by date
  const exerciseLogs_ = useMemo(() => {
    if (!exerciseId) return [];
    const id = Number(exerciseId);
    return exerciseLogs
      .filter((log) => log.exerciseId === id)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [exerciseId, exerciseLogs]);

  if (exercisesLoading) {
    return <LoadingSpinner />;
  }

  if (!exercise) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>Exercise not found</h2>
        <button onClick={() => navigate('/exercises')}>
          Back to Exercises
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          {`< Back`}
        </button>
      </div>

      {exerciseLogs_.length > 0 ? (
        <div className={styles.chartsContainer}>
          <ExerciseProgressChart exercise={exercise} logs={exerciseLogs_} />
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>No logged data available for this exercise.</p>
          <p>Start logging workouts to see your progress!</p>
        </div>
      )}
    </div>
  );
}

export default ExerciseAnalyticsPage;
