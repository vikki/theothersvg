/*global mat4: true */

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

var vixgl = vixgl || {};

vixgl.camera = vixgl.camera || {
   pitch: 0,
   pitchRate: 0,
   yaw: 0,
   yawRate: 0,
   
   xPos: 0,
   yPos: 0.4,
   zPos: 0,
   
   speed: 0,

   updateViewingAngle : function (elapsed) {
      "use strict";
   
      if (this.speed !== 0) {
         this.xPos -= Math.sin(this.yaw) * this.speed * elapsed;
         this.zPos -= Math.cos(this.yaw) * this.speed * elapsed;
      }
      this.yaw   += this.yawRate * elapsed;
      this.pitch += this.pitchRate * elapsed;
   },

   updateSceneForCamera : function(mvMatrix) {
      "use strict";

      mat4.rotate(mvMatrix, -this.pitch, [1, 0, 0]);
      mat4.rotate(mvMatrix, -this.yaw, [0, 1, 0]);
      mat4.translate(mvMatrix, [-this.xPos, -this.yPos, -this.zPos]);
   },

   // TODO UGLY You Ain't Go No Alibi :'(
   // could potentially do this more elegantly with a mapping of deltas....
   // so you'd have an object or maybe assoc 2d array like : 
   // [key : [pitchRateDelta, yawRateDelta, speedDelta]] 
   // where key is like left arrow, or the char code for that or whatever
   // and maybe you can iterate over the array 
   // get a delta
   // and apply it to the pitchRate, yawRate, and speed
   // or something
   // ORRRR could move the keys stuff into util, or else make it even simpler
   // and its tested now so you break it as you see fit and find out quickly ;)
   handleKeys : function () {
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
   }
};
