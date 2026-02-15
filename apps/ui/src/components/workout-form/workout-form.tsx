import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Workout, Exercise } from '../../types/types';
import { Dropdown } from '../dropdown/dropdown';
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
  const [selectedExerciseToAdd, setSelectedExerciseToAdd] = useState<
    number | null
  >(null);
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

  const addExercise = (exerciseId: number) => {
    if (!selectedExercises.includes(exerciseId)) {
      setSelectedExercises((prev) => [...prev, exerciseId]);
    }
  };

  const removeExercise = (exerciseId: number) => {
    setSelectedExercises((prev) => prev.filter((id) => id !== exerciseId));
  };

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    dropIndex: number
  ) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);

    if (dragIndex === dropIndex) return;

    setSelectedExercises((prev) => {
      const newExercises = [...prev];
      const [draggedItem] = newExercises.splice(dragIndex, 1);
      newExercises.splice(dropIndex, 0, draggedItem);
      return newExercises;
    });
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

      {/* Exercise Selection - Dropdown */}
      <div className={styles.formGroup}>
        <div className={styles.labelWithButton}>
          <label htmlFor="exercise-select">Select Exercises</label>
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
          <Dropdown
            value={selectedExerciseToAdd}
            onChange={(exerciseId) => {
              addExercise(exerciseId);
              setSelectedExerciseToAdd(null);
            }}
            options={allExercises
              .filter((e) => !selectedExercises.includes(e.id))
              .map((exercise) => ({
                value: exercise.id,
                label: `${exercise.name}${
                  exercise.sets && exercise.reps
                    ? ` (${exercise.sets}x${exercise.reps}${
                        exercise.weight ? ` @ ${exercise.weight}kg` : ''
                      })`
                    : ''
                }`,
              }))}
            placeholder="-- Add an exercise --"
          />
        )}
      </div>

      {/* Selected Exercises List */}
      {selectedExercises.length > 0 && (
        <div className={styles.selectedSummary}>
          <strong className={styles.summaryTitle}>
            Selected Exercises ({selectedExercises.length})
          </strong>
          <div className={styles.selectedList}>
            {selectedExercises.map((id, index) => {
              const exercise = allExercises.find((e) => e.id === id);
              return exercise ? (
                <div
                  key={id}
                  className={styles.selectedListItem}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  <div className={styles.exerciseInfo}>
                    <span className={styles.dragHandle} title="Drag to reorder">
                      ≡
                    </span>
                    <div className={styles.exerciseDetails}>
                      <span className={styles.exerciseTitle}>
                        {exercise.name}
                      </span>
                      {exercise.sets && exercise.reps && (
                        <span className={styles.exerciseMetaInfo}>
                          {'( '}
                          {exercise.sets}x{exercise.reps}
                          {exercise.weight && ` @ ${exercise.weight}kg`}
                          {' )'}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => removeExercise(id)}
                    title="Remove exercise"
                    disabled={submitting}
                  >
                    ✕
                  </button>
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
