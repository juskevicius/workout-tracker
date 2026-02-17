import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExercises } from '../../hooks/useDatabase';
import { ExerciseForm } from '../../components/exercise-form/exercise-form';
import { ExerciseList } from '../../components/exercise-list/exercise-list';
import { ConfirmationModal } from '../../components/confirmation-modal/confirmation-modal';
import type { Exercise } from '../../types/types';
import styles from './exercise-page.module.css';

export function ExercisesPage() {
  const {
    exercises,
    loading,
    error,
    addExercise,
    updateExercise,
    deleteExercise,
  } = useExercises();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    id: number | null;
  }>({
    isOpen: false,
    id: null,
  });

  const filteredExercises = exercises.filter((exercise) =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddExercise = async (exerciseData: Omit<Exercise, 'id'>) => {
    await addExercise(exerciseData);
    setShowForm(false);
  };

  const handleEditExercise = async (id: number, updates: Partial<Exercise>) => {
    await updateExercise(id, updates);
    setEditingId(null);
  };

  const handleDeleteExercise = async (id: number) => {
    setDeleteConfirmation({ isOpen: true, id });
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmation.id) {
      await deleteExercise(deleteConfirmation.id);
      setDeleteConfirmation({ isOpen: false, id: null });
    }
  };

  const handleViewAnalytics = (id: number) => {
    navigate(`/exercises/${id}/analytics`);
  };

  if (loading) {
    return <div className={styles.loadingContainer}>Loading exercises...</div>;
  }

  return (
    <div className={styles.container}>
      {error && <div className={styles.error}>Error: {error.message}</div>}

      {/* Header Section */}
      <div className={styles.header}>
        <h2>
          <span className="material-symbols-outlined">exercise</span>Exercises
        </h2>
        <button
          className={styles.addButton}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Add Exercise'}
        </button>
      </div>

      {/* Form Section */}
      {showForm && (
        <div className={styles.formSection}>
          <ExerciseForm
            onSubmit={handleAddExercise}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Search Section */}
      {exercises.length > 0 && (
        <div className={styles.searchSection}>
          <input
            type="text"
            placeholder="Search exercises..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {/* Exercise List Section */}
      {filteredExercises.length > 0 ? (
        <ExerciseList
          exercises={filteredExercises}
          editingId={editingId}
          onEdit={(id, updates) => handleEditExercise(id, updates)}
          onDelete={handleDeleteExercise}
          onEditingChange={setEditingId}
          onViewAnalytics={handleViewAnalytics}
        />
      ) : (
        <div className={styles.emptyState}>
          <p>{searchQuery ? 'No exercises found.' : 'No exercises yet.'}</p>
          <p>Create your first exercise to get started!</p>
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        title="Delete Exercise"
        message="Are you sure you want to delete this exercise? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmation({ isOpen: false, id: null })}
      />
    </div>
  );
}

export default ExercisesPage;
