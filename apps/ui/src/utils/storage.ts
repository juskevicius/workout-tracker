import { db } from '../services/db';
import type { Workout, Exercise, WorkoutLog, ExerciseLog } from '../types/types';

export interface WorkoutData {
  version: string;
  exportDate: string;
  workouts: Workout[];
  exercises: Exercise[];
  workoutLogs: WorkoutLog[];
  exerciseLogs: ExerciseLog[];
}

/**
 * Export all workout data as JSON
 */
export async function exportAllData(): Promise<WorkoutData> {
  const [workouts, exercises, workoutLogs, exerciseLogs] = await Promise.all([
    db.workouts.toArray(),
    db.exercises.toArray(),
    db.workoutLogs.toArray(),
    db.exerciseLogs.toArray(),
  ]);

  return {
    version: '1.0',
    exportDate: new Date().toISOString(),
    workouts,
    exercises,
    workoutLogs,
    exerciseLogs,
  };
}

/**
 * Import workout data into IndexedDB
 * @param data The data to import
 * @param merge If true, merge with existing data; if false, replace all data
 */
export async function importData(data: WorkoutData, merge = true): Promise<void> {
  try {
    if (!merge) {
      // Clear all existing data
      await Promise.all([
        db.workouts.clear(),
        db.exercises.clear(),
        db.workoutLogs.clear(),
        db.exerciseLogs.clear(),
      ]);
    }

    // Import data
    await Promise.all([
      db.workouts.bulkPut(data.workouts),
      db.exercises.bulkPut(data.exercises),
      db.workoutLogs.bulkPut(data.workoutLogs),
      db.exerciseLogs.bulkPut(data.exerciseLogs),
    ]);
  } catch (error) {
    throw new Error(`Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Download data as JSON file
 */
export async function downloadDataAsJSON(): Promise<void> {
  const data = await exportAllData();
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `workout-data-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Load and import JSON data from file
 */
export async function importDataFromFile(file: File, merge = true): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content) as WorkoutData;
        await importData(data, merge);
        resolve();
      } catch (error) {
        reject(new Error(`Failed to import file: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsText(file);
  });
}

/**
 * Clear all data from IndexedDB
 */
export async function clearAllData(): Promise<void> {
  await Promise.all([
    db.workouts.clear(),
    db.exercises.clear(),
    db.workoutLogs.clear(),
    db.exerciseLogs.clear(),
  ]);
}
