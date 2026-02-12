import Dexie, { type Table } from 'dexie';
import type { Exercise, ExerciseLog, Workout, WorkoutLog } from '../types/types';

export class WorkoutDatabase extends Dexie {
  workouts!: Table<Workout>;
  exercises!: Table<Exercise>;
  workoutLogs!: Table<WorkoutLog>;
  exerciseLogs!: Table<ExerciseLog>;

  constructor() {
    super('WorkoutTrackerDB');
    this.version(1).stores({
      workouts: '++id',
      exercises: '++id',
      workoutLogs: '++id, date',
      exerciseLogs: '++id, exerciseId, date',
    });
  }
}

export const db = new WorkoutDatabase();
