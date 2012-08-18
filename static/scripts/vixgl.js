/*global vec3:false, glCtx:false, requestAnimFrame:false */

// TODO oh fucking hell use a proper loader
// could have an overarching webgl object
// that has multiple contexts
// which then can encapsulate webgl calls
// TODO try to do this with mixins rather than subclassing
// could even mix in the picker (dummy gl ctx) properly as its just another feature :D
// will still automatically need 2 ctxs, one for dummy, one for real
// could maybe throw in observer pattern here?
// TODO not yet!!!

/*var vixgl = vixgl || {
   planets: [],
   dummy: new glCtx('dummygl', 'dummyFragmentShader', 'dummyVertexShader'),
   proper: new glCtx('vixgl', 'fragmentShader', 'vertexShader')
};*/
var vixgl = vixgl || {};
vixgl.planets = [];

// TODO one fine day most of these attributes can be set up with mixins for lighting and textures etc.
// not quite there yet though!
vixgl.proper = new glCtx('vixgl', 'fragmentShader', 'vertexShader');

vixgl.proper.initUniforms = function () {
   "use strict";

   var shaderProgram = this.shaderProgram,
      gl = this.gl;

   shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
   shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, 'uPMatrix');
   shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, 'uNMatrix');
   shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, 'uSampler');
   shaderProgram.scale = gl.getUniformLocation(shaderProgram, 'uScale');
   shaderProgram.greyingFactor = gl.getUniformLocation(shaderProgram, 'uGreyingFactor');
   shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, 'uAmbientColor');
   shaderProgram.lightingDirectionUniform = gl.getUniformLocation(shaderProgram, 'uLightingDirection');
   shaderProgram.directionalColorUniform = gl.getUniformLocation(shaderProgram, 'uDirectionalColor');
};

vixgl.proper.initAttributes = function () {
   "use strict";

   var prog = this.shaderProgram,
      gl = this.gl;

   prog.vertexPositionAttribute = gl.getAttribLocation(prog, 'aVertexPosition');
   gl.enableVertexAttribArray(prog.vertexPositionAttribute);

   prog.vertexNormalAttribute = gl.getAttribLocation(prog, 'aVertexNormal');
   gl.enableVertexAttribArray(prog.vertexNormalAttribute);

   prog.textureCoordAttribute = gl.getAttribLocation(prog, 'aTextureCoord');
   gl.enableVertexAttribArray(prog.textureCoordAttribute);
};

vixgl.proper.initProgVars = function (planet) {
   "use strict";

   var gl = this.gl,
      vertices = this.vertices,
      prog = this.shaderProgram,
      lightingDirection = [0.25, - 0.25, - 1.0],
      adjustedLD = vec3.create();

   gl.bindBuffer(gl.ARRAY_BUFFER, vertices.normalBuffer);
   gl.vertexAttribPointer(prog.vertexNormalAttribute, vertices.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

   gl.bindBuffer(gl.ARRAY_BUFFER, vertices.textureCoordBuffer);
   gl.vertexAttribPointer(prog.textureCoordAttribute, vertices.textureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

   gl.activeTexture(gl.TEXTURE0);
   gl.bindTexture(gl.TEXTURE_2D, planet.texture);
   gl.uniform1i(prog.samplerUniform, 0);

   // push ambient light RGB uniform to shader
   gl.uniform3f(prog.ambientColorUniform, 0.2, 0.2, 0.2);

   // directional lighting vector
   vec3.normalize(lightingDirection, adjustedLD);
   // reverse the vector cos we specify it in terms of where its going
   // but we calculate it in terms of where its coming from
   vec3.scale(adjustedLD, - 1);
   // push it up to the shader
   gl.uniform3fv(prog.lightingDirectionUniform, adjustedLD);

   // push directional lighting colour up to the shader
   gl.uniform3f(prog.directionalColorUniform, 0.7, 0.7, 0.7);

   gl.uniform3fv(prog.greyingFactor, planet.getGreyingFactor());
};


vixgl.dummy = new glCtx('dummygl', 'dummyFragmentShader', 'dummyVertexShader');

vixgl.dummy.initTextures = function () {
   "use strict";
};

vixgl.dummy.initUniforms = function () {
   "use strict";

   this.shaderProgram.mvMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uMVMatrix");
   this.shaderProgram.pMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, 'uPMatrix');
   this.shaderProgram.scale = this.gl.getUniformLocation(this.shaderProgram, 'uScale');
   this.shaderProgram.color = this.gl.getUniformLocation(this.shaderProgram, 'uColor');
};

vixgl.dummy.initAttributes = function () {
   "use strict";

   this.shaderProgram.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram, 'aVertexPosition');
   this.gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);
};

