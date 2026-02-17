import { useState } from 'react';
import type { Exercise } from '../../types/types';
import { ExerciseForm } from '../exercise-form/exercise-form';
import styles from './exercise-list.module.css';

interface ExerciseListProps {
  exercises: Exercise[];
  editingId: number | null;
  onEdit: (id: number, updates: Partial<Exercise>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onEditingChange: (id: number | null) => void;
  onViewAnalytics: (id: number) => void;
}

export function ExerciseList({
  exercises,
  editingId,
  onEdit,
  onDelete,
  onEditingChange,
  onViewAnalytics,
}: ExerciseListProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpanded = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleEditSubmit = async (
    id: number,
    formData: Omit<Exercise, 'id'>
  ) => {
    await onEdit(id, formData);
  };

  return (
    <div className={styles.list}>
      {exercises.map((exercise) => (
        <div key={exercise.id} className={styles.listItem}>
          {editingId === exercise.id ? (
            <div className={styles.editMode}>
              <ExerciseForm
                initialData={exercise}
                onSubmit={(data) => handleEditSubmit(exercise.id, data)}
                onCancel={() => onEditingChange(null)}
              />
            </div>
          ) : (
            <>
              {/* Exercise Card Header */}
              <div
                className={styles.cardHeader}
                onClick={() => toggleExpanded(exercise.id)}
              >
                <div className={styles.titleSection}>
                  <h3>{exercise.name}</h3>
                  {exercise.description && (
                    <p className={styles.description}>{exercise.description}</p>
                  )}
                  {expandedId !== exercise.id && (
                    <div className={styles.metrics}>
                      <span className={styles.badge}>{exercise.sets}x</span>
                      <span className={styles.badge}>{exercise.reps}r</span>
                      {exercise.weight ? (
                        <span className={styles.badge}>
                          {exercise.weight}kg
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>
                <div
                  className={styles.analyticsBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewAnalytics(exercise.id);
                  }}
                  role="button"
                  tabIndex={0}
                  title="View analytics"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onViewAnalytics(exercise.id);
                    }
                  }}
                >
                  <span className="material-symbols-outlined">bar_chart</span>
                </div>
                <button
                  className={styles.expandButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpanded(exercise.id);
                  }}
                  aria-label="Toggle details"
                >
                  {expandedId === exercise.id ? '▼' : '▶'}
                </button>
              </div>

              {/* Exercise Card Details */}
              {expandedId === exercise.id && (
                <div className={styles.cardDetails}>
                  <div className={styles.detailsGrid}>
                    <div className={styles.detailItem}>
                      <span className={styles.label}>Sets:</span>
                      <span className={styles.value}>{exercise.sets}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.label}>Reps:</span>
                      <span className={styles.value}>{exercise.reps}</span>
                    </div>
                    {exercise.weight ? (
                      <div className={styles.detailItem}>
                        <span className={styles.label}>Weight:</span>
                        <span className={styles.value}>
                          {exercise.weight} kg
                        </span>
                      </div>
                    ) : null}
                    {exercise.repDurationSeconds ? (
                      <div className={styles.detailItem}>
                        <span className={styles.label}>Rep Duration:</span>
                        <span className={styles.value}>
                          {exercise.repDurationSeconds}s
                        </span>
                      </div>
                    ) : null}
                    {exercise.repRestPeriodSeconds ? (
                      <div className={styles.detailItem}>
                        <span className={styles.label}>
                          Rest (Between Reps):
                        </span>
                        <span className={styles.value}>
                          {exercise.repRestPeriodSeconds}s
                        </span>
                      </div>
                    ) : null}
                    {exercise.setRestPeriodSeconds ? (
                      <div className={styles.detailItem}>
                        <span className={styles.label}>
                          Rest (Between Sets):
                        </span>
                        <span className={styles.value}>
                          {exercise.setRestPeriodSeconds}s
                        </span>
                      </div>
                    ) : null}
                  </div>

                  {/* Action Buttons */}
                  <div className={styles.actions}>
                    <button
                      className={styles.editButton}
                      onClick={() => onEditingChange(exercise.id)}
                    >
                      Edit
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => onDelete(exercise.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
