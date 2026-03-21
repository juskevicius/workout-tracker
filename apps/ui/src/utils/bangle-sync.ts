import type { Workout, Exercise } from '../types/types';

export const syncWorkoutToBangle = async (
  workout: Workout,
  exercises: Exercise[]
): Promise<void> => {
  try {
    const workoutData = {
      name: workout.name,
      exercises: exercises.map((exercise) => ({
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        workTimer: exercise.repDurationSeconds || 0,
        restRepTimer: exercise.repRestPeriodSeconds || 0,
        restSetTimer: exercise.setRestPeriodSeconds || 0,
      })),
    };

    if ('Notification' in window) {
      if (Notification.permission !== 'granted') {
        await Notification.requestPermission();
      }

      if (Notification.permission === 'granted') {
        // Use Service Worker if available for reliable background notification delivery
        if ('serviceWorker' in navigator && !!navigator.serviceWorker.controller) {
          const registration = await navigator.serviceWorker.ready;
          await registration.showNotification('BangleWorkoutSync', {
            body: JSON.stringify(workoutData),
            tag: 'workout-sync',
            silent: true, // Try not to vibrate the phone itself
          });

          // Clean up the notification quickly so it doesn't linger on the phone
          setTimeout(() => {
            registration.getNotifications({ tag: 'workout-sync' }).then((notifications) => {
              notifications.forEach((n) => n.close());
            });
          }, 1000);
        } else {
          // Fallback if service worker isn't controlling the page
          const notification = new Notification('BangleWorkoutSync', {
            body: JSON.stringify(workoutData),
            tag: 'workout-sync',
            silent: true,
          });
          setTimeout(() => notification.close(), 1000);
        }
      }
    } else {
      alert('Notifications API not supported in this browser.');
    }
  } catch (e) {
    console.error('Failed to sync to watch', e);
  }
};
