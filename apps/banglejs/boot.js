/**
 * Workout Timer boot listener (wrktmr.boot.js)
 * 
 * Silently listens for workout sync payloads from Gadgetbridge in the background.
 * Writes them to storage so the Workout Timer can read them upon launch without
 * needing to be actively open during the sync.
 */
(function() {
  var _GB = global.GB;
  global.GB = function(msg) {
    // Intercept our specific notification
    if (msg.t === 'notify' && msg.title === 'BangleWorkoutSync') {
      try {
        var workout = JSON.parse(msg.body);
        require("Storage").writeJSON("wrktmr.json", workout);
        Bangle.buzz(100); 
      } catch (e) {
        // Ignore malformed payloads
      }
      return; // Stop the watch from showing it as a generic text notification
    }
    
    // Pass everything else up the chain
    if (_GB) setTimeout(_GB, 0, msg);
  };
})();
