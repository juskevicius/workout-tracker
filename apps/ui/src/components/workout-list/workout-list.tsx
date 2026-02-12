import { useState } from 'react';
import type { Workout, Exercise } from '../../types/types';
import styles from './workout-list.module.css';

interface WorkoutListProps {
  workouts: Workout[];
  exercises: Exercise[];
  onEdit: (workout: Workout) => void;
  onDelete: (id: number) => void;
  onViewSchedule: () => void;
}

export function WorkoutList({
  workouts,
  exercises,
  onEdit,
  onDelete,
  onViewSchedule,
}: WorkoutListProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getExerciseById = (id: number) => {
    return exercises.find((e) => e.id === id);
  };

  if (workouts.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No workouts created yet. Create your first workout above!</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {workouts.map((workout) => (
        <div key={workout.id} className={styles.card}>
          <div
            className={styles.cardHeader}
            onClick={() => toggleExpand(workout.id)}
            role="button"
            tabIndex={0}
          >
            <div className={styles.headerInfo}>
              <h3 className={styles.workoutName}>{workout.name}</h3>
              <span className={styles.exerciseCount}>
                {workout.exercises.length} exercise
                {workout.exercises.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div
              className={styles.scheduleBtn}
              onClick={(e) => {
                e.stopPropagation();
                onViewSchedule();
              }}
              role="button"
              tabIndex={0}
              title="View schedule"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onViewSchedule();
                }
              }}
            >
              📋
            </div>
            <span className={styles.expandIcon}>
              {expandedId === workout.id ? '▼' : '▶'}
            </span>
          </div>

          {workout.description && (
            <div className={styles.description}>{workout.description}</div>
          )}

          {expandedId === workout.id && (
            <div className={styles.details}>
              <div className={styles.exercisesList}>
                <h4>Exercises:</h4>
                {workout.exercises.length === 0 ? (
                  <p className={styles.noExercises}>
                    No exercises in this workout
                  </p>
                ) : (
                  <div className={styles.exercisesGrid}>
                    {workout.exercises.map((exerciseId) => {
                      const exercise = getExerciseById(exerciseId);
                      return exercise ? (
                        <div key={exerciseId} className={styles.exerciseItem}>
                          <div className={styles.exerciseNameSmall}>
                            {exercise.name}
                          </div>
                          <div className={styles.exerciseMetrics}>
                            <span>
                              {exercise.sets}x{exercise.reps}
                            </span>
                            {exercise.weight && (
                              <span>{exercise.weight}kg</span>
                            )}
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              <div className={styles.actions}>
                <button
                  className={styles.editButton}
                  onClick={() => onEdit(workout)}
                >
                  Edit
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => onDelete(workout.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
