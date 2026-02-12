import type { Workout, WorkoutLog } from '../../types/types';
import { Dropdown } from '../dropdown/dropdown';
import styles from './workout-schedule-panel.module.css';

interface WorkoutSchedulePanelProps {
  selectedDate: string;
  selectedWorkoutId: number | null;
  onSelectWorkout: (id: number) => void;
  onScheduleWorkout: () => void;
  onRemoveWorkout: (logId: number) => void;
  availableWorkouts: Workout[];
  scheduledWorkouts: WorkoutLog[];
  allWorkouts: Workout[];
}

export function WorkoutSchedulePanel({
  selectedDate,
  selectedWorkoutId,
  onSelectWorkout,
  onScheduleWorkout,
  onRemoveWorkout,
  availableWorkouts,
  scheduledWorkouts,
  allWorkouts,
}: WorkoutSchedulePanelProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getWorkoutName = (workoutId: number) => {
    return (
      allWorkouts.find((w) => w.id === workoutId)?.name || 'Unknown Workout'
    );
  };

  const canAddWorkout = () => {
    return (
      selectedWorkoutId &&
      !scheduledWorkouts.some((log) => log.workoutId === selectedWorkoutId)
    );
  };

  return (
    <div className={styles.panel}>
      <div className={styles.selectedDate}>
        <h3>{formatDate(selectedDate)}</h3>
      </div>

      <div className={styles.section}>
        <h4>Schedule Workout</h4>
        {availableWorkouts.length === 0 ? (
          <p className={styles.noWorkouts}>
            No workouts available. Create workouts first.
          </p>
        ) : (
          <>
            <Dropdown
              value={selectedWorkoutId}
              onChange={onSelectWorkout}
              options={availableWorkouts.map((workout) => ({
                value: workout.id,
                label: `${workout.name} (${workout.exercises.length} exercises)`,
              }))}
              placeholder="Select a workout..."
            />

            <button
              className={styles.scheduleButton}
              onClick={onScheduleWorkout}
              disabled={!canAddWorkout()}
            >
              Add to Schedule
            </button>
          </>
        )}
      </div>

      <div className={styles.section}>
        <h4>Scheduled for this date</h4>
        {scheduledWorkouts.length === 0 ? (
          <p className={styles.empty}>No workouts scheduled for this date.</p>
        ) : (
          <div className={styles.scheduledList}>
            {scheduledWorkouts.map((log) => (
              <div key={log.id} className={styles.scheduledItem}>
                <div className={styles.itemContent}>
                  <div className={styles.itemName}>
                    {getWorkoutName(log.workoutId)}
                  </div>
                  <div className={styles.itemStatus}>
                    {log.isCompleted ? (
                      <span className={styles.completed}>✓ Completed</span>
                    ) : (
                      <span className={styles.pending}>Pending</span>
                    )}
                  </div>
                </div>
                <button
                  className={styles.removeButton}
                  onClick={() => onRemoveWorkout(log.id)}
                  title="Remove from schedule"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
