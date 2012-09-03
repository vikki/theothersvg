/*global vixgl:false, mat4:false, mat3:false */

var glCtx = function (canvasId, fragmentShaderId, vertexShaderId) {
   "use strict";

   this.canvasId = canvasId;
   this.fragmentShaderId = fragmentShaderId;
   this.vertexShaderId = vertexShaderId;
   this.mvMatrix = mat4.create();
   this.pMatrix = mat4.create();
   this.worldObjects = [];
};

glCtx.prototype.drawStuff = function () {
   "use strict";

   this.initGL();
   this.initShaders();
   this.initBuffers();
   // don't do for dummy?
   this.initTextures();

   this.gl.clearColor(0.0, 0.0, 0.0, 0.1);
   this.gl.enable(this.gl.DEPTH_TEST);
};

glCtx.prototype.initGL = function () {
   "use strict";

   var canvas = document.getElementById(this.canvasId);
   // ~= gl but future proof : canvas.getContext('experimental-webgl');
   //properGL = WebGLUtils.setupWebGL(canvas);
   this.gl = canvas.getContext('experimental-webgl', {
      preserveDrawingBuffer: true
   });
   this.viewportWidth = canvas.width;
   this.viewportHeight = canvas.height;
};

glCtx.prototype.initShaders = function () {
   "use strict";

   var fragmentShader = this.getShader(this.gl, this.fragmentShaderId),
       vertexShader = this.getShader(this.gl, this.vertexShaderId),
       shaderStatus;

   this.shaderProgram = this.gl.createProgram();
   this.gl.attachShader(this.shaderProgram, vertexShader);
   this.gl.attachShader(this.shaderProgram, fragmentShader);
   this.gl.linkProgram(this.shaderProgram);

   shaderStatus = this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS);
   if (!shaderStatus) {
      console.log('webgl didnae work' + shaderStatus);
   } else {
      console.log('program is shiny');
   }

   this.gl.useProgram(this.shaderProgram);

   this.initUniforms();
   this.initAttributes();
};


glCtx.prototype.setupBuffer = function (contents, itemSize, buffer) {
   "use strict";

   var gl = this.gl,
       newBuffer = gl.createBuffer();
   newBuffer.itemSize = itemSize;
   newBuffer.numItems = contents.length / itemSize;
   gl.bindBuffer(buffer, newBuffer);
   return newBuffer;
};

glCtx.prototype.setupFloat32Buffer = function (contents, itemSize, buffer) {
   "use strict";

   var newBuffer = this.setupBuffer(contents, itemSize, buffer);
   this.gl.bufferData(buffer, new Float32Array(contents), this.gl.STATIC_DRAW);
   return newBuffer;
};

glCtx.prototype.setupUint16Buffer = function (contents, itemSize, buffer) {
   "use strict";

   var newBuffer = this.setupBuffer(contents, itemSize, buffer);
   this.gl.bufferData(buffer, new Uint16Array(contents), this.gl.STATIC_DRAW);
   return newBuffer;
};

glCtx.prototype.initBuffers = function () {
   "use strict";

   var latitudeBands = 30,
       longitudeBands = 30,
       radius = 2,
       vertexPositionData = [],
       normalData = [],
       textureCoordData = [],
       latNumber = 0,
       longNumber = 0,
       theta = 0,
       sinTheta = 0,
       cosTheta = 0,
       phi = 0,
       sinPhi = 0,
       cosPhi = 0,
       x = 0,
       y = 0,
       z = 0,
       u = 0,
       v = 0,
       indexData = [],
       topLeft,
       bottomLeft,
       topRight,
       bottomRight;

   this.vertices = {};

   for (; latNumber <= latitudeBands; latNumber++) {
       theta = latNumber * Math.PI / latitudeBands;
       sinTheta = Math.sin(theta);
       cosTheta = Math.cos(theta);

      for (longNumber = 0; longNumber <= longitudeBands; longNumber++) {
         phi = longNumber * 2 * Math.PI / longitudeBands;
         sinPhi = Math.sin(phi);
         cosPhi = Math.cos(phi);

         x = cosPhi * sinTheta;
         y = cosTheta;
         z = sinPhi * sinTheta;

         u = 1 - (longNumber / longitudeBands);
         v = 1 - (latNumber / latitudeBands);

         normalData.push(x);
         normalData.push(y);
         normalData.push(z);

         textureCoordData.push(u);
         textureCoordData.push(v);

         vertexPositionData.push(radius * x);
         vertexPositionData.push(radius * y);
         vertexPositionData.push(radius * z);
      }
   }

   this.vertices.normalBuffer = this.setupFloat32Buffer(normalData, 3, this.gl.ARRAY_BUFFER);
   this.vertices.textureCoordBuffer = this.setupFloat32Buffer(textureCoordData, 2, this.gl.ARRAY_BUFFER);
   this.vertices.positionBuffer = this.setupFloat32Buffer(vertexPositionData, 3, this.gl.ARRAY_BUFFER);

   for (latNumber = 0; latNumber < latitudeBands; latNumber++) {
      for (longNumber = 0; longNumber < longitudeBands; longNumber++) {
         topLeft = (latNumber * (longitudeBands + 1)) + longNumber;
         bottomLeft = topLeft + longitudeBands + 1;
         topRight = topLeft + 1;
         bottomRight = bottomLeft + 1;

         indexData.push(topLeft);
         indexData.push(bottomLeft);
         indexData.push(topRight);

         indexData.push(bottomLeft);
         indexData.push(bottomRight);
         indexData.push(topRight);
      }
   }

   this.vertices.indexBuffer = this.setupUint16Buffer(indexData, 1, this.gl.ELEMENT_ARRAY_BUFFER);
};

