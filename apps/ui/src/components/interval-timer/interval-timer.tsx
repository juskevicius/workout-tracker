import { useState, useEffect } from 'react';
import type { Exercise } from '../../types/types';
import styles from './interval-timer.module.css';

interface IntervalTimerProps {
  exercise: Exercise;
  onBack: () => void;
}

interface TimerState {
  currentSet: number;
  currentRep: number;
  phase: 'work' | 'rest-rep' | 'rest-set';
  timeRemaining: number;
  isRunning: boolean;
}

export function IntervalTimer({ exercise, onBack }: IntervalTimerProps) {
  const [state, setState] = useState<TimerState>({
    currentSet: 1,
    currentRep: 1,
    phase: 'work',
    timeRemaining: exercise.repDurationSeconds!,
    isRunning: false,
  });

  const getRepName = (repIndex: number): string => {
    if (exercise.repNames && exercise.repNames.length > 0) {
      return exercise.repNames[repIndex % exercise.repNames.length];
    }
    return `Rep ${repIndex + 1}`;
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const getPhaseInfo = (): { label: string; duration: number } => {
    if (state.phase === 'work') {
      return {
        label: 'WORK',
        duration: exercise.repDurationSeconds!,
      };
    } else if (state.phase === 'rest-rep') {
      return {
        label: 'REST',
        duration: exercise.repRestPeriodSeconds || 0,
      };
    } else {
      return {
        label: 'REST (Set)',
        duration: exercise.setRestPeriodSeconds || 0,
      };
    }
  };

  // Timer effect
  useEffect(() => {
    if (!state.isRunning) return;

    const interval = setInterval(() => {
      setState((prev) => {
        const newState = { ...prev };
        newState.timeRemaining -= 1;

        // If current phase is done, move to next
        if (newState.timeRemaining <= 0) {
          if (prev.phase === 'work') {
            // After work, check if there are more reps in this set
            if (prev.currentRep < exercise.reps) {
              newState.phase = 'rest-rep';
              newState.timeRemaining = exercise.repRestPeriodSeconds || 0;
            } else if (prev.currentSet < exercise.sets) {
              // All reps done in this set, move to next set
              newState.phase = 'rest-set';
              newState.timeRemaining = exercise.setRestPeriodSeconds || 0;
            } else {
              // Workout complete
              newState.isRunning = false;
              newState.timeRemaining = 0;
            }
          } else if (prev.phase === 'rest-rep') {
            // After rep rest, start next rep
            newState.currentRep += 1;
            newState.phase = 'work';
            newState.timeRemaining = exercise.repDurationSeconds || 0;
          } else if (prev.phase === 'rest-set') {
            // After set rest, start next set
            newState.currentSet += 1;
            newState.currentRep = 1;
            newState.phase = 'work';
            newState.timeRemaining = exercise.repDurationSeconds || 0;
          }
        }

        return newState;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isRunning, exercise]);

  const toggleTimer = () => {
    setState((prev) => ({ ...prev, isRunning: !prev.isRunning }));
  };

  const skipForward = () => {
    setState((prev) => {
      const isWorkoutComplete =
        prev.currentSet === exercise.sets &&
        prev.currentRep === exercise.reps &&
        prev.phase === 'work';
      if (isWorkoutComplete) return prev;

      const newState = { ...prev, isRunning: false };

      if (prev.phase === 'work') {
        if (prev.currentRep < exercise.reps) {
          newState.phase = 'rest-rep';
          newState.timeRemaining = exercise.repRestPeriodSeconds || 0;
        } else if (prev.currentSet < exercise.sets) {
          newState.phase = 'rest-set';
          newState.timeRemaining = exercise.setRestPeriodSeconds || 0;
        }
      } else if (prev.phase === 'rest-rep') {
        newState.currentRep += 1;
        newState.phase = 'work';
        newState.timeRemaining = exercise.repDurationSeconds || 0;
      } else if (prev.phase === 'rest-set') {
        newState.currentSet += 1;
        newState.currentRep = 1;
        newState.phase = 'work';
        newState.timeRemaining = exercise.repDurationSeconds || 0;
      }

      return newState;
    });
  };

  const skipBackward = () => {
    setState((prev) => {
      const isAtStart =
        prev.currentSet === 1 && prev.currentRep === 1 && prev.phase === 'work';
      if (isAtStart) return prev;

      const newState = { ...prev, isRunning: false };

      if (prev.phase === 'work' && prev.currentRep > 1) {
        newState.currentRep -= 1;
        newState.phase = 'rest-rep';
        newState.timeRemaining = exercise.repRestPeriodSeconds || 0;
      } else if (prev.phase === 'work' && prev.currentRep === 1) {
        if (prev.currentSet > 1) {
          newState.currentSet -= 1;
          newState.currentRep = exercise.reps;
          newState.phase = 'rest-set';
          newState.timeRemaining = exercise.setRestPeriodSeconds || 0;
        }
      } else if (prev.phase === 'rest-rep') {
        newState.phase = 'work';
        newState.timeRemaining = exercise.repDurationSeconds || 0;
      } else if (prev.phase === 'rest-set') {
        newState.phase = 'work';
        newState.currentSet -= 1;
        newState.currentRep = exercise.reps;
        newState.timeRemaining = exercise.repDurationSeconds || 0;
      }

      return newState;
    });
  };

  const isWorkoutComplete =
    state.currentSet > exercise.sets ||
    (state.currentSet === exercise.sets &&
      state.currentRep > exercise.reps &&
      state.phase === 'work');

  const phaseInfo = getPhaseInfo();

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={onBack}>
        {'<  Back'}
      </button>

      <div className={styles.exerciseHeader}>
        <h1 className={styles.exerciseName}>{exercise.name}</h1>
        <p className={styles.exerciseDetails}>
          {exercise.sets} set{exercise.sets !== 1 ? 's' : ''} × {exercise.reps}{' '}
          rep{exercise.reps !== 1 ? 's' : ''}
          {exercise.weight && ` @ ${exercise.weight}kg`}
        </p>
      </div>

      {isWorkoutComplete ? (
        <div className={styles.timerDisplay}>
          <div className={styles.finished}>✓ Workout Complete!</div>
        </div>
      ) : (
        <>
          <div className={styles.timerDisplay}>
            <div className={styles.timeValue}>
              {formatTime(state.timeRemaining)}
            </div>
            <div className={styles.repName}>
              {getRepName(state.currentRep - 1)}
            </div>
            <div className={styles.currentPhase}>{phaseInfo.label}</div>
            <div className={styles.progress}>
              Set {state.currentSet}/{exercise.sets} • Rep {state.currentRep}/
              {exercise.reps}
            </div>
          </div>

          <div className={styles.statsContainer}>
            {exercise.weight ? (
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Weight</div>
                <div className={styles.statValue}>{exercise.weight} kg</div>
              </div>
            ) : null}
            {exercise.repRestPeriodSeconds ? (
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Rest (Rep)</div>
                <div className={styles.statValue}>
                  {exercise.repRestPeriodSeconds}s
                </div>
              </div>
            ) : null}
            {exercise.setRestPeriodSeconds ? (
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Rest (Set)</div>
                <div className={styles.statValue}>
                  {exercise.setRestPeriodSeconds}s
                </div>
              </div>
            ) : null}
          </div>

          <div className={styles.controls}>
            <button
              className={`${styles.skipBtn} ${styles.controlBtn}`}
              onClick={skipBackward}
              disabled={
                state.currentSet === 1 &&
                state.currentRep === 1 &&
                state.phase === 'work'
              }
            >
              ⏮
            </button>

            <button
              className={`${
                state.isRunning ? styles.pauseBtn : styles.playBtn
              } ${styles.controlBtn}`}
              onClick={toggleTimer}
            >
              {state.isRunning ? '⏸' : '▶'}
            </button>

            <button
              className={`${styles.skipBtn} ${styles.controlBtn}`}
              onClick={skipForward}
              disabled={isWorkoutComplete}
            >
              ⏭
            </button>
          </div>
        </>
      )}
    </div>
  );
}
