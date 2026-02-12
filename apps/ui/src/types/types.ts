interface Exercise {
  id: number;
  name: string;
  description?: string;
  sets: number; // default 1
  reps: number; // default 1
  weight?: number;
  repNames?: string[]; // default ["Rep 1", "Rep 2", ...]
  setRestPeriodSeconds?: number; // default 0
  repRestPeriodSeconds?: number; // default 0
  repDurationSeconds?: number;
}

interface ExerciseLog {
  id: number;
  exerciseId: Exercise['id'];
  date: string; // ISO date string
  isCompleted: boolean;
  setsCompleted: boolean[];
  repsCompletedPerSet: number[];
  weightPerRep?: number[];
  effort?: number; // 1-10 scale
  notes?: string;
}

interface Workout {
  id: number;
  name: string;
  description?: string;
  exercises: Exercise['id'][];
}

interface WorkoutLog {
  id: number;
  workoutId: Workout['id'];
  isCompleted: boolean;
  date: string; // ISO date string
  exerciseLogs: ExerciseLog['id'][];
  notes?: string;
}

export type { Exercise, ExerciseLog, Workout, WorkoutLog };
