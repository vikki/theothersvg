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
   this.vidding = false;
   this.greyed = false;
};

vixgl.Planet.prototype.getGreyingFactor = function () {
   return this.greyed ? [0.3, 0.3, 0.3] : [1.0, 1.0, 1.0];
};

vixgl.Planet.prototype.draw = function (ctx) {
   ctx.mvPushMatrix();

   if (this.vidding) {
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

// TODO - fix  - this smells
// because stopSpinning is a feature of the viz/solar system, rather than of the planets
// therefore it should be moved out of here into one of those
// we also need to move quite a lot of this logic out of the planet .. 
// not sure where to draw the line with the vid stuff though

// so maybe the planet should have a boolean, spinning
// which could be set by the solar system
// so it doesn't have to depend on the solar system
// its fine for the solar system to depend on planets, cos they do in RL :)

// vidding is a property of the solar system or the app itself

vixgl.Planet.prototype.stopSpinning = false;
vixgl.Planet.prototype.animate = function (elapsed) {
   var leftCentralBound = 1.73 * Math.PI,
       rightCentralBound = 1.77 * Math.PI,
       inCenter = this.rTri >= leftCentralBound && this.rTri <= rightCentralBound,
       vid = document.querySelector('#video' + this.videoRef);

   if (this.stopSpinning && !this.vidding) {
      this.stopSpinning = false;
   }

   if (!this.stopSpinning) {
      if (this.vidding && inCenter) {
         this.rTri = 1.75 * Math.PI;
         this.stopSpinning = true;
         //this.scale = 0.3;

         if (vid) {
            console.log('play vid');
            vid.play();
         }
      } else {
         this.scale = this.origScale;
         // normalize rTri such that it is always less than 360deg (==Math.PI*2)
         // you don't need to do this for the rotation maths to work 
         // cos its a sin wave but its handy for the where-ami maths :P
         if (this.rTri <= 2 * Math.PI) {
            this.rTri += (this.rotationAngleDuringWindow * elapsed / this.windowToRotate);
         } else {
            this.rTri = 0;
         }
      }
   }

   if (this.vidding && this.stopSpinning) {
      var vid = document.getElementById('video' + this.videoRef);
      this.texture = vixgl.proper.updateTextureWith(vid, this.texture);
   }
};

vixgl.Planet.prototype.equalsColor = function (toMatch) {
   return ((this.color[0] == toMatch[0]) && 
           (this.color[1] == toMatch[1]) && 
           (this.color[2] == toMatch[2]) && 
           (this.color[3] == toMatch[3]));
};

vixgl.Planet.prototype.equalsImageUrl = function (toMatch) {
   return this.imageUrl === toMatch;
};
