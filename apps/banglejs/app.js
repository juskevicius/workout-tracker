/**
 * Workout Timer for Bangle.js  (wrktmr)
 *
 * Receives workout data from the workout-tracker PWA via a Gadgetbridge
 * notification (title: "BangleWorkoutSync") and runs an independent
 * interval timer on the watch.
 *
 * Controls:
 *   Tap          – play / pause  (or "mark done" for non-timed exercises)
 *   Swipe left   – skip forward  (next rep / phase)
 *   Swipe right  – skip backward (prev rep / phase)
 *   Button       – exit to launcher / clock
 *
 * Data format expected in notification body (JSON):
 * {
 *   "name": "My Workout",
 *   "exercises": [
 *     {
 *       "name": "Push-ups",
 *       "sets": 3,
 *       "reps": 10,
 *       "repNames": ["Right arm 10", "Left arm 12"],
 *       "workTimer": 45,       // seconds per rep (0 = no timer)
 *       "restRepTimer": 15,    // rest between reps
 *       "restSetTimer": 60     // rest between sets
 *     }, ...
 *   ]
 * }
 */

// ── state ────────────────────────────────────────────────────────────
var workout = null;       // full workout payload
var exIdx = 0;            // current exercise index
var setNum = 1;           // current set (1-based)
var repNum = 1;           // current rep (1-based)
var phase = 'work';       // 'work' | 'rest-rep' | 'rest-set'
var timeLeft = 0;         // seconds remaining in current phase
var running = false;      // is the countdown ticking?
var timerInterval = null; // setInterval id
var completed = false;    // entire workout finished?
var appState = 'idle';    // 'idle' | 'menu' | 'timer'

// ── helpers ──────────────────────────────────────────────────────────
function ex() { return workout.exercises[exIdx]; }

function hasTimer() { return ex().workTimer > 0; }

function fmt(s) {
  var m = Math.floor(s / 60);
  var sec = s % 60;
  return (m < 10 ? '0' : '') + m + ':' + (sec < 10 ? '0' : '') + sec;
}

function phaseLabel() {
  if (phase === 'work') {
    var e = ex();
    if (e.repNames && e.repNames.length > 0) {
      return e.repNames[(repNum - 1) % e.repNames.length];
    }
    return 'WORK';
  }
  if (phase === 'rest-rep') return 'REST';
  return 'REST (SET)';
}

function phaseDuration() {
  if (phase === 'work')     return ex().workTimer;
  if (phase === 'rest-rep') return ex().restRepTimer || 0;
  return ex().restSetTimer || 0;
}

// ── drawing ──────────────────────────────────────────────────────────
function draw() {
  g.clear();
  g.setFontAlign(0, 0); // centre / centre

  if (completed) {
    g.setFont('Vector', 22);
    g.drawString('WORKOUT', g.getWidth() / 2, g.getHeight() / 2 - 16);
    g.drawString('COMPLETE!', g.getWidth() / 2, g.getHeight() / 2 + 16);
    g.flip();
    return;
  }

  var e = ex();
  var cx = g.getWidth() / 2;
  var cy = g.getHeight() / 2;

  // ── exercise name (top) ────────────────────────────────────────
  g.setFont('Vector', 16);
  var nameStr = e.name.length > 16 ? e.name.substring(0, 15) + '…' : e.name;
  g.drawString(nameStr, cx, 18);

  if (!hasTimer()) {
    // no-timer exercise → show "Mark Done" prompt
    g.setFont('Vector', 20);
    g.drawString('No timer', cx, cy - 16);
    g.setFont('Vector', 16);
    g.drawString('Tap to mark done', cx, cy + 16);
    g.flip();
    return;
  }

  // ── big time ───────────────────────────────────────────────────
  g.setFont('Vector', 42);
  g.drawString(fmt(timeLeft), cx, cy - 12);

  // ── phase label ────────────────────────────────────────────────
  g.setFont('Vector', 16);
  g.drawString(phaseLabel(), cx, cy + 22);

  // ── progress line ──────────────────────────────────────────────
  g.setFont('Vector', 14);
  var prog = 'S' + setNum + '/' + e.sets + '  R' + repNum + '/' + e.reps;
  g.drawString(prog, cx, cy + 42);

  // ── play / pause indicator (bottom) ────────────────────────────
  g.setFont('Vector', 14);
  g.drawString(running ? '|| PAUSE' : '> PLAY', cx, g.getHeight() - 14);

  g.flip();
}

// ── timer tick ───────────────────────────────────────────────────────
function tick() {
  if (appState !== 'timer' || !running) return;
  timeLeft--;

  if (timeLeft <= 0) {
    Bangle.buzz(100);
    advance();
  }
  draw();
}

// ── advance to next phase / rep / set / exercise ─────────────────────
function advance() {
  var e = ex();

  if (phase === 'work') {
    if (repNum < e.reps) {
      phase = 'rest-rep';
      timeLeft = e.restRepTimer || 0;
      if (timeLeft <= 0) { repNum++; phase = 'work'; timeLeft = e.workTimer; }
    } else if (setNum < e.sets) {
      phase = 'rest-set';
      timeLeft = e.restSetTimer || 0;
      if (timeLeft <= 0) { setNum++; repNum = 1; phase = 'work'; timeLeft = e.workTimer; }
    } else {
      // exercise finished → move to next
      nextExercise();
      return;
    }
  } else if (phase === 'rest-rep') {
    repNum++;
    phase = 'work';
    timeLeft = ex().workTimer;
  } else if (phase === 'rest-set') {
    setNum++;
    repNum = 1;
    phase = 'work';
    timeLeft = ex().workTimer;
  }
}