vixgl.dummy.initProgVars = function (planet) {
   "use strict";

   var r = planet.color[0] / 255,
      g = planet.color[1] / 255,
      b = planet.color[2] / 255,
      a = planet.color[3] / 255;
   this.gl.uniform4fv(this.shaderProgram.color, [r, g, b, a]);
};

vixgl.drawStuff = function (vvc) {
   "use strict";

   vixgl.initWorldObjects(vvc);

   vixgl.dummy.drawStuff();
   vixgl.proper.drawStuff();

   vixgl.tick();
};

vixgl.animatePlanets = function (elapsed) {
   "use strict";

   var prop;
   for (prop in this.planets) {
      if (this.planets.hasOwnProperty(prop)) {
         this.planets[prop].animate(elapsed);
      }
   }

   // TODO aiee gonna have to use mixins for this to avoid dependency....
   vixgl.camera.updateViewingAngle(elapsed);
};

vixgl.drawPlanets = function() {
   for (prop in this.planets) {
      if (this.planets.hasOwnProperty(prop)) {
         this.mvPushMatrix();

         // maybe draw planet should be on planet (figures :P)
         // and the glCtx could have some notion of world objects
         // that it should iterate over,
         // push the mvMatrix,
         // draw the world object
         // then pop the mvMatrix and carry on 
         planet = this.planets[prop];
         mat4.rotate(this.mvMatrix, planet.rTri, [0, 1, 0]);
         mat4.translate(this.mvMatrix, planet.distFromCentre);
         planet.draw(this);

         this.mvPopMatrix();
      }
   }
} ;

// ask the browser to call us again, next time stuff needs to be animated
// i.e. when we're in focus and the screen needs repainting
// then draw the scene, and set it up for next time (move things) 
vixgl.tick = function () {
   "use strict";

   var self = vixgl,
      animatePlanetsFunc = vixgl.util.bind(self, vixgl.animatePlanets);

   requestAnimFrame(vixgl.tick);
   vixgl.camera.handleKeys();
   vixgl.proper.drawScene();
   vixgl.dummy.drawScene();

   vixgl.util.animate(animatePlanetsFunc);
};

vixgl.initWorldObjects = function (vvc) {
   "use strict";

   var i = 0,
      maxShareCount = 0,
      totalShareCount = 0,
      allowForSun = 0,
      maxDistFromSun = 25,
      outSoFar = allowForSun,
      planet,
      entry,
      sharePerc,
      thisDist,
      dist,
      planetUrl;

   planet = new vixgl.Planet({
      rTri: 0.1,
      startingAngle: 0,
      distFromCentre: [0, 0, 0],
      imageUrl: vixgl.config.getConfig()['sunUrl'],
      scale: 0.5,
      color: [255, 255, 0, 255],
      title: 'the SUN'
   });
   this.addPlanet(planet);

   for (; i < 10; i++) {
      if (vvc.entries[i].shares > maxShareCount) {
         maxShareCount = vvc.entries[i].shares;
      }
      totalShareCount += vvc.entries[i].shares;
   }

   for (i = 0; i < 10; i++) {
      entry = vvc.entries[i];
      sharePerc = entry.shares / totalShareCount;

      thisDist = sharePerc * (maxDistFromSun - allowForSun);
      dist = thisDist + outSoFar;
      outSoFar += thisDist;

      planetUrl = vixgl.config.getConfig()['planetBaseUrl'];
      planetUrl = planetUrl.replace('%s', entry.videoRef);

      planet = new vixgl.Planet({
         rTri: Math.PI * 2 * sharePerc,
         startingAngle: 0.2 * i,
         distFromCentre: [dist, 0.0, dist],
         imageUrl: planetUrl,
         scale: sharePerc + 1.5,
         color: vixgl.util.randColor(),
         title: entry.title,
         video: entry.hostingSiteUrl,
         videoRef: entry.videoRef
      });

      this.addPlanet(planet);
   }
};

