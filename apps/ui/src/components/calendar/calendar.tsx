import { useState } from 'react';
import type { WorkoutLog } from '../../types/types';
import styles from './calendar.module.css';

interface CalendarProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  workoutLogs: WorkoutLog[];
}

export function Calendar({
  selectedDate,
  onSelectDate,
  workoutLogs,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date(selectedDate));

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    // Convert Sunday (0) to 6, shift all days by 1 to start week on Monday
    return (day - 1 + 7) % 7;
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const getDateString = (day: number) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const dayStr = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  const isSelected = (day: number) => {
    return getDateString(day) === selectedDate;
  };

  const hasWorkout = (day: number) => {
    const dateStr = getDateString(day);
    return workoutLogs.some((log) => log.date === dateStr);
  };

  const getWorkoutsForDay = (day: number) => {
    const dateStr = getDateString(day);
    return workoutLogs.filter((log) => log.date === dateStr);
  };

  const getWorkoutColor = (workoutId: number) => {
    if (!workoutId) {
      return '#22c55e'; // Default color
    }

    const COMMON_COLORS = [
      '#FF0000', // Red
      '#00FF00', // Green
      '#0000FF', // Blue
      '#FF00FF', // Magenta
      '#00FFFF', // Cyan
      '#FFC0CB', // Pink
      '#000000', // Black
      '#808080', // Gray
      '#FF4500', // Orange Red
      '#4B0082', // Indigo
      '#FFFF00', // Yellow
      '#800000', // Maroon
      '#008000', // Dark Green
      '#808000', // Olive
      '#FFA500', // Orange
      '#008080', // Teal
      '#800080', // Purple
    ];

    return COMMON_COLORS[workoutId % COMMON_COLORS.length];
  };

  const isToday = (day: number) => {
    const today = new Date().toISOString().split('T')[0];
    return getDateString(day) === today;
  };

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <button className={styles.navButton} onClick={handlePrevMonth}>
          ◀
        </button>
        <h3 className={styles.monthYear}>
          {monthName} {year}
        </h3>
        <button className={styles.navButton} onClick={handleNextMonth}>
          ▶
        </button>
      </div>

      <div className={styles.weekDays}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div key={day} className={styles.weekDay}>
            {day}
          </div>
        ))}
      </div>

      <div className={styles.days}>
        {emptyDays.map((_, i) => (
          <div key={`empty-${i}`} className={styles.emptyDay} />
        ))}
        {daysArray.map((day) => (
          <button
            key={day}
            className={`${styles.day} ${
              isSelected(day) ? styles.selected : ''
            } ${hasWorkout(day) ? styles.hasWorkout : ''} ${
              isToday(day) ? styles.today : ''
            }`}
            onClick={() => onSelectDate(getDateString(day))}
          >
            <span className={styles.dayNumber}>{day}</span>
            {hasWorkout(day) && (
              <div className={styles.workoutDotsContainer}>
                {getWorkoutsForDay(day).map((log) => (
                  <span
                    key={log.id}
                    className={styles.workoutDot}
                    style={{ backgroundColor: getWorkoutColor(log.workoutId) }}
                  />
                ))}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
