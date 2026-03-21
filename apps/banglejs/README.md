# Bangle.js Workout Timer

A Bangle.js smartwatch app that receives workout data from the workout-tracker PWA
via Gadgetbridge notifications and runs an independent interval timer on the watch.

## How it works

1. In the workout-tracker PWA, open a workout session and tap the watch sync button.
2. The PWA sends a notification titled `BangleWorkoutSync` with a JSON payload.
3. Gadgetbridge forwards the notification to the Bangle.js watch.
4. **In the background**, the `boot.js` script catches this notification, silently saves it to the watch's internal flash storage (`wrktmr.json`), and prevents it from buzzing the screen constraints.
5. When you open the **Workout Timer** app, it reads from storage and automatically launches the previously synced workout.

## Controls

- **Tap** the screen to play / pause the timer.
- **Swipe left** to skip forward to the next rep or phase.
- **Swipe right** to go back to the previous rep or phase.
- When an exercise completes, a summary screen appears with a prompt to continue.
- Exercises without a timer show a "Mark Done" button (tap to continue).

## Installation

You need to install two files to your watch using the Espruino Web IDE (Storage -> New File):

**1. The Background Sync Script (Boot File):**
- Name: `wrktmr.boot.js`
- Contents: Paste the code from `apps/banglejs/boot.js`

**2. The Main App (App File):**
- Name: `wrktmr.app.js`
- Contents: Paste the code from `apps/banglejs/app.js`

**3. Register the App & Boot Script:**
After uploading both files, paste this into the left-hand REPL console in the Espruino Web IDE:
```javascript
// Register the boot file
require("Storage").write("wrktmr.info", {
  "id": "wrktmr",
  "name": "Workout Timer",
  "src": "wrktmr.app.js",
  "icon": "wrktmr.img"
});
```

*Note: Since Bangle.js automatically loads `.boot.js` files at system boot, you'll need to reboot the watch or run `load()` from the IDE console first so the system hooks into `wrktmr.boot.js`.*
