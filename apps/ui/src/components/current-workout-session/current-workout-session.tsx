import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type {
  Workout,
  Exercise,
  WorkoutLog,
  ExerciseLog,
} from '../../types/types';
import { CustomCheckbox } from '../custom-checkbox/custom-checkbox';
import styles from './current-workout-session.module.css';

interface CurrentWorkoutSessionProps {
  workoutLog: WorkoutLog;
  workout: Workout | undefined;
  exercises: Exercise[];
  exerciseLogs: ExerciseLog[];
  onAddExerciseLog: (
    log: Omit<ExerciseLog, 'id'>,
    workoutLogId: number
  ) => Promise<ExerciseLog | undefined>;
  onUpdateExerciseLog: (
    id: number,
    updates: Partial<ExerciseLog>
  ) => Promise<ExerciseLog | undefined>;
}

export function CurrentWorkoutSession({
  workoutLog,
  workout,
  exercises,
  exerciseLogs,
  onAddExerciseLog,
  onUpdateExerciseLog,
}: CurrentWorkoutSessionProps) {
  const navigate = useNavigate();
  const [expandedExercise, setExpandedExercise] = useState<number | null>(null);

  // Get or create exercise logs for today's workout
  const getExerciseLog = (exerciseId: number): ExerciseLog | null => {
    const existingLog = exerciseLogs.find(
      (log) => log.exerciseId === exerciseId && log.date === workoutLog.date
    );
    return existingLog || null;
  };

  const buildDefaultExerciseLog = (
    exerciseId: number
  ): Omit<ExerciseLog, 'id'> => {
    const exercise = exercises.find((e) => e.id === exerciseId)!;
    return {
      exerciseId,
      date: workoutLog.date,
      isCompleted: false,
      setsCompleted: Array(exercise.sets).fill(false),
      repsCompletedPerSet: Array(exercise.sets).fill(exercise.reps),
      weightPerRep: exercise.weight
        ? Array(exercise.sets).fill(exercise.weight)
        : undefined,
      effort: 8,
      notes: '',
    };
  };

  const handleUpdateReps = async (
    exerciseId: number,
    setIndex: number,
    reps: number
  ) => {
    const exerciseLog = getExerciseLog(exerciseId);
    if (exerciseLog) {
      const updatedReps = [...(exerciseLog.repsCompletedPerSet || [])];
      updatedReps[setIndex] = reps;
      await onUpdateExerciseLog(exerciseLog.id, {
        repsCompletedPerSet: updatedReps,
      });
    } else {
      const exercise = exercises.find((e) => e.id === exerciseId);
      if (exercise) {
        const repsArray = Array(exercise.sets).fill(exercise.reps);
        repsArray[setIndex] = reps;
        const defaultExerciseLog = buildDefaultExerciseLog(exerciseId);
        await onAddExerciseLog(
          { ...defaultExerciseLog, repsCompletedPerSet: repsArray },
          workoutLog.id
        );
      }
    }
  };

  const handleToggleCompleted = async (exerciseId: number) => {
    const exerciseLog = getExerciseLog(exerciseId);
    const exercise = exercises.find((e) => e.id === exerciseId);
    if (!exercise) return;

    if (exerciseLog) {
      await onUpdateExerciseLog(exerciseLog.id, {
        isCompleted: !exerciseLog.isCompleted,
        setsCompleted: Array(exerciseLog.setsCompleted.length).fill(
          !exerciseLog.isCompleted
        ),
      });
    } else {
      const defaultExerciseLog = buildDefaultExerciseLog(exerciseId);
      await onAddExerciseLog(
        {
          ...defaultExerciseLog,
          isCompleted: true,
          setsCompleted: Array(defaultExerciseLog.setsCompleted.length).fill(
            true
          ),
        },
        workoutLog.id
      );
    }
  };

  const handleToggleSetCompleted = async (
    exerciseId: number,
    setIndex: number
  ) => {
    const exerciseLog = getExerciseLog(exerciseId);
    const exercise = exercises.find((e) => e.id === exerciseId);
    if (!exercise) return;

    if (exerciseLog) {
      // Update existing exercise log - toggle the boolean at setIndex
      const updatedSetsCompleted = [
        ...(exerciseLog.setsCompleted || Array(exercise.sets).fill(false)),
      ];
      updatedSetsCompleted[setIndex] = !updatedSetsCompleted[setIndex];
      await onUpdateExerciseLog(exerciseLog.id, {
        setsCompleted: updatedSetsCompleted,
      });
    } else {
      // Create new exercise log with the set at setIndex marked as completed
      const defaultExerciseLog = buildDefaultExerciseLog(exerciseId);
      const newSetsCompleted = Array(exercise.sets).fill(false);
      newSetsCompleted[setIndex] = true;
      await onAddExerciseLog(
        { ...defaultExerciseLog, setsCompleted: newSetsCompleted },
        workoutLog.id
      );
    }
  };

  const isSetCompleted = (exerciseId: number, setIndex: number): boolean => {
    const exerciseLog = getExerciseLog(exerciseId);
    return exerciseLog?.setsCompleted?.[setIndex] ?? false;
  };

  const handleUpdateWeight = async (
    exerciseId: number,
    setIndex: number,
    weight: number
  ) => {
    const exerciseLog = getExerciseLog(exerciseId);
    if (exerciseLog) {
      const updatedWeights = [...(exerciseLog.weightPerRep || [])];
      updatedWeights[setIndex] = weight;
      await onUpdateExerciseLog(exerciseLog.id, {
        weightPerRep: updatedWeights,
      });
    } else {
      const exercise = exercises.find((e) => e.id === exerciseId);
      if (exercise) {
        const weightArray = Array(exercise.sets).fill(exercise.weight);
        weightArray[setIndex] = weight;
        const defaultExerciseLog = buildDefaultExerciseLog(exerciseId);
        await onAddExerciseLog(
          { ...defaultExerciseLog, weightPerRep: weightArray },
          workoutLog.id
        );
      }
    }
  };

  const handleUpdateEffort = async (exerciseId: number, effort: number) => {
    const exerciseLog = getExerciseLog(exerciseId);
    if (exerciseLog) {
      await onUpdateExerciseLog(exerciseLog.id, { effort });
    } else {
      const defaultExerciseLog = buildDefaultExerciseLog(exerciseId);
      await onAddExerciseLog({ ...defaultExerciseLog, effort }, workoutLog.id);
    }
  };

  const handleUpdateNotes = async (exerciseId: number, notes: string) => {
    const exerciseLog = getExerciseLog(exerciseId);
    if (exerciseLog) {
      await onUpdateExerciseLog(exerciseLog.id, { notes });
    } else {
      const defaultExerciseLog = buildDefaultExerciseLog(exerciseId);
      await onAddExerciseLog({ ...defaultExerciseLog, notes }, workoutLog.id);
    }
  };

  if (!workout) {
    return <div>Workout not found</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.workoutInfo}>
          <h2 className={styles.workoutName}>{workout.name}</h2>
          {workout.description && (
            <p className={styles.description}>{workout.description}</p>
          )}
        </div>
      </div>

      <div className={styles.exercisesList}>
        {exercises.length === 0 ? (
          <div className={styles.empty}>No exercises in this workout</div>
        ) : (
          exercises.map((exercise) => {
            const exerciseLog = getExerciseLog(exercise.id);
            const isExpanded = expandedExercise === exercise.id;

            return (
              <div key={exercise.id} className={styles.exerciseCard}>
                <button
                  className={`${styles.exerciseHeader} ${
                    isExpanded ? styles.expanded : ''
                  } ${exerciseLog?.isCompleted ? styles.completed : ''}`}
                  onClick={() =>
                    setExpandedExercise(isExpanded ? null : exercise.id)
                  }
                >
                  <div
                    className={styles.completionCheckbox}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <CustomCheckbox
                      checked={exerciseLog?.isCompleted || false}
                      onChange={() => handleToggleCompleted(exercise.id)}
                    />
                  </div>
                  <div className={styles.exerciseTitle}>
                    <h3 className={styles.exerciseName}>{exercise.name}</h3>
                    <p className={styles.exerciseMeta}>
                      {exercise.sets} set{exercise.sets !== 1 ? 's' : ''} ×{' '}
                      {exercise.reps} rep{exercise.reps !== 1 ? 's' : ''}
                      {exercise.weight && ` @ ${exercise.weight}kg`}
                    </p>
                  </div>
                  {exercise?.repDurationSeconds && (
                    <div
                      className={styles.timerBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/timer/${exercise.id}`);
                      }}
                      role="button"
                      tabIndex={0}
                      title="Launch interval timer"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          navigate(`/timer/${exercise.id}`);
                        }
                      }}
                    >
                      <span className="material-symbols-outlined">timer</span>
                    </div>
                  )}
                  <span className={styles.chevron}>
                    {isExpanded ? '▼' : '▶'}
                  </span>
                </button>

                {isExpanded && (
                  <div className={styles.exerciseDetails}>
                    <div className={styles.setsContainer}>
                      {Array.from({ length: exercise.sets }).map(
                        (_, setIndex) => (
                          <div
                            key={setIndex}
                            className={`${styles.setRow} ${
                              isSetCompleted(exercise.id, setIndex)
                                ? styles.setCompleted
                                : ''
                            }`}
                          >
                            <span className={styles.setNumber}>
                              Set {setIndex + 1}:
                            </span>

                            <div className={styles.setInputs}>
                              <div className={styles.inputGroup}>
                                <label>Reps</label>
                                <input
                                  type="number"
                                  min="0"
                                  value={
                                    typeof exerciseLog?.repsCompletedPerSet?.[
                                      setIndex
                                    ] === 'number'
                                      ? exerciseLog.repsCompletedPerSet[
                                          setIndex
                                        ]
                                      : exercise.reps
                                  }
                                  onChange={(e) =>
                                    handleUpdateReps(
                                      exercise.id,
                                      setIndex,
                                      Number(e.target.value)
                                    )
                                  }
                                  className={styles.input}
                                />
                              </div>

                              {exercise.weight && (
                                <div className={styles.inputGroup}>
                                  <label>Weight (kg)</label>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={
                                      typeof exerciseLog?.weightPerRep?.[
                                        setIndex
                                      ] === 'number'
                                        ? exerciseLog.weightPerRep[setIndex]
                                        : exercise.weight
                                    }
                                    onChange={(e) =>
                                      handleUpdateWeight(
                                        exercise.id,
                                        setIndex,
                                        Number(e.target.value)
                                      )
                                    }
                                    className={styles.input}
                                  />
                                </div>
                              )}

                              {exercise.repRestPeriodSeconds && (
                                <div className={styles.inputGroup}>
                                  <label>Time (s)</label>
                                  <input
                                    type="text"
                                    readOnly
                                    value={exercise.repRestPeriodSeconds}
                                    className={`${styles.input} ${styles.readOnly}`}
                                  />
                                </div>
                              )}
                            </div>

                            <div className={styles.setCheckbox}>
                              <label className={styles.checkboxLabel}>✓</label>
                              <CustomCheckbox
                                checked={isSetCompleted(exercise.id, setIndex)}
                                onChange={() =>
                                  handleToggleSetCompleted(
                                    exercise.id,
                                    setIndex
                                  )
                                }
                              />
                            </div>
                          </div>
                        )
                      )}
                    </div>

                    <div className={styles.effortSection}>
                      <label className={styles.label}>Effort (1-10)</label>
                      <div className={styles.effortSlider}>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={exerciseLog?.effort || 8}
                          onChange={(e) =>
                            handleUpdateEffort(
                              exercise.id,
                              Number(e.target.value)
                            )
                          }
                          className={styles.slider}
                        />
                        <span className={styles.effortValue}>
                          {exerciseLog?.effort || 8}
                        </span>
                      </div>
                    </div>

                    <div className={styles.notesSection}>
                      <label className={styles.label}>Notes</label>
                      <textarea
                        value={exerciseLog?.notes || ''}
                        onChange={(e) =>
                          handleUpdateNotes(exercise.id, e.target.value)
                        }
                        placeholder="Add any notes about this exercise..."
                        className={styles.textarea}
                        rows={2}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