// ── go back one phase ───────────────────────────────────────────────
function goBack() {
  var e = ex();

  if (phase === 'rest-rep') {
    phase = 'work';
    timeLeft = e.workTimer;
  } else if (phase === 'rest-set') {
    phase = 'work';
    timeLeft = e.workTimer;
  } else if (phase === 'work') {
    if (repNum > 1) {
      repNum--;
      phase = 'rest-rep';
      timeLeft = e.restRepTimer || 0;
      if (timeLeft <= 0) { phase = 'work'; timeLeft = e.workTimer; }
    } else if (setNum > 1) {
      setNum--;
      repNum = e.reps;
      phase = 'rest-set';
      timeLeft = e.restSetTimer || 0;
      if (timeLeft <= 0) { phase = 'work'; timeLeft = e.workTimer; }
    }
  }
  running = false;
  draw();
}

// ── next exercise ────────────────────────────────────────────────────
function nextExercise() {
  running = false;
  exIdx++;
  if (exIdx >= workout.exercises.length) {
    completed = true;
    Bangle.buzz(300);
    draw();
    return;
  }
  setNum = 1;
  repNum = 1;
  phase = 'work';
  timeLeft = hasTimer() ? ex().workTimer : 0;
  Bangle.buzz(200);
  draw();
}

// ── input handling ───────────────────────────────────────────────────
function onTap() {
  if (completed) {
    // restart from menu
    showExerciseMenu();
    return;
  }
  if (!hasTimer()) {
    // no-timer exercise → mark done, go to next
    nextExercise();
    return;
  }
  running = !running;
  draw();
}

function onSwipe(dir) {
  if (completed) return;
  if (!hasTimer()) return;
  if (dir === -1) {
    // swipe left → skip forward
    running = false;
    advance();
    draw();
  } else if (dir === 1) {
    // swipe right → skip backward
    goBack();
  }
}

// ── menu switching ───────────────────────────────────────────────────
function showExerciseMenu() {
  appState = 'menu';
  running = false;
  
  var menu = {
    "": { 
      title: "Exercises",
      back: function() {
        cleanup();
        Bangle.showLauncher();
      }
    }
  };
  
  workout.exercises.forEach(function(ex, i) {
    // Truncate name if it's too long
    var name = ex.name.length > 15 ? ex.name.substring(0, 14) + '…' : ex.name;
    menu[name] = function() {
      exIdx = i;
      setNum = 1;
      repNum = 1;
      phase = 'work';
      completed = false;
      running = false;
      timeLeft = hasTimer() ? ex.workTimer : 0;
      startTimerUI();
    };
  });
  
  menu["< Exit"] = function() {
    cleanup();
    Bangle.showLauncher();
  };
  
  // Let Espruino handle the menu (removes prior setUI)
  E.showMenu(menu);
}

function startTimerUI() {
  appState = 'timer';
  // Clear the Espruino menu so we can do custom drawing
  E.showMenu();
  g.clear();
  
  Bangle.setUI({
    mode: 'custom',
    back: function() { showExerciseMenu(); },
    touch: function(btn, xy) { onTap(); },
    swipe: function(dir) { onSwipe(dir); }
  });
  
  draw();
}

// ── loading from storage ─────────────────────────────────────────────
function loadWorkout() {
  var data = require('Storage').readJSON('wrktmr.json', true);
  if (data && data.exercises && data.exercises.length > 0) {
    workout = data;
    Bangle.buzz(100);
    showExerciseMenu();
  } else {
    startIdleScreen();
  }
}

// ── Gadgetbridge notification listener ───────────────────────────────
function handleGB(msg) {
  // If we receive a sync notification while the app is actively open,
  // we wait 200ms to let the boot script save it, then immediately reload it.
  if (msg.t === 'notify' && msg.title === 'BangleWorkoutSync') {
    setTimeout(loadWorkout, 200);
  }
  // We ALWAYS pass the message up the chain so `wrktmr.boot.js` can intercept 
  // and save it, and then suppress the generic text notification.
  if (originalGB) originalGB(msg);
}

// ── cleanup (called by Bangle.setUI when user exits) ─────────────────
function cleanup() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
  // Restore original GB handler
  global.GB = originalGB;
  // Restore default LCD timeout
  Bangle.setLCDTimeout(10);
}

// ── idle screen (waiting for sync) ───────────────────────────────────
function startIdleScreen() {
  appState = 'idle';
  workout = null;
  completed = false;
  running = false;
  E.showMenu(); // clear menu if any
  g.clear();
  g.setFontAlign(0, 0);
  g.setFont('Vector', 18);
  g.drawString('Workout Timer', g.getWidth() / 2, g.getHeight() / 2 - 16);
  g.setFont('Vector', 14);
  g.drawString('Waiting for sync...', g.getWidth() / 2, g.getHeight() / 2 + 16);
  g.flip();

  Bangle.setUI({
    mode: 'custom',
    back: function() { cleanup(); Bangle.showLauncher(); }
  });
}

// ── boot ─────────────────────────────────────────────────────────────
var originalGB = global.GB;
global.GB = handleGB;

// Keep screen awake while the app is open
Bangle.setLCDTimeout(0);
Bangle.setLCDPower(1);

// Tick every second checking appState
timerInterval = setInterval(tick, 1000);

// Load previous workout on launch (or show idle screen if empty)
loadWorkout();
