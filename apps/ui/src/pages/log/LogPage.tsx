import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useWorkouts,
  useWorkoutLogs,
  useExercises,
  useExerciseLogs,
} from '../../hooks/useDatabase';
import { CurrentWorkoutSession } from '../../components/current-workout-session/current-workout-session';
import styles from './log-page.module.css';

export function LogPage() {
  const { workouts } = useWorkouts();
  const { exercises } = useExercises();
  const { workoutLogs } = useWorkoutLogs();
  const { exerciseLogs, addExerciseLog, updateExerciseLog } = useExerciseLogs();
  const [todaysWorkouts, setTodayWorkouts] = useState<any | null>([]);
  const navigate = useNavigate();

  const getTodayDateString = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const today = getTodayDateString();
    const todayLogs = workoutLogs.filter((log) => log.date === today);

    if (todayLogs.length) {
      const todaysWorkouts = todayLogs.map((todaysLog) => {
        const workout = workouts.find((w) => w.id === todaysLog.workoutId);
        return {
          log: todaysLog,
          workout,
          exercises: workout
            ? exercises.filter((e) => workout.exercises.includes(e.id))
            : [],
        };
      });
      setTodayWorkouts(todaysWorkouts);
    } else {
      setTodayWorkouts([]);
    }
  }, [workoutLogs, workouts, exercises]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>
          <span className="material-symbols-outlined">checklist</span>Today's
          Workouts
        </h2>
      </div>

      {todaysWorkouts.length ? (
        todaysWorkouts.map((w) => (
          <CurrentWorkoutSession
            key={w.workout.id}
            workoutLog={w.log}
            workout={w.workout}
            exercises={w.exercises}
            exerciseLogs={exerciseLogs}
            onAddExerciseLog={addExerciseLog}
            onUpdateExerciseLog={updateExerciseLog}
          />
        ))
      ) : (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>No workout planned today</p>
          <p className={styles.emptyText}>
            Head to the{' '}
            <strong
              onClick={(e) => {
                e.stopPropagation();
                navigate('/schedule');
              }}
              className={styles.planLink}
            >
              Schedule
            </strong>{' '}
            page to add one.
          </p>
        </div>
      )}
    </div>
  );
}

export default LogPage;
