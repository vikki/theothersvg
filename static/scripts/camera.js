// TODO rewrite this so there aren't so many fricking globals!!
var pitch = 0;
var pitchRate = 0;
var yaw = 0;
var yawRate = 0;

var xPos = 0;
var yPos = 0.4;
var zPos = 0;

var speed = 0;
var currentlyPressedKeys = {}; 

// map keys to understandable names to remove comments

var KEYS = {
   ONE: 49,
   TWO: 50,
   LEFT: 37,
   A: 65,
   RIGHT: 39,
   D: 68,
   UP: 38,
   W: 87,
   DOWN: 40,
   S: 83
};

// pitch is up/down
var handleKeys = function() {
  if (currentlyPressedKeys[KEYS.ONE]) {
    pitchRate = 0.001;
  } else if (currentlyPressedKeys[KEYS.TWO]) {
    pitchRate = -0.001;
  } else {
    pitchRate = 0;
  }

  // yaw is left/right
  if (currentlyPressedKeys[KEYS.LEFT] || currentlyPressedKeys[KEYS.A]) {
    yawRate = 0.001;
  } else if (currentlyPressedKeys[KEYS.RIGHT] || currentlyPressedKeys[KEYS.D]) {
    yawRate = -0.001;
  } else {
    yawRate = 0;
  }

  // speed is up/down
  if (currentlyPressedKeys[KEYS.UP] || currentlyPressedKeys[KEYS.W]) {
    speed = 0.003;
  } else if (currentlyPressedKeys[KEYS.DOWN] || currentlyPressedKeys[KEYS.S]) {
    speed = -0.003;
  } else {
    speed = 0;
  }
};

document.onkeydown = handleKeyDown;
document.onkeyup = handleKeyUp;

function handleKeyDown(event) {
   currentlyPressedKeys[event.keyCode] = 1;
}

function handleKeyUp(event) {
   currentlyPressedKeys[event.keyCode] = null;
}

    var updateViewingAngle = function(elapsed) {
       var joggingAngle = 0.0005;
       if (speed != 0) {
         xPos -= Math.sin(yaw) * speed * elapsed;
         zPos -= Math.cos(yaw) * speed * elapsed;

         joggingAngle += elapsed * 0.6;  // 0.6 "fiddle factor" -- makes it feel more realistic :-)
       }
       yaw += yawRate * elapsed;
       pitch += pitchRate * elapsed;
    };

