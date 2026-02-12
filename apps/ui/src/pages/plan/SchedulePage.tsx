import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkouts, useWorkoutLogs } from '../../hooks/useDatabase';
import { Calendar } from '../../components/calendar/calendar';
import { WorkoutSchedulePanel } from '../../components/workout-schedule-panel/workout-schedule-panel';
import type { WorkoutLog } from '../../types/types';
import styles from './schedule-page.module.css';

export function SchedulePage() {
  const navigate = useNavigate();
  const { workouts, loading: workoutsLoading } = useWorkouts();
  const {
    workoutLogs,
    addWorkoutLog,
    deleteWorkoutLog,
    loading: logsLoading,
  } = useWorkoutLogs();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<number | null>(
    null
  );

  const workoutsForDate = workoutLogs.filter(
    (log) => log.date === selectedDate
  );

  const handleScheduleWorkout = async () => {
    if (!selectedWorkoutId) return;

    const newLog: Omit<WorkoutLog, 'id'> = {
      workoutId: selectedWorkoutId,
      date: selectedDate,
      isCompleted: false,
      exerciseLogs: [],
    };

    await addWorkoutLog(newLog);
    setSelectedWorkoutId(null);
  };

  const handleRemoveWorkout = async (logId: number) => {
    await deleteWorkoutLog(logId);
  };

  if (workoutsLoading || logsLoading) {
    return (
      <div className={styles.loadingContainer}>Loading workout schedule...</div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          {`< Back`}
        </button>
      </div>
      <h2 className={styles.title}>Workout Schedule</h2>

      <div className={styles.content}>
        <div className={styles.calendarSection}>
          <Calendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            workoutLogs={workoutLogs}
          />
        </div>

        <div className={styles.scheduleSection}>
          <WorkoutSchedulePanel
            selectedDate={selectedDate}
            selectedWorkoutId={selectedWorkoutId}
            onSelectWorkout={setSelectedWorkoutId}
            onScheduleWorkout={handleScheduleWorkout}
            onRemoveWorkout={handleRemoveWorkout}
            availableWorkouts={workouts}
            scheduledWorkouts={workoutsForDate}
            allWorkouts={workouts}
          />
        </div>
      </div>
    </div>
  );
}
