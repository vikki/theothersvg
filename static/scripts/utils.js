/*global ActiveXObject:true */
// random stuff that is generally handy

var vixgl = vixgl || {};
vixgl.util = vixgl.util || {};

vixgl.util.getXMLHttpRequest = function getXMLHttpRequest() {
   "use strict";

   if (window.XMLHttpRequest) {
      return new window.XMLHttpRequest();
   } else {
      try {
         return new ActiveXObject("MSXML2.XMLHTTP.3.0");
      } catch (ex) {
         return null;
      }
   }
};

vixgl.util.log = function log(msg) {
   "use strict";

   if (console && console.log) {
      console.log(msg);
   } else {
      alert(msg);
   }
};

// don't handle all failure cases properly here - TODO fixme 
vixgl.util.doAjaxRequest = function doAjaxRequest(url, onSuccess, onFail) {
   "use strict";

   // fuck yeah closures
   var oReq = this.getXMLHttpRequest();

   onSuccess = onSuccess || function defaultAjaxFail() {
      vixgl.util.log("AJAX (XMLHTTP) not supported.");
   };

   onFail = onFail || function defaultAjaxSuccess(oReq) {
      vixgl.util.log('check it out - ajax worked!!! ' + oReq.responseText);
   };

   if (oReq !== null) {
      oReq.open("GET", url, true);
      if (typeof onSuccess === 'function') {
         oReq.onreadystatechange = function () {
            if (oReq.readyState === 4 ) {
               if (oReq.status === 200) {
                  onSuccess(oReq);
               }
            }
         };
      }
      oReq.send();
   } else {
      if (typeof onFail === 'function') {
         onFail();
      }
   }
};

vixgl.util.getFirstMatching = function getFirstMatching(collection, matcher, toMatch) {
   "use strict";

   for (var i = 0; i < collection.length; i++) {
      if (matcher.call(collection[i], toMatch)) {
         return collection[i];
      }
   }
};

vixgl.util.relMouseCoords = function relMouseCoords(e) {
   "use strict";

   var x;
   var y;
   if (e.pageX || e.pageY) {
      x = e.pageX;
      y = e.pageY;
   } else {
      x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
   }

   x -= e.toElement.offsetLeft;
   y -= e.toElement.offsetTop;
   return {
      x: x,
      y: y
   };
};

vixgl.util.getColorFromCoords = function getColorFromCoords(coords, ctx) {
   "use strict";

   var pixelValues = new Uint8Array(4);
   ctx.readPixels(coords.x, coords.y, 1, 1, ctx.RGBA, ctx.UNSIGNED_BYTE, pixelValues);
   return pixelValues;
};

vixgl.util.isPowerOfTwo = function isPowerOfTwo(x) {
   "use strict";

   return (x & (x - 1)) === 0;
};

vixgl.util.nextHighestPowerOfTwo = function nextHighestPowerOfTwo(x) {
   /*jshint bitwise: false */
   "use strict";

   --x;
   for (var i = 1; i < 32; i <<= 1) {
      x = x | x >> i;
   }
   return x + 1;
};

vixgl.util.randPrimaryColor = function randPrimaryColor() {
   "use strict";

   return Math.round(Math.random() * 255);
};

vixgl.util.randColor = function randColor() {
   "use strict";

   return [vixgl.util.randPrimaryColor(), vixgl.util.randPrimaryColor(), vixgl.util.randPrimaryColor(), 255];
};

vixgl.util.getQueryStringParams = function getQueryStringParams(url) {
   "use strict";

   var pairs = {};

   var idx = url.indexOf('?');
   if (idx !== -1) {
      var queryString = url.substring(idx + 1);

      var queryStringPairs = queryString.split('&');
      for (var i in queryStringPairs) {
         if (queryStringPairs.hasOwnProperty(i)) {
            var pair = queryStringPairs[i].split('=');
            if (pair.length === 2) {
               pairs[pair[0]] = pair[1];
            }
          }
      }
   }

   return pairs;
};

vixgl.util.getQueryStringParam = function getQueryStringParam(url, paramName) {
   "use strict";

   return this.getQueryStringParams(url)[paramName];
};

// TODO unsuckify this - think x-browser
vixgl.util.addEventHandler = function addEventHandler(eventName, eventHandler) {
   "use strict";

   document[eventName] = eventHandler;
};

// TODO - do this on init?
vixgl.util.addEventHandler('onkeydown', function handleKeyDown(event) {
      "use strict";

      console.log('you pressed ' + event.keyCode);

      vixgl.util.currentlyPressedKeys[event.keyCode] = 1;
   });

vixgl.util.addEventHandler('onkeyup', function handleKeyUp(event) {
     "use strict";
 
      vixgl.util.currentlyPressedKeys[event.keyCode] = null;
   });

vixgl.util.currentlyPressedKeys = {};

vixgl.util.anyPressed = function(keys) {
   "use strict";

   for (var i = 0; i < keys.length; i++) {
      if (vixgl.util.currentlyPressedKeys[keys[i]]) {
          return true;
      }
   }
   return false;
};
