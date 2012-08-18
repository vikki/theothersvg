/*global mat4: true */

var vixgl = vixgl || {};

vixgl.Camera = function() {
   "use strict";

   this.pitch = 0;
   this.pitchRate = 0;
   this.yaw = 0;
   this.yawRate = 0;
   
   this.xPos = 0;
   this.yPos = 0.4;
   this.zPos = 0;
   
   this.speed = 0;
};

vixgl.camera = vixgl.camera || new vixgl.Camera();

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

// TODO
// could potentially do this more elegantly with a mapping of deltas....
// so you'd have an object or maybe assoc 2d array like : 
// [key : [pitchRateDelta, yawRateDelta, speedDelta]] 
// and maybe you can iterate over the array 
// get a delta
// and apply it to the pitchRate, yawRate, and speed
// or something
// ORRRR could move the keys stuff into util, or else make it even simpler
vixgl.camera.handleKeys = function () {
   "use strict";

   // pitch is up/down
   if (vixgl.util.anyPressed([KEYS.ONE])) {
      this.pitchRate = 0.001;
   } else if (vixgl.util.anyPressed([KEYS.TWO])) {
      this.pitchRate = -0.001;
   } else {
      this.pitchRate = 0;
   }

   // yaw is left/right
   if (vixgl.util.anyPressed([KEYS.LEFT, KEYS.A])) {
      this.yawRate = 0.001;
   } else if (vixgl.util.anyPressed([KEYS.RIGHT, KEYS.D])) {
      this.yawRate = -0.001;
   } else {
      this.yawRate = 0;
   }

   // speed is up/down
   if (vixgl.util.anyPressed([KEYS.UP, KEYS.W])) {
      this.speed = 0.003;
   } else if (vixgl.util.anyPressed([KEYS.DOWN, KEYS.S])) {
      this.speed = -0.003;
   } else {
      this.speed = 0;
   }
};

vixgl.camera.updateViewingAngle = function (elapsed) {
   "use strict";


   var joggingAngle = 0.0005;
   if (this.speed !== 0) {
      this.xPos -= Math.sin(this.yaw) * this.speed * elapsed;
      this.zPos -= Math.cos(this.yaw) * this.speed * elapsed;

      joggingAngle += elapsed * 0.6; // 0.6 "fiddle factor" -- makes it feel more realistic :-)
   }
   this.yaw   += this.yawRate * elapsed;
   this.pitch += this.pitchRate * elapsed;
};

vixgl.camera.updateSceneForCamera = function(ctx) {
   "use strict";

   mat4.rotate(ctx.mvMatrix, - this.pitch, [1, 0, 0]);
   mat4.rotate(ctx.mvMatrix, - this.yaw, [0, 1, 0]);
   mat4.translate(ctx.mvMatrix, [-this.xPos, -this.yPos, -this.zPos]);
};
