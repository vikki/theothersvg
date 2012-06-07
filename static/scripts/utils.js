// random stuff that is generally handy
// order dependent :'( this all needs refactoring into a module but still - TODO

var oReq; // don't global me (bro)

function getXMLHttpRequest() 
{
    if (window.XMLHttpRequest) {
        return new window.XMLHttpRequest;
    }   
    else {
        try {
            return new ActiveXObject("MSXML2.XMLHTTP.3.0");
        }   
        catch(ex) {
            return null;
        }   
    }   
}

// don't handle all failure cases properly here - TODO fixme 
function doAjaxRequest(url, onSuccess, onFail) {
   oReq = getXMLHttpRequest();

   onSuccess = onSuccess || defaultAjaxSuccess;
   onFail = onFail || defaultAjaxFail;

   if (oReq != null) {
      oReq.open("GET", url, true);
      if (typeof onSuccess === 'function') {
         oReq.onreadystatechange = function() {
            if (oReq.readyState == 4 /* complete */) {
               if (oReq.status == 200) {
                  onSuccess(oReq);
               }
             }
         };
      }
      oReq.send();
   }
   else {
      if (typeof onFail === 'function') {
         onFail();
      }
   }
}

function getFirstMatching(collection, matcher, toMatch) {
  for (var i = 0; i < collection.length; i++) {
     if (matcher.call(collection[i], toMatch)) {
       return collection[i];
     }
  }
};

function relMouseCoords(e){
   var x;
   var y;
   if (e.pageX || e.pageY) {
     x = e.pageX;
     y = e.pageY;
   }
   else {
     x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
     y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
   }

   x -= e.toElement.offsetLeft;
   y -= e.toElement.offsetTop;
   return {x:x, y:y};
}

function getColorFromCoords(coords, ctx) {
   var pixelValues = new Uint8Array(4);
   ctx.readPixels(coords.x, coords.y, 1,1, ctx.RGBA, ctx.UNSIGNED_BYTE, pixelValues)
   return pixelValues;
}

function defaultAjaxFail() {
   log("AJAX (XMLHTTP) not supported.");
}

function defaultAjaxSuccess(oReq) {
   log('check it out - ajax worked!!! ' + oReq.responseText);
}

function log(msg) {
   if (console && console.log) {
      console.log(msg);
   } else {
      alert(msg);
   }
}

function isPowerOfTwo(x) {
    return (x & (x - 1)) == 0;
}

function nextHighestPowerOfTwo(x) {
    --x;
    for (var i = 1; i < 32; i <<= 1) {
        x = x | x >> i;
    }
    return x + 1;
}

    var randPrimaryColor = function() {
      return Math.round(Math.random() * 255);
    };

var OPAQUE = 255;
