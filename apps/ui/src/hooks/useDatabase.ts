import { useEffect, useState } from 'react';
import { db } from '../services/db';
import type {
  Workout,
  Exercise,
  WorkoutLog,
  ExerciseLog,
} from '../types/types';

/**
 * Hook to fetch all workouts from IndexedDB
 */
export function useWorkouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setLoading(true);
        const data = await db.workouts.toArray();
        setWorkouts(data);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to fetch workouts')
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, []);

  const addWorkout = async (workout: Omit<Workout, 'id'>) => {
    try {
      const id = await db.workouts.add(workout as Workout);
      const newWorkout = await db.workouts.get(id);
      if (newWorkout) {
        setWorkouts((prev) => [...prev, newWorkout]);
      }
      return newWorkout;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to add workout');
      setError(error);
      throw error;
    }
  };

  const updateWorkout = async (id: number, updates: Partial<Workout>) => {
    try {
      await db.workouts.update(id, updates);
      const updated = await db.workouts.get(id);
      if (updated) {
        setWorkouts((prev) => prev.map((w) => (w.id === id ? updated : w)));
      }
      return updated;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to update workout');
      setError(error);
      throw error;
    }
  };

  const deleteWorkout = async (id: number) => {
    try {
      await db.workouts.delete(id);
      setWorkouts((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to delete workout');
      setError(error);
      throw error;
    }
  };

  return { workouts, loading, error, addWorkout, updateWorkout, deleteWorkout };
}

/**
 * Hook to fetch all exercises from IndexedDB
 */
export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true);
        const data = await db.exercises.toArray();
        setExercises(data);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to fetch exercises')
        );
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  const addExercise = async (exercise: Omit<Exercise, 'id'>) => {
    try {
      const id = await db.exercises.add(exercise as Exercise);
      const newExercise = await db.exercises.get(id);
      if (newExercise) {
        setExercises((prev) => [...prev, newExercise]);
      }
      return newExercise;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to add exercise');
      setError(error);
      throw error;
    }
  };

  const updateExercise = async (id: number, updates: Partial<Exercise>) => {
    try {
      await db.exercises.update(id, updates);
      const updated = await db.exercises.get(id);
      if (updated) {
        setExercises((prev) => prev.map((e) => (e.id === id ? updated : e)));
      }
      return updated;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to update exercise');
      setError(error);
      throw error;
    }
  };

  const deleteExercise = async (id: number) => {
    try {
      await db.exercises.delete(id);
      setExercises((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to delete exercise');
      setError(error);
      throw error;
    }
  };

  return {
    exercises,
    loading,
    error,
    addExercise,
    updateExercise,
    deleteExercise,
  };
}

/**
 * Hook to fetch all workout logs from IndexedDB
 */
export function useWorkoutLogs() {
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchWorkoutLogs = async () => {
      try {
        setLoading(true);
        const data = await db.workoutLogs.toArray();
        setWorkoutLogs(data);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to fetch workout logs')
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutLogs();
  }, []);

  const addWorkoutLog = async (workoutLog: Omit<WorkoutLog, 'id'>) => {
    try {
      const id = await db.workoutLogs.add(workoutLog as WorkoutLog);
      const newWorkoutLog = await db.workoutLogs.get(id);
      if (newWorkoutLog) {
        setWorkoutLogs((prev) => [...prev, newWorkoutLog]);
      }
      return newWorkoutLog;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to add workout log');
      setError(error);
      throw error;
    }
  };

  const updateWorkoutLog = async (id: number, updates: Partial<WorkoutLog>) => {
    try {
      await db.workoutLogs.update(id, updates);
      const updated = await db.workoutLogs.get(id);
      if (updated) {
        setWorkoutLogs((prev) => prev.map((w) => (w.id === id ? updated : w)));
      }
      return updated;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to update workout log');
      setError(error);
      throw error;
    }
  };

  const deleteWorkoutLog = async (id: number) => {
    try {
      // Get the workout log to find related exercise logs
      const workoutLog = await db.workoutLogs.get(id);

      if (workoutLog) {
        // Delete all related exercise logs
        if (workoutLog.exerciseLogs && workoutLog.exerciseLogs.length > 0) {
          await db.exerciseLogs.bulkDelete(workoutLog.exerciseLogs);
        }
      }

      // Delete the workout log itself
      await db.workoutLogs.delete(id);
      setWorkoutLogs((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to delete workout log');
      setError(error);
      throw error;
    }
  };

  return {
    workoutLogs,
    loading,
    error,
    addWorkoutLog,
    updateWorkoutLog,
    deleteWorkoutLog,
  };
}

/**
 * Hook to fetch all exercise logs from IndexedDB
 */
export function useExerciseLogs() {
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchExerciseLogs = async () => {
      try {
        setLoading(true);
        const data = await db.exerciseLogs.toArray();
        setExerciseLogs(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error('Failed to fetch exercise logs')
        );
      } finally {
        setLoading(false);
      }
    };

    fetchExerciseLogs();
  }, []);

  const addExerciseLog = async (
    exerciseLog: Omit<ExerciseLog, 'id'>,
    workoutLogId?: number
  ) => {
    try {
      const id = await db.exerciseLogs.add(exerciseLog as ExerciseLog);
      const newExerciseLog = await db.exerciseLogs.get(id);
      if (newExerciseLog) {
        setExerciseLogs((prev) => [...prev, newExerciseLog]);

        // If workoutLogId is provided, add this exercise log to the workout log
        if (workoutLogId) {
          const workoutLog = await db.workoutLogs.get(workoutLogId);
          if (workoutLog) {
            const updatedExerciseLogs = [
              ...(workoutLog.exerciseLogs || []),
              id,
            ];
            await db.workoutLogs.update(workoutLogId, {
              exerciseLogs: updatedExerciseLogs,
            });
          }
        }
      }
      return newExerciseLog;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to add exercise log');
      setError(error);
      throw error;
    }
  };

  const updateExerciseLog = async (
    id: number,
    updates: Partial<ExerciseLog>
  ) => {
    try {
      
      // If setsCompleted is being updated, check if all sets are completed
      if (Array.isArray(updates.setsCompleted)) {
        const allSetsCompleted = updates.setsCompleted.every((completed) => completed);
        if (allSetsCompleted && !updates.isCompleted) {
          updates.isCompleted = true;
        } else if (!allSetsCompleted) {
          updates.isCompleted = false;
        }
      }
      
      await db.exerciseLogs.update(id, updates);
      const updated = await db.exerciseLogs.get(id);
      if (updated) {
        setExerciseLogs((prev) => prev.map((e) => (e.id === id ? updated : e)));

        // Check if all exercise logs for the same workout are now completed
        // Find the workout log that contains this exercise log by querying by date first
        const workoutLogsForDate = await db.workoutLogs
          .where('date')
          .equals(updated.date)
          .toArray();
        const workoutLog = workoutLogsForDate.find((wl) =>
          wl.exerciseLogs?.includes(id)
        );

        if (workoutLog && typeof updates.isCompleted === 'boolean') {
          const relatedExerciseLogs = workoutLog.exerciseLogs
            ? await db.exerciseLogs
                .where('id')
                .anyOf(workoutLog.exerciseLogs)
                .toArray()
            : [];

          // Check if all related exercise logs are completed
          const allCompleted = relatedExerciseLogs.every(
            (log) => log.isCompleted
          );
          if (allCompleted && !workoutLog.isCompleted) {
            await db.workoutLogs.update(workoutLog.id, { isCompleted: true });
          } else if (!allCompleted && workoutLog.isCompleted) {
            await db.workoutLogs.update(workoutLog.id, { isCompleted: false });
          }
        }
      }
      return updated;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to update exercise log');
      setError(error);
      throw error;
    }
  };

  const deleteExerciseLog = async (id: number) => {
    try {
      await db.exerciseLogs.delete(id);
      setExerciseLogs((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to delete exercise log');
      setError(error);
      throw error;
    }
  };

  return {
    exerciseLogs,
    loading,
    error,
    addExerciseLog,
    updateExerciseLog,
    deleteExerciseLog,
  };
}
