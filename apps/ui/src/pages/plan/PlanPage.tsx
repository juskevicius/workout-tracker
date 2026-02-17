import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkouts, useExercises } from '../../hooks/useDatabase';
import { WorkoutForm } from '../../components/workout-form/workout-form';
import { WorkoutList } from '../../components/workout-list/workout-list';
import { ConfirmationModal } from '../../components/confirmation-modal/confirmation-modal';
import type { Workout } from '../../types/types';
import styles from './plan-page.module.css';

export function PlanPage() {
  const navigate = useNavigate();
  const {
    workouts,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    loading: workoutsLoading,
  } = useWorkouts();
  const { exercises, loading: exercisesLoading } = useExercises();
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

  const filteredWorkouts = workouts.filter((workout) =>
    workout.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddWorkout = async (data: Omit<Workout, 'id'>) => {
    await addWorkout(data);
    setShowForm(false);
  };

  const handleUpdateWorkout = async (id: number, data: Omit<Workout, 'id'>) => {
    await updateWorkout(id, data);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEditWorkout = (workout: Workout) => {
    setEditingId(workout.id);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setShowForm(false);
  };

  const handleDeleteWorkout = async (id: number) => {
    setDeleteConfirmation({ isOpen: true, id });
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmation.id) {
      await deleteWorkout(deleteConfirmation.id);
      setDeleteConfirmation({ isOpen: false, id: null });
    }
  };

  const handleViewSchedule = () => {
    navigate('/schedule');
  };

  const editingWorkout = editingId
    ? workouts.find((w) => w.id === editingId)
    : undefined;

  if (workoutsLoading || exercisesLoading) {
    return <div className={styles.loadingContainer}>Loading workouts...</div>;
  }

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.header}>
        <h2>
          <span className="material-symbols-outlined">calendar_month</span>{' '}
          Workout Plan
        </h2>
        <button
          className={styles.addButton}
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
          }}
        >
          {showForm ? 'Cancel' : '+ Add Workout'}
        </button>
      </div>

      {/* Form Section */}
      {showForm && (
        <div className={styles.formSection}>
          <h3>{editingWorkout ? 'Edit Workout' : 'Create New Workout'}</h3>
          <WorkoutForm
            initialData={editingWorkout}
            allExercises={exercises}
            onSubmit={
              editingWorkout
                ? (data) => handleUpdateWorkout(editingWorkout.id, data)
                : handleAddWorkout
            }
            onCancel={handleCancelEdit}
          />
        </div>
      )}

      {/* Search Section */}
      {workouts.length > 0 && (
        <div className={styles.searchSection}>
          <input
            type="text"
            placeholder="Search workouts..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {/* Workouts List Section */}
      {filteredWorkouts.length > 0 ? (
        <WorkoutList
          workouts={filteredWorkouts}
          exercises={exercises}
          onEdit={handleEditWorkout}
          onDelete={handleDeleteWorkout}
          onViewSchedule={handleViewSchedule}
        />
      ) : (
        <div className={styles.emptyState}>
          <p>{searchQuery ? 'No workouts found.' : 'No workouts yet.'}</p>
          <p>Create your first workout to get started!</p>
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        title="Delete Workout"
        message="Are you sure you want to delete this workout? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmation({ isOpen: false, id: null })}
      />
    </div>
  );
}
