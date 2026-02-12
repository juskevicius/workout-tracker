import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Workout, Exercise } from '../../types/types';
import styles from './workout-form.module.css';

interface WorkoutFormProps {
  initialData?: Workout;
  allExercises: Exercise[];
  onSubmit: (data: Omit<Workout, 'id'>) => Promise<void>;
  onCancel: () => void;
}

export function WorkoutForm({
  initialData,
  allExercises,
  onSubmit,
  onCancel,
}: WorkoutFormProps) {
  const navigate = useNavigate();
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(
    initialData?.description || ''
  );
  const [selectedExercises, setSelectedExercises] = useState<number[]>(
    initialData?.exercises || []
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Workout name is required');
      return;
    }

    if (selectedExercises.length === 0) {
      setError('Please select at least one exercise');
      return;
    }

    try {
      setSubmitting(true);

      const finalData: Omit<Workout, 'id'> = {
        name: name.trim(),
        ...(description.trim() && { description: description.trim() }),
        exercises: selectedExercises,
      };

      await onSubmit(finalData);
      setName('');
      setDescription('');
      setSelectedExercises([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save workout');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleExercise = (exerciseId: number) => {
    setSelectedExercises((prev) =>
      prev.includes(exerciseId)
        ? prev.filter((id) => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <div className={styles.error}>{error}</div>}

      {/* Workout Name */}
      <div className={styles.formGroup}>
        <label htmlFor="name">Workout Name</label>
        <input
          id="name"
          type="text"
          placeholder="e.g., Upper Body, Cardio Day"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={submitting}
          minLength={1}
          maxLength={100}
        />
      </div>

      {/* Description */}
      <div className={styles.formGroup}>
        <label htmlFor="description">Description (optional)</label>
        <textarea
          id="description"
          placeholder="Optional notes about this workout"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          disabled={submitting}
        />
      </div>

      {/* Exercise Selection */}
      <div className={styles.formGroup}>
        <div className={styles.labelWithButton}>
          <label>Select Exercises</label>
          <button
            type="button"
            className={styles.createExerciseBtn}
            onClick={() => navigate('/exercises')}
            title="Create new exercise"
          >
            + Create Exercise
          </button>
        </div>
        {allExercises.length === 0 ? (
          <div className={styles.noExercises}>
            No exercises available. Create exercises first in the Exercises
            page.
          </div>
        ) : (
          <div className={styles.exerciseGrid}>
            {allExercises.map((exercise) => (
              <div key={exercise.id} className={styles.exerciseCheckbox}>
                <input
                  type="checkbox"
                  id={`exercise-${exercise.id}`}
                  checked={selectedExercises.includes(exercise.id)}
                  onChange={() => toggleExercise(exercise.id)}
                  disabled={submitting}
                />
                <label
                  htmlFor={`exercise-${exercise.id}`}
                  className={styles.checkboxLabel}
                >
                  <span className={styles.exerciseName}>{exercise.name}</span>
                  {exercise.sets && exercise.reps && (
                    <span className={styles.exerciseMeta}>
                      {exercise.sets}x{exercise.reps}
                      {exercise.weight && ` @ ${exercise.weight}kg`}
                    </span>
                  )}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Exercises Summary */}
      {selectedExercises.length > 0 && (
        <div className={styles.selectedSummary}>
          <strong>Selected: {selectedExercises.length} exercise(s)</strong>
          <div className={styles.selectedList}>
            {selectedExercises.map((id) => {
              const exercise = allExercises.find((e) => e.id === id);
              return exercise ? (
                <div key={id} className={styles.selectedItem}>
                  {exercise.name}
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className={styles.buttonGroup}>
        <button
          type="submit"
          className={styles.submitButton}
          disabled={submitting}
        >
          {submitting ? 'Saving...' : 'Save Workout'}
        </button>
        <button
          type="button"
          className={styles.cancelButton}
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
