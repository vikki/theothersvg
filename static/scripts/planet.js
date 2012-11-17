// kinda feels like the GL stuff should be separate from the app stuff
// so maybe planet should inherit from circle??

var vixgl = vixgl || {};
// TODO add the i-forgot-new fix from stoyan, cos you're a dumbass and you will forget new :P

// can you mix in the props with mixins?
vixgl.Planet = vixgl.Planet || function(planetConfig) {
   this.startingAngle = planetConfig.startingAngle;
   this.distFromCentre = planetConfig.distFromCentre;
   this.origImageUrl = planetConfig.imageUrl;
   this.rotationAngleDuringWindow = planetConfig.rTri;
   this.rTri = planetConfig.rTri;
   this.origScale = planetConfig.scale;
   this.color = planetConfig.color;
   this.title = planetConfig.title;
   this.video = planetConfig.video;
   this.videoRef = planetConfig.videoRef;
   this.scale = planetConfig.scale;
   this.imageUrl = planetConfig.imageUrl;

   this.windowToRotate = 1000;
   this.selected = false;
   this.greyed = false;
   this.spinning = true;
   this.inCenter = false;
};

vixgl.Planet.prototype.getGreyingFactor = function () {
   return this.greyed ? [0.3, 0.3, 0.3] : [1.0, 1.0, 1.0];
};

vixgl.Planet.prototype.draw = function (ctx) {
   ctx.mvPushMatrix();

   if (this.selected) {
      mat4.rotate(ctx.mvMatrix, 3.0, [0, 1, 0]);
   }

   var gl = ctx.gl;
   var vertices = ctx.vertices;
   var shaderProgram = ctx.shaderProgram;
   gl.bindBuffer(gl.ARRAY_BUFFER, vertices.positionBuffer);
   gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, vertices.positionBuffer.itemSize, gl.FLOAT, false, 0, 0);
   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertices.indexBuffer);
   gl.uniform1f(shaderProgram.scale, this.scale);

   ctx.initProgVars(this);

   mat4.translate(ctx.mvMatrix, [1.0, 0.0, 1.0]);

   ctx.setMatrixUniforms();
   gl.drawElements(gl.TRIANGLES, vertices.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

   ctx.mvPopMatrix();
};

// so solar system can be in 1 of 3 states: normal, selected but not in center, and playing
// planets should spin when in [normal | selected but not in center]
// planets should be greyed when in  [selected but not in center | playing] and they aren't the selected one
// planets should play video when in they are in center, and selected 

// so planets have state for : selected, in center, greyed, playing
// solar system has state for normal, selected (but not in center), and playing

// planets don't need to know about overall state, they just respond to questions from the solar system,
// and get their state updated as a result of the state of the solar system
// ... i think :)

// might need to only update the angle on tick so as not to confuse the crap out of the maths :P
vixgl.Planet.prototype.isInCenter = function() {
   var leftCentralBound = 1.73 * Math.PI,
       rightCentralBound = 1.77 * Math.PI;

   return this.rTri >= leftCentralBound && this.rTri <= rightCentralBound;
};

vixgl.Planet.prototype.playVideo = function() {
   var vid = document.querySelector('#video' + this.videoRef);

         // this shouldn't be in here because its not a feature of the planet...
         if (vid) {
            vixgl.util.log('play vid');
            vid.play();
         }
};
// TODO
// DO NOT WRITE ANY  MORE CODE
// UNTIL YOU HAVE THIS AS A DIAGRAM
// AND PROBS WILL NEED EITHER http://lamehacks.net/blog/implementing-a-state-machine-in-javascript/
// OR THE HF DESIGN PATTERNS BOOK

vixgl.Planet.prototype.animate = function (elapsed) {

   if (!this.selected) {
      this.spinning = true;
   }

   if (this.spinning) {
      if (this.selected && this.isInCenter()) {
         this.rTri = 1.75 * Math.PI;
         this.spinning = false;
         this.playVideo();
      } else {
         this.updateAndNormaliseAngle(elapsed);
      }
   } else {
      if (this.selected) {
         var vid = document.getElementById('video' + this.videoRef);
         this.texture = vixgl.proper.updateTextureWith(vid, this.texture);
      }
   }
};

vixgl.Planet.prototype.updateAndNormaliseAngle = function(elapsed) {
         if (this.rTri <= 2 * Math.PI) {
            this.rTri += (this.rotationAngleDuringWindow * elapsed / this.windowToRotate);
         } else {
            this.rTri = 0;
         }
};


vixgl.Planet.prototype.equalsColor = function (toMatch) {
   return ((this.color[0] === toMatch[0]) && 
           (this.color[1] === toMatch[1]) && 
           (this.color[2] === toMatch[2]) && 
           (this.color[3] === toMatch[3]));
};

vixgl.Planet.prototype.equalsImageUrl = function (toMatch) {
   return this.imageUrl === toMatch;
};

vixgl.Planet.prototype.move = function(mvMatrix) {
   mat4.rotate(mvMatrix, this.rTri, [0, 1, 0]);
   mat4.translate(mvMatrix, this.distFromCentre);
};


