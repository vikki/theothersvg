   "use strict";

   var glCtx = function(canvasId, fragmentShaderId, vertexShaderId) {
      this.canvasId = canvasId;
      this.fragmentShaderId = fragmentShaderId;
      this.vertexShaderId = vertexShaderId;
      this.mvMatrix = mat4.create();
      this.pMatrix = mat4.create();
   };  

glCtx.prototype.drawStuff = function() {
       this.initGL();
       this.initShaders();
       this.initBuffers();
       // don't do for dummy?
       this.initTextures();

       this.gl.clearColor(0.0, 0.0, 0.0, 0.1); 
       this.gl.enable(this.gl.DEPTH_TEST);
    };  

   glCtx.prototype.initGL = function() {
     var canvas = document.getElementById(this.canvasId);
     // ~= gl but future proof : canvas.getContext('experimental-webgl');
     //properGL = WebGLUtils.setupWebGL(canvas);
     this.gl = canvas.getContext('experimental-webgl', {preserveDrawingBuffer: true});
     this.viewportWidth = canvas.width;
     this.viewportHeight = canvas.height;
   };  

    glCtx.prototype.initShaders = function() {
       var fragmentShader = getShader(this.gl, this.fragmentShaderId);
       var vertexShader   = getShader(this.gl, this.vertexShaderId);

       this.shaderProgram = this.gl.createProgram();
       this.gl.attachShader(this.shaderProgram, vertexShader);
       this.gl.attachShader(this.shaderProgram, fragmentShader);
       this.gl.linkProgram(this.shaderProgram);

       var foo = this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS);
       if (!foo) {
        console.log('webgl didnae work' + foo);
       } else {
          console.log('program is shiny');
       }

       this.gl.useProgram(this.shaderProgram);

       this.initUniforms();
       this.initAttributes();
    };


