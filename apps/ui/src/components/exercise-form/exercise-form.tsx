import { useState } from 'react';
import type { Exercise } from '../../types/types';
import styles from './exercise-form.module.css';

interface ExerciseFormProps {
  initialData?: Exercise;
  onSubmit: (data: Omit<Exercise, 'id'>) => Promise<void>;
  onCancel: () => void;
}

export function ExerciseForm({
  initialData,
  onSubmit,
  onCancel,
}: ExerciseFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(
    initialData?.description || ''
  );
  const [sets, setSets] = useState(initialData?.sets || 3);
  const [reps, setReps] = useState(initialData?.reps || 10);
  const [repNames, setRepNames] = useState<string>(
    initialData?.repNames?.join('\n') || ''
  );
  const [weight, setWeight] = useState(initialData?.weight || 0);
  const [repDurationSeconds, setRepDurationSeconds] = useState(
    initialData?.repDurationSeconds || 0
  );
  const [setRestPeriodSeconds, setSetRestPeriodSeconds] = useState(
    initialData?.setRestPeriodSeconds || 0
  );
  const [repRestPeriodSeconds, setRepRestPeriodSeconds] = useState(
    initialData?.repRestPeriodSeconds || 0
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [advancedExpanded, setAdvancedExpanded] = useState(false);

  const parseRepNames = (input: string): string[] => {
    if (!input.trim()) {
      return [];
    }
    return input
      .split('\n')
      .map((name) => name.trim())
      .filter((name) => name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Exercise name is required');
      return;
    }

    try {
      setSubmitting(true);
      const finalRepNames = parseRepNames(repNames);

      const finalData: Omit<Exercise, 'id'> = {
        name: name.trim(),
        ...(description.trim() && { description: description.trim() }),
        sets,
        reps,
        ...(weight > 0 && { weight }),
        ...(repDurationSeconds > 0 && { repDurationSeconds }),
        ...(setRestPeriodSeconds >= 0 && { setRestPeriodSeconds }),
        ...(repRestPeriodSeconds >= 0 && { repRestPeriodSeconds }),
        ...(finalRepNames.length > 0 && { repNames: finalRepNames }),
      };

      await onSubmit(finalData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save exercise');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.formGrid}>
        {/* Exercise Name */}
        <div className={styles.formGroup}>
          <label htmlFor="name">Exercise Name</label>
          <input
            id="name"
            type="text"
            placeholder="e.g., Push-ups, Squats"
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
            placeholder="Optional notes about this exercise"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            disabled={submitting}
          />
        </div>

        {/* Sets */}
        <div className={styles.formGroup}>
          <label htmlFor="sets">Sets</label>
          <input
            id="sets"
            type="number"
            min="1"
            max="10"
            value={sets}
            onChange={(e) => setSets(parseInt(e.target.value))}
            disabled={submitting}
          />
        </div>

        {/* Reps */}
        <div className={styles.formGroup}>
          <label htmlFor="reps">Reps</label>
          <input
            id="reps"
            type="number"
            min="1"
            max="100"
            value={reps}
            onChange={(e) => setReps(parseInt(e.target.value))}
            disabled={submitting}
          />
        </div>

        {/* Weight */}
        <div className={styles.formGroup}>
          <label htmlFor="weight">Weight, kg (optional)</label>
          <input
            id="weight"
            type="number"
            min="0"
            max="200"
            step="0.01"
            value={weight}
            onChange={(e) => setWeight(parseFloat(e.target.value))}
            placeholder="Optional"
            disabled={submitting}
          />
        </div>
      </div>

      {/* Advanced Section */}
      <div className={styles.advancedSection}>
        <button
          type="button"
          className={styles.advancedToggle}
          onClick={() => setAdvancedExpanded(!advancedExpanded)}
          disabled={submitting}
        >
          <span className={styles.toggleIcon}>
            {advancedExpanded ? '▼' : '▶'}
          </span>
          Advanced Options
        </button>

        {advancedExpanded && (
          <div className={styles.advancedContent}>
            <div className={styles.formGrid}>
              {/* Rep Names */}
              <div className={`${styles.formGroup} ${styles.repNamesGroup}`}>
                <label htmlFor="repNames">
                  Rep Names (optional){' '}
                  <span className={styles.hint}>one per line</span>
                </label>
                <textarea
                  id="repNames"
                  placeholder={`e.g.:\nWarm-up\nMain Set\nFinisher`}
                  value={repNames}
                  onChange={(e) => setRepNames(e.target.value)}
                  rows={4}
                  disabled={submitting}
                  className={styles.repNamesTextarea}
                />
                <div className={styles.hint}>
                  Leave empty to auto-generate (Rep 1, Rep 2, ...). Enter one
                  name per line.
                </div>
              </div>

              {/* Rep Duration */}
              <div className={styles.formGroup}>
                <label htmlFor="repDuration">
                  Rep Duration in Seconds (optional)
                </label>
                <input
                  id="repDuration"
                  type="number"
                  min="0"
                  max="600"
                  value={repDurationSeconds}
                  onChange={(e) =>
                    setRepDurationSeconds(parseInt(e.target.value))
                  }
                  placeholder="0 = no limit"
                  disabled={submitting}
                />
              </div>

              {/* Rest Between Reps */}
              <div className={styles.formGroup}>
                <label htmlFor="repRest">
                  Rest Between Reps in Seconds (optional)
                </label>
                <input
                  id="repRest"
                  type="number"
                  min="0"
                  max="600"
                  value={repRestPeriodSeconds}
                  onChange={(e) =>
                    setRepRestPeriodSeconds(parseInt(e.target.value))
                  }
                  placeholder="0 = no rest"
                  disabled={submitting}
                />
              </div>

              {/* Rest Between Sets */}
              <div className={styles.formGroup}>
                <label htmlFor="setRest">
                  Rest Between Sets in Seconds (optional)
                </label>
                <input
                  id="setRest"
                  type="number"
                  min="0"
                  max="600"
                  value={setRestPeriodSeconds}
                  onChange={(e) =>
                    setSetRestPeriodSeconds(parseInt(e.target.value))
                  }
                  placeholder="0 = no rest"
                  disabled={submitting}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className={styles.buttonGroup}>
        <button
          type="submit"
          className={styles.submitButton}
          disabled={submitting}
        >
          {submitting ? 'Saving...' : 'Save Exercise'}
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
