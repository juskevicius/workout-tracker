import { useNavigate, useParams } from 'react-router-dom';
import { useExercises } from '../../hooks/useDatabase';
import { IntervalTimer } from '../../components/interval-timer/interval-timer';
import { LoadingSpinner } from '../../components/loading-spinner/loading-spinner';

export function TimerPage() {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const navigate = useNavigate();
  const { exercises, loading } = useExercises();

  const exercise = exercises.find((e) => e.id === Number(exerciseId));

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!exercise) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>Exercise not found</h2>
        <button onClick={() => navigate('/')}>Back to Home</button>
      </div>
    );
  }

  return <IntervalTimer exercise={exercise} onBack={() => navigate(-1)} />;
}
