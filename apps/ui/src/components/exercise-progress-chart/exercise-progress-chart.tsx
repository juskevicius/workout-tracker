import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { Exercise, ExerciseLog } from '../../types/types';
import styles from './exercise-progress-chart.module.css';

interface ExerciseProgressChartProps {
  exercise: Exercise;
  logs: ExerciseLog[];
}

export function ExerciseProgressChart({ exercise, logs }: ExerciseProgressChartProps) {
  // Prepare data for weight progress
  const weightData = logs
    .filter((log) => log.weightPerRep && log.weightPerRep.length > 0)
    .map((log) => {
      const avgWeight =
        log.weightPerRep!.reduce((a, b) => a + b, 0) / log.weightPerRep!.length;
      const maxWeight = Math.max(...log.weightPerRep!);
      return {
        date: new Date(log.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        avgWeight: Math.round(avgWeight * 10) / 10,
        maxWeight,
        fullDate: log.date,
      };
    });

  // Prepare data for reps progress
  const repsData = logs.map((log) => {
    const totalReps =
      log.repsCompletedPerSet?.reduce((a, b) => a + b, 0) || 0;
    const avgReps = log.repsCompletedPerSet
      ? Math.round((totalReps / log.repsCompletedPerSet.length) * 10) / 10
      : 0;
    return {
      date: new Date(log.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      totalReps,
      avgReps,
      effort: log.effort || 0,
      fullDate: log.date,
    };
  });

  const hasWeightData = weightData.length > 0;

  // Calculate Y axis domain for weight chart with 30% margin
  const weightYAxisDomain = hasWeightData
    ? (() => {
        const allWeights = [
          ...weightData.map((d) => d.avgWeight),
          ...weightData.map((d) => d.maxWeight),
        ];
        const minWeight = Math.min(...allWeights);
        const maxWeight = Math.max(...allWeights);
        const range = maxWeight - minWeight;
        const margin = range * 0.3; // 30% margin
        return [
          Math.max(0, Math.floor((minWeight - margin) * 10) / 10),
          Math.ceil((maxWeight + margin) * 10) / 10,
        ];
      })()
    : [0, 100];

  return (
    <div className={styles.container}>
      <div className={styles.exerciseInfo}>
        <h3 className={styles.exerciseName}>{exercise.name}</h3>
        <p className={styles.stats}>
          {exercise.sets} set{exercise.sets !== 1 ? 's' : ''} ×{' '}
          {exercise.reps} rep{exercise.reps !== 1 ? 's' : ''}
          {exercise.weight && ` @ ${exercise.weight}kg`}
        </p>
      </div>

      {hasWeightData && (
        <div className={styles.chartSection}>
          <h4 className={styles.chartTitle}>Weight Progress</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <YAxis stroke="#666" domain={weightYAxisDomain} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="avgWeight"
                stroke="#55a8a3"
                strokeWidth={2}
                dot={{ fill: '#2E5E5A', r: 4 }}
                activeDot={{ r: 6 }}
                name="Avg Weight (kg)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className={styles.chartSection}>
        <h4 className={styles.chartTitle}>Reps Progress</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={repsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              stroke="#666"
            />
            <YAxis stroke="#666" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#f5f5f5',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            />
            <Legend />
            <Bar dataKey="totalReps" fill="#55a8a3" name="Total Reps" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {repsData.length > 0 && (
        <div className={styles.chartSection}>
          <h4 className={styles.chartTitle}>Effort Level</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={repsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <YAxis domain={[0, 10]} stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="effort"
                stroke="#55a8a3"
                strokeWidth={2}
                dot={{ fill: '#2E5E5A', r: 4 }}
                activeDot={{ r: 6 }}
                name="Effort (1-10)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className={styles.summarySection}>
        <h4 className={styles.summaryTitle}>Summary</h4>
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Total Workouts</span>
            <span className={styles.summaryValue}>{logs.length}</span>
          </div>
          {hasWeightData && (
            <>
              <div className={styles.summaryCard}>
                <span className={styles.summaryLabel}>Avg Weight</span>
                <span className={styles.summaryValue}>
                  {(
                    weightData.reduce((sum, d) => sum + d.avgWeight, 0) /
                    weightData.length
                  ).toFixed(1)}
                  kg
                </span>
              </div>
              <div className={styles.summaryCard}>
                <span className={styles.summaryLabel}>Max Weight</span>
                <span className={styles.summaryValue}>
                  {Math.max(...weightData.map((d) => d.maxWeight))}kg
                </span>
              </div>
            </>
          )}
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Avg Reps</span>
            <span className={styles.summaryValue}>
              {(
                repsData.reduce((sum, d) => sum + d.avgReps, 0) /
                repsData.length
              ).toFixed(1)}
            </span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Avg Effort</span>
            <span className={styles.summaryValue}>
              {(
                repsData.reduce((sum, d) => sum + d.effort, 0) /
                repsData.length
              ).toFixed(1)}
              /10
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
