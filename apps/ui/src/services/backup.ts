import { db } from './db';
import type { Workout, Exercise, WorkoutLog, ExerciseLog } from '../types/types';

export interface BackupData {
  version: string;
  timestamp: string;
  data: {
    workouts: Workout[];
    exercises: Exercise[];
    workoutLogs: WorkoutLog[];
    exerciseLogs: ExerciseLog[];
  };
}

/**
 * Export all database content to JSON
 */
export async function exportDatabase(): Promise<BackupData> {
  try {
    const [workouts, exercises, workoutLogs, exerciseLogs] = await Promise.all([
      db.workouts.toArray(),
      db.exercises.toArray(),
      db.workoutLogs.toArray(),
      db.exerciseLogs.toArray(),
    ]);

    const backup: BackupData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: {
        workouts,
        exercises,
        workoutLogs,
        exerciseLogs,
      },
    };

    return backup;
  } catch (error) {
    throw new Error(
      `Failed to export database: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Import backup data into database (merge strategy)
 */
export async function importDatabase(backup: BackupData): Promise<void> {
  try {
    // Clear existing data
    await Promise.all([
      db.workouts.clear(),
      db.exercises.clear(),
      db.workoutLogs.clear(),
      db.exerciseLogs.clear(),
    ]);

    // Import data
    await Promise.all([
      db.workouts.bulkAdd(backup.data.workouts),
      db.exercises.bulkAdd(backup.data.exercises),
      db.workoutLogs.bulkAdd(backup.data.workoutLogs),
      db.exerciseLogs.bulkAdd(backup.data.exerciseLogs),
    ]);
  } catch (error) {
    throw new Error(
      `Failed to import database: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