// TODO un-barf - this shouldn't be necessary once refactored :S
vixgl.addPlanet = function(planet) {
   this.planets.push(planet);
   this.dummy.worldObjects.push(planet);
   this.proper.worldObjects.push(planet);
};

vixgl.getVideoLocation = function (videoRef) {
   "use strict";

   var videoLocationBase = vixgl.config.getConfig()['videoLocationBase'];
   return videoLocationBase.replace('%s', videoRef);
};

// TODO this should handle if we've already drawn the video?
// and get rid of old ones
// or maybe some other method wrapping it should
vixgl.drawVid = function (videoRef) {
   "use strict";

   var vid = document.createElement('video');

   vid.id = 'video' + videoRef;
   vid.style.display = 'none';
   vid.height = '256';
   vid.width = '256';
   vid.className = 'vidTexture';
   vid.src = '/vid?vid=http://streaming.vikkiread.co.uk.s3.amazonaws.com/' + videoRef + '.mp4';
   document.body.appendChild(vid);
   return vid;
};


vixgl.removeOldVidEmbeds = function (current) {
   "use strict";

   // call stop  + remove old video elements - hopefully this prevents mem leakages? 
   var vidTextures = document.querySelectorAll('.vidTexture'),
      vid;

   for (var i = 0; i < vidTextures.length; i++) {
      vid = vidTextures[i];
      if (vid === current) {
         continue;
      }
      vid.pause();
      // http://blog.pearce.org.nz/2010/11/how-to-stop-video-or-audio-element.html
      vid.src = '';
      vid.currentSrc = '';
      vid.load();
      vid.parentElement.removeChild(vid);
   }
};

vixgl.setupChartViz = function (oReq) {
   "use strict";

   var vvc = JSON.parse(oReq.responseText);
   console.dir(vvc);
   vixgl.drawStuff(vvc);
};

vixgl.doStuff = function () {
   "use strict";

   var vvcJsonUrl = vixgl.config.getConfig()['vvcJson'],
      vixgl_canvas = document.getElementById('vixgl');

   vixgl.util.doAjaxRequest(vvcJsonUrl, vixgl.setupChartViz);
   var bindy  = vixgl.util.bind(vixgl, vixgl.doStuffWithPlanet);
   vixgl.util.addEventHandler(vixgl_canvas, 'onclick', bindy);
};

vixgl.getPlanetFromColor = function (colorToMatch) {
   "use strict";

   return vixgl.util.getFirstMatching(this.planets, vixgl.Planet.prototype.equalsColor, colorToMatch);
};

vixgl.doStuffWithPlanet = function () {
   "use strict";

   var coords = vixgl.util.relMouseCoords(event),
      col = vixgl.util.getColorFromCoords(coords, vixgl.dummy.gl),
      planet = vixgl.getPlanetFromColor(col),
      toShow = planet ? planet.title : 'the VOID....',
      vid,
      prop,
      currentPlanet;

   vixgl.util.log('from ' + col[0] + ',' + col[1] + ',' + col[2] + ',' + col[3] + ' got ' + toShow);

   document.getElementById('whoo').innerText = 'i am embarassingly happy that you clicked on ' + toShow;

   for (prop in this.planets) {
      if (this.planets.hasOwnProperty(prop)) {
         currentPlanet = this.planets[prop];
         currentPlanet.selected = false;
         currentPlanet.greyed = (typeof planet !== 'undefined');
         this.proper.updateTextureWith(currentPlanet.origTexture, currentPlanet.texture);
      }
   }

   vixgl.removeOldVidEmbeds(vid);

   if (planet) {
      vid = document.getElementById('video' + planet.videoRef);
      if (!vid) {
         vid = vixgl.drawVid(planet.videoRef);
      }
      planet.selected = true;
      planet.greyed = false;
   }
};