glCtx.prototype.setupBuffer  = function(contents, itemSize, buffer) {
       var gl = this.gl;
       var newBuffer = gl.createBuffer();
       newBuffer.itemSize = itemSize;
       newBuffer.numItems = contents.length / itemSize;
       gl.bindBuffer(buffer, newBuffer);
       return newBuffer;
   };

   glCtx.prototype.setupFloat32Buffer = function(contents, itemSize, buffer) {
       var gl = this.gl;
       var newBuffer = this.setupBuffer(contents, itemSize, buffer);
       gl.bufferData(buffer, new Float32Array(contents), gl.STATIC_DRAW);
       return newBuffer;
   };

   glCtx.prototype.setupUint16Buffer = function(contents, itemSize, buffer) {
       var gl = this.gl;
       var newBuffer = this.setupBuffer(contents, itemSize, buffer);
       gl.bufferData(buffer, new Uint16Array(contents), gl.STATIC_DRAW);
       return newBuffer;
   };

    glCtx.prototype.initBuffers = function() {
       this.vertices = {};
       var latitudeBands = 30;
       var longitudeBands = 30;
       var radius = 2;

       var vertexPositionData = [];
       var normalData = [];
       var textureCoordData = [];

       for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
         var theta = latNumber * Math.PI / latitudeBands;
         var sinTheta = Math.sin(theta);
         var cosTheta = Math.cos(theta);

         for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
           var phi = longNumber * 2 * Math.PI / longitudeBands;
           var sinPhi = Math.sin(phi);
           var cosPhi = Math.cos(phi);

           var x = cosPhi * sinTheta;
           var y = cosTheta;
           var z = sinPhi * sinTheta;

           var u = 1 - (longNumber / longitudeBands);
           var v = 1 - (latNumber / latitudeBands);

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

       var indexData = [];
       for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
         for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
           var topLeft = (latNumber * (longitudeBands + 1)) + longNumber;
           var bottomLeft = topLeft + longitudeBands + 1;
           var topRight = topLeft + 1;
           var bottomRight  = bottomLeft + 1;

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


    glCtx.prototype.initTextures = function() {
        for (var i in planets) {
           planets[i].origTex = this.initTexture(planets[i].imageUrl);
        }  
    }

    glCtx.prototype.initTexture = function(vid) {
      var foo = new Image();
      var ctx  = this;
      foo.onload = function() {
         var realUrl = matchVideo(this.src);
         var planet = getNewPlanetFromImageUrl(realUrl);
         var texture = ctx.createTextureFromImage(this);
         planet.texture = texture;
      }
      foo.src = getVideoLocation(vid);
      return foo;
    };


// its an enormous ballache to get the index in here, so not bothering for now..
glCtx.prototype.createTextureFromImage = function(image) {
    image.crossOrigin = '';
    if (!isPowerOfTwo(image.width) || !isPowerOfTwo(image.height)) {
        // Scale up the texture to the next highest power of two dimensions.
        var canvas = document.createElement("canvas");
        canvas.style = 'background-color: #FFFF00';
        canvas.width = nextHighestPowerOfTwo(image.width);
        canvas.height = nextHighestPowerOfTwo(image.height);
        var ctx = canvas.getContext("2d");

        ctx.fillStyle = '#FFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // draw image in the middle
        var centerX = canvas.width/2 - image.width/2;
        var centerY = canvas.height/2 - image.height/2;
        ctx.drawImage(image, centerX, centerY, image.width, image.height);

        // TODO figure out middle properly, and size of text etc.)
        ctx.moveTo(50, 50);
        ctx.fillStyle = 'Red';
        ctx.font = '30px sans-serif';
        //ctx.fillText("fill", 60, 60);

        image = canvas;
    }

    return this.makeTextureFrom(image);
}

   glCtx.prototype.makeTextureFrom = function(image)  {
      var texture = this.gl.createTexture();
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
      this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
      this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
      // make the current texture null (tidy up)
      this.gl.bindTexture(this.gl.TEXTURE_2D, null);

      return texture;
    }

glCtx.prototype.createTextureFromImage = function(image) {
    var texture = this.gl.createTexture();
    return this.updateTextureWith(image, texture);
}

glCtx.prototype.makeImageSuitableForTexture = function(image)  {
    image.crossOrigin = '';
    // it probs should be image.width not image.videoWidth or clientWidth but doesn't work with <video>
    // fix with functional programming :P
    if (image.tagName && image.tagName == 'IMG') {
      var width = image.width;
      var height = image.height;
    }  else {
      var width = image.videoWidth;
      var height = image.videoHeight;
    }

    if (!isPowerOfTwo(width) || !isPowerOfTwo(height)) {
        // Scale up the texture to the next highest power of two dimensions.
        var canvas = document.createElement("canvas");
        canvas.style = 'background-color: #FFFF00';
        canvas.width = nextHighestPowerOfTwo(width);
        canvas.height = nextHighestPowerOfTwo(height);
        var ctx = canvas.getContext("2d");

        // almost black, but a bit lighter so you can see the contours a bit
        // better
        ctx.fillStyle = '#1F1F1F';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // draw image in the middle
        var centerX = canvas.width/2 - width/2;
        var centerY = canvas.height/2 - height/2;
        ctx.drawImage(image, centerX, centerY, width, height);

        // TODO figure out middle properly, and size of text etc.)
        ctx.moveTo(50, 50);
        ctx.fillStyle = 'Red';
        ctx.font = '30px sans-serif';
        //ctx.fillText("fill", 60, 60);

        image = canvas;
    }

    return image;
}

glCtx.prototype.updateTextureWith = function(image, texture)  {
      image = this.makeImageSuitableForTexture(image);

      this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
      this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
      this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
      // make the current texture null (tidy up)
      this.gl.bindTexture(this.gl.TEXTURE_2D, null);

      return texture;
    }

    glCtx.prototype.setMatrixUniforms = function() {
       this.gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform,  false, this.pMatrix);
       this.gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, this.mvMatrix);

       var normalMatrix = mat3.create();
       mat4.toInverseMat3(this.mvMatrix, normalMatrix);
       mat3.transpose(normalMatrix);
       this.gl.uniformMatrix3fv(this.shaderProgram.nMatrixUniform, false, normalMatrix);
    };

    glCtx.prototype.mvMatrixStack = [];

    glCtx.prototype.mvPushMatrix = function() {
       var copy = mat4.create();
       mat4.set(this.mvMatrix, copy);
       this.mvMatrixStack.push(copy);
    };

    glCtx.prototype.mvPopMatrix = function() {
       if (this.mvMatrixStack.length == 0) {
          throw "no pringles for you!";
       }
       this.mvMatrix = this.mvMatrixStack.pop();
    };



    glCtx.prototype.drawScene = function() {
         var gl = this.gl;
         var shaderProgram = this.shaderProgram;
         var vertices = this.vertices;

         gl.viewport(0, 0, this.viewportWidth, this.viewportHeight);
         gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
         mat4.perspective(45, this.viewportWidth / this.viewportHeight, 0.1, 100.0, this.pMatrix);

         mat4.identity(this.mvMatrix);
         mat4.translate(this.mvMatrix, [0.0, 0.0, -30.0]);

         // TODO start refactoring into camera.js
         mat4.rotate(this.mvMatrix, -pitch, [1,0,0]);
         mat4.rotate(this.mvMatrix, -yaw, [0,1,0]);
         mat4.translate(this.mvMatrix, [-xPos, -yPos, -zPos]);
         // eof refactory goodness

         for (var i in planets) {
            this.mvPushMatrix();

            var planet = planets[i];
            var fakeIndex = (i*1)+1;

            var rotAngle = fakeIndex*planet.rTri;
            mat4.rotate(this.mvMatrix, planet.rTri, [0,1,0]);

            mat4.translate(this.mvMatrix, planet.distFromCentre);
            planets[i].draw(this);

            this.mvPopMatrix();
         }
    };