glCtx.prototype.initTextures = function () {
   "use strict";
   
   var prop,
       worldObject;

   for (prop in this.worldObjects) {
      if (this.worldObjects.hasOwnProperty(prop)) {
         worldObject = this.worldObjects[prop];
         worldObject.origTexture = this.initTexture(worldObject);
      }
   }
};

glCtx.prototype.initTexture = function (worldObject) {
   "use strict";

   var imgForTexture = new Image(),
       ctx = this;

   imgForTexture.onload = function () {
      var texture = ctx.createTextureFromImage(this)
      worldObject.texture = texture;
   };
   imgForTexture.src = vixgl.getVideoLocation(worldObject.imageUrl);
   return imgForTexture;
};

glCtx.prototype.makeTextureFrom = function (image) {
   "use strict";

   var texture = this.gl.createTexture();

   this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
   this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
   this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
   this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
   this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
   // make the current texture null (tidy up)
   this.gl.bindTexture(this.gl.TEXTURE_2D, null);

   return texture;
};

glCtx.prototype.createTextureFromImage = function (image) {
   "use strict";

var texture = this.gl.createTexture();
   return this.updateTextureWith(image, texture);
};

glCtx.prototype.makeImageSuitableForTexture = function (image) {
   "use strict";

   var width,
       height,
       ctx,
       canvas,
       centerX,
       centerY;

   image.crossOrigin = '';
   // it probs should be image.width not image.videoWidth or clientWidth but doesn't work with <video>
   // fix with functional programming :P
   if (image.tagName && image.tagName === 'IMG') {
      width = image.width;
      height = image.height;
   } else {
      width = image.videoWidth;
      height = image.videoHeight;
   }

   if (!vixgl.util.isPowerOfTwo(width) || !vixgl.util.isPowerOfTwo(height)) {
      // Scale up the texture to the next highest power of two dimensions.
      canvas = document.createElement("canvas");
      canvas.style = 'background-color: #FFFF00';
      canvas.width = vixgl.util.nextHighestPowerOfTwo(width);
      canvas.height = vixgl.util.nextHighestPowerOfTwo(height);
      ctx = canvas.getContext("2d");

      // almost black, but a bit lighter so you can see the contours a bit
      // better
      ctx.fillStyle = '#1F1F1F';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // draw image in the middle
      centerX = canvas.width / 2 - width / 2;
      centerY = canvas.height / 2 - height / 2;
      ctx.drawImage(image, centerX, centerY, width, height);

      image = canvas;
   }

   return image;
};

glCtx.prototype.updateTextureWith = function (image, texture) {
   "use strict";

   image = this.makeImageSuitableForTexture(image);

   this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
   this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
   this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
   this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
   this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
   // make the current texture null (tidy up)
   this.gl.bindTexture(this.gl.TEXTURE_2D, null);

   return texture;
};

glCtx.prototype.setMatrixUniforms = function () {
   "use strict";

   var normalMatrix = mat3.create();

   this.gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, this.pMatrix);
   this.gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, this.mvMatrix);

   mat4.toInverseMat3(this.mvMatrix, normalMatrix);
   mat3.transpose(normalMatrix);
   this.gl.uniformMatrix3fv(this.shaderProgram.nMatrixUniform, false, normalMatrix);
};

glCtx.prototype.mvMatrixStack = [];

glCtx.prototype.mvPushMatrix = function () {
   "use strict";

   var copy = mat4.create();
   mat4.set(this.mvMatrix, copy);
   this.mvMatrixStack.push(copy);
};

glCtx.prototype.mvPopMatrix = function () {
   "use strict";

   if (this.mvMatrixStack.length === 0) {
      throw "no pringles for you!";
   }
   this.mvMatrix = this.mvMatrixStack.pop();
};

glCtx.prototype.drawScene = function () {
   "use strict";
   /*jshint bitwise: false */

   var prop,
       worldObject;

   this.gl.viewport(0, 0, this.viewportWidth, this.viewportHeight);
   this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
   mat4.perspective(45, this.viewportWidth / this.viewportHeight, 0.1, 100.0, this.pMatrix);

   mat4.identity(this.mvMatrix);
   mat4.translate(this.mvMatrix, [0.0, 0.0, - 30.0]);

   vixgl.camera.updateSceneForCamera(this.mvMatrix);

   for (prop in this.worldObjects) {
      if (this.worldObjects.hasOwnProperty(prop)) {
         this.mvPushMatrix();
   
         worldObject = this.worldObjects[prop];
         if (typeof worldObject.move === 'function') {
            worldObject.move(this.mvMatrix);
         }
         if (typeof worldObject.move === 'function') {
            worldObject.draw(this);
         }
   
         this.mvPopMatrix();
      }
   }
};

glCtx.prototype.getShader = function(ctx, shaderName) {
   "use strict";

   // TODO should do this with ajax
   // and store shaders in diff files
   var shaderScript = document.getElementById(shaderName),
       str = '',
       shaderMap = {},
       k = shaderScript.firstChild;

   for (; k; k = k.nextSibling) {
      if (k.nodeType === 3) {
         str += k.textContent;
      }
   }   
    
   shaderMap['x-shader/x-fragment'] = ctx.FRAGMENT_SHADER;
   shaderMap['x-shader/x-vertex']   = ctx.VERTEX_SHADER;
  
   var shader = ctx.createShader(shaderMap[shaderScript.type]);
   console.dir(shader);
   ctx.shaderSource(shader, str);
   ctx.compileShader(shader);

   if (!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS)){
           console.log(ctx.getShaderInfoLog(shader));
   } 
   
   return shader;
};
