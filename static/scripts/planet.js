// TODO add the i-forgot-new fix from stoyan, cos you're a dumbass and you will forget new :P
function Planet(rTri, startingAngle, distFromCentre, imageUrl, scale, color, title, video, videoRef ){
    this.startingAngle = startingAngle;
    this.distFromCentre = distFromCentre;
    this.origImageUrl = imageUrl;
    this.rotationAngleDuringWindow = rTri;
    this.windowToRotate = 1000;
    this.rTri = rTri;
    this.origScale = scale;
    this.color = color;
    this.title = title;
    this.video = video;
    this.vidding = false;
    this.videoRef = videoRef;

    this.greyed = false;
    this.hack2 = false;
    this.scale = scale;
    this.imageUrl = imageUrl;
}

Planet.prototype.getGreyingFactor = function() {
  return this.greyed ? [0.3, 0.3, 0.3] : [1.0, 1.0, 1.0];
};

Planet.prototype.draw = function(ctx) {
         ctx.mvPushMatrix();

         //mat4.rotate(this.mvMatrix, rTri, [0,1,0]);
         //if (this.vidding && !this.hack2) {
         if (this.vidding ) {
            mat4.rotate(ctx.mvMatrix, 3.0, [0,1,0]);
            this.hack2 = true;
         }

         var gl = ctx.gl;
         var vertices = ctx.vertices;
         var shaderProgram = ctx.shaderProgram;
         gl.bindBuffer(gl.ARRAY_BUFFER, vertices.positionBuffer);
         gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, vertices.positionBuffer.itemSize, gl.FLOAT, false, 0, 0);
         gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertices.indexBuffer);
         gl.uniform1f( shaderProgram.scale, this.scale);

         ctx.initProgVars(this);

         mat4.translate(ctx.mvMatrix, [1.0, 0.0, 1.0]);

         ctx.setMatrixUniforms();
         gl.drawElements(gl.TRIANGLES, vertices.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

         ctx.mvPopMatrix();
};


// this smells
// because stopSpinning is a feature of the viz/solar system, rather than of the planets
// therefore it should be moved out of here into one of those
// we also need to move quite a lot of this logic out of the planet .. not sure where to draw the line with the vid stuff though
Planet.prototype.stopSpinning = false;
Planet.prototype.animate = function(elapsed) {
   if (!this.stopSpinning) {
      var stopRotatingWhenViddingAndInCenter = (this.vidding && (this.rTri >= 1.73*Math.PI && this.rTri <= 1.77*Math.PI));

      if (stopRotatingWhenViddingAndInCenter) {
         this.rTri = 1.75*Math.PI;
         this.stopSpinning = true;
         this.scale = 0.3;

         var vid = document.querySelector('#video' + this.videoRef);
         if (vid) {
            console.log('play vid');
            vid.play();
         }
      } else {
         this.scale = this.origScale;
         // normalize rTri such that it is always less than 360deg (==Math.PI*2)
         // you don't need to do this for the rotation maths to work cos its a sin wave but its handy for the where-ami maths :P
         if (this.rTri <= 2*Math.PI) {
            this.rTri += (this.rotationAngleDuringWindow * elapsed / this.windowToRotate);
         } else {
            this.rTri = 0;
         }
      }
   }

   if (this.vidding && this.stopSpinning) {
      var vid = document.getElementById('video' + this.videoRef);
      this.texture = proper.updateTextureWith(vid, this.texture);
   }
};

// can i not just compare the arrays ???? or is this a WAT moment
Planet.prototype.equalsColor = function(toMatch) {
   return ((this.color[0] == toMatch[0]) &&
           (this.color[1] == toMatch[1]) &&
           (this.color[2] == toMatch[2]) &&
           (this.color[3] == toMatch[3]) );
};

Planet.prototype.equalsImageUrl = function(toMatch) {
   return this.imageUrl === toMatch;
};

