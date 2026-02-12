import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExercises, useWorkouts } from '../../hooks/useDatabase';

export function HomePage() {
  const { workouts, loading: workoutsLoading } = useWorkouts();
  const { exercises, loading: exercisesLoading } = useExercises();
  const navigate = useNavigate();

  useEffect(() => {
    if (!workoutsLoading && !exercisesLoading) {
      if (exercises.length === 0 || workouts.length === 0) {
        navigate('/welcome');
      } else {
        navigate('/log');
      }
    }
  }, [workouts, exercises, workoutsLoading, exercisesLoading, navigate]);

  return null;
}

export default HomePage;
